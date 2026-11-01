// "Departures", a mixed format reel (stock clips with the hotels' own images and footage;
// Scott picked it from the motion lab's departure-board roll). A split-flap departures
// board in CBH black and gold lists the stops; each stop's row flips to BOARDING, the whole
// frame turns over flap by flap into the trip (stock for the journey on the first leg, then
// the hotel), and flaps back to the board for the next, the row it left flipping to
// DEPARTED. The board ends on "WHERE TO / NEXT?". Soft synthesised flap sounds
// (`scripts/flap-sfx.py`; Scott: "add a soft flap sound") under every riffle and turn.
// All timings are in beats from the film's start.

export type DeparturesPicture =
  | {
      kind: "still";
      src: string;
      size: [number, number]; // source width, height in pixels
      crop: { cx: number; cy?: number; h?: number }; // 9:16 window, source pixels
      // a slow pan across a wide still: the window's centre travels from crop.cx to panTo
      // over the shot (eased), in place of the push
      panTo?: number;
    }
  | {
      kind: "video";
      src: string;
      from: number; // seconds into the clip
      // a frame of the clip for the flap turns (144 tiles can't each play the video):
      // `posterIn` at `from`, `posterOut` where the shot ends
      posterIn?: string;
      posterOut?: string;
    };

export type DeparturesShot = DeparturesPicture & {
  beats: number; // time on screen
  side: "stock" | "hotel"; // stock gets a neutral grade, hotels the autumn grade
};

export type DeparturesLeg = {
  row: number; // the board row this trip is
  hotel: string; // the hotel's name under the place flaps on its first shot
  hold: number; // beats on the board with this row BOARDING before the turn
  shots: DeparturesShot[];
};

export type DeparturesSpec = {
  id: string;
  beat: number; // frames per beat
  intro: number; // beats for the board to flip in before the first BOARDING
  rows: { time: string; place: string }[];
  legs: DeparturesLeg[];
  turn: number; // beats per flap turn
  end: { lines: [string, string]; beats: number };
  music?: {
    src: string;
    startAt: number; // frames into the file
    gain: number;
    seconds: number;
  };
};

export type Segment =
  | { kind: "board"; from: number; to: number }
  | {
      kind: "turn";
      from: number;
      to: number;
      front: Face;
      back: Face;
    }
  | {
      kind: "shot";
      from: number;
      to: number;
      shot: DeparturesShot;
      label?: { place: string; hotel: string };
    }
  | { kind: "end"; from: number; to: number };

export type Face =
  | { kind: "board" }
  | { kind: "end" }
  | { kind: "picture"; shot: DeparturesShot; at: "in" | "out" };

// The film as a list of segments in frames, plus the board's status changes.
export const layout = (f: DeparturesSpec) => {
  const fr = (b: number) => Math.round(b * f.beat);
  const segs: Segment[] = [];
  const status: { frame: number; row: number; text: string }[] = [];
  let t = 0;
  const push = (s: Segment) => {
    segs.push(s);
    t = s.to;
  };
  push({ kind: "board", from: 0, to: fr(f.intro) });
  f.legs.forEach((leg, li) => {
    if (li > 0) push({ kind: "board", from: t, to: t + fr(leg.hold) });
    // BOARDING flips in two beats before the turn (the intro's at its last two beats)
    status.push({ frame: t - fr(2), row: leg.row, text: "BOARDING" });
    push({
      kind: "turn",
      from: t,
      to: t + fr(f.turn),
      front: { kind: "board" },
      back: { kind: "picture", shot: leg.shots[0], at: "in" },
    });
    leg.shots.forEach((shot, si) => {
      const firstHotel = leg.shots.findIndex((s) => s.side === "hotel");
      push({
        kind: "shot",
        from: t,
        to: t + fr(shot.beats),
        shot,
        label:
          si === firstHotel
            ? { place: f.rows[leg.row].place, hotel: leg.hotel }
            : undefined,
      });
    });
    const last = leg.shots[leg.shots.length - 1];
    const isLast = li === f.legs.length - 1;
    push({
      kind: "turn",
      from: t,
      to: t + fr(f.turn),
      front: { kind: "picture", shot: last, at: "out" },
      back: isLast ? { kind: "end" } : { kind: "board" },
    });
    status.push({ frame: t, row: leg.row, text: "DEPARTED" });
  });
  push({ kind: "end", from: t, to: t + fr(f.end.beats) });
  return { segs, status, frames: t };
};

export const departuresFrames = (f: DeparturesSpec) => layout(f).frames;

export const validateDepartures = (f: DeparturesSpec) => {
  const fail = (msg: string) => {
    throw new Error(`${f.id}: ${msg}`);
  };
  f.rows.forEach(
    (r) => r.place.length > 13 && fail(`${r.place} is over 13 flaps`),
  );
  f.legs.forEach((l) => {
    if (!f.rows[l.row]) fail(`no board row ${l.row}`);
    l.shots.forEach((s, i) => {
      if (s.beats * f.beat < 24)
        fail(`a shot in ${f.rows[l.row].place} is under 0.8s`);
      // the first and last shots of a trip take part in a flap turn
      if (s.kind === "video" && i === 0 && !s.posterIn)
        fail(`${s.src} needs posterIn for the flap turn`);
      if (s.kind === "video" && i === l.shots.length - 1 && !s.posterOut)
        fail(`${s.src} needs posterOut for the flap turn`);
    });
  });
  const srcs = f.legs.flatMap((l) => l.shots.map((s) => s.src));
  if (new Set(srcs).size !== srcs.length) fail("a shot is used twice");
  if (f.music && f.music.startAt + departuresFrames(f) > f.music.seconds * 30)
    fail("the film is longer than the music");
};
