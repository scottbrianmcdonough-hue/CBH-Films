import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// "Screen time" (Scott, 29 Oct: picked from the brand-moment ideas, "UI ones are gold"): a
// weekly screen-time report in the CBH black and gold (a generic report, not any phone
// maker's look). A notification sits at the top from frame one: "Your screen time was down
// 82% this weekend". A thumb taps it and it opens into the report: 24 minutes a day, the
// week's bars tall Monday to Thursday and only slivers of gold Friday to Sunday. Under it,
// "Most used": the apps are the weekend itself (Lie-in, The fireside, Spa, Afternoon tea),
// their icons the hotels' own shots; the thumb taps each in turn and its icon opens into
// the footage full frame, labelled in the house order, then folds back. Last, the report
// folds back into the notification, which lifts away, leaving the question. Four hotels:
// Ruthin Castle (the carved bed), The Kingfisher (the wood burner), Rutland Hall (the twin
// spa baths), Waterton Park (afternoon tea). Silent mock-up: timing even, to cut to a track.

const W = 1080;
const H = 1920;
const D = "campaigns/screen-time";

export type App = {
  name: string;
  time: string;
  share: number; // bar under the name, of the top app's time
  clip?: string; // footage (its first frame as `poster`), or
  clip2?: string; // a second real-time shot, cut in on the app's middle beat
  still?: string; // a photo on the barely-there push
  poster?: string;
  pos?: string; // object-position for a still
  place: string;
  hotel: string; // "\n" breaks a long name over two lines
};

// The first cut: four hotels across the collection.
const MIXED: App[] = [
  {
    name: "Lie-in",
    time: "11h 30m",
    share: 1,
    clip: "hotels/ruthin-castle/clips/white-bed.mp4",
    poster: `${D}/lie-in-poster.jpg`,
    place: "NORTH WALES",
    hotel: "Ruthin Castle Hotel & Spa",
  },
  {
    name: "The fireside",
    time: "6h 45m",
    share: 0.59,
    clip: "hotels/the-kingfisher/festive/fire.mp4",
    poster: `${D}/fireside-poster.jpg`,
    place: "BEDFORD",
    hotel: "The Kingfisher",
  },
  {
    name: "Spa",
    time: "4h 20m",
    share: 0.38,
    clip: "hotels/rutland-hall/spa-baths.mp4",
    poster: `${D}/spa-poster.jpg`,
    place: "RUTLAND",
    hotel: "Rutland Hall Hotel & Spa",
  },
  {
    name: "Afternoon tea",
    time: "2h 10m",
    share: 0.19,
    clip: "hotels/waterton-park/clips/afternoon-tea.mp4",
    poster: `${D}/tea-poster.jpg`,
    place: "WAKEFIELD",
    hotel: "Waterton Park Hotel & Spa",
  },
];

// Regional cuts (Scott: "keep it regional ... if you can do more than one region do it"):
// four moments from one region each, the hotels alternating.
export const SCREEN_TIME_REGIONS: Record<string, App[]> = {
  mixed: MIXED,
  // Autumn and winter only, fresh Reel Bank footage (Scott, 29 Oct; no Christmas trees: the
  // festive footage is kept for a December Screen time), a still where it fits.
  // A different hotel on each app, never the same one twice in a row (Scott: "Low Wood Bay
  // twice", "three Rutlands in a row"); every shot at its own speed (no slow motion).
  yorkshire: [
    // Gisborough's two best shots (Scott: the ivy and the frosty terrace walk weren't inspiring)
    {
      name: "Crisp mornings",
      time: "11h 30m",
      share: 1,
      clip: "hotels/gisborough-hall/screen-time/misty-sunrise.mp4",
      clip2: "hotels/gisborough-hall/screen-time/snowy-garden.mp4",
      poster: `${D}/gis-sunrise-poster.jpg`,
      place: "NORTH YORKSHIRE",
      hotel: "Gisborough Hall",
    },
    {
      name: "The fireside",
      time: "5h 10m",
      share: 0.45,
      still: "hotels/holdsworth-house/tea-by-the-fire.jpg",
      pos: "30% 50%",
      place: "HALIFAX, WEST YORKSHIRE",
      hotel: "Holdsworth House Hotel",
    },
    {
      name: "Winter sunset",
      time: "3h 20m",
      share: 0.29,
      still: "campaigns/screen-time/stills/waterton-park-winter.jpg",
      pos: "62% 50%",
      place: "WAKEFIELD",
      hotel: "Waterton Park Hotel & Spa",
    },
    {
      name: "Lie-in",
      time: "2h 40m",
      share: 0.23,
      clip: "hotels/gisborough-hall/screen-time/bedroom-4s.mp4",
      poster: `${D}/gis-bedroom4-poster.jpg`,
      place: "NORTH YORKSHIRE",
      hotel: "Gisborough Hall",
    },
  ],
  "north-west-wales": [
    {
      name: "Lake views",
      time: "11h 30m",
      share: 1,
      clip: "hotels/low-wood-bay/screen-time/misty-lake-4s.mp4",
      poster: `${D}/lwb-lake4-poster.jpg`,
      place: "WINDERMERE, LAKE DISTRICT",
      hotel: "Low Wood Bay\nResort & Spa",
    },
    {
      name: "Lie-in",
      time: "6h 15m",
      share: 0.54,
      still: "campaigns/screen-time/stills/ruthin-four-poster.jpg",
      pos: "50% 50%",
      place: "NORTH WALES",
      hotel: "Ruthin Castle Hotel & Spa",
    },
    {
      name: "Evening stroll",
      time: "3h 05m",
      share: 0.27,
      clip: "hotels/rowton-hall/screen-time/dusk-4s.mp4",
      poster: `${D}/rowton-dusk4-poster.jpg`,
      place: "CHESTER",
      hotel: "Rowton Hall Hotel & Spa",
    },
    {
      name: "Spa",
      time: "2h 20m",
      share: 0.2,
      still: "hotels/castle-inn/hot-stones.jpg",
      pos: "50% 50%",
      place: "KESWICK",
      hotel: "Lake District Castle Inn\nHotel & Spa",
    },
  ],
  "east-midlands": [
    {
      name: "Lie-in",
      time: "11h 30m",
      share: 1,
      still: "hotels/the-mount/four-poster.jpg",
      pos: "68% 50%",
      place: "WOLVERHAMPTON",
      hotel: "The Mount Country Manor\nHotel & Golf",
    },
    {
      // two Kingfisher shots no other reel has used (Scott: "stop using that same kingfisher clip")
      name: "Long lunch",
      time: "6h 45m",
      share: 0.59,
      clip: "hotels/the-kingfisher/screen-time/carving.mp4",
      clip2: "hotels/the-kingfisher/screen-time/cocktail.mp4",
      poster: `${D}/kf-carving-poster.jpg`,
      place: "BEDFORD",
      hotel: "The Kingfisher",
    },
    {
      name: "Bath time",
      time: "4h 20m",
      share: 0.38,
      clip: "hotels/rutland-hall/screen-time/candlelit-bath.mp4",
      poster: `${D}/rutland-bath-poster.jpg`,
      place: "RUTLAND",
      hotel: "Rutland Hall Hotel & Spa",
    },
    {
      name: "Spa",
      time: "2h 05m",
      share: 0.18,
      still: "hotels/whittlebury-park/spa-pool.jpg",
      pos: "50% 50%",
      place: "NORTHAMPTONSHIRE",
      hotel: "Whittlebury Park",
    },
  ],
};

// The week: hours a day, Monday to Sunday (the weekend in gold).
const WEEK = [5.6, 6.1, 5.2, 6.4, 0.5, 0.3, 0.4];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

type Rect = { x: number; y: number; w: number; h: number };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});
const GOLD = (a: number) => `rgba(195,158,85,${a})`;
const CREAM = (a: number) => `rgba(245,239,227,${a})`;

const BANNER: Rect = { x: 54, y: 250, w: 972, h: 168 };
const CARD: Rect = { x: 80, y: 270, w: 920, h: 1180 };
const FULL: Rect = { x: 0, y: 0, w: W, h: H };
// the chart, inside the card
const CHART = { x: 70, y: 380, w: 780, h: 250 };
const MAXH = 7; // hours at the chart's top
// the most-used rows, inside the card
const ROW0 = 760;
const ROW_H = 102;
const ICON = 76;
const iconRect = (i: number): Rect => ({
  x: CARD.x + 56,
  y: CARD.y + ROW0 + i * ROW_H + 8,
  w: ICON,
  h: ICON,
});

// The timeline, on the track's beats. Music (Scott: "use unused tracks or sections"): Deep
// Classy House, its opening, which no film has used (`november-out-there` plays from 142.6s):
// the quiet pads from 10.2s under the notification and the report, the kick in at 16.30s
// (film beat 12) as the first app opens, then the groove; it ends on beat 52, a downbeat,
// before the first breakdown and its vocal (40.97s). 118 BPM: 0.50843s, 15.25 frames a beat.
const MUSIC = "campaigns/november/deep-classy-house.mp3";
const BEAT_S = 0.50843;
const KICK_S = 16.296; // the track's first kick, film beat 12
const MUSIC_GAIN = 0.84; // as on November, ~-15 LUFS
const B = (n: number) => Math.round(n * BEAT_S * 30);
// One timeline for the reel (four apps, two bars each) and one for the Story (Scott: "screen time
// stories"): three apps, six beats each, the kick on the first; the hook
// held (Scott: "too fast the UI, that's the hook"): two seconds on the notification, the report
// counting down for two more, the first app at 5s. 17.5s.
const timeline = (story: boolean) => {
  const first = story ? 10 : 12; // the kick, as the first app opens
  const every = story ? 6 : 8;
  const n = story ? 3 : 4;
  const TAP = B(story ? 4 : 3); // the notification is tapped
  const end = first + every * n; // the report folds back on this beat
  return {
    first,
    TAP,
    OPEN: TAP + 4, // 24 frames into the report
    BARS: B(story ? 5.5 : 5), // the bars grow
    ROWS: B(story ? 7.5 : 7), // the rows come in, 6 frames apart
    // each app opens on a downbeat: the 16-frame open centred on the beat
    T: Array.from({ length: n }, (_, i) => {
      const open = B(first + every * i) - 8;
      return {
        reach: open - 15,
        press: open - 3,
        open,
        close: B(first + every * (i + 1)) - 8 - (story ? 18 : 22), // done just before the next opens
      };
    }),
    // a second shot cuts in on the app's middle beat, so each shot plays at its own speed
    CUT: (i: number) => B(first + every * i + 3),
    FOLD: B(end) - 10, // the report folds back into the banner
    AWAY: B(end) - 10 + 34, // the banner lifts away
    LINE: B(end + 2), // the question
    FADE: B(story ? end + 4.5 : 48),
    FRAMES: story ? B(end + 6.5) : B(52),
  };
};
type Timeline = ReturnType<typeof timeline>;
const REEL = timeline(false);
const STORY = timeline(true);
export const SCREEN_TIME_FRAMES = REEL.FRAMES;
export const SCREEN_TIME_STORY_FRAMES = STORY.FRAMES;

const ease = (f: number, a: number, d: number) => progress(f, a, d, EASE_IN_OUT);

// one app's icon, opening into its footage
const AppShot: React.FC<{ a: App; i: number; on: number; tm: Timeline }> = ({ a, i, on, tm }) => {
  const frame = useCurrentFrame();
  const { T, CUT } = tm;
  const t = T[i];
  const open = ease(frame, t.open, 16) * (1 - ease(frame, t.close, 16));
  const r = lerpRect(iconRect(i), FULL, open);
  const radius = lerp(20, 0, open);
  const live = frame >= t.open && frame < t.close + 16;
  const second = !!a.clip2 && frame >= CUT(i);
  // a still gets the barely-there push while it is open
  const push = a.still ? lerp(1, 1.05, progress(frame, t.open, t.close + 16 - t.open, (x) => x)) : 1;
  const label = progress(frame, t.open + 18, 16) * (1 - progress(frame, t.close - 10, 10));
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: radius,
        overflow: "hidden",
        opacity: on,
        boxShadow: open > 0 ? `0 20px 60px rgba(0,0,0,${0.5 * open})` : "none",
        zIndex: live ? 20 : 1,
      }}
    >
      {/* the icon is the clip's first frame, so the hand-over to the footage doesn't jump */}
      <Img
        src={staticFile(a.still ?? a.poster ?? "")}
        style={{ position: "absolute", width: W, height: H, left: "50%", top: "50%", objectFit: "cover",
          objectPosition: a.pos ?? "50% 50%",
          transform: `translate(-50%, -50%) scale(${Math.max(r.w / W, r.h / H) * push})` }}
      />
      {live && a.clip ? (
        // footage plays at its own speed: an app too long for one shot cuts to a second on its middle beat
        <Sequence key={second ? 2 : 1} from={second ? CUT(i) : t.open} layout="none">
          <div style={{ position: "absolute", left: "50%", top: "50%", width: W, height: H,
            transform: `translate(-50%, -50%) scale(${Math.max(r.w / W, r.h / H)})` }}>
            <OffthreadVideo src={staticFile(second ? a.clip2! : a.clip)} muted style={{ width: W, height: H }} />
          </div>
        </Sequence>
      ) : null}
      {/* the house label: the place in gold caps over its underline, the name in cream Cormorant */}
      {label > 0 ? (
        <AbsoluteFill>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(to bottom, rgba(9,9,10,0) 50%, rgba(9,9,10,0.68) 68%, rgba(9,9,10,0.74) 84%, rgba(9,9,10,0.4) 100%)",
              opacity: label,
            }}
          />
          <div style={{ position: "absolute", left: 72, bottom: 500, opacity: label,
            transform: `translateY(${(1 - label) * 18}px)` }}>
            <div style={{ display: "inline-block" }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.24em",
                color: colors.gold, textShadow: "0 2px 16px rgba(9,9,10,0.7)" }}>{a.place}</div>
              <div style={{ height: 2, marginTop: 12, background: colors.gold }} />
            </div>
            <div style={{ fontFamily: serif, fontSize: 64, lineHeight: 1.1, marginTop: 14, color: colors.cream,
              whiteSpace: "pre", textShadow: "0 2px 22px rgba(9,9,10,0.55)" }}>{a.hotel}</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </div>
  );
};

// the thumb: a soft ring, as in a screen recording
const thumbAt = (frame: number, { TAP, T }: Timeline) => {
  const rest = { x: 820, y: 1660 };
  const bannerTap = { x: 560, y: BANNER.y + BANNER.h / 2 };
  let pos = rest;
  const inn = ease(frame, TAP - 22, 20);
  pos = { x: lerp(rest.x, bannerTap.x, inn), y: lerp(rest.y, bannerTap.y, inn) };
  const back = ease(frame, TAP + 6, 22);
  pos = { x: lerp(pos.x, rest.x, back), y: lerp(pos.y, rest.y, back) };
  for (let i = 0; i < T.length; i++) {
    const t = T[i];
    if (frame < t.reach) break;
    const ic = iconRect(i);
    const to = { x: ic.x + ic.w / 2 + 460, y: ic.y + ic.h / 2 + 4 };
    const reach = ease(frame, t.reach, t.press - t.reach);
    pos = { x: lerp(rest.x, to.x, reach), y: lerp(rest.y, to.y, reach) };
    const away = ease(frame, t.press + 4, 18);
    pos = { x: lerp(pos.x, rest.x, away), y: lerp(pos.y, rest.y, away) };
  }
  return pos;
};

export const ScreenTime: React.FC<{ region?: string; story?: boolean }> = ({ region = "mixed", story = false }) => {
  const frame = useCurrentFrame();
  const tm = story ? STORY : REEL;
  const { TAP, OPEN, BARS, ROWS, T, FOLD, AWAY, LINE } = tm;
  // the Story keeps the top three
  const APPS = SCREEN_TIME_REGIONS[region].slice(0, T.length);
  const open = ease(frame, OPEN, 24) * (1 - ease(frame, FOLD, 24));
  const away = ease(frame, AWAY, 22);
  const box = lerpRect(BANNER, CARD, open);
  const banner = 1 - progress(frame, OPEN, 10);
  const bannerBack = progress(frame, FOLD + 14, 10);
  const content = progress(frame, OPEN + 14, 12) * (1 - progress(frame, FOLD, 10));
  const bars = (k: number) => ease(frame, BARS + k * 3, 26);
  const row = (i: number) => progress(frame, ROWS + i * 6, 16);
  const pressed =
    (frame >= TAP - 2 && frame < TAP + 4) || T.some((t) => frame >= t.press - 2 && frame < t.press + 4);
  const thumb = thumbAt(frame, tm);
  // the thumb shows only while it taps, never resting over the footage
  const taps = [{ reach: TAP - 22, press: TAP }, ...T];
  const thumbOn = Math.max(
    ...taps.map((t) => progress(frame, t.reach - 4, 8) * (1 - progress(frame, t.press + 8, 10))),
  );
  const minutes = Math.round(lerp(212, 24, ease(frame, BARS, 40))); // counts down to 24m a day
  const mins = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
  const line = progress(frame, LINE, 24);
  const showBanner = frame < OPEN + 10 || frame >= FOLD + 14;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* the notification, opening into the report card */}
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y - away * 260,
          width: box.w,
          height: box.h,
          borderRadius: lerp(40, 44, open),
          background: "linear-gradient(180deg, #1B1A1C 0%, #121113 100%)",
          border: `1.5px solid ${GOLD(0.3)}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          overflow: "hidden",
          opacity: 1 - away,
        }}
      >
        {showBanner ? (
          <div style={{ position: "absolute", inset: 0, opacity: frame < OPEN + 10 ? banner : bannerBack }}>
            <div style={{ position: "absolute", left: 30, top: 34, width: 100, height: 100, borderRadius: 24,
              background: colors.black, border: `1.5px solid ${GOLD(0.45)}` }}>
              {/* the app icon in gold (Scott); the corner CB stays white */}
              <Img src={staticFile("brand/cb-watermark-gold.png")}
                style={{ position: "absolute", left: 22, top: 19, width: 56, height: 61 }} />
            </div>
            <div style={{ position: "absolute", left: 156, top: 30, right: 34, fontFamily: sans, whiteSpace: "nowrap" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: CREAM(0.55),
                letterSpacing: "0.04em" }}>
                <span>SCREEN TIME</span>
                <span>now</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 600, color: colors.cream, marginTop: 8 }}>
                Your screen time was down 82%
              </div>
              <div style={{ fontSize: 26, color: CREAM(0.7), marginTop: 4 }}>
                Tap to see where the weekend went
              </div>
            </div>
          </div>
        ) : null}
        {/* the report */}
        <div style={{ position: "absolute", left: 0, top: 0, width: CARD.w, height: CARD.h, opacity: content }}>
          <div style={{ position: "absolute", left: 70, top: 64, fontFamily: sans, fontSize: 22, fontWeight: 600,
            letterSpacing: "0.26em", color: colors.gold }}>THIS WEEKEND</div>
          <div style={{ position: "absolute", left: 66, top: 104, fontFamily: serif, fontSize: 150, lineHeight: 1,
            color: colors.cream }}>
            {mins}
            <span style={{ fontSize: 56, color: CREAM(0.6), marginLeft: 16 }}>a day</span>
          </div>
          <div style={{ position: "absolute", left: 70, top: 280, fontFamily: sans, fontSize: 28, fontWeight: 600,
            color: colors.gold, opacity: progress(frame, BARS + 30, 14) }}>
            ↓ 82% from last weekend
          </div>
          {/* the week */}
          {[0, 0.5, 1].map((g) => (
            <div key={g} style={{ position: "absolute", left: CHART.x, width: CHART.w, top: CHART.y + CHART.h * (1 - g),
              height: 1, background: CREAM(g === 0 ? 0.18 : 0.07) }} />
          ))}
          {WEEK.map((h, k) => {
            const bw = 64;
            const gap = (CHART.w - bw * 7) / 6;
            const weekend = k >= 4;
            const hgt = Math.max(6, (h / MAXH) * CHART.h * bars(k));
            return (
              <React.Fragment key={k}>
                <div style={{ position: "absolute", left: CHART.x + k * (bw + gap), width: bw,
                  top: CHART.y + CHART.h - hgt, height: hgt, borderRadius: "10px 10px 3px 3px",
                  background: weekend ? colors.gold : CREAM(0.2) }} />
                <div style={{ position: "absolute", left: CHART.x + k * (bw + gap), width: bw, top: CHART.y + CHART.h + 16,
                  textAlign: "center", fontFamily: sans, fontSize: 22, fontWeight: 600,
                  color: weekend ? colors.gold : CREAM(0.45) }}>{DAYS[k]}</div>
              </React.Fragment>
            );
          })}
          <div style={{ position: "absolute", left: 70, right: 70, top: ROW0 - 70, height: 1, background: CREAM(0.08) }} />
          <div style={{ position: "absolute", left: 70, top: ROW0 - 44, fontFamily: sans, fontSize: 20, fontWeight: 600,
            letterSpacing: "0.26em", color: CREAM(0.5) }}>MOST USED</div>
          {APPS.map((a, i) => (
            <div key={a.name} style={{ position: "absolute", left: 56 + ICON + 28, right: 64, top: ROW0 + i * ROW_H + 8,
              height: ICON, opacity: row(i), transform: `translateY(${(1 - row(i)) * 16}px)`, fontFamily: sans }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
                <span style={{ fontSize: 31, fontWeight: 600, color: colors.cream }}>{a.name}</span>
                <span style={{ fontSize: 26, color: CREAM(0.6) }}>{a.time}</span>
              </div>
              <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: CREAM(0.07) }}>
                <div style={{ width: `${a.share * 100 * row(i)}%`, height: 6, borderRadius: 3, background: colors.gold }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* the icons, which open into the footage */}
      {APPS.map((_, i) => (
        <AppShot key={i} a={APPS[i]} i={i} tm={tm} on={row(i) * (1 - progress(frame, FOLD, 10))} />
      ))}
      {/* the thumb */}
      <div
        style={{
          position: "absolute",
          left: thumb.x - 34,
          top: thumb.y - 34,
          width: 68,
          height: 68,
          borderRadius: 34,
          border: `2px solid ${CREAM(0.7)}`,
          background: CREAM(pressed ? 0.28 : 0.14),
          transform: `scale(${pressed ? 0.86 : 1})`,
          opacity: thumbOn,
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          zIndex: 30,
        }}
      />
      {/* the question, once the notification has gone */}
      <div
        style={{
          position: "absolute",
          top: 760,
          width: "100%",
          textAlign: "center",
          fontFamily: serif,
          fontSize: 96,
          lineHeight: 1.12,
          color: colors.cream,
          opacity: line,
          transform: `translateY(${(1 - line) * 22}px)`,
        }}
      >
        When did you last
        <br />
        switch off?
      </div>
      <Img
        src={staticFile("brand/cb-watermark.png")}
        style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108, zIndex: 25 }}
      />
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round((KICK_S - tm.first * BEAT_S) * 30)}
        volume={(f) =>
          MUSIC_GAIN *
          interpolate(f, [0, 8, tm.FADE, tm.FRAMES], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};

