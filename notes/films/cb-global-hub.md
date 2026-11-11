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
- Name (Scott, 11 Nov, from the Crest Hotels press release: "Powered by the CBHUB, Classic British Hotels will provide
  Crest Hotels with global distribution, robust demand generation, and seamless access to its agency and corporate
  commercial partnerships"): the caps now read CBHUB (both cuts); the post says CBHUB; Crest Hotels not named (Scott:
  "don't mention Crest as a proof point"). Renders cbhub-landscape.mp4 and cbhub-4x5.mp4.
- What the CBHUB is (Phill, 11 Nov, with "CB - Distribution Ecosystem - 2026.pptx"): the Aven/SynXis platform, the CB
  CRS Distribution Hub in the ecosystem diagram, connecting hotels to the GDS (with CB IDS and CB Channel Connect) and
  through them to CBH's strategic agency partners, Global Consortia and Channel Connect partners. Book Direct, OTAs and
  CB Digital sit outside it. The post now calls it "our central distribution hub" (was "centralised ecosystem ... from
  travel trade to direct bookings", too broad); the vendor isn't named. The animation stands.
- Reworked on Phill's diagram (Scott, 11 Nov: "rework the animation so it's like Phill's diagram", then "incorporate the
  maps and then the diagram, both"): `cbhub-story` (`src/linkedin/CBHubStory.tsx`, 16:9, 25.0s, -14.5 LUFS). Act 1 is
  the diagram redrawn in the house look (`CBHubDiagram.tsx`): it draws itself (a faint outline from frame one for the
  preview), the parts outside the hub faint (OTA, Book Direct, RFP Tool, Media Hub), the hotel lights gold, a pulse runs
  through the channel manager into the CBHUB ("Central distribution hub"), which glows with a soft click, on down to the
  GDS, IDS and Channel Connect and the partners bar (strategic agency partners, global consortia and channel partners).
  The camera pushes into the partners bar and comes out over the UK as the world draws back: act 2 is the map cut
  without its door (GlobalHubWide noDoor), the lines and bells, 8 new partnerships, 750,000+ global travel agents, the
  logo. One sound (`global-hub-sfx.py --story`, sound-story.wav). The diagram alone is `cbhub-diagram`.
- Scott (11 Nov: "make the diagram connect more, like that's the hub, more flowing connections"): the elbow lines are now
  S curves fanning out from the CBHUB (`curve()`), light runs along every connector once lit (the faint ones fainter),
  soft rings ripple out from the hub like a heartbeat, and the diagram's dotted hotel to CRS link is back as a faint
  curve.
- Scott (11 Nov: "you had the hub right, but the Media and the ones on the right were darkened, keep it close to the
  diagram"): every box at full strength, and the diagram's other boxes back: CB Digital (red) with Classicbritishhotels.com
  and Hotel website, RMS (green) under the channel manager, RFP Tool and Media Hub (blue), the hotel gold, as Phill's
  diagram colours them (the palette's secondaries, here because the diagram uses them); its labels as the diagram (CB
  Book Direct, CB GDS, CB IDS, CB Channel Connect). The flowing curves, light and hub heartbeat kept.
- Track (Scott, 11 Nov: the piano "is like looping", "polish it up"): `cbhub-story` is now on Fine Taste (miyagisama, in
  the repo for the deck and on the unposted Magnet CB) from 37.25s: its quiet breakdown under the diagram, the bass back
  (46.32s) as the camera comes through into the world, its own ending under the logo; the bells retuned to its G major.
  -15.2 LUFS. Polish: the diagram centred (OFFX 130), its faint outline stronger on frame one (the preview).
- Scott (11 Nov: "go back to the previous music"): `cbhub-story` back on the soft cinematic piano (`FINE_TASTE = False` in
  the sfx script), bells in F major again; the centring and frame one polish kept.
