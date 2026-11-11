import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CBHubDiagram, OFFX, PARTNERS_BOX } from "./CBHubDiagram";
import { GlobalHubWide, GLOBAL_HUB_STORY_MAP_FRAMES } from "./GlobalHubWide";

// The CBHUB, diagram then map (Scott, 11 Nov: "incorporate the maps and then the diagram, both somehow ... do your magic").
// Act 1 is Phill's distribution diagram (CBHubDiagram, as an act): the hotel lights, the flow runs through the CBHUB to
// the GDS, IDS and Channel Connect and on to the partners. Then the camera pushes into the partners bar, the door's move,
// and comes out over the UK as the world draws back: act 2 is the map cut without its door (GlobalHubWide, noDoor), the
// lines out to the world, 8 new partnerships, 750,000+ global travel agents, the logo. One sound across both
// (scripts/global-hub-sfx.py --story). 16:9 for LinkedIn.

export const MAP_AT = 240; // where the map act starts underneath (the diagram holds 2s longer, Scott, 11 Nov)
export const CBHUB_STORY_FRAMES = MAP_AT + GLOBAL_HUB_STORY_MAP_FRAMES;
const PUSH = [MAP_AT + 40, MAP_AT + 92] as const;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CBHubStory: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, PUSH, [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const gone = interpolate(frame, [PUSH[1] - 18, PUSH[1]], [1, 0], clamp);
  const cx = PARTNERS_BOX.x + PARTNERS_BOX.w / 2 + OFFX;
  const cy = PARTNERS_BOX.y + PARTNERS_BOX.h / 2;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("campaigns/global-hub/sound-story.wav")} volume={0.7} />
      <Sequence from={MAP_AT}>
        <GlobalHubWide noDoor silent />
      </Sequence>
      {frame < PUSH[1] ? (
        <AbsoluteFill
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `scale(${1 + 9 * push * push})`,
            opacity: gone,
          }}
        >
          <CBHubDiagram act />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
