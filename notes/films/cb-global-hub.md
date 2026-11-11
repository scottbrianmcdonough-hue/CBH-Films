# CB Global Hub: opening the door

`cb-global-hub` (`src/linkedin/GlobalHub.tsx`, map from `scripts/global-hub-map.mjs`), 4:5, silent, 14s. LinkedIn.
Back to [all films](../README.md).

## Status

First version sent 11 Nov for Phill's sign off.

## The film

- Phill (Teams, 10 Nov): competitor conferences this week (POB, BWH) pushing global reach; a post on the CB Global Hub:
  distribution to global partners through the GDS channel, "8 new strategic partnerships this year", "opening the door
  to new global markets", Global Consortia. Scott: "do it from scratch, it doesn't have to be like the other ones, CB
  Hub is new" (a first pass followed the GN map).
- A panelled hotel door drawn in gold line on black, CB GLOBAL HUB in gold caps over "Opening the door / to new markets"
  in pale Cormorant from frame one (LinkedIn's preview); the door swings open, warm light spills across the floor, the
  UK lit through the doorway; the camera pushes through as the world draws back; eight gold lines arc out from the UK,
  each market lighting as it lands while the count climbs to 8 ("new strategic partnerships this year"), light
  travelling the lines to the end; white CB in the corner. The last frame stands as a still.
- The eight markets (New York, Los Angeles, São Paulo, Dubai, Mumbai, Singapore, Tokyo, Sydney) are illustrative: the
  partners and their markets weren't given. Swap for the real ones in `MARKETS` and rerun the map script.
- The new CBH palette (Bianca, 10 Nov): black, gold `#c7ab77`, pale `#f2f0f0` only. No competitor named.

## Notes

- Facts from the membership page (Scott pasted it, 11 Nov; there is no Global Hub page, so the post links to
  classicbritishhotels.com/membership-for-independent-hotels/): the CB branded GDS chain code puts hotels in front of
  750,000+ global travel agents. Scott: "as long as it stays clean, add it, make it engaging": after the eighth market
  the count steps aside for two stats side by side, 8 new partnerships this year and 750,000+ global travel agents
  counting up, while a dust of gold points spreads over the land from the UK; the last frame is the still.
- "CB Global Hub" is Phill's name for it and isn't on the site: Phill to confirm it's the name to use publicly.
- Scott (11 Nov): CB GLOBAL HUB "bolder and bigger like Lee's artwork, The Wait Is Over": now 46px, weight 700, tight
  (0.04em), gold, its underline kept. Sound (Scott: "a mellow track and subtle sound effects", "grab a mellow track from
  the repo"): the soft cinematic piano from Bonfire Night (public/campaigns/bonfire/cinematic-piano.mp3; on Instagram
  5 Nov, this is LinkedIn) with a quiet latch as the door opens, a soft bell as each market lights (F major pentatonic,
  rising) and a faint shimmer under the agents, by `scripts/global-hub-sfx.py` into `public/campaigns/global-hub/sound.wav`.
  14.0s, -15.4 LUFS.
- Scott (11 Nov): "don't like the count noise, sounds like sparkling" (the shimmer under the count is out), "maybe needs a
  logo and ending": from frame 396 all fades to black and the official logo rises with its light sweep; 17.0s. The
  still for the post is the two stats frame (392).
- Landscape for LinkedIn (Scott, 11 Nov: "this is for LinkedIn so landscape", "needs better spacing"):
  `cb-global-hub-wide` (`src/linkedin/GlobalHubWide.tsx`, 1920 x 1080, map from `global-hub-map.mjs --wide`): the
  headline and stats in a column on the left, the door and the world on the right, all text above the bottom quarter
  (LinkedIn's player bar). The 4:5 `cb-global-hub` kept. Palette: core only (black, gold, pale); the secondary blue
  `#779096` offered as a faint ocean tint, not used.
- Polish (Scott, 11 Nov: "make sure the last bit holds a beat longer so the whole animation registers"): the two stats
  hold 2s longer before the ending (END 456, 19.0s, both cuts; the sound file 19s); the count fades out before the
  stats come in (the labels ghosted over each other). FINAL: landscape -15.2 LUFS, 4:5 to match; still at 14.5s.
