import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FilmFinish } from "../components/FilmFinish";
import { colors, EASE_IN_OUT, progress, serif } from "../theme";
import { B, Label, MUSIC, MUSIC_FROM, MUSIC_GAIN, Page, PAGES, Picture } from "./HardbackFlip";

// The winter flipbook as a pad (Scott, 30 Oct: "do the flipbook the same way, the feel, if it's a better
// flip", after the stick-figure reel's pages lifting away; the hardback's turn needed work, its cover was
// streaky, the end line weak). A pad bound at the top lies on the CBH charcoal, black card cover with the
// gold CB; the cover lifts away over its top edge as the camera pushes in, and from there every page is a
// full-bleed hotel shot (the hardback's pages, footage at its own speed) that lifts away on a downbeat,
// a page every two bars, its shadow sliding off the page beneath (one calm move, nothing fast). The last
// page is the end card: black card, a gold ribbon bookmark, "Bookmark / your winter", the camera drawing
// back to the pad. The hardback stays as `cbh-flipbook-winter-hardback`.

const W = 1080;
const H = 1920;
const CARD = "#141312";
const CHARCOAL = "#282825";
const LIFT = 18; // frames a page takes to lift away

// the timeline: the cover lifts away onto beat 4; page i is on top from its downbeat until it lifts onto
// beat 12 + 8i; the end card is on top from beat 44, the camera back out over 46-50
const COVER_OFF = B(4);
const PAGE_OFF = (i: number) => B(12 + 8 * i);
const END_ON = PAGE_OFF(PAGES.length - 1);
const LINE = END_ON + 8;
export const PAD_FRAMES = B(52);

const ease = (f: number, a: number, b: number) => progress(f, a, b - a, EASE_IN_OUT);

// black card with a fine even grain (no streaks)
const Card: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill style={{ backgroundColor: CARD }}>
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.8  0 0 0 0 0.7  0 0 0 0.045 0" />
      </filter>
      <rect width={W} height={H} filter={`url(#${id})`} />
    </svg>
  </AbsoluteFill>
);

// a page lifting away over its top edge (`off` = the frame it is gone), dimming as it goes
const Leaf: React.FC<{ off: number; children: React.ReactNode }> = ({ off, children }) => {
  const frame = useCurrentFrame();
  const t = ease(frame, off - LIFT, off);
  return (
    <AbsoluteFill style={{ transformOrigin: "50% 0%", transform: `perspective(2600px) rotateX(${-t * 98}deg)`,
      backfaceVisibility: "hidden", filter: t > 0 ? `brightness(${1 - 0.4 * t})` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};
// the lifting page's shadow on the page beneath, sliding up off it
const Shade: React.FC<{ off: number }> = ({ off }) => {
  const frame = useCurrentFrame();
  const t = ease(frame, off - LIFT, off);
  if (t <= 0 || t >= 1) return null;
  return <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(0,0,0,${0.62 * (1 - t)}) 0%, rgba(0,0,0,${0.3 * (1 - t)}) ${(1 - t) * 70}%, rgba(0,0,0,0) ${(1 - t) * 100}%)` }} />;
};

const HotelPage: React.FC<{ p: Page; i: number }> = ({ p, i }) => {
  const frame = useCurrentFrame();
  const on = i === 0 ? COVER_OFF : PAGE_OFF(i - 1); // when it becomes the top page
  const label = progress(frame, on + 8, 16);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: CARD }}>
      <Picture p={p} from={on} to={PAGE_OFF(i)} />
      <Label p={p} on={label} />
    </AbsoluteFill>
  );
};

export const PadFlip: React.FC = () => {
  const frame = useCurrentFrame();
  // the camera: the pad on the table, in to full bleed as the cover lifts, back out at the end
  const s = frame < END_ON
    ? interpolate(ease(frame, B(2), B(8)), [0, 1], [0.8, 1])
    : interpolate(ease(frame, B(46), B(50)), [0, 1], [1, 0.84]);
  const ty = (1 - s) * 60; // a touch low, so the binding shows above
  const line = progress(frame, LINE, 20);
  const ribbon = ease(frame, END_ON - 4, END_ON + 14);
  // only the top page and the one beneath it are drawn
  const layers: { off: number; el: React.ReactNode }[] = [
    {
      off: COVER_OFF,
      el: (
        <>
          <Card id="cover-grain" />
          <div style={{ position: "absolute", inset: 64, border: `2px solid ${colors.gold}`, opacity: 0.75 }} />
          <Img src={staticFile("brand/cbh-logo-cb-only.svg")}
            style={{ position: "absolute", left: (W - 380) / 2, top: 560, width: 380, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }} />
        </>
      ),
    },
    ...PAGES.map((p, i) => ({ off: PAGE_OFF(i), el: <HotelPage p={p} i={i} /> })),
  ];
  const top = layers.findIndex((l) => frame < l.off);
  return (
    <AbsoluteFill style={{ backgroundColor: CHARCOAL }}>
      <AbsoluteFill style={{ transform: `translateY(${ty}px) scale(${s})` }}>
        {/* the pad's thickness: page edges stacked under it, its shadow on the table */}
        {[3, 2, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: 0, top: k * 7, width: W, height: H, backgroundColor: k % 2 ? "#1d1c1a" : "#121110",
            boxShadow: k === 3 ? "0 30px 60px rgba(0,0,0,0.5)" : undefined, borderRadius: 4 }} />
        ))}
        {/* the end card, the last page */}
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <Card id="end-grain" />
          <div style={{ position: "absolute", top: 740, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 104,
            lineHeight: 1.12, color: colors.cream, opacity: line, transform: `translateY(${(1 - line) * 22}px)` }}>
            Bookmark
            <br />
            your winter
          </div>
          {/* the ribbon bookmark, laid down the page from the binding */}
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
            <defs>
              <linearGradient id="ribbon" x1="0" x2="1">
                <stop offset="0" stopColor="#8f7238" />
                <stop offset="0.45" stopColor="#d9b56b" />
                <stop offset="1" stopColor="#a8873f" />
              </linearGradient>
            </defs>
            {(() => {
              const len = 1180 * ribbon;
              return len > 2 ? (
                <path d={`M922 0 L974 0 L974 ${len} L948 ${len - 32} L922 ${len} Z`} fill="url(#ribbon)"
                  style={{ filter: "drop-shadow(3px 6px 6px rgba(0,0,0,0.55))" }} />
              ) : null;
            })()}
          </svg>
          {frame < END_ON ? <Shade off={END_ON} /> : null}
        </AbsoluteFill>
        {layers.map((l, k) =>
          top >= 0 && (k === top || k === top + 1) ? (
            <AbsoluteFill key={k} style={{ zIndex: 10 - k }}>
              <Leaf off={l.off}>{l.el}</Leaf>
              {k === top + 1 ? <Shade off={layers[top].off} /> : null}
            </AbsoluteFill>
          ) : null,
        )}
        {/* the binding along the top */}
        <div style={{ position: "absolute", left: -6, top: -44, width: W + 12, height: 48, borderRadius: "10px 10px 2px 2px",
          background: "linear-gradient(#1c1b19, #0b0b0a)", borderBottom: `2px solid ${colors.gold}`, zIndex: 20 }} />
      </AbsoluteFill>
      <Img src={staticFile("brand/cb-watermark.png")}
        style={{ position: "absolute", left: 920, top: 1452, width: 100, height: 108, opacity: progress(frame, COVER_OFF, 12) }} />
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={Math.round(MUSIC_FROM * 30)}
        volume={(f) => MUSIC_GAIN * interpolate(f, [0, 6, PAD_FRAMES - 24, PAD_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      <FilmFinish />
    </AbsoluteFill>
  );
};
