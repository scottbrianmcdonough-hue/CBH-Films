import { AbsoluteFill } from "remotion";
import { CBLogo } from "../components/CBLogo";
import { FadeIn, RevealLine } from "../components/RevealWords";
import { colors, sans, serif } from "../theme";
import type { Hotel } from "../types";

// Hotel name, subtitle (if any) and location on black, with the animated CBH logo below.
// With `logo` false (a film carrying the CB watermark on its shots), the logo is left off
// so the brand appears once.
export const EndCard: React.FC<{ hotel: Hotel; logo?: boolean }> = ({
  hotel,
  logo = true,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.black,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <RevealLine
      start={6}
      style={{
        fontFamily: serif,
        fontSize: 104,
        lineHeight: 1,
        color: colors.cream,
      }}
    >
      {hotel.name}
    </RevealLine>
    {hotel.subtitle ? (
      <RevealLine
        start={12}
        style={{
          fontFamily: serif,
          fontSize: 60,
          lineHeight: 1.2,
          color: colors.cream,
          opacity: 0.9,
          marginTop: 10,
        }}
      >
        {hotel.subtitle}
      </RevealLine>
    ) : null}
    <FadeIn
      start={20}
      style={{
        fontFamily: sans,
        fontSize: 24,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: colors.gold,
        marginTop: 34,
      }}
    >
      {hotel.location}
    </FadeIn>
    {logo ? (
      <>
        {/* Sits above the Reels/TikTok caption area. */}
        <div style={{ position: "absolute", bottom: 470 }}>
          <CBLogo start={34} width={190} shimmerAt={66} />
        </div>
      </>
    ) : null}
  </AbsoluteFill>
);
