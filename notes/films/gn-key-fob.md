# GN key fob

**Status:** Polished version sent.  
**Compositions:** `gn-key-fob`, `gn-key-fob-silent`  
**Music:** None: synthesised key sounds  
**Client:** Great National Group (LinkedIn)

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

`gn-key-fob`: the third GN brand moment (Scott: the map was "forced ... needs to be fresh"; `src/linkedin/GNKeyFob.tsx`, 4:5, real 3D with `@remotion/three` and three.js, render with `--gl=angle`): a brass barrel key and a round fob, lime round navy like the badge, hang on a split ring in warm low light; the fob turns on its loop and every face is one of the 26 hotels (town in lime caps, name in white Source Serif), the hotel's photo out of focus behind it (`scripts/gn-key-bg.sh`), quickening to a spin and slowing to land face on as the badge; the key fades into the dark, the enamel flattens to GN's exact colours, the badge settles over the wordmark (official proportions). Logo SVGs from GN's theme (Scott, 20 Oct) in `public/brand/gn/` (lime #AFBD37, navy #152C3D), badge and wordmark cut from them; hotel photos (one each, from the Our Hotels page) and the homepage heroes in `public/campaigns/gn-key/`. First version sent. Sound (Scott: the silent ones "were like short quick take infographics"; this is a brand moment): `scripts/gn-key-sfx.py` synthesises the key settling on its ring, a tick each half turn (following the spin), a clink on the landing and a last faint touch of the ring, in a small room; no music, no whooshes; `gn-key-fob` has it, `gn-key-fob-silent` doesn't (render that one with `NO_AUDIO=1`). Polish: the key's bow a round cast ring (a flat one read as a washer), handled brass (streaked roughness, less saturated), the hotel faces' navy a shade deeper so it reads navy under the light, the key darkening into the shadow as it fades. Polished version sent.
