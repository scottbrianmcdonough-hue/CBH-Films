---
name: hotel-film
description: Make or change a Classic British Hotels (CBH) hotel promo film in this repo, a 9:16 vertical film plus a 15s Stories cut, from photos, copy and a music track. Use when asked to make a video/reel/story/ad for a hotel, add a hotel, swap photos/copy/music, recut to music, or change the house style. Holds the agreed process and final standards from the Hythe Imperial film.
---

# CBH hotel films

Every hotel film is data. The engine in `src/hotel-film/` renders any `FilmSpec`; each hotel
gets one file in `src/hotels/<slug>.ts` with its photos, copy, music timing and cut list, and
is registered in `src/hotels/index.ts`. Hythe Imperial (`src/hotels/hythe-imperial.ts`) is
the reference: copy its structure.

## Process for a new hotel

1. **Gather assets** in `public/hotels/<slug>/`:
   - 5–8 strong photos, ideally: exterior/aerial (the hook), 3 different rooms (landscape
     works for the triptych), bar or drink, restaurant/food, spa, golf or grounds if the
     hotel has them. Prefer warm, dark or neutral shots; drop shots that clash with
     black/gold (bright blue walls), show CCTV/signage, or look like stock.
   - The music track (the user supplies it; ask them to confirm the licence; Pixabay-style
     names suggest the Pixabay licence).
   - Logo: the official CBH primary logo (vector) in `public/brand/` is shared by every
     film: `cbh-logo-on-dark.svg` on the end cards, `cbh-logo-gold.svg` (its gold paths
     only) as the shimmer mask, and `cbh-logo-on-light.svg` for light backgrounds.
2. **Write the copy** from the hotel's own site and its CBH page only. If a site is blocked,
   use search-result snippets and say so. One distinct, specific fact per caption: never
   repeat a claim (e.g. sea views twice). Pattern: small gold eyebrow naming the place +
   a 3-line serif claim, e.g. `The Champagne Bar` / `Kent's only / Moët & Chandon /
   Champagne Bar`. Use the hotel's full official name on the end card.
3. **Trim and analyse the music.** Take the opening of the track with headroom:
   `ffmpeg -t 45 -i track.mp3 -c copy public/hotels/<slug>/<name>.mp3`
   (trim ≥5s longer than the longest film; `validateFilm` fails if the film outgrows it).
   Then `python3 scripts/analyze-beats.py public/hotels/<slug>/<name>.mp3` (needs
   `pip install librosa`). Check the tempo is sensible (it halves double time; pass
   `--bpm` if still wrong). Use the printed bar-start frames.
4. **Write the spec** `src/hotels/<slug>.ts`: scenes in order, `cuts` on bar starts,
   `durationInFrames` on a bar start, `music.fadeFrom` one bar before the end. Export a
   full film (`<slug>`) and a Stories cut (`<slug>-story`), and add both to
   `src/hotels/index.ts`.
5. **Check and render**: `npm run lint`, then `scripts/render-film.sh <slug>` and
   `scripts/render-film.sh <slug>-story`.
   Run the QA checklist, then commit the source, assets and `out/<id>.mp4`, and open a
   PR to `main` so the next session starts with this hotel too.

## Final standards (agreed with the client on Hythe Imperial)

**Format**: 1080×1920, 30fps. Full film ~30–40s; Stories cut ≤15s (hook, rooms,
one signature fact, end card). Exported by `scripts/to-mp4.sh`: H.264 High 4.1,
standard-range yuv420p, AAC, faststart.

**Brand**: CBH gold `#C39E55` (the official logo gold) on near-black `#09090A`, cream text `#F5EFE3`
(`src/hotel-film/theme.ts`). Gold text and rules are the flat brand gold, never the
foil gradient (Scott, October Best Loved: its pale highlights read as "gold and white"). Fonts: Cormorant Garamond for headlines, Open Sans for
eyebrows, bundled in `public/fonts/` (never load from Google at render time).

**Look**: minimal and slick. Full-bleed photos with slow push/pan moves. Understated type:
gold letterspaced eyebrow + light serif lines that rise out of a mask. Subtle film grain and
vignette over everything. No decorative frames, rules or drawn illustrations.
Never use the same photo twice in a film: ask the user for more shots instead (Pulse
validation enforces this).

**Text rule** (Scott, 16 Oct 2026; the reels had drifted between two label orders):
- **End cards**: clean cream Cormorant, centred, with the white CB in its corner. No gold place
  line on end cards (an earlier gold caps location under the name is dropped).
- **Lines and questions over shots**: cream Cormorant (as on the festive opening line and the
  November hook).
- **Hotel labels over a shot**, only where the place needs saying: a small gold caps place
  with its still underline on top, then the hotel's name in cream Cormorant beneath (The
  Mount tile wall's opening label is the reference). This is the only place gold appears:
  the one brand touch.

**Gold underline** (Scott, Hintlesham Hall search reel): gold caps eyebrows get a still
2px gold underline exactly the width of the words, rising in with them. Never a growing or
drawing line (Scott: the drawing gold rule is in every film). Default in `search/`
(`eyebrowRule`); use it on new films in any engine.

**Copy voice** (agreed on Whittlebury Park): original and specific, never generic hotel
clichés ("luxury", "exceptional cuisine", "unwind", "stay in style"), and no full stops.
Gold eyebrows can be witty short phrases rather than plain labels, e.g. `Pole position
near Silverstone`, `Save room for Murrays`, `Hot, cold, repeat`, `Room to sprawl`. Never
name a dish or detail the photo doesn't show; keep food lines seasonal and generic.
No "worth ..." end lines ("worth waking up in", "worth the trip"): Scott found them
used too many times (clocks reel); a question that invites comments works instead.
No "no X, just Y" / "not X, it's Y" lines ("No footage / Just depth"): Scott, "that is an
AI tell". Say the plain thing ("Made from one photo").

**Structure**: open straight on the strongest shot (usually the aerial with the hotel name
and subtitle), not on a logo. The client loves the letter-mask opening (`intro` on the
spec, `components/WordIntro.tsx`): the hotel's short name cut out of black with the sea
or hero photo showing through, then a fly-through into a letter that lands on a downbeat.
Use it by default; set `captionDelay` on the first scene so its caption waits for the
landing. Find `origin` by rendering a still and measuring a thick vertical stroke
(e.g. the T's stem) - and check full-resolution frames, as glyphs stop drawing at extreme
zoom (the component caps the zoom and dissolves the page to avoid black frames). For variety between hotels there is a second opening: `aperture: { land }` on the spec
(`components/ApertureIntro.tsx`), a gold line that draws across the black and opens like
an aperture onto the first scene (used for Whittlebury Park when the client asked for
"something different than the fly-through"). A third: `slices: { land }`
(`components/SliceIntro.tsx`), the first photo slides in as three full-height panels from
alternating sides, with a little parallax inside each and fine gold seams, locking into one
full-bleed shot on the downbeat (Whittlebury Park Stay & Dine, when the client wanted
"simple and slick", full-bleed, and a trick that stands out without video footage). Use one
opening only, never two. Rooms as the triptych (three landscape room photos stacked
as strips under a black caption header, sliding in over the previous shot). End card:
hotel name, subtitle, location (not the website), then the animated CBH logo.

**Small photos**: if a photo is too small to fill 1080×1920 sharply (e.g. a 952×714
dish shot), set `framed: true` on its scene: it sits at near-native size in a gold-edged
frame on black with the caption above, and the camera still drifts inside the frame.
With only one room photo, use a normal photo scene instead of the triptych.

**Transitions**: crossfades by default. At most three signature moves, spread out with
crossfades between them: the triptych `cover` entrance, one mid-film reveal, and the `rise` into
the end card. The mid-film reveal must differ between films (the client found the arch
"samey" once three films used it): `arch` (Victorian arch window, Hythe Imperial), `seam`
(a gold hairline wipes the next scene in, The Kingfisher) or `split` (the scene parts along
the middle on gold edges, Whittlebury Park Stay & Dine). Check which the other recent films
use before picking one. The client rejected back-to-back fancy transitions.
Every transition is centred on a downbeat; frame counts are even.

**Motion graphics**: only when they belong to the subject and stay subtle: golden
champagne fizz (`overlay: "fizz"`) is approved. Rejected: glassy bubbles over the spa
(they read as a stock effect).

**Sound**: the music only, no sound effects (rejected). Cut on bar starts; fade out over
the final bar so it ends on a downbeat; never let the track run out under the end card.
Loudness ≈ -16 to -14 LUFS.

**Social safe zones** (Reels/TikTok/Stories UI): top captions start 250px down; bottom
captions sit 460px up; the end-card logo sits 470px up; nothing important in the
right-hand ~120px around the action buttons.

## The bar for reels (Scott, 10 Oct 2026)

Reels must be built around a real animated idea, at the standard of the sketch reel and the
map reel; a run of photos with push-ins and cuts reads as a slideshow and is no longer
enough ("needs to wow me", "cool animations of that standard and the map when doing
reels"). Pick ONE signature idea per reel and carry it through every shot; keep the house
look (black and gold, minimal text, no sound effects, no flashing, cuts on the beat).
Ready-made, approved ideas:
- **Map journey** (`journey/`, `cbh-journey`): a gold thread across a map of Britain, each
  hotel opening out of its pin on the downbeat, sparks, the head becoming the CB logo. Use
  it for collection-wide and multi-hotel reels; for one hotel, start on the map and dive
  to its pin.
- **Sketch to life** (`sketch/`, `holdsworth-sketch`, `ruthin-sketch-story`): each still
  draws itself in pencil (clean outlines, light hatching), then the colour floods in like
  watercolour; one fact pencilled in for a Story, staying on to the end. Best on
  architecture and interiors.
- **Unwrap** (`unwrap/`): the gold ribbon and gift-wrap peel, for gifting and offers.
- **Depth moves** (the house signature, Scott 16 Oct: "the depth is cool", "it can be a
  signature, because nobody is doing it like that"): every still becomes a camera move with
  real depth (`scripts/still-depth-dolly.py`, MiDaS small: near things travel further than
  far ones, the dolly swells the near layer). Scott's signature for his own work too (17 Oct:
  "remember the depth map engine for future, can be a signature"; his LinkedIn breakdown).
  The engine: depth (MiDaS or hand-drawn), mattes, fills behind, `still-depth-dolly.py` for
  the moves, and `Layers3D` / `EndScene` in `stings/DepthBreakdown.tsx` for layers pulled
  apart in 3D and text set inside the scene; the steps are below. For CBH, keep it tasteful
  (Scott, 17 Oct, after a few rounds: "keep it tasteful, depth map behind the scenes, just
  show the finished wow moments, the payoff"): the depth map stays behind the scenes, never on
  screen; no step labels, screenshots, outlines or "how it's made" lines. Show only the
  finished result: the depth moves, and a layered moment (a scene parting in depth) only where
  it lands as the payoff of that reel, judged by the reel and its subject. The map, the
  pull-apart as a demo and the how-to belong to his own LinkedIn. What pops most: one clear subject in front of a simple
  background, moving as a solid layer (the coffee cup "pops out of the feed"). Used on
  Departures and Waterton Park
  (`waterton-park-island`). Depth maps are drawn by hand by default (Scott, 18 Oct: "always
  do by hand, more precise"): MiDaS reads furniture, stands and people as soft blobs that bend
  on the move (the tea stand's legs, the bedroom's footstool and armchair). Write a
  `make-<shot>-depth.py` per photo (see `public/hotels/waterton-park/make-bedroom-depth.py`):
  the room or sky far, the floor or ground sloping toward the camera, and each object one solid
  block at the depth of the floor where it stands; pass it with `--depth-img`. The house rule
  (Scott, 21 Oct: "hand draw the depth map for precision, house rule after auto"): auto first,
  then by hand. Run MiDaS (`--frames 1 --depth-png`) as the reference for the room's layout
  (which walls recede, which come toward the camera, what stands proud), then draw the map by
  hand to match it with clean solid blocks, and render from the hand map only. On the Rowton
  shots MiDaS caught what the first hand map got wrong (the pool's ceiling recedes, the
  bedroom's right wall angles in); see `make-rowton-depth.py` in the up-next patch. Rules learned: every shot moves (push, pull-back or glide), at
  constant speed so the cuts flow (Scott: "not so stop start"); no handheld sway (it read
  fake); a glide across a subject with clear foreground shows the depth best (Waterton's
  afternoon tea: glide 220px, parallax 55, dolly 0.07, after Scott asked for "a little more
  motion" at parallax 22); wide scenes parallax 18-30; soften the depth and lower the
  parallax on a thin subject against sky (the Castle Inn walker wobbled); keep the upscale
  under ~2x (an aerial pull-back from 1.6x on a 1280px-tall photo holds up). When the model splits one
  object across depths (Waterton's cake stand: base near, top far, so its legs bent as the
  table slid under them, "nauseating"), draw the depth by hand (`--depth-img`, see
  `public/hotels/waterton-park/make-tea-depth.py`): the room far, the table sloping toward the
  camera, every object one solid layer at the depth of the spot it stands on. Where a near
  object stands against something far (a cup against a window rail, a rock edge against a
  lake), the softened depth drags the background with it and bends straight lines (Scott:
  "watch the warping"): cut the object out with a matte (`--layer`, GrabCut seeded from rough
  shapes; see `public/demo/make-coffee-mask.py`, `make-mountain-mask.py`) and the script moves
  it as its own layer over the background filled in behind it, rigid (`--layer-near`, a cup)
  or with its own depth (a hillside). Check the first and last frames for bent lines. Behind the layer the script fills
  what the move uncovers; where that is water or grass running one way, pass `--fill-dir 1,0`
  so the texture is mirrored in (a blurred fill showed as a smooth patch and left a ghost of a
  thin subject, the walker).
  The process, step by step (the depth breakdown, 17 Oct; Scott: "remember the process"):
  1. Depth: MiDaS, or simple shapes drawn by hand where it muddles an object into what is
     behind it (`make-coffee-depth.py`).
  2. Matte the near thing: GrabCut from rough seeds, then trace by hand where it fails. It
     grabs a bright background edge touching the object (the cup's rim and the window
     rail: traced point by point) and loses a dark thin subject against dark water (the
     walker's legs stayed on the lake and slid into it as the cliff moved: trace him to
     his boots and join him to the rock; Scott: "he needs to be standing on the thing like real").
  3. Fill behind it along the picture's own lines (`fill_along` in
     `public/demo/make-breakdown-assets.py`): the rail and the grain carry straight through
     (a blind inpaint bent the rail); water and grass mirrored in, each row toned to the
     texture beside the hole (a mirror from further off showed as a pale box); every back
     layer gets the same fill (a darkened one showed as a dark box as the layers parted).
  4. Move: constant glide, modest parallax (the mountain at 45, dolly 0.05: pulled harder,
     the walker went over the edge). A thin thing on a layer rides at the depth of the
     ground under it (the script takes it from the first solid pixel below).
  5. The 3D pull-apart: CSS layers pushed back with `translateZ` and scaled by
     `(P - z) / P` so each still fills the frame and only parallax shows; solid back layers.
  6. Check crops, not just whole frames: the first and last frames of each move, thin
     subjects and their feet, layer edges, and the 3D frames for holes, boxes and a sliver
     of black at the frame's edge.
  Cut them hard
  on the downbeats: a water-ripple transition between them was turned down ("not keen on
  the ripples").
- **Rolodex** (`rolodex/`, `cbh-rolodex`, a test): the collection as a card file, every
  hotel on an index card filed A to Z on a 3D drum, riffled fast and landing on a few whose
  footage opens out of the card. Shows the whole collection without a count. Slow to render
  (about 20 minutes for 26s).
Or meet the bar with craft instead of an effect (Scott: "or better executions of simple
cuts and stuff"): plain cuts, executed well, so every cut feels chosen. Craft alone is
not enough: give the reel a theme the cuts serve (Scott on the first cut of `cbh-craft`:
"there's no theme"). `cbh-craft` runs on a clock, one day morning to morning (breakfast at
08:00 to breakfast in bed at 08:00 the next day, "Same time tomorrow?"), the hours rolling
on at every cut (`time` per shot, `close` line in `craft/`).
- **Match cuts**: cut between shots that share a shape, line, colour or position (a round
  plate to a round window, an arch to an arch, a steam curl to a cloud, the horizon held at
  the same height), so the eye carries straight through.
- **Cut on movement**: leave a clip mid-motion (a pour, a door opening, a pan) and enter
  the next moving the same way and speed; stills get a matching drift direction.
- **Cut on the musical accent**, not only the downbeat: the snare, a guitar pluck, a
  chord change; hold longer on the phrase, quicker in a run (never under 0.8s).
- **Object wipes**: a door frame, a pillar, a passing glass or a hand crossing the lens
  takes us into the next shot (footage with foreground movement only, no fake wipes).
- **Speed ramps** on footage: ease into slow motion on the moment (the pour landing, the
  dog's leap) and back.
- **Composition**: frame for 9:16 (subject on the thirds, leading lines up the frame),
  keep eyelines and horizons consistent across a run, grade the set to match.
- **Sound to picture**: the cut lands where the music opens up; the end card where it
  resolves.
Plan these on a contact sheet before cutting: lay the shots out, mark the shapes and
motion, and order them so each pair connects.
New ideas should meet the same bar: show a mock-up frame strip before building, then a
preview. Real footage leads where there is some. Bianca's preferences below still hold
(calm, no fragmented text, no obvious Ken Burns), so the motion comes from the idea, not
from faster cutting or a beat pulse (Scott rejected the beat pulse).

## Client preferences (Bianca, the CBH client; Scott runs the work)

- No flashing montages, no fragmented text builds, no mixed transitions.
- Bianca dislikes obvious Ken Burns; Scott dislikes frozen frames. Default to the
  barely-there push (1.00 -> 1.04) when in doubt.
- Never reuse a track across films. Rejected tracks: Upbeat Lounge, Disco Funk, Funk Groove,
  Jazz Cocktail Bar Funk. Keep films off a lead line (melody check, see `montage/` above).
- Facts come from the client (the CBH and hotel sites are blocked here). Every claim must be
  on the hotel's own CBH page; name only verified rosettes (hotels listed only on the Food
  Lover's page don't count). Record the source wording in the spec.
- End lines sell what only CBH can claim, never a generic "dinner and a stay".
- Maids Head Hotel is leaving the collection: never use it in autumn content (or later).

## Jira ticket (the post that goes with each film)

Scott now pastes a shorter ticket (Low Wood Bay, 15 Oct): Hook, Post, Hashtags, CTA, time
slot, platforms and a one-line backup-music note only; he drops the title, campaign line,
attachments and the other notes. Give him that cut by default, and anything to check in chat.

Scott pastes tickets straight into Jira, so every ticket is clean and complete, in this
exact shape (the Fairlawns Stay & Dine ticket is the reference):

```
[AUTUMN FOODIE] <Hotel> <offer> reel        (title: campaign prefix, hotel, what it is)

Campaign: Cosy Escapes (autumn campaign, from 10 Oct 2026)
@Bianca Thomson

Hook
<one or two sentences describing what the video shows, in order>

Post
<ONE post for every platform: Unicode bold for emphasis, an emoji or two, a question
that invites comments, a line that makes booking feel like a treat>

Hashtags
<3 to 5: #ClassicBritishHotels always, plus 2-3 specific to the campaign, place or theme;
no broad tags (#UKHotels, #Travel, #Staycation); put search keywords in the post text>

CTA
- Facebook: 👉 Book here: <full URL>
- Instagram: 𝗧𝗮𝗽 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝗶𝗻 𝗼𝘂𝗿 𝗯𝗶𝗼 𝘁𝗼 𝗯𝗼𝗼𝗸. (bio link set to <full URL>)
- TikTok: <a comment prompt, no link>

Time slot: Instagram 12:00 PM; Facebook and TikTok 8:00 PM
Platforms: Instagram, Facebook, TikTok
Video: <film-id>.mp4 (<length>s, 9:16)

Notes:
- <short bold-led bullets: sources for every fact, anything to check before posting>
```

Emoji (Scott, 3 Nov): few and chosen, three or four a post, each placed where it does a job: standing in for a
word ("phone on 🔕") or carrying the idea (🔓 "The wait is over", 🗝️ "Book now"), not tacked on the end of every
line. No lists of three, and a sale post closes on booking, not on a question nobody will answer.

Rules: one post, not one per platform; only the CTA varies by platform. Platforms are
Instagram, Facebook and TikTok. Links are full plain URLs (Jira turns them into smart
chips that copy as the page title: tell Scott to switch chips to URL display). A
single-hotel post links to that hotel's CBH page offers section
(`/hotels/<slug>/#offers`); a multi-hotel post links to the Foodie Breaks page. No em
dashes, never state a hotel count, no "dinner and a room" pitch, no "contact the hotel"
lines. No price unless asked; if a "from" price goes in the copy, add *From prices vary.
Prices accurate as of 9 Sept 2026. Generate Unicode bold with a script, never by hand.

## QA checklist before sending a render

- `npm run lint` passes (`validateFilm` also checks cut/scene counts, even transition
  lengths, ≥1s solo time per scene, and music length).
- Extract a frame from each scene and mid-transition and look at them
  (`ffmpeg -i out/<id>.mp4 -vf "select='eq(n\,F1)+eq(n\,F2)',scale=270:480,tile=6x1" -frames:v 1 -fps_mode passthrough sheet.png`):
  captions readable, nothing in the safe zones, no stray frames.
- Measure the audio over the last few seconds: music plays under the end card and fades
  to silence by the last frame.
- `ffprobe`: 1080×1920, 30fps, expected frame count, H.264 + AAC.
- Send the MP4 to the user and say what changed; flag any claim you couldn't verify.

## Environment notes

- On Claude Code on the web, the session-start hook installs npm deps and the Python tools
  (numpy, Pillow, librosa) and points Remotion at the preinstalled Chromium via
  `REMOTION_BROWSER_EXECUTABLE`. If a render still tries to download Chrome, pass
  `--browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell)`.
- Shader transitions from `@remotion/transitions` need Chrome 149+ with a flag; use the
  DOM-based custom transitions in `src/hotel-film/transitions.tsx` instead.
- Engine pieces: `Film.tsx` (renders a spec), `types.ts` (spec + validation),
  `transitions.tsx`, `scenes/` (`Triptych`, `EndCard`), `components/` (`PhotoScene`,
  `KenBurns`, `RevealWords`, `Fizz`, `FilmFinish`, `CBLogo`).
- Other styles, each a spec type with its own engine: `editorial/` (scroll), `motion/`
  (Gold Line) and `pulse/` (rhythm edit: a quick run of word flashes over spa/room details,
  then full-bleed scenes on the beat with short dissolves; Whittlebury Park is the
  reference, with a full film and a Stories cut). Pulse scenes spa/room/closing are
  optional, which is how the Stories cut drops them. `montage/` is a multi-hotel campaign
  rhythm edit (Plate to Pillow is the reference): hand-placed 9:16 crops, hard cuts on
  measured beats (never under 0.8s), a small name-and-location label per hotel carried
  across its shots, and the campaign artwork as the end card. The client found push-ins
  (Ken Burns) played out, tried a static "settle" (`motion: "settle"`), then asked for the
  Ken Burns back: Plate to Pillow now plays pre-rendered clips (`clip` on each shot, made
  by `scripts/kenburns.py`: Pillow LANCZOS frame by frame with subpixel crop boxes, never
  ffmpeg zoompan), every shot the same gentle linear push 1.04 to ~1.12 with a small drift
  always the same way; and one text move
  (a masked rise landing on the beat). Plates stay clean so the food gets the full beat;
  the hotel name and location land on each pillow shot only (`labelOn: "last"`), large,
  left-aligned in the lower third over a full-width gradient (a local radial shade read
  as a smudge), with a thin gold rule drawing under the name to complete on the next
  cut (the client loves it). Shots hold three beats so the photos register. The end card
  arrives as one calm block on a downbeat, draws its gold rule once, then holds still
  while the music fades (a line-by-line build read as fragmented). One camera move, one
  text move, no mixed transitions, no flashes. Peak-limit a hot music section rather
  than letting it clip. Check the window for breakdowns too (the keys and bass dropping
  out for a bar): one landing on a cut sounds like a glitch (Fairlawns). Score each
  downbeat window by its deepest mid-range (500-3000Hz) dip at half-second resolution and
  pick one with none deeper than ~7dB before the fade. Pick music sections with no lead line (the client rejected a cut
  that sat on a guitar solo): beat strength and loudness won't show a solo, so run a
  melody tracker (pyin on the harmonic 600-4000 Hz band) over the whole track and keep
  the film where it stays low. CB watermark, grid-safe vertical reel spec: 100px wide,
  bottom edge at y=1560, 60px right margin, on every shot but not the end card.
  `footage/` is a real-footage reel (Dalmahoy is the reference, after the Ilsington reel
  the client liked): the hotel's own clips lead, muted, then stills close, then a calm
  name-and-location end card. One transition, a 0.8s crossfade centred on each measured
  beat; calm left-aligned text blocks over a lower-third gradient with the gold rule
  drawing under them; the hook text set on frame one. Pick clip in-points between the
  clip's own edits (`scdet`): a shot needs ~2.6s of unbroken footage (crossfade in, 1s
  clear, crossfade out). Match stills to the footage's motion rather than forcing a Ken
  Burns: a slow drift beside handheld pans, static beside locked-off clips.
  A Story can drop the end card and hold one text block over every shot instead (`block`:
  eyebrow, headline, static gold rule, line; bottom-left over a soft dark scrim pocket,
  one rise and fade), with the CB watermark on every shot. Oakley Hall's dog Story is the
  reference: Scott's phone clip of a cavapoo on the lawn, dog only (a photo after it added
  nothing: end the Story as the dog reaches the camera), the block clearing (`until`) as
  the dog gets up so its face isn't under the text.
  Gold paw prints (`paws`, `components/PawTrail.tsx`) trot up to the dog on the hook and
  fade before the text arrives, and the rule doesn't draw: the client found a drawing
  line plus paws "too many competing". Check a phone clip's GPS (`ffprobe` format tags)
  to confirm which hotel it is.
  Fairlawns Stay & Dine (`fairlawns-stay-dine`) is the multi-clip version: six phone
  clips cut on beats with a short 10-frame dissolve, no text over the footage (Scott
  dropped the block: the visuals carry it), then the usual end card (Scott found a
  "Reserved" place-card prop cheap, then a big gold-foil CB monogram with a light sweep
  too much): the last clip settling and fading to
  black (`endFade`), then the hotel name in Cormorant, the location in gold caps (from the
  address on its CBH page) and the official CBH logo with the house shimmer
  on the CB monogram only (`logo: "cb-shimmer"`; never recolour the logo, a whitened copy read as the corner overlay),
  no rule
  (`rule: false`), no extra graphics; the CB mark fades out into it. The block's lines
  rise from behind their own baselines (a masked reveal, a few frames apart) with a soft, wide shadow, the eyebrow and rule in gold foil. Phone
  clips shot under mains light flutter at 10Hz in rolling bands: run them through
  `scripts/deflicker-rows.py` (per-row gains against a 3-frame average; ffmpeg's global
  deflicker leaves the bands).
  AA Rosettes (`src/hotels/aa-rosettes.ts`) is the montage without the gold line: each dish
  opens out of the last through an expanding circle (`reveal: "iris"`) on a downbeat, the
  label rising in on the next beat. Bianca dislikes Ken Burns and Scott dislikes frozen
  frames, so every photo gets the same barely-there push (linear 1.00 -> 1.04 over its
  time on screen, centred, no pan; `kenburns.py --z0 1.0 --z1 1.04 --drift 0`), stills
  only (frame-grab any video), while a rosette counter (`counter`, `RosetteCounter.tsx`)
  rolls 1 -> 2 -> 3 top-left as the client's red rosettes bloom in
  (`public/brand/aa-rosette-red.svg`); labels drop the rule
  (`labelRule: false`). Rosettes only where the hotel's own CBH page states them.
  AA trademark rules: draw only the rosettes awarded, never empty placeholder outlines (a
  row that reads as a score out of three implies underperformance), and never speculate on
  future ratings in copy (a "climbing to three" hook was cut for this). With a
  hotel outside the Foodie Breaks offer, end on a brand card (`endCard.brand`: lines over
  the shimmering CB logo), not the price card.
- `flipbook/` is a journal reel (Cosy Escapes is the reference): a cloth cover with the
  title in gold foil, then full-bleed photo pages (Scott's style: prints on a black desk
  read as fake), each with a Cormorant italic caption bottom-left over a soft scrim and the
  hotel small in gold beneath, a barely-there 1.00 -> 1.04 push, then the campaign artwork
  on the cloth as the back page. The one move is the page turn: the full frame curls away
  from the bottom-right corner (the fold is the perpendicular bisector of the corner's
  travel; the flap shows the paper's reverse, shaded along the bend, casting a soft shadow;
  cut at the spine, the frame's left edge), every turn 24 frames, eased, landing on a
  downbeat. The CB mark sits still over the photo pages and fades off the back page.
- `unwrap/` is a gift reel (the Black Friday gift-voucher reel is the reference, Scott:
  "simple and warm", no sale graphics, no discount claims): a calm Cormorant italic line on
  black (or over a gift photo, `opening.still`), then the one move for every reveal: a thin
  gold ribbon draws across the frame (tilted 6 degrees, a light at its tip), the frame splits
  along it and both halves peel back like gift wrap (curling round a 70px roll, black satin
  on the reverse catching a soft gold sheen, a gilded cut edge, soft shadows), uncovering
  the next full-bleed shot. Each peel is 30 frames centred on a downbeat, two bars apart;
  stills get the 1.00 -> 1.05 push, clips play as they are (`rate` to fill a slot). Scott:
  "a reel, not a slideshow": each hotel is a section led by its real footage, stills in
  support, shots inside it hard-cut on beats (three bars for a hotel with footage, two for
  a single still); drop a still that only repeats what a clip shows. Labels (name in gold
  caps, place beneath; Scott then asked for bigger, easier-to-scan text: the place as a gold
  caps eyebrow, the hotel name large in Cormorant (86px, broken over two lines), each line
  rising from behind its baseline 5 frames apart, a gold rule drawing under it until the
  next ribbon; the opening gets a gold caps "This Black Friday" eyebrow over a 104px line,
  the voucher a large "Valid for 12 months" over gold caps terms) are printed on the sheet
  over a scrim that is there from the start
  (a scrim fading in after each landing read as the corner pumping), so they peel away with
  it. The CB mark sits still at the reel spec position until the gift. Never hand CSS an
  empty `path("")` clip: it is invalid, the clip drops and the old sheet flashes for a
  frame (Scott saw it as a flicker bottom-right, where the tilted peel finishes last).
  The last unwrap opens on the gift (the voucher card, or the real artwork in `gift.art`),
  then the usual end card on the same black. Start the music so the track's own intro sits
  under the opening line and its first kick lands as the first wrap opens.
- `matchcut/` is a plate match-cut reel (Foodie Breaks "one plate, ten kitchens" is the
  reference, `src/hotels/foodie-match-cut.ts`): every cut is a hard match cut on the plate
  rim, so the plate stays put while the food and hotel change. `scripts/plate-rim.py` fits
  the rim ellipse (check its overlay; pass `--hint cx,cy,d` when it locks onto food), and
  `scripts/plate-match.py` levels the rim, scales its width to the shared target at frame
  centre (`--dy` drops a plate a little lower where that lets the photo reach the foot of
  the frame or clears the label), carries the photo's own surface out to any 9:16 edge it
  doesn't reach, defocused and darkened with distance, and renders the shot's slice of
  one continuous 1.00 -> 1.06 push that runs across every plate. Scott found that fill bad
  on busy edges ("don't worry so much about the blends"): the target is 1250px, a touch
  wider than the frame, so portrait photos need none, and fill is kept to plain surfaces
  (dark table, white cloth). Mirrored fill left ghost plates. Use only plates whose whole
  rim is in the photo for the labelled match cuts: a rim running off the edge breaks the
  match. Scott then asked for "a rapid flick through at the end, without text so it's
  just plates": those plates go there, an eighth note each (`flick: true`, rendered with
  `--cover`: enlarged until the photo fills the frame, no fill), into the last plate.
  Scott then asked for "more dynamic, not just static": each cut between labelled plates
  whips the frame 12 degrees clockwise round the rim centre with a 15% push, 5 frames out
  and 5 in, motion-blurred (`--spin 12 --punch 1.15 --spin-in/--spin-out 5`), so the
  rims still meet at the same size; the labels rise in line by line as the plate
  settles and lift out upward as it whips away. (Turning only the plate inside its rim
  looked lovely overhead but broke on tilted plates, where the food stands above the rim.)
  Order dark/light alternately, rim shape changing gradually (tilted oval -> round ->
  tilted), savoury into dessert last. Named plates hold three beats (~1.6s: at 0.8s Scott
  found the labels too quick to read), cut on the track's beat; stills only, no footage. Text: the opening line (Cormorant italic) over the first plate, then the name
  (56px, two lines if long, never shortened) and location in light-gold caps top-left over
  a top shade. The CB watermark is one still image over all plates; the end card is the
  house card on black (the offer in Cormorant, "From £139" in gold caps, the official CBH
  logo with the shimmer on the CB), not the cropped campaign artwork (Scott).
  On a track whose beat tracker wobbles, find the period from the onset autocorrelation
  and the downbeat from the entries after each breakdown.
- `search/` is a search reel (Hardwick Hall, `hardwick-hall-search`, is the reference): a
  CBH-styled search bar (gold hairline, magnifier, never a real search engine's or AI
  assistant's look, and no claim that an AI recommended the hotel) fades up on black and
  types one query in behind a gold caret, then it glides up into the top safe zone as the
  first shot fades up. Each shot answers one part of the query (`match`): that part turns
  gold while a caption gives the fact. No growing lines anywhere (no search sweep, query
  underline or caption rule): Scott found the drawing gold rule is in every film.
  Stills get the 1.00 -> 1.04 push, or a slow `pan` across a wide still. Usual end card.
- `scripts/sketch-to-life.py` draws a photo in phases on cream paper, stroke by stroke
  from the photo's own edges and tones (not a filter): pencil roughs (straight guidelines
  overshooting their corners, loose tonal outlines, the main lines roughed in), ink
  outlines growing out from `--focus`, cross-hatching in the shadows, then a slow,
  translucent watercolour wash and the settle into the photo. `--mask` keeps the line
  work on a subject. For whole scenes (buildings, rooms) soften the texture and keep only
  the longer lines, or stone, leaves and carpet turn into speckle: `--ink-min 40
  --ink-max 1000 --ink-blur 1.8 --hatch-pct 28,14,6 --hatch-run 8` (the Holdsworth
  House sketch reel; portraits keep the defaults). Each shot needs ~2 bars to draw, hatch
  and wash, so use fewer, longer shots. A sketch is a drawn illustration: check with the
  client before a CBH film goes out in it.

- `journey/` is a map reel (the CBH journey reel is the reference; Scott wanted "wow",
  "music video style", then "pick something original", "no beat pulse"): a dark map of
  Britain whose gold coastline draws in from the south, pins popping up, then one gold
  thread travelling the route hotel by hotel, the camera following its head and trailing
  gold sparks; on each downbeat the pin bursts and the hotel's shot opens out of it (a
  gold-edged iris), folding back into the pin as the thread moves on; a pull-back to the
  whole route glowing, then the logo. Minimal text: one line placed in the sea, a small
  name per hotel. The map comes from `scripts/britain-map.mjs` (Natural Earth 1:10m via
  world-atlas, transverse Mercator fitted to the frame; pins at town level, stops listed
  in travelling order). The CB mark comes in with the first hotel and leaves on the
  pull-back (on the full map it sits on Kent). `unwrap/` also has the showcase cut
  (`cbh-showcase`): no opening, per-shot tags and chapter lines.
- `sketch/` is the sketch reel (Holdsworth House is the reference; Scott: "a sketch and
  then the photo fills in", "a fact makes it come to life"): `scripts/sketch-wash.py`
  pre-renders each still as a clip on cream paper: graphite outlines draw on first, then
  light shading, in drifting patches; the colour floods in from a chosen origin as a
  watercolour wash (blobby front, faint pigment edge, paler while wet) and the pencil fades
  as it passes; a 1.00 -> 1.04 push throughout. The film hard-cuts the clips on downbeats,
  pencils a short note into a soft clearing in the drawing (written on left to right,
  washed away with the colour), and ends on the usual end card. No FilmFinish vignette:
  it greyed the paper. A Story is one shot and one fact.
- `mixed/` is the mixed format engine (Scott: "call these mixed reels"): stock clips mixed
  with the hotels' own images and footage (`november-out-there`, "November / everywhere else"
  -> "at ours", is the reference; Scott asked for Bonfire Night's stock-plus-hotels recipe
  with a new theme). Each stock shot of the everyday version (a car in slush, rain on a
  window, a wet dog, a dark street, a frozen face, a snowy car window) cuts on the action or
  shape into a hotel doing the same thing, nicer (scone, tea pour, a dog by a lake, fireside
  tea, a hot tub, a map at a bright window); "at ours" (not "in here") because some hotel
  shots are outdoors. Pairs: stock two beats, hotel four. Looks pushed well apart (Scott:
  "make the difference more noticeable"): stock near colourless, dark, a blue-grey wash;
  hotels the deck reel's autumn grade pushed warmer. Each hotel shot dissolves in over 14
  frames centred on the beat, arriving cold and warming up (Scott: "a crossfade so it
  warms up"); cuts back to stock stay hard. Text: one block over the first pair, the top
  line held still across the cut while the second swaps on the bass drop; masked lines must
  travel past their own height and hide off their baseline (at 105% the "y" of
  "everywhere" peeked under "November"). End card: a question in cream Cormorant, the
  white CB kept, dissolving in over the last shot. Stock comes from Scott (Pexels is
  blocked here): ask for portrait clips by search term, accept good near-misses and say
  how they'll be used; interpolate 24fps stock to 30 (`minterpolate`), check every clip for
  its own cuts (`scdet`) and that no clip runs out under its slot plus dissolve. Never the
  Oakley Hall dog again (used three times); no short-sleeve or summer shots in autumn.
- `collage/` is the moving tile wall (`the-mount-collage` is the reference): one photo
  fills the frame, tiles of others over it, on a grid with even gutters, small corners,
  flat (tiles, not cards: the deck reel did cards). The scene behind shifts to a new
  framing on every landing so it dances with them. Scott's final call: "shift and slide" and
  "collide", not pop, bounce or float (all read as jerky): tiles slide between slots, slide
  in from the nearer side and off it, shove the row along (`shoved`: set off when the
  other arrives, slowing into place) and knock the end tile off (`shovedOff`); a tile grows
  into the scene on the big hits. One smooth ease in and out per move, fastest just before
  the hit, settled 3 frames after; nothing moves once it has stopped (no settle wobble,
  pops or pose snaps); the tile layer drifts as one like a slow camera instead. Cut to the
  track's own accents, not a grid: map the hits first (kick/snare onset strength at every
  eighth note), land on the syncopated pushes, hold through stops and quiet bars. Depth:
  the wall's, not the tiles' (Scott: 3D is cool "if they look like tiles and not cards"):
  every tile on one plane tilted back and turning as one (each tile turns about the frame's
  centre), tiles with a solid edge for thickness and a cast shadow, a moving tile lifting
  off the wall and setting flat on the hit; the scene blurred and darker behind. Don't
  grow a small photo (under ~1200px tall) into the full-frame scene: it goes soft. A
  plain Rect tile is an array: test with Array.isArray, never `"at" in` (arrays have an `at`
  method). A tile that grew into the scene must drop under the tiles landing over it.
- Footage already in the repo history (Holdsworth House, Rutland Hall) was removed before
  PR #4 merged; recover it with `git log --all -- <path>` and `git show <commit>^:<path>`.
  Of the Holdsworth clips only the parterre, terrace and bedroom are real footage (the
  rest are push-in renders of stills).
- The CBH site (classicbritishhotels.com and i0.wp.com) is blocked by this environment's
  network policy: ask Scott to attach files with @ (images pasted mid-turn arrive only as
  previews; attached to a fresh message they land in the session's `images/` folder).
- A mockup PNG made for a white page (e.g. the CBH gift voucher cards) carries light grey
  soft shadows that glow on black: darken its semi-transparent pixels before using it.
- Images pasted into chat often arrive only as previews: ask for files attached with @,
  which land in `/root/.claude/uploads/<session>/`.
- `out/*.jpg` is gitignored: use `git add -f` for contact sheets.
- If `git push` hits a GitHub 500, retry with backoff.
