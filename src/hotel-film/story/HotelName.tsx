import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, EASE_IN_OUT, EASE_OUT, progress, sans, serif } from "../theme";

// The house hotel label (gold caps place, underline, the name in cream Cormorant), copied from
// foil/VoucherClean.tsx on claude/loving-brown-0k56ps so the Dear notes need nothing else from there.
const LIFT = "0 3px 28px rgba(9,9,10,0.55), 0 1px 3px rgba(9,9,10,0.45)";

// a deeper pocket than the opener's: the churro's plate and the breakfast tray are bright
const LOW =
  "radial-gradient(ellipse 1000px 520px at 120px 1400px, rgba(9,9,10,0.72) 0%, rgba(9,9,10,0.5) 45%, rgba(9,9,10,0) 100%)";

// House style (the skill's "Hotel name and location"): in the lower third, the place on
// top in small gold caps with a still 2px gold underline the width of the words, the
// hotel's name under it large in cream Cormorant; rising in together just after the cut,
// leaving before the next hotel.
// `gentle` (Scott, Dark by five: the words "just kind of pop up"): a slower build in order, the
// place easing up first, its underline drawing out left to right, then the name drifting up
// out of a soft focus; a longer fade out. Off by default, so the other films keep theirs.
export const HotelName: React.FC<{
  name: string;
  place: string;
  len: number;
  gentle?: boolean;
  // a pool of shade right behind the words and a dark halo on the gold caps, for a caption
  // over something bright (Dark by five: LAKE DISTRICT over the fire was hard to read)
  shade?: number;
}> = ({ name, place, len, gentle, shade }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 6, 16, EASE_OUT);
  const pPlace = gentle ? progress(frame, 0, 30, EASE_IN_OUT) : p;
  const pLine = gentle ? progress(frame, 14, 30, EASE_IN_OUT) : 1;
  const pName = gentle ? progress(frame, 26, 34, EASE_IN_OUT) : p;
  const out = 1 - progress(frame, len - (gentle ? 20 : 10), gentle ? 20 : 10, EASE_IN_OUT);
  const o = gentle ? out : p * out;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* gentle: the shade under the words comes in lighter and slower, so it never reads as
          the picture dimming again (Dark by five: a "second wave" after the colour arrived) */}
      <AbsoluteFill style={{ background: LOW, opacity: gentle ? 0.62 * progress(frame, 0, 56, EASE_IN_OUT) : 1 }} />
      {shade ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 520px 150px at 330px 1400px, rgba(9,9,10,${shade}), rgba(9,9,10,0) 100%)`,
            opacity: gentle ? progress(frame, 0, 40, EASE_IN_OUT) : 1,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 180,
          bottom: 470,
          transform: gentle ? undefined : `translateY(${(1 - p) * 20}px)`,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: colors.gold,
            textShadow: shade
              ? "0 0 6px rgba(9,9,10,0.9), 0 0 16px rgba(9,9,10,0.75), 0 1px 14px rgba(9,9,10,0.55)"
              : "0 1px 14px rgba(9,9,10,0.55)",
            opacity: gentle ? pPlace : 1,
            transform: gentle ? `translateY(${((1 - pPlace) * 12).toFixed(2)}px)` : undefined,
          }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-block",
              whiteSpace: "nowrap",
              paddingBottom: 10,
              borderBottom: gentle ? undefined : `2px solid ${colors.gold}`,
            }}
          >
            <span style={{ marginRight: "-0.26em" }}>{place}</span>
            {gentle ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  background: colors.gold,
                  transform: `scaleX(${pLine.toFixed(4)})`,
                  transformOrigin: "left center",
                }}
              />
            ) : null}
          </span>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 76,
            lineHeight: 1.02,
            color: colors.cream,
            marginTop: 22,
            textShadow: LIFT,
            // a long name breaks into two even lines ("Low Wood Bay / Resort & Spa"), not one word over
            textWrap: "balance",
            opacity: gentle ? pName : 1,
            transform: gentle ? `translateY(${((1 - pName) * 16).toFixed(2)}px)` : undefined,
            filter: gentle && pName < 1 ? `blur(${((1 - pName) * 6).toFixed(2)}px)` : undefined,
          }}
        >
          {name}
        </div>
      </div>
    </AbsoluteFill>
  );
};
