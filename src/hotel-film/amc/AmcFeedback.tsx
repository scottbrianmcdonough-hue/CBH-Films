import React from "react";
import {
  AbsoluteFill,
  Easing,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, EASE_OUT, sans, serif } from "../theme";

// "The reviews are in" (was "What you said"; Scott found it flat): the AMC 2026 feedback reel (Bianca: collate the LinkedIn and email
// feedback for a post next week and next year's sponsor pack; Scott picked "the comments
// roll in"). 4:5 like the AMC reel, over its photos and on its track (Light it Up Boy):
// comments pop in at the foot of a stack on the beat, pushing the older ones up, over the
// day's photos, day into night, a card every four beats; on the horns' lift one quote
// held large over the gala team; then CBH's own reply types itself
// into a comment box (Scott: "the end transition as a comment box typing"), posts, and the
// CB in its avatar flies out to become the logo, on the track's last hit. Comment cards are CBH's own black and gold, never LinkedIn's look.
// Copy: all real feedback (James Cannon's email, three LinkedIn posts); the reply's wording
// is ours.

export const AMC_FEEDBACK_FPS = 30;
export const AMC_FEEDBACK_W = 1080;
export const AMC_FEEDBACK_H = 1350;
// the 16:9 cut (Scott, 23 Oct: "need the landscape version"), built from the same code
export const AMC_FEEDBACK_WIDE_W = 1920;
export const AMC_FEEDBACK_WIDE_H = 1080;

// everything below is built twice, 4:5 and 16:9 (`wide`), so the two cuts stay in step
const build = (wide: boolean) => {
const W = wide ? AMC_FEEDBACK_WIDE_W : AMC_FEEDBACK_W;
const H = wide ? AMC_FEEDBACK_WIDE_H : AMC_FEEDBACK_H;

// Light it Up Boy (Mixkit 849, 0.5042s a beat): the horns lift at 58.754s, film beat 16;
// on beat JUMP the music jumps to the outro's last bars, its last hit at 91.24s
const BEAT = 0.5042;
// the horns lift at 58.754s on film beat HORN: the four comments pop on beats 1-13, then
// the whole list holds for reading (Scott: "hold on the ending list of comments")
const HORN = 39;
const TS = 58.754 - HORN * BEAT;
const b = (k: number) => Math.round(k * BEAT * AMC_FEEDBACK_FPS);
// The music is one file, joined sample-accurately (two <Audio> clips can only meet on whole
// frames, and their downbeats flammed ~20ms apart: Scott's "stutter right at the end"): the
// track from TS to 74.0384s, then from 16.1345s later (the two sides are the same music there:
// the stab at 73.0807 / 89.2152s, onset envelopes correlating 0.97 over the next 2s), a 10ms
// crossfade, two beats after the stab so the jump sits closer to the last hit and the logo
// lands just before its shimmer (Scott: "it lands on the CB and sits there"):
//   ffmpeg -i light-it-up-boy.mp3 -filter_complex "[0]atrim=start=39.0902:end=74.0384,
//     asetpts=PTS-STARTPTS[a];[0]atrim=start=90.1629,asetpts=PTS-STARTPTS[b];
//     [a][b]acrossfade=d=0.01:c1=tri:c2=tri" -c:a libmp3lame -b:a 320k music.mp3
// (TS must stay 39.0902, i.e. HORN 39; re-cut the file if HORN changes.)
const JUMP = HORN + 30; // the quote 10 beats, the reply 20
const SHIFT = 89.2152 - 73.0807;
const HIT = Math.round((91.24 - SHIFT - TS) * AMC_FEEDBACK_FPS);
// ends as the shimmer finishes, on the logo, no fade (Scott: "don't fade out, just the shimmer and then done")
const AMC_FEEDBACK_FRAMES = HIT + 31;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const src = (f: string) => staticFile(`campaigns/amc-feedback/${f}`);

// the full logo and the CB alone (the CB file keeps the full logo's frame, so they stack)
const LOGO_SRC = staticFile("brand/cbh-logo-on-dark.svg");
const CB_SRC = staticFile("brand/cbh-logo-cb-only.svg");
const LOGO_W = wide ? 380 : 460;
const LOGO_H = (LOGO_W * 655.69) / 534.25;
const logoBox = { position: "absolute", left: 0, top: 0, width: LOGO_W, height: LOGO_H } as const;

type Comment = { at: number; name: string; role: string; text: string; rows?: number };

// placeholders, in the voice the real ones are likely to have
// all real (Bianca and Scott, 21 Oct), one sentence each, word for word (Scott: "take a
// fragment or one sentence each", "actual quotes?"); a sentence cut short ends in "…"; the
// full texts are in the AMC 2026 feedback doc. A card every four beats, the last two a beat longer (Scott), the list held to the horns:
// James Cannon's email to Phill (Scott: fine to quote), then three LinkedIn posts
const COMMENTS: Comment[] = [
  // Rachel's quote out (Scott, 23 Oct); her welcome opens the night behind Nicole's card instead
  { at: 4, name: "James Cannon", role: "EMEA Director · Access Hospitality", text: "What an enjoyable, informative, friendly, and valuable day we all had." },
  { at: 7, name: "Laura O'Brien", role: "Cluster Sales Manager · Great National Hotels", text: "A fantastic, well-organised event with great speakers…" },
  { at: 10, name: "Nicole Pearce", role: "Business Development Manager · Donnington & Co", text: "We were delighted to pick up the award for Sales Superstars for 2026." },
];
// real: the same email ("the quality of your speakers / panels, the atmosphere during the
// day and the evening, and the engagement from your members was one of the best I have ever
// experienced"), its last words
const HERO = {
  text: "One of the best I have ever experienced.",
  name: "James Cannon",
  role: "EMEA Director · Access Hospitality",
};

// CBH's reply, typed into the comment box (placeholder too: Bianca may want her own words)
const REPLY = "Thanks to every member, colleague, partner and sponsor who joined us. Here's to the next 25!"; // "colleague", "just thanks" (Scott)
// the held quote has ten beats (Scott: "a tad longer"), then the reply types at a typist's pace (Scott: "the reply
// is too fast"), about five seconds, sends, and the posted comment holds before the CB flies
const REPLY_AT = HORN + 10;
const BOX_IN = b(REPLY_AT);
const TYPE_FROM = b(REPLY_AT + 1);
const TYPE_TO = b(REPLY_AT + 10.5);
const SEND = b(REPLY_AT + 11);
const FLY = b(JUMP);
// a typist's rhythm: a breath after commas and full stops, scaled to fit the window
const TYPED = (() => {
  const w = REPLY.split("").map((c, i) => 1 + (i > 0 && REPLY[i - 1] === "," ? 3 : 0) + (i > 0 && REPLY[i - 1] === "." ? 6 : 0));
  const total = w.reduce((a, x) => a + x, 0);
  let acc = 0;
  return w.map((x) => {
    acc += x;
    return Math.round(TYPE_FROM + ((acc - x) / total) * (TYPE_TO - TYPE_FROM));
  });
})();
const KEYS = "campaigns/dear-weekend/sfx"; // the Dear Weekend reel's keys (scripts/dear-sfx.py)

// the day's photos behind the stack, day into night, each changing with its card (the
// Donnington winners behind Nicole's Sales Superstars)
type Shot = {
  f: string;
  night?: boolean;
  pos?: string;
  from: number;
  // pin a point of the photo (source pixels, photo w x h) to a point on screen at a scale,
  // for a subject the cover crop would put behind the board
  place?: { w: number; h: number; x: number; y: number; sx: number; sy: number; scale: number };
};
const BACKS: Shot[] = [
  // opens on David Allen at the lectern (Scott: "throw him in there somewhere"), the clear beats
  // before the first card, his face placed right of centre under the title
  {
    f: "david-allen.jpg",
    from: 0,
    place: { w: 2000, h: 1126, x: 1520, y: 410, sx: 650, sy: 540, scale: 1.35 },
  },
  // the day, then the night opening on Rachel's welcome at the gala (Scott), then Donnington
  { f: "stronger-together-room.jpg", from: 4 },
  { f: "sales-panel.jpg", from: 7 },
  { f: "rachel-welcome.jpg", night: true, pos: "80% 45%", from: 10 },
  { f: "winner-donnington.jpg", night: true, from: 14 },
  // the list held for reading: the night crossfades on under it, twice
  { f: "winners-stage.jpg", night: true, from: 19 },
  // cropped to the two dancing, their faces in the gap between the title and the board
  // (Scott: "his face is covered by the comment box")
  {
    f: "dance-floor.jpg",
    night: true,
    from: 28,
    place: { w: 2000, h: 1126, x: 585, y: 318, sx: 540, sy: 284, scale: 1.36 },
  },
];
// a CSS take on the AMC reel's two grades: warmed daylight, the night's neon tamed
const grade = (night?: boolean) =>
  night
    ? "saturate(0.75) contrast(1.1) sepia(0.18) hue-rotate(-6deg)"
    : "sepia(0.12) saturate(1.04) contrast(1.06)";

// card geometry
const CARD_X = wide ? 340 : 70;
const CARD_W = W - 2 * CARD_X;
const PAD = 22;
const AV = 66;
const QUOTE_SIZE = 35;
const QUOTE_LH = 47;
// a line of the quote at QUOTE_SIZE across the card's ~800px text column: measured at 44
// to 50 characters in the render, so the low end (check every card when the copy changes)
const CHARS = wide ? 62 : 44;
const GAP = 16;
const lines = (t: string, chars = CHARS) => {
  const words = t.split(" ");
  let n = 1;
  let len = 0;
  for (const w of words) {
    if (len + w.length + (len ? 1 : 0) > chars) {
      n++;
      len = w.length;
    } else len += w.length + (len ? 1 : 0);
  }
  return n;
};
const cardH = (c: Comment) => PAD * 2 + 70 + (c.rows ?? lines(c.text)) * QUOTE_LH;
// the newest card's bottom edge: the finished board centred in the space under the title
// (Scott: "why is it so far down"), never lower than 50px off the foot
// in 16:9 the board hangs from under the title and is scaled to clear the player's bar
const BOARD_TOP = 255;
const BOARD_H = COMMENTS.reduce((a, c) => a + cardH(c), 0) + GAP * (COMMENTS.length - 1);
const BOARD_K = wide ? Math.min(1, (H - 110 - BOARD_TOP) / BOARD_H) : 1;
const STACK_FOOT = wide ? BOARD_TOP + BOARD_H : Math.min(H - 50, Math.round((300 + (H - 50)) / 2 + BOARD_H / 2));

const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

const Card: React.FC<{
  c: Comment;
  y: number;
  pop: number;
  fade: number;
  lit: number; // the newest card's edge catches the gold, then settles
  cb?: number; // CBH's own card: the CB in the avatar (0 hides it while it flies out)
  ring?: number;
}> = ({ c, y, pop, fade, lit, cb, ring = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: CARD_X,
      top: y,
      width: CARD_W,
      height: cardH(c),
      boxSizing: "border-box",
      padding: PAD,
      borderRadius: 24,
      // see-through enough for the day's photo to show (Scott: "a little more transparent")
      background: "rgba(14,14,16,0.62)",
      textShadow: "0 1px 10px rgba(0,0,0,0.55)",
      border: `1px solid rgba(195,158,85,${0.28 + 0.5 * lit})`,
      boxShadow: `0 18px 40px rgba(0,0,0,0.35), 0 0 ${28 * lit}px rgba(195,158,85,${0.22 * lit})`,
      display: "flex",
      gap: 22,
      opacity: pop * fade,
      transform: `translateY(${(1 - pop) * 36}px) scale(${0.94 + 0.06 * pop})`,
      transformOrigin: "50% 100%",
    }}
  >
    <div
      style={{
        width: AV,
        height: AV,
        flex: "none",
        borderRadius: "50%",
        border: `2px solid rgba(195,158,85,${ring})`,
        background: cb === undefined ? "none" : `rgba(20,20,22,${ring})`,
        color: colors.gold,
        fontFamily: serif,
        fontSize: 30,
        lineHeight: `${AV - 4}px`,
        textAlign: "center",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {cb === undefined ? initials(c.name) : <Thumb opacity={cb} />}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 30,
          lineHeight: "38px",
          color: colors.cream,
        }}
      >
        {c.name}
      </div>
      <div
        style={{
          fontFamily: sans,
          // 21px so the role still reads at feed size
          fontSize: 21,
          letterSpacing: 1.8,
          textTransform: "uppercase",
          lineHeight: "26px",
          color: colors.gold,
          marginBottom: 4,
        }}
      >
        {c.role}
      </div>
      <div
        style={{
          fontFamily: sans,
          fontSize: QUOTE_SIZE,
          lineHeight: `${QUOTE_LH}px`,
          color: colors.cream,
          // no word left on its own on the last line
          ...({ textWrap: "pretty" } as React.CSSProperties),
        }}
      >
        {c.text}
      </div>
    </div>
  </div>
);

// CBH's thumbnail: the full logo in a dark circle with the avatars' gold ring (Scott: "the CB
// thumbnail becomes the full CB logo"; a circle like the other avatars, not LinkedIn's square)
const TH_H = 46; // inside the ring, the wordmark clear of it
const TH_W = (TH_H * 534.25) / 655.69;
const S_TH = TH_W / LOGO_W; // the thumbnail's logo as a scale of the end card's
const Thumb: React.FC<{ opacity: number }> = ({ opacity }) => (
  <Img
    src={LOGO_SRC}
    style={{
      position: "absolute",
      width: TH_W,
      height: TH_H,
      left: (AV - 4) / 2 - TH_W / 2, // inside the 2px ring (border-box)
      top: (AV - 4) / 2 - TH_H / 2,
      opacity,
    }}
  />
);

// clear of LinkedIn's player controls along the foot (Scott's screenshot: they sat over the box)
const REPLY_FOOT = wide ? 110 : 170;
// the comment box: CB avatar, the field, a send arrow; it grows a line at a time as it types
const FIELD_CHARS = wide ? 62 : 38;
const ReplyBox: React.FC<{ typed: number; show: number; rise: number; caret: boolean; sent: number }> = ({
  typed,
  show,
  rise,
  caret,
  sent,
}) => {
  const text = REPLY.slice(0, typed);
  const n = typed > 0 ? lines(text, FIELD_CHARS) : 1;
  const ready = typed > 0;
  return (
    <div
      style={{
        position: "absolute",
        left: CARD_X,
        width: CARD_W,
        bottom: REPLY_FOOT,
        display: "flex",
        alignItems: "flex-end",
        gap: 20,
        opacity: show,
        transform: `translateY(${(1 - rise) * 60}px)`,
      }}
    >
      <div
        style={{
          width: AV,
          height: AV,
          flex: "none",
          borderRadius: "50%",
          border: `2px solid ${colors.gold}`,
          background: "rgb(20,20,22)",
          position: "relative",
          boxSizing: "border-box",
          marginBottom: 8,
        }}
      >
        <Thumb opacity={1} />
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 84,
          height: 40 + n * 44,
          boxSizing: "border-box",
          padding: "20px 28px",
          borderRadius: 36,
          background: "rgba(14,14,16,0.88)",
          border: "1px solid rgba(245,239,227,0.22)",
          fontFamily: sans,
          fontSize: 33,
          lineHeight: "44px",
          color: ready ? colors.cream : "rgba(245,239,227,0.42)",
        }}
      >
        {ready ? text : "Add a comment…"}
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: 38,
            marginLeft: 2,
            verticalAlign: "-7px",
            background: colors.gold,
            opacity: caret ? 1 : 0,
          }}
        />
      </div>
      <div
        style={{
          width: 66,
          height: 66,
          flex: "none",
          borderRadius: "50%",
          marginBottom: 9,
          background: ready ? colors.gold : "rgba(245,239,227,0.12)",
          transform: `scale(${1 + 0.18 * Math.sin(Math.PI * sent)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={30} height={30} viewBox="0 0 24 24">
          <path
            d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
            fill="none"
            stroke={ready ? colors.black : "rgba(245,239,227,0.5)"}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// a comment box with no words in it: an empty avatar ring and soft bars where the name, role
// and text would be. After the hold they pile in on top of the board, faster and faster, so it
// reads as more and more feedback arriving (Scott: "more feedback boxes coming in, unread"),
// without putting words in anyone's mouth.
const BLANKS = [31, 32, 32.75, 33.4, 34, 34.5, 35, 35.4, 35.8, 36.2].map((at, k) => ({
  at,
  x: ((k * 37) % 180) - 90,
  y: wide ? 270 + ((k * 211) % 520) : 330 + ((k * 211) % 760),
  rot: ((k * 53) % 80) / 10 - 4,
  rows: 1 + (k % 2),
  w: 0.55 + ((k * 29) % 35) / 100, // the text bar's length, as a share of the column
  size: 0.8 + ((k * 17) % 20) / 100, // the box's width, as a share of a card's
}));
const BlankCard: React.FC<{ y: number; rows: number; w: number; size: number }> = ({ y, rows, w, size }) => {
  const bar = (width: number | string, height: number, color: string, mb: number) => (
    <div style={{ width, height, borderRadius: height / 2, background: color, marginBottom: mb }} />
  );
  return (
    <div
      style={{
        position: "absolute",
        left: CARD_X + (CARD_W * (1 - size)) / 2,
        top: y,
        width: CARD_W * size,
        boxSizing: "border-box",
        padding: PAD,
        borderRadius: 24,
        background: "rgb(20,20,22)",
        border: "1px solid rgba(195,158,85,0.3)",
        display: "flex",
        gap: 22,
      }}
    >
      <div
        style={{
          width: AV,
          height: AV,
          flex: "none",
          borderRadius: "50%",
          border: "2px solid rgba(195,158,85,0.6)",
          boxSizing: "border-box",
        }}
      />
      <div style={{ flex: 1, paddingTop: 8 }}>
        {bar(230, 20, "rgba(245,239,227,0.5)", 12)}
        {bar(320, 10, "rgba(195,158,85,0.55)", 22)}
        {Array.from({ length: rows }, (_, r) =>
          bar(`${(r === rows - 1 ? w : 0.95) * 100}%`, 16, "rgba(245,239,227,0.28)", 18),
        )}
      </div>
    </div>
  );
};

// the gala team on stage, at its full width (Scott: Bianca on the left and Lee on the right
// were cut off at the edges: the square photo cropped to 4:5 lost ~190px a side): the photo
// whole across the top on black, its foot fading into the black under the quote; a push of only 3%, so the edges stay in
// (the same for the Table 3 selfie, a wide 4:3 photo: Scott, "this needs a better crop")
const WidePhoto: React.FC<{ f: string; aspect: number; from: number; to: number; dim: number; wpos?: string }> = ({
  f,
  aspect,
  from,
  to,
  dim,
  wpos = "50% 50%",
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 10, to, to + 10], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  // a slow 3% push so the photo is never still (polish), the edges' people still in frame
  const push = interpolate(frame, [from, to + 10], [1, 1.03], clamp);
  const photoH = W / aspect;
  if (wide) {
    // 16:9: full bleed, framed on the people (`wpos`), the slow push about them
    return (
      <AbsoluteFill style={{ opacity: o, backgroundColor: colors.black }}>
        <Img
          src={src(f)}
          style={{
            width: W,
            height: H,
            objectFit: "cover",
            objectPosition: wpos,
            transformOrigin: wpos,
            transform: `scale(${push})`,
            filter: `${grade(true)} brightness(${dim})`,
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* black under the photo, no blurred fill (Scott: "it's still blurry, minimise that blur") */}
      <AbsoluteFill style={{ backgroundColor: colors.black }} />
      <Img
        src={src(f)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: photoH,
          transform: `scale(${push})`,
          transformOrigin: "50% 40%",
          filter: `${grade(true)} brightness(${dim})`,
          // the photo's foot fades into the black over its last 12%
          WebkitMaskImage: "linear-gradient(to bottom, #000 88%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 88%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Photo: React.FC<{
  s: Shot;
  from: number;
  to: number;
  dim: number;
  blur: number;
}> = ({ s, from, to, dim, blur }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 10, to, to + 10], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const push = interpolate(frame, [from, to + 10], [1.02, 1.08], clamp);
  const p = s.place;
  if (p && wide) {
    return (
      <AbsoluteFill style={{ opacity: o }}>
        <Img
          src={src(s.f)}
          style={{
            width: W,
            height: H,
            objectFit: "cover",
            objectPosition: `${(p.x / p.w) * 100}% ${(p.y / p.h) * 100}%`,
            transform: `scale(${push})`,
            filter: `${grade(s.night)} brightness(${dim}) blur(${blur}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }
  if (p) {
    return (
      <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
        <Img
          src={src(s.f)}
          style={{
            position: "absolute",
            left: p.sx - p.x * p.scale,
            top: p.sy - p.y * p.scale,
            width: p.w * p.scale,
            height: p.h * p.scale,
            maxWidth: "none",
            // the push grows about the faces, so they stay clear of the board
            transformOrigin: `${p.x * p.scale}px ${p.y * p.scale}px`,
            transform: `scale(${push})`,
            filter: `${grade(s.night)} brightness(${dim}) blur(${blur}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img
        src={src(s.f)}
        style={{
          width: W,
          height: H,
          objectFit: "cover",
          objectPosition: s.pos ?? "50% 50%",
          transform: `scale(${push})`,
          filter: `${grade(s.night)} brightness(${dim}) blur(${blur}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const AmcFeedback: React.FC = () => {
  const frame = useCurrentFrame();

  // the stack: each card pops in on its beat, and the cards above slide up to make room
  const CLEAR = b(HORN); // the stack sweeps away for the held quote, on the horns' lift
  // the board and the header are gone before the gala photo comes up (sweeping 260px half
  // faded, they ghosted over it, the title over the "Gala Awards Dinner" banner)
  const clearOut = interpolate(frame, [CLEAR - 6, CLEAR + 1], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  const cards = COMMENTS.map((c, i) => {
    const t = b(c.at) - 1;
    const pop = interpolate(frame, [t, t + 8], [0, 1], { ...clamp, easing: EASE_OUT });
    // the gold edge settles within two beats (it lingered on the last card through the
    // whole hold, where its flicker showed most)
    const next = Math.min(COMMENTS[i + 1] ? b(COMMENTS[i + 1].at) - 1 : CLEAR, t + b(2));
    const lit = interpolate(frame, [t, t + 4, next, next + 10], [0, 1, 0.6, 0], clamp);
    return { c, i, t, pop, lit };
  });
  // offset of card i from the foot: the eased heights of every later card that has arrived
  // the board fills from the top down (Scott: "why does the first comment start low, have it
  // start at the top and go down"): each card lands under the last, where the finished board
  // sits centred under the title
  const yOf = (i: number) => {
    let y = STACK_FOOT - BOARD_H;
    for (let j = 0; j < i; j++) y += cardH(COMMENTS[j]) + GAP;
    // whole pixels: Chrome snaps a card's border to the pixel grid but not its text, so a
    // fractional position made the edges tick against the type (Scott: "flickering edges")
    return Math.round(y - clearOut * 140);
  };

  // the board steps back a little as the blank boxes pile on
  const boardBack = interpolate(frame, [b(BLANKS[0].at), b(BLANKS[BLANKS.length - 1].at) + 8], [1, 0.6], clamp);
  // the header builds in order (Scott): AMC 2026, its gold underline drawing out, then "The
  // reviews are in" once the line is drawn, then the comments from beat 4
  const header = interpolate(frame, [2, 16], [0, 1], { ...clamp, easing: EASE_OUT });
  const titleIn = interpolate(frame, [30, 46], [0, 1], { ...clamp, easing: EASE_OUT });
  const headerOut = interpolate(frame, [CLEAR - 6, CLEAR + 1], [1, 0], clamp);
  const rule = interpolate(frame, [8, 30], [0, 1], { ...clamp, easing: EASE_IN_OUT });

  // the held quote over the gala team, then the thank-you, then the logo
  const heroIn = interpolate(frame, [CLEAR + 3, CLEAR + 17], [0, 1], { ...clamp, easing: EASE_OUT });
  const heroOut = interpolate(frame, [b(REPLY_AT - 0.5), b(REPLY_AT)], [1, 0], clamp);
  const nameIn = interpolate(frame, [CLEAR + 14, CLEAR + 26], [0, 1], { ...clamp, easing: EASE_OUT });
  // the reply: the box rises, the words type in, it sends, and the posted comment lifts to
  // the middle of the frame
  const boxRise = interpolate(frame, [BOX_IN, BOX_IN + 12], [0, 1], { ...clamp, easing: EASE_OUT });
  const boxShow = interpolate(frame, [BOX_IN, BOX_IN + 8, SEND + 2, SEND + 8], [0, 1, 1, 0], clamp);
  const typed = TYPED.filter((at) => frame >= at).length;
  const typing = frame >= TYPE_FROM - 2 && frame <= TYPE_TO + 2;
  const caret = typing || Math.floor(frame / 15) % 2 === 0;
  const sent = interpolate(frame, [SEND - 3, SEND + 5], [0, 1], clamp);
  const POST: Comment = { at: 0, name: "Classic British Hotels", role: "Replying to all of you", text: REPLY, rows: 2 };
  const postH = cardH(POST);
  const postRest = wide ? 700 : 860; // under the Table 3 selfie (full width, 810 high), clear of the faces
  const postFrom = H - REPLY_FOOT - postH;
  const postLift = interpolate(frame, [SEND + 2, SEND + 18], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const postPop = interpolate(frame, [SEND + 2, SEND + 8], [0, 1], { ...clamp, easing: EASE_OUT });
  const postY = postFrom + (postRest - postFrom) * postLift;
  const postLit = interpolate(frame, [SEND + 2, SEND + 8, FLY - 6, FLY], [0, 1, 0.5, 0], clamp);
  // the CB in its avatar flies out to the middle, growing, and the card falls away under it
  // a tap on the avatar first, so the eye goes to it (Scott: "a sharper click ... our eyes
  // drawn to the thumbnail first, then it moves"): a flare and a click; it only ever grows
  // (the 1.3x pop that shrank back and the ripple ringing out read as big, small, big)
  // then the flight on a quicker, sharper curve
  const TAP = FLY - 14;
  const tap = interpolate(frame, [TAP, TAP + 4, TAP + 14], [0, 1, 0], clamp);
  const nudge = interpolate(frame, [TAP, TAP + 4], [1, 1.12], { ...clamp, easing: EASE_OUT });
  const fly = interpolate(frame, [FLY, FLY + 24], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  // the card falls away under the tapped avatar before it moves, so the flying logo never
  // crosses the card's own name and text (Scott: "a fragment in the transition")
  const cardGone = interpolate(frame, [TAP + 3, FLY - 1], [1, 0], { ...clamp, easing: EASE_IN_OUT });
  const avX = CARD_X + 1 + PAD + AV / 2;
  const avY = postRest + 1 + PAD + AV / 2;
  // the thumbnail grows into the full logo, centred, its dark square falling away; one gold
  // shimmer across the CB on the last hit
  // the avatar leaves the card at the tap and is the logo from then on
  const cbIn = frame >= TAP ? 1 : 0;
  const logoScale = S_TH * nudge + (1 - S_TH * nudge) * fly;
  // the circle melts away as the logo starts to grow, on the clock rather than the flight's
  // curve (tied to the curve it hung on large and vanished in one frame: Scott's "fragment")
  const square = interpolate(frame, [FLY - 2, FLY + 7], [1, 0], { ...clamp, easing: EASE_IN_OUT });
  const flyGlow = Math.sin(Math.PI * fly);
  const shimmer = interpolate(frame, [HIT, HIT + 30], [-0.6, 1.6], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      {/* the day behind the stack, dimmed and softened so the comments lead */}
      {BACKS.map((s, i) => (
        <Photo key={s.f} s={s} from={i === 0 ? -10 : b(s.from) - 1} to={i === BACKS.length - 1 ? CLEAR : b(BACKS[i + 1].from) - 1} dim={0.5} blur={1.8} />
      ))}
      {/* the gala team behind the held quote, clearer */}
      <WidePhoto f="team-gala.webp" aspect={1920 / 1918} wpos="50% 52%" from={CLEAR + 1} to={b(REPLY_AT - 0.5)} dim={0.92} />
      {/* the 25 Years balloons, then Table 3, faint behind the reply */}
      <WidePhoto f="table-3-selfie-lift.jpg" aspect={2000 / 1500} wpos="50% 45%" from={b(REPLY_AT + 8)} to={FLY - 4} dim={0.8} />
      <Photo s={{ f: "team-balloons-25-years.jpg", pos: "50% 35%", from: 0 }} from={BOX_IN} to={b(REPLY_AT + 8)} dim={0.78} blur={1.5} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.1) 0%, rgba(9,9,10,0.1) 55%, rgba(9,9,10,0.85) 100%)",
        }}
      />
      {/* deeper behind the header, so the photos' own signage never fights the title; it goes
          with the header (Scott: the dark band stayed over the top of the gala and Table 3) */}
      <AbsoluteFill
        style={{
          opacity: headerOut,
          background:
            "linear-gradient(to bottom, rgba(9,9,10,0.84) 0%, rgba(9,9,10,0.58) 13%, rgba(9,9,10,0) 30%)",
        }}
      />

      {/* the header */}
      <div
        style={{
          position: "absolute",
          top: wide ? 46 : 78,
          left: 0,
          width: W,
          textAlign: "center",
          opacity: header * headerOut,
          transform: `translateY(${(1 - header) * 16}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: sans,
            fontSize: 30,
            letterSpacing: 8,
            paddingLeft: 8,
            color: colors.gold,
            paddingBottom: 10,
            backgroundImage: `linear-gradient(${colors.gold}, ${colors.gold})`,
            backgroundSize: `${rule * 100}% 2px`,
            backgroundPosition: "50% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          AMC 2026
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 92,
            lineHeight: "110px",
            marginTop: 14,
            color: colors.cream,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 14}px)`,
          }}
        >
          The reviews are in
        </div>
      </div>

      {/* the comments, fading out as they rise under the header */}
      <AbsoluteFill
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, transparent ${wide ? 205 : 240}px, #000 ${wide ? 250 : 300}px)`,
          maskImage: `linear-gradient(to bottom, transparent ${wide ? 205 : 240}px, #000 ${wide ? 250 : 300}px)`,
        }}
      >
        {/* the board holds still (Scott: "just keep it static"; a sub-pixel drift ticked a
            pixel at a time, and fractional positions flickered the edges) */}
        <AbsoluteFill style={wide ? { transform: `scale(${BOARD_K})`, transformOrigin: `${W / 2}px ${BOARD_TOP}px` } : undefined}>
          {cards.map(({ c, i, t, pop, lit }) =>
            frame >= t && frame < CLEAR + 10 ? (
              <Card key={i} c={c} y={yOf(i)} pop={pop} fade={(1 - clearOut) * boardBack} lit={lit} />
            ) : null,
          )}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* the blank boxes, piling on */}
      <AbsoluteFill style={{ transform: `translateY(${Math.round(-clearOut * 140)}px)` }}>
        {BLANKS.map((k, i) => {
          const t = b(k.at) - 1;
          if (frame < t || frame >= CLEAR + 10) return null;
          const land = interpolate(frame, [t, t + 6], [0, 1], { ...clamp, easing: EASE_OUT });
          return (
            <AbsoluteFill
              key={i}
              style={{
                opacity: land * (1 - clearOut),
                transform: `translateX(${k.x}px) rotate(${k.rot * (0.4 + 0.6 * land)}deg) scale(${1.1 - 0.1 * land})`,
                transformOrigin: `${W / 2}px ${k.y + 90}px`,
                filter: "drop-shadow(0 22px 28px rgba(0,0,0,0.55))",
              }}
            >
              <BlankCard y={k.y} rows={k.rows} w={k.w} size={k.size} />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>

      {/* the held quote */}
      {heroIn > 0 && heroOut > 0 ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: wide ? 70 : 96,
            opacity: heroOut,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 150,
              lineHeight: "90px",
              color: colors.gold,
              opacity: heroIn,
            }}
          >
            “
          </div>
          <div
            style={{
              width: wide ? 1500 : 900,
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: wide ? 78 : 86,
              lineHeight: "98px",
              textAlign: "center",
              color: colors.cream,
              opacity: heroIn,
              transform: `translateY(${(1 - heroIn) * 20}px)`,
              textShadow: "0 2px 24px rgba(0,0,0,0.6)",
              // balanced lines, so no word is left on its own
              ...({ textWrap: "balance" } as React.CSSProperties),
            }}
          >
            {HERO.text}
          </div>
          <div
            style={{
              marginTop: 34,
              fontFamily: sans,
              fontSize: 27,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: colors.gold,
              textAlign: "center",
              opacity: nameIn,
            }}
          >
            {HERO.name}
            <div style={{ color: colors.paleGold, letterSpacing: 2.5, fontSize: 21, marginTop: 8 }}>
              {HERO.role}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* CBH's reply: the box types it, then the posted comment */}
      {boxShow > 0 ? <ReplyBox typed={typed} show={boxShow} rise={boxRise} caret={caret} sent={sent} /> : null}
      {frame >= SEND + 2 && cardGone > 0 ? (
        <div style={{ opacity: cardGone, filter: `blur(${(1 - cardGone) * 4}px)`, transform: `translateY(${(1 - cardGone) * 30}px)` }}>
          <Card c={POST} y={postY} pop={postPop} fade={1} lit={postLit} cb={frame >= TAP ? 0 : 1} ring={frame >= TAP ? 0 : 1} />
        </div>
      ) : null}

      {/* the logo, alone on black, the shimmer across the CB on the last hit */}
      <AbsoluteFill style={{ opacity: cbIn }}>
        <div
          style={{
            position: "absolute",
            left: (W - LOGO_W) / 2,
            top: (H - LOGO_H) / 2,
            width: LOGO_W,
            height: LOGO_H,
            transform: `translate(${(avX - W / 2) * (1 - fly)}px, ${(avY - H / 2) * (1 - fly)}px) scale(${logoScale})`,
            filter: flyGlow > 0 ? `drop-shadow(0 0 ${30 * flyGlow}px rgba(195,158,85,${0.45 * flyGlow}))` : "none",
            transformOrigin: "50% 50%",
          }}
        >
          {/* the thumbnail's dark circle and gold ring (flaring on the tap), growing with the
              logo and falling away */}
          <div
            style={{
              position: "absolute",
              left: LOGO_W / 2 - AV / S_TH / 2,
              top: LOGO_H / 2 - AV / S_TH / 2,
              width: AV / S_TH,
              height: AV / S_TH,
              borderRadius: "50%",
              boxSizing: "border-box",
              // the ring stays 2px on screen as the logo grows
              border: `${2 / logoScale}px solid rgb(${Math.round(195 + 50 * tap)},${Math.round(158 + 60 * tap)},${Math.round(85 + 90 * tap)})`,
              background: "rgb(20,20,22)",
              boxShadow: tap > 0 ? `0 0 ${(40 * tap) / S_TH}px ${(8 * tap) / S_TH}px rgba(218,195,150,${0.9 * tap})` : "none",
              opacity: square,
            }}
          />
          <Img src={LOGO_SRC} style={logoBox} />
          <div
            style={{
              ...logoBox,
              WebkitMaskImage: `url(${CB_SRC})`,
              maskImage: `url(${CB_SRC})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              background: `linear-gradient(115deg, rgba(255,232,170,0) ${shimmer * 100 - 18}%, rgba(255,236,185,0.85) ${shimmer * 100}%, rgba(255,232,170,0) ${shimmer * 100 + 18}%)`,
            }}
          />
        </div>
      </AbsoluteFill>

      <FilmFinish />
      <Audio
        src={src("music.mp3")}
        volume={(f) =>
          interpolate(f, [0, 6, AMC_FEEDBACK_FRAMES - 6, AMC_FEEDBACK_FRAMES], [0, 0.9, 0.9, 0], clamp)
        }
      />
      {/* a subtle pop as each blank box lands (scripts/amc-pop-sfx.py), a touch louder as
          the pile quickens */}
      {BLANKS.map((k, i) => (
        <Sequence key={`pop${i}`} from={b(k.at) - 1} layout="none">
          <Audio src={src(`pop-${(i % 4) + 1}.wav`)} volume={0.16 + 0.012 * i} />
        </Sequence>
      ))}
      {/* the keys as the reply types, a click as it sends */}
      {TYPED.map((at, i) => (
        <Sequence key={i} from={at} layout="none">
          <Audio
            src={staticFile(
              REPLY[i] === " "
                ? `${KEYS}/space-${(i % 2) + 1}.wav`
                : `${KEYS}/key-${((REPLY.charCodeAt(i) * 7 + i * 3) % 6) + 1}.wav`,
            )}
            volume={0.3}
          />
        </Sequence>
      ))}
      <Sequence from={FLY - 15} layout="none">
        <Audio src={staticFile(`${KEYS}/click.wav`)} volume={0.5} />
      </Sequence>
      <Sequence from={SEND - 1} layout="none">
        <Audio src={staticFile(`${KEYS}/click.wav`)} volume={0.36} />
      </Sequence>
    </AbsoluteFill>
  );
};
return { AmcFeedback, frames: AMC_FEEDBACK_FRAMES };
};

const PORTRAIT = build(false);
const WIDE = build(true);
export const AMC_FEEDBACK_FRAMES = PORTRAIT.frames;
export const AmcFeedback = PORTRAIT.AmcFeedback;
export const AmcFeedbackWide = WIDE.AmcFeedback;
