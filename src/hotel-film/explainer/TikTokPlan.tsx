import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { colors, EASE_IN_OUT, progress, sans, serif } from "../theme";

// The TikTok plan as a 16:9 explainer for the call with Bianca (Scott, 25 Nov: "run through the tiktok growth
// strategy, make an explainer video", then "can you add ai voice"): one point a scene, CBH black and gold, a British
// voice (Kokoro, run locally by scripts/tiktok-plan-vo.py, which prints the line lengths below). Figures from the plan.

const VO = [4.5, 8.36, 5.93, 3.58, 9.26, 3.18, 5.27, 11.84, 7.53, 6.44, 5.35, 8.98, 4.84, 7.94];
const LEAD = 12; // frames of quiet before each line
const TAIL = 16; // frames after it
const LEN = VO.map((d) => Math.round(d * 30) + LEAD + TAIL);
const STARTS = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b, 0));
const END_HOLD = 60;
export const TIKTOK_PLAN_FRAMES = LEN.reduce((a, b) => a + b, 0) + END_HOLD;

const cream = colors.cream, gold = colors.gold;
const p = (f: number, s: number, d = 14) => progress(f, s, d);
const rise = (t: number, px = 26): React.CSSProperties => ({ opacity: t, transform: `translateY(${(1 - t) * px}px)` });
const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");

const Caps: React.FC<{ children: React.ReactNode; t?: number; style?: React.CSSProperties }> = ({ children, t = 1, style }) => (
  <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: "0.24em", color: gold, textTransform: "uppercase", ...rise(t), ...style }}>{children}</div>
);
const Head: React.FC<{ children: React.ReactNode; t?: number; size?: number; style?: React.CSSProperties }> = ({ children, t = 1, size = 96, style }) => (
  <div style={{ fontFamily: serif, fontWeight: 500, fontSize: size, lineHeight: 1.08, color: cream, whiteSpace: "pre-line", ...rise(t), ...style }}>{children}</div>
);
const Body: React.FC<{ children: React.ReactNode; t?: number; style?: React.CSSProperties }> = ({ children, t = 1, style }) => (
  <div style={{ fontFamily: sans, fontWeight: 400, fontSize: 34, lineHeight: 1.4, color: "rgba(245,239,227,0.78)", ...rise(t), ...style }}>{children}</div>
);
const Left: React.FC<{ children: React.ReactNode; w?: number }> = ({ children, w = 820 }) => (
  <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: w, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>{children}</div>
);

// a phone with a clip playing and a TikTok style caption pill
const Phone: React.FC<{ clip: string; pill: string[]; t: number; f: number; follow?: number }> = ({ clip, pill, t, f, follow = -1 }) => (
  <div style={{ position: "absolute", right: 200, top: 120, width: 470, height: 840, borderRadius: 52, overflow: "hidden", border: `3px solid rgba(195,158,85,0.55)`,
    boxShadow: "0 40px 90px rgba(0,0,0,0.6)", opacity: t, transform: `translateY(${(1 - t) * 60}px)` }}>
    <OffthreadVideo src={staticFile(clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {pill.map((l, i) => (
        <div key={l} style={{ background: "#000", color: "#fff", fontFamily: "Figtree, " + sans, fontWeight: 700, fontSize: 30, padding: "6px 16px", borderRadius: 12,
          ...rise(p(f, 10 + i * 5, 10), 14) }}>{l}</div>
      ))}
    </div>
    {follow >= 0 ? (
      <div style={{ position: "absolute", left: "50%", bottom: 120, transform: `translateX(-50%) scale(${1 - 0.08 * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - follow) / 8)))})`,
        background: f >= follow + 4 ? "rgba(255,255,255,0.18)" : "#FE2C55", color: "#fff", fontFamily: sans, fontWeight: 700, fontSize: 28, padding: "12px 46px", borderRadius: 10,
        opacity: p(f, follow - 20, 10) }}>{f >= follow + 4 ? "Following" : "Follow"}</div>
    ) : null}
  </div>
);

const S0: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
    <Img src={staticFile("brand/cbh-logo-on-dark.svg")} style={{ width: 300, opacity: p(f, 0, 18) }} />
    <Caps t={p(f, 10)}>TikTok plan 2027</Caps>
    <Head t={p(f, 18)} size={110} style={{ textAlign: "center" }}>Turning viewers{"\n"}into followers</Head>
  </AbsoluteFill>
);

const S1: React.FC<{ f: number; len: number }> = ({ f }) => {
  const c = interpolate(f, [8, 70], [0, 472], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const w = 1200;
  return (
    <AbsoluteFill>
      <Left w={1500}>
        <Caps t={p(f, 0)}>Where we are</Caps>
        <div style={{ display: "flex", alignItems: "baseline", gap: 28, ...rise(p(f, 4)) }}>
          <div style={{ fontFamily: serif, fontSize: 220, color: cream, lineHeight: 1 }}>{fmt(c)}</div>
          <div style={{ fontFamily: serif, fontSize: 64, color: "rgba(245,239,227,0.7)" }}>followers</div>
        </div>
        <div style={{ position: "relative", width: w, height: 14, background: "rgba(245,239,227,0.12)", borderRadius: 7, ...rise(p(f, 10)) }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (c / 500) * w, background: gold, borderRadius: 7 }} />
          <div style={{ position: "absolute", left: w - 2, top: -16, width: 3, height: 46, background: cream }} />
          <div style={{ position: "absolute", left: w - 130, top: 44, fontFamily: sans, fontSize: 28, color: cream }}>Target 500</div>
        </div>
        <Body t={p(f, 120)} style={{ marginTop: 60, fontSize: 44, color: cream }}>
          <span style={{ color: gold, fontWeight: 700 }}>+92%</span> video views in the last 28 days (11.3K)
        </Body>
      </Left>
    </AbsoluteFill>
  );
};

const S2: React.FC<{ f: number }> = ({ f }) => {
  const N = 185, cols = 20, sz = 30, gap = 9;
  return (
    <AbsoluteFill>
      <Left w={700}>
        <Caps t={p(f, 0)}>The gap</Caps>
        <Head t={p(f, 6)}>1 profile visit{"\n"}for every 185 views</Head>
        <Body t={p(f, 20)}>Views are up 92%, profile views only 17%.</Body>
      </Left>
      <div style={{ position: "absolute", right: 150, top: 340, width: cols * (sz + gap), display: "flex", flexWrap: "wrap", gap }}>
        {Array.from({ length: N }).map((_, i) => {
          const t = p(f, 10 + i * 0.35, 6);
          const lit = i === 92 && f > 90;
          return <div key={i} style={{ width: sz, height: sz, borderRadius: sz / 2, background: lit ? gold : "rgba(245,239,227,0.22)", opacity: t,
            transform: `scale(${lit ? 1 + 0.5 * Math.sin(Math.PI * Math.min(1, (f - 90) / 12)) : 1})`, boxShadow: lit ? `0 0 24px ${gold}` : "none" }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

const S3: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
    <Caps t={p(f, 0)}>The job for 2027</Caps>
    <Head t={p(f, 8)} size={140} style={{ textAlign: "center" }}>Turn viewers{"\n"}into <span style={{ color: gold }}>followers</span></Head>
  </AbsoluteFill>
);

const Bars: React.FC<{ f: number; rows: { label: string; v: number; hi?: boolean }[]; max: number; at: number; unit: string }> = ({ f, rows, max, at, unit }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 30 }}>
    {rows.map((r, i) => {
      const t = p(f, at + i * 10, 24);
      return (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, t * 2) }}>
          <div style={{ width: 230, fontFamily: sans, fontSize: 30, color: cream }}>{r.label}</div>
          <div style={{ height: 40, width: (r.v / max) * 420 * t, background: r.hi ? gold : "rgba(245,239,227,0.3)", borderRadius: 4 }} />
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 32, color: r.hi ? gold : cream }}>{fmt(r.v * t)}{unit}</div>
        </div>
      );
    })}
  </div>
);

const S4: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Left w={860}>
      <Caps t={p(f, 0)}>Rule one</Caps>
      <Head t={p(f, 6)}>A hook on screen{"\n"}from the first frame</Head>
      <Bars f={f} at={110} max={325} unit=" views" rows={[{ label: "With a hook", v: 325, hi: true }, { label: "Without", v: 196 }]} />
      <Body t={p(f, 130)} style={{ fontSize: 26 }}>Average views, our first six posts</Body>
    </Left>
    <Phone clip="hotels/rowton-hall/screen-time/pool-4s.mp4" pill={["save this for your", "next spa weekend"]} t={p(f, 4, 18)} f={f} />
  </AbsoluteFill>
);

const S5: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Left w={860}>
      <Caps t={p(f, 0)}>Rule two</Caps>
      <Head t={p(f, 6)}>End on a question,{"\n"}or a reason to follow</Head>
    </Left>
    <Phone clip="hotels/low-wood-bay/screen-time/candles.mp4" pill={["who are you", "taking?"]} t={p(f, 0, 16)} f={f} follow={60} />
  </AbsoluteFill>
);

const S6: React.FC<{ f: number }> = ({ f }) => {
  const days = [["Mon", "8pm"], ["Tue", ""], ["Wed", "8pm"], ["Thu", ""], ["Fri", "8pm"], ["Sat", "12 to 3pm"], ["Sun", ""]];
  return (
    <AbsoluteFill>
      <Left w={1640}>
        <Caps t={p(f, 0)}>Posting</Caps>
        <Head t={p(f, 6)}>3 to 4 posts a week</Head>
        <div style={{ display: "flex", gap: 20, marginTop: 40 }}>
          {days.map(([d, t], i) => {
            const on = t !== "";
            const a = p(f, 20 + i * 6, 14);
            return (
              <div key={d} style={{ width: 200, height: 220, borderRadius: 20, border: `2px solid ${on ? gold : "rgba(245,239,227,0.18)"}`, background: on ? "rgba(195,158,85,0.14)" : "transparent",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, ...rise(a, 30) }}>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 32, color: cream }}>{d}</div>
                <div style={{ fontFamily: sans, fontSize: 26, color: gold, opacity: on ? 1 : 0 }}>{t || "."}</div>
              </div>
            );
          })}
        </div>
        <Body t={p(f, 70)} style={{ fontSize: 28 }}>Weekdays at 8pm, inside the 6 to 10pm peak; weekends between 12 and 3pm</Body>
      </Left>
    </AbsoluteFill>
  );
};

const MIX = [
  { name: "Save for later lists and tips", share: 40, at: 30 },
  { name: "POV stays and food", share: 30, at: 105 },
  { name: "Stories, heritage and quirks", share: 20, at: 190 },
  { name: "TikTok only animation", share: 10, at: 260 },
];
const S7: React.FC<{ f: number }> = ({ f }) => {
  const W = 1640;
  let x = 0;
  return (
    <AbsoluteFill>
      <Left w={W}>
        <Caps t={p(f, 0)}>The content mix</Caps>
        <Head t={p(f, 6)} size={84}>What we post</Head>
        <div style={{ position: "relative", width: W, height: 360, marginTop: 30 }}>
          {MIX.map((m, i) => {
            const t = p(f, m.at, 20);
            const left = x;
            x += (m.share / 100) * W;
            return (
              <div key={m.name} style={{ position: "absolute", left, top: 0, width: (m.share / 100) * W - 10, opacity: t }}>
                <div style={{ height: 120, background: gold, opacity: 1 - i * 0.2, borderRadius: 8, transformOrigin: "left", transform: `scaleX(${t})` }} />
                <div style={{ fontFamily: serif, fontSize: 76, color: cream, marginTop: 18 }}>{m.share}%</div>
                <div style={{ fontFamily: sans, fontSize: 26, color: "rgba(245,239,227,0.8)", lineHeight: 1.3 }}>{m.name}</div>
              </div>
            );
          })}
        </div>
      </Left>
    </AbsoluteFill>
  );
};

const S8: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Left w={860}>
      <Caps t={p(f, 0)}>Packages</Caps>
      <Head t={p(f, 6)} size={88}>Packages with a strong{"\n"}hook get their own video</Head>
      <Body t={p(f, 70)}>Like Rutland Hall's Four Roots Journey: a bathing ritual, a treatment and meditation</Body>
    </Left>
    <Phone clip="hotels/rutland-hall/spa-baths.mp4" pill={["four roots", "journey"]} t={p(f, 4, 18)} f={f} />
  </AbsoluteFill>
);

const Card: React.FC<{ big: string; text: string; t: number }> = ({ big, text, t }) => (
  <div style={{ width: 720, padding: "50px 56px", borderRadius: 28, border: `2px solid rgba(195,158,85,0.6)`, background: "rgba(195,158,85,0.08)", ...rise(t, 30) }}>
    <div style={{ fontFamily: serif, fontSize: 92, color: gold, lineHeight: 1 }}>{big}</div>
    <div style={{ fontFamily: sans, fontSize: 34, color: cream, marginTop: 20, lineHeight: 1.35 }}>{text}</div>
  </div>
);
const S9: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Left w={1640}>
      <Caps t={p(f, 0)}>Partners</Caps>
      <div style={{ display: "flex", gap: 60, marginTop: 20 }}>
        <Card t={p(f, 10)} big="1 to 2" text="Hosted stays with UK hotel creators (30K to 60K followers), at willing member hotels" />
        <Card t={p(f, 90)} big="Weekly" text="Likes and comments on our members' TikToks, so they post with us in mind" />
      </div>
    </Left>
  </AbsoluteFill>
);

const KPI = [
  { m: "Average watch time", now: "3 to 7s", aim: "6s or more" },
  { m: "Engagement rate", now: "1.3%", aim: "3%" },
  { m: "Profile visits per 1,000 views", now: "5.4", aim: "10" },
  { m: "New followers", now: "about 212 this year", aim: "set with the 2027 target" },
];
const S10: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Left w={1640}>
      <Caps t={p(f, 0)}>How we measure it</Caps>
      <div style={{ display: "grid", gridTemplateColumns: "620px 420px 520px", rowGap: 26, marginTop: 30, alignItems: "baseline" }}>
        {[["", "Now", "Aim"]].concat(KPI.map((k) => [k.m, k.now, k.aim])).map((row, i) => (
          <React.Fragment key={row[0] || "head"}>
            {row.map((c, j) => (
              <div key={j} style={{ fontFamily: i === 0 ? sans : j === 2 ? serif : sans, fontWeight: i === 0 ? 700 : 400, fontSize: i === 0 ? 26 : j === 2 ? 52 : 36,
                letterSpacing: i === 0 ? "0.2em" : 0, textTransform: i === 0 ? "uppercase" : "none", color: i === 0 ? gold : j === 2 ? gold : cream,
                ...rise(p(f, 10 + i * 18), 20) }}>{c}</div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </Left>
  </AbsoluteFill>
);

const S11: React.FC<{ f: number }> = ({ f }) => {
  const c = interpolate(f, [150, 230], [472, 522], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  return (
    <AbsoluteFill>
      <Left w={1640}>
        <Caps t={p(f, 0)}>Paid: small, and only behind what works</Caps>
        <Head t={p(f, 8)} size={88}>First test: a follower boost</Head>
        <div style={{ display: "flex", gap: 90, marginTop: 40, alignItems: "flex-end" }}>
          {[["£14.40", "one day"], ["42 to 210", "estimated new followers"]].map(([a, b], i) => (
            <div key={b} style={rise(p(f, 70 + i * 25), 24)}>
              <div style={{ fontFamily: serif, fontSize: 120, color: gold, lineHeight: 1 }}>{a}</div>
              <div style={{ fontFamily: sans, fontSize: 30, color: cream, marginTop: 10 }}>{b}</div>
            </div>
          ))}
          <div style={rise(p(f, 140), 24)}>
            <div style={{ fontFamily: serif, fontSize: 120, color: cream, lineHeight: 1 }}>{fmt(c)}</div>
            <div style={{ fontFamily: sans, fontSize: 30, color: cream, marginTop: 10 }}>{c >= 500 ? "past 500 with 50 new" : "followers"}</div>
          </div>
        </div>
      </Left>
    </AbsoluteFill>
  );
};

const STEPS = [["Jan", "Set up"], ["Feb", "Test"], ["Mar", "Paid boost"], ["Apr", "Creators"], ["May to Jun", "Scale"]];
const S12: React.FC<{ f: number }> = ({ f }) => {
  const W = 1560, gapX = W / (STEPS.length - 1);
  const line = p(f, 8, 100);
  return (
    <AbsoluteFill>
      <Left w={1640}>
        <Caps t={p(f, 0)}>January to June</Caps>
        <div style={{ position: "relative", width: W + 40, height: 300, marginTop: 50 }}>
          <div style={{ position: "absolute", left: 20, top: 100, height: 4, width: W * line, background: gold }} />
          {STEPS.map(([m, s], i) => {
            const t = p(f, 8 + i * 22, 14);
            return (
              <div key={m} style={{ position: "absolute", left: 20 + i * gapX - 110, top: 0, width: 220, textAlign: "center", opacity: t }}>
                <div style={{ fontFamily: sans, fontSize: 28, color: "rgba(245,239,227,0.7)", height: 60 }}>{m}</div>
                <div style={{ margin: "26px auto 0", width: 28, height: 28, borderRadius: 14, background: gold, transform: `scale(${t})` }} />
                <div style={{ fontFamily: serif, fontSize: 52, color: cream, marginTop: 30 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </Left>
    </AbsoluteFill>
  );
};

const DECISIONS = ["Our 2027 follower target", "Which members host a creator stay", "A budget, when there is one"];
const S13: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Left w={1200}>
      <Caps t={p(f, 0)}>Decisions to make</Caps>
      {DECISIONS.map((d, i) => (
        <div key={d} style={{ display: "flex", alignItems: "center", gap: 36, ...rise(p(f, 50 + i * 55), 24) }}>
          <div style={{ fontFamily: serif, fontSize: 96, color: gold, width: 70 }}>{i + 1}</div>
          <div style={{ fontFamily: serif, fontSize: 72, color: cream }}>{d}</div>
        </div>
      ))}
    </Left>
  </AbsoluteFill>
);

const SCENES: React.FC<{ f: number; len: number }>[] = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13];

export const TikTokPlan: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: colors.black }}>
      {SCENES.map((Scene, i) => {
        const len = LEN[i] + (i === SCENES.length - 1 ? END_HOLD : 0);
        const f = frame - STARTS[i];
        const fade = Math.min(p(f, 0, 10), 1 - p(f, len - 10, 10));
        return (
          <Sequence key={i} from={STARTS[i]} durationInFrames={len}>
            <AbsoluteFill style={{ opacity: i === SCENES.length - 1 ? p(f, 0, 10) : fade }}>
              <Scene f={f} len={len} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {VO.map((_, i) => (
        <Sequence key={`vo${i}`} from={STARTS[i] + LEAD} durationInFrames={LEN[i]}>
          <Audio src={staticFile(`explainer/vo/${String(i).padStart(2, "0")}.wav`)} />
        </Sequence>
      ))}
      <Img src={staticFile("brand/cb-watermark.png")} style={{ position: "absolute", right: 64, bottom: 54, width: 76, opacity: 0.85 }} />
    </AbsoluteFill>
  );
};
