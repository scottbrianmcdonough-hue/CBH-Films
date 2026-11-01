# cbh-films

Remotion project for Classic British Hotels (CBH) promo films. Moved here 1 Nov 2026 from
`scottbrianmcdonough-hue/my-video` (branch `claude/ecstatic-sagan-d8zvpg`), whose history had grown to 26 GB
of committed renders and kept filling the session disk. This repo has the code, scripts, assets and notes
with no history and no renders:

- Never commit renders (`out/*.mp4` etc. are ignored). Render into `/dev/shm` (tmpfs, ~16 GB) with
  `TMPDIR=/dev/shm/...`, check the file, then send it to Scott with SendUserFile. Only the text tickets in
  `out/` are kept in git.
- Every render named under "Open work" below as `out/<id>.mp4` lives in the old repo (`my-video`, branch
  `claude/ecstatic-sagan-d8zvpg`); re-render from the spec here when one is needed.
- Newest (1 Nov): `cbh-journey-short`, the 35s map journey (12 hotels open, the thread through all 21), going out
  Mon 2 Nov with `cbh-journey-story`; `cbh-journey` is the 52s cut.

- Hotel films are data-driven: the engine is `src/hotel-film/`, each hotel is a spec in
  `src/hotels/<slug>.ts` registered in `src/hotels/index.ts`.
- Before making or changing a hotel film, read `.claude/skills/hotel-film/SKILL.md`: it holds
  the process (assets, copy, music analysis, spec, render, QA) and the agreed house standards
  (CBH gold/black, minimal full-bleed look, max three signature transitions, no sound effects,
  social safe zones, Stories cut ≤15s), and the bar for reels: one signature animated idea
  (map journey, sketch to life, unwrap, or a new one of that standard) or simple cuts done
  with real craft (match cuts, cutting on movement and musical accents); never a slideshow.
- Render with `scripts/render-film.sh <film-id>` (outputs `out/<film-id>.mp4`); lint with `npm run lint`.
- In Claude Code on the web, `.claude/hooks/session-start.sh` installs npm and Python
  dependencies and sets `REMOTION_BROWSER_EXECUTABLE` (read by `remotion.config.ts`), so
  renders need no extra flags.

- Text rule (Scott, 16 Oct; in the skill): end cards clean cream Cormorant, centred, white CB
  in the corner, no gold place line; lines and questions over shots in cream Cormorant; hotel
  labels over a shot (only where the place needs saying) a small gold caps place with its
  underline on top, then the name in cream Cormorant: the only gold, the one brand touch.
  An end card that names a hotel and its place takes the same order (Scott, 20 Oct, Low
  Wood Bay): gold caps place, underline, then the name in cream Cormorant.

- CBH charcoal `#282825` (Scott, 22 Oct: "remember that charcoal colour"): the ink of CBH's 25 Years
  lockup, a house colour beside the gold `#C39E55` and black; the AMC reel's end card turns to it
  so the lockup sits in the card.

## Open work (trim as items close)

- Branches: `main` has everything up to the Black Friday reel (PR #6, merged).
  `claude/sleepy-meitner-h0zycw` carries the newer work below (showcase, journey, sketch,
  craft, rolodex), with no PR open yet; it is merged into `ccr-df0b465b-qqzrio` (search
  reels, sketch-to-life renderer), so that branch has everything. `claude/busy-wozniak-q1gnsk` (PR #4) is a separate
  session's style tests (three.js depth, window pane, split-screen Story, oak leaf), not
  merged into either.
- `aa-rosettes` / `aa-rosettes-story`: final; Jira ticket delivered.
- `dalmahoy`: waiting on the cocktail bar still (never arrived as a file).
- `plate-to-pillow` (A) / `plate-to-pillow-b` (B, Smooth Soul): on hold; Bianca questioned
  the "bed for the night" angle, which led to the AA Rosettes reel.
- `fairlawns-stay-dine`: Fairlawns footage reel (Neo Soul Night), visuals only (no text block), standard end card with the shimmering logo; sent for review.
- `cosy-escapes-flipbook`: Cosy Escapes journal reel (Cozy Soulful); sent for review.
- `oakley-hall-story`: dog post (dog clip only, Upbeat Acoustic), Cosy Escapes; Jira ticket delivered.
- `hardwick-hall-search` / `-story`: "search" reel concept (new `search/` engine), Hardwick
  Hall foodie; growing lines removed. Story going out as an Instagram Story. Music is Soul
  Retro Groove (Scott kept it; Plate to Pillow has changed, so no clash).
- `hintlesham-hall-search` / `-story`: search reel, Hintlesham Hall foodie ("Fine dining in a
  Suffolk country manor"), Smooth Soul; first preview. Spare photos (dessert, garden pond,
  parkland, bedroom) are in the uploads, not the repo.
- `black-friday-gift-vouchers`: Black Friday gift-voucher reel (unwrap engine, Luxury by
  Sub_Clair), footage-led after Scott's first notes; preview 4 sent; on hold (Scott: leave it
  for now). Pending fix if it resumes: the Rutland lake clip judders and the Fairlawns sauce
  pour lurches under the peel (open Fairlawns on the plating instead).
- `cbh-showcase`: collection showcase (unwrap engine, Luxury reused from 100.2s at Scott's
  request), 20 hotels, minimal text, visual-led; preview sent. Scott found it a slideshow,
  which led to the journey reel; parked.
- `cbh-journey` / `-story`: source brought here 1 Nov from `claude/hook-browser-path` (the 29 Oct renders' spec, its
  photos in `campaigns/journey-new/`), Hythe's tag now the full name "Hythe Imperial Hotel, Golf & Spa" (Scott); posting
  Mon 2 Nov. The ending (Scott: "loses energy right at the light logo bloom", it sat on the track's thinning
  outro): `music.edits` (new in the journey engine) cut on bars to more groove from beat 64, the pre-drop breakdown
  from beat 84 (the pull back) and the drop on beat 92, where the lights' CB goes solid (`endAt` 1393), 52.0s, -15.9 LUFS (reel gain 0.47). The Story the same (Scott: "and the Story version"): the breakdown from beat 20 (the pull back), the
  drop on beat 28 under the solid CB, 18.2s, -15.5 LUFS. Scott wondered if 52s is too long. Older notes: the gold-thread map reel (journey engine), 20 hotels opening out of their
  pins on the beat, same stretch of Luxury; thread carries on to Pitlochry and its head
  bursts to light 57 pins (the collection) then becomes the CB logo. Spec has the Kingfisher
  on its aperitivo shot (Scott picked it), but out/cbh-journey.mp4 is still the fireside
  render: re-render when it resumes (Scott: "stop here for now").
- `holdsworth-sketch` / `holdsworth-sketch-story`: sketch reel (sketch engine), redrawn
  in pen and ink with scripts/sketch-to-life.py (pencil roughs, ink, hatching, slow
  watercolour wash, the photo): four longer shots (house, main hall, tea by the fire,
  breakfast in bed), 32s; the Story is the house with "The Beatles stayed here", 13.1s.
  Preview sent. Story polish (23 Oct, Scott: "two pics instead of one and a hand drawn ending like
  the Ruthin sketch"): the house then afternoon tea ("Tea for two?" pencilled on the tablecloth),
  both lines kept in a darker pencil with a tight glow round the letters (`stay: "pencil"`, `ink:
  "dark"`; a paper oval behind them was out, Scott), end card like Ruthin's (name, then the place in
  gold caps; Scott chose it over the house order), 17.6s, -14.9 LUFS; suggested for Fri 23 Oct with a "Stay where they stayed" sticker. (`ruthin-sketch-story` still uses the older sketch-wash.py clip.)
  `ruthin-sketch-story`: the one-fact Story, "A castle since the 1200s"; preview sent.
- `cbh-craft`: the craft reel (craft engine), Smooth Soul. After "there's no theme" it
  runs on a clock: one day, 08:00 breakfast to 08:00 breakfast in bed, "Same time
  tomorrow?"; match cuts kept (lawn, fire to lantern to dinner's circles, bedposts); preview 2 sent.
- `cbh-rolodex`: test (rolodex engine): every hotel on an index card filed A to Z on a 3D
  drum, riffled fast, landing on Dalmahoy, Holdsworth, Oakley Hall and Ruthin, whose footage
  opens out of the card; last card "Keep this one handy"; Whittlebury's cooking track.
  Test sent, awaiting Scott's view. Known: card names/places come from search results
  (CBH site blocked), so check them; the riffle may be too fast to read; the turned-card
  stack reads as a grey band; renders take about 20 minutes (3D cards).
- Ideas offered, not built: rapid-shutter bursts (as an accent, hard cuts, no white
  flashes) and a collage wall that resolves into the CB monogram.
- `foodie-breaks-match-cut`: Foodie Breaks plate match-cut reel (Cooking Groove), seven labelled plates
  plus a no-text flick of six, stills only, CBH logo shimmer end card, labels held 1.6s, spin-whip match cuts and rising labels; fifth preview sent, final render after sign-off (confirm the Waterton Park duck photo).
- `october-best-loved`: Linktree October Best Loved reel (footage engine, now with `hook`,
  per-hotel `offers` blocks and an optional `music`), six hotels with their offer names,
  two versions from one edit: `october-best-loved` with Funk Music by SigmaMusicArt baked in
  (cut on its beats, 19.48s in, -15.9 LUFS) and `october-best-loved-silent` for the Instagram
  trending sound Hello October; both rendered. Story `october-best-loved-story`: all six
  hotels rapid (1.6s each, 10-frame dissolve), silent for Hello October. End card is now
  "October's / Best Loved" only (no link in bio, no gold rule); Haycock's pale plate gets
  a `shade` so its label reads. The Kingfisher is now Reel Bank footage
  (roast, dessert by the fire; Christmas clips left out). Still waiting on the Fairlawns
  7 .mov, Ruthin 1-4 + Express Pamper and Holdsworth 5 .mp4 (never arrived), so it uses the
  repo's Fairlawns clips, the Holdsworth parterre and the Ruthin hot-tub still. Ticket in
  `out/october-best-loved-ticket.txt`.
- `october-best-loved-2`: second Best Loved, same six offers and spec, fresh footage only:
  Fairlawns chef outdoors (hook) and copper bath, Ruthin's own autumn post (sumac and
  ruins, hot tub; 1s shots slowed 0.33x with minterpolate). Preview 1 sent with stand-ins
  still waiting on files: Kingfisher IMG_6941 + copy_68BF2FE2, Holdsworth 20260527 clips,
  Fairlawns IMG_7205, new Wildes Inns and Haycock Manor stills. No Gonville.
  The Kingfisher's tree, garland and fire clips are kept for the festive reel.
- `festive-lights-on` / `festive-lights-on-story`: festive reel (`festive/`
  engine). Scott: footage and stills must alternate ("otherwise it's tree tree tree, still
  still still"), so every shot alternates F/S on hard beat cuts, two beats each: Kingfisher
  garland (line "Come in / from the cold", lights switch on), Donnington, Kingfisher fire,
  Hogarths chef, Kingfisher tree (band's stop), Barnett Hill (tip to tip, on the return),
  treehouse canopy, Fairlawns crackers, Ramside tree, Fairlawns tea, treehouse copper bath,
  Hintlesham Hall; push-through on the last three stills; a light snowfall over the opening
  line is the one festive touch (Scott: don't touch the logo; a holly sprig on the C was tried
  and dropped); end card, no gold rule (on every reel), "Book your / Christmas,
  / Twixmas or / New Year" (CBH page wording; no "link in bio", "festive magic" was corny)
  + CB logo. 22.6s; Story 15s. Christmas Jazz by Tunetank baked in; no silent versions (Scott). Ticket `out/festive-lights-on-ticket.txt`. Langshott pumpkin clip kept for Halloween.
- `gn-ai-search` / `gn-book-direct` / `gn-conversion`: Great National Group LinkedIn stat
  videos (`src/linkedin/GNStats.tsx`, 4:5, silent, 8-9s): the static stat cards animated
  (69 of 100 travellers fill in, "Of travellers now rely on AI search summaries alone, often
  without clicking through at all." (Scott, 16 Oct); three reasons count up with lime bars; "Market Insight" 30%
  card in GN's own blob/rings/hatch design with average vs our-hotels bars), original copy
  kept. Official GN logos in `public/brand/gn-logo-*-{white,navy}.png` (navy recoloured from
  the white masters). Serif is Source Serif 4 until GN's brand font is known. GIFs are made
  from the MP4s with ffmpeg (not committed). No audio track (Scott: strip the empty one): render with
  `NO_AUDIO=1 scripts/render-film.sh <id>`. Header is GN's badge (`public/brand/gn-badge.png`,
  rebuilt hi-res from Scott's 100px badge with the logo master's letters) + "Great National
  Group". Post A (book direct) scheduled 14 Oct with the last-frame thumbnail; Post B (69%)
  to follow a few days later (swap its 👉 for 🔗, as Scott did on A); `gn-conversion` waits
  for its own post copy.
- `gn-full-house`: a Great National Group brand moment (Scott: "a cool animation for GN too ...
  do what you can execute best"; `src/linkedin/GNFullHouse.tsx`, 4:5, silent): the lime
  ring draws round like a gauge while navy rises in the circle like a glass filling (a
  rippling surface); the GN is there from frame one in navy and turns white wherever the
  navy has risen past it (a 0-100% count was dropped, Scott: "why does the 100 percent
  represent": a number reads as a claim); full, the ring pulses (letters cut from
  `gn-badge.png`), the badge lifts and
  GN's own wordmark (cut from the centred logo) comes up beneath; no light sweep (Scott:
  the shimmer is CBH's), 6.7s; polish: opens on the empty ring and navy GN (frame one is
  LinkedIn's preview), a shorter tail on the fill, no seam inside the ring. The ring closes as one circle once its
  ends touch (Scott heard "a click": a hairline gap opened for five frames), the navy overfills. On GN's
  card background. Render with `NO_AUDIO=1`; GIF and thumbnail in `out/gn/`. First version sent.
- `gn-map`: the GN brand moment that fits (Scott: the full-house fill had nothing to do with
  "Great National and Ireland ... it has to fit"; `src/linkedin/GNMap.tsx`, 4:5, silent,
  9.5s): Ireland and Britain (`scripts/gn-map.mjs`, Natural Earth via world-atlas, faint from
  frame one for the preview) draw in navy, GN's 26 hotels (`src/linkedin/gn-map/hotels.json`,
  Scott's list from greatnationalhotels.com/our-hotels, placed by town: 17 Ireland, 9 UK)
  light up in lime, Ireland west to east then the UK; the lights lift off, fan into a circle
  (assigned by angle, so no crossings) and the lime ring closes through them; the navy fills
  from the centre, the white GN comes up, the badge lifts over GN's wordmark. No shimmer.
  First version sent; `gn-full-house` kept as the other option.
- `gn-key-fob`: the third GN brand moment (Scott: the map was "forced ... needs to be fresh";
  `src/linkedin/GNKeyFob.tsx`, 4:5, real 3D with `@remotion/three` and three.js,
  render with `--gl=angle`): a brass barrel key and a round fob, lime round navy like the
  badge, hang on a split ring in warm low light; the fob turns on its loop and every face is
  one of the 26 hotels (town in lime caps, name in white Source Serif), the hotel's photo out
  of focus behind it (`scripts/gn-key-bg.sh`), quickening to a spin and slowing to land face
  on as the badge; the key fades into the dark, the enamel flattens to GN's exact colours,
  the badge settles over the wordmark (official proportions). Logo SVGs from GN's theme
  (Scott, 20 Oct) in `public/brand/gn/` (lime #AFBD37, navy #152C3D), badge and wordmark cut
  from them; hotel photos (one each, from the Our Hotels page) and the homepage heroes in
  `public/campaigns/gn-key/`. First version sent. Sound (Scott: the silent ones "were like
  short quick take infographics"; this is a brand moment): `scripts/gn-key-sfx.py` synthesises
  the key settling on its ring, a tick each half turn (following the spin), a clink on the
  landing and a last faint touch of the ring, in a small room; no music, no whooshes;
  `gn-key-fob` has it, `gn-key-fob-silent` doesn't (render that one with `NO_AUDIO=1`). Polish: the
  key's bow a round cast ring (a flat one read as a washer), handled brass (streaked roughness,
  less saturated), the hotel faces' navy a shade deeper so it reads navy under the light, the
  key darkening into the shadow as it fades. Polished version sent.
- `clocks-go-back` / `-story`: "This Sunday has 25 hours" (clocks go back Sun 25 Oct 2026;
  post by ~20-23 Oct). `rewind/` engine: the opening runs backwards (Fairlawns sauce,
  Kingfisher fork from its own Instagram reel, Fairlawns dish, Dalmahoy syrup) while a gold
  clock counts back a minute at a time 02:00 -> 01:00 (Scott), landing on the snap as the
  syrup pours forward ("One extra hour"); the sauce rewind was cut (Scott: it looked like
  plating, not backwards), so it opens on the fork; a subtle tape-rewind look (scanlines,
  washed tint, soft tracking bands) runs under the clock until the snap; then one shot a bar with a line (Holdsworth
  parterre, Oakley dog, Kingfisher fireside, Ruthin hot tub), Fairlawns bedroom with
  "Where will you / spend yours?" (Scott: no more "worth ..." end lines), CB logo. 26.1s; Story 13.0s. Music "Lounge
  Soul" by Kulakovka (Pixabay; credit "Music by Tony Vodnik from Pixabay", check which name
  Pixabay asks for): quiet intro under the rewind, band enters on the snap. Clips cut by
  `scripts/clocks-clips.py`. Final sent (closing line swapped); the newest cut (Sentimental Autumn Music, centred end card) is on `claude/loving-brown-0k56ps`; its labels redone to the text rule (19 Oct: gold caps place underlined over the name in cream Cormorant, the clock cream), patch `out/clocks-go-back-text.patch`, renders `out/clocks-go-back{,-story}.mp4`, place caps 28px; then each hour shot held a beat longer (Scott: too fast to read; five beats, clips recut by `scripts/clocks-clips.py`, in the patch), 24.0s and 12.7s, final; ticket in
  `out/clocks-go-back-ticket.txt`: reel Wed 21 Oct, Story Sat 24 Oct. Kingfisher autumn river (in
  `the-kingfisher/autumn-reel.mp4`, 3.8-5.8s) offered as an autumn swap for the parterre;
  IMG_6950 (Kingfisher fireplace, Christmas 2023) not used: festive decor.
- `november-out-there`: "November everywhere else / at ours" (was "out there / in here":
  Scott, the lake and hot tub are outside shots) (`mixed/` engine, the mixed format; Scott: like the
  Bonfire Night Story, `bonfire-night-story` on `claude/sharp-darwin-suaml5`, stock clips with
  hotel images and footage, but a new theme and take). Grim November stock (Pexels, near
  colourless, dark, a blue-grey wash) hard-cut on the action into the hotels (warm): rain in a puddle (hook; was a car in
  slush, Scott: less snow, it's the UK) -> Ilsington scone,
  rain on a window -> Kingfisher tea pour, wet dog -> lakeside springer spaniel with a couple (Scott's still, the Wild Boar estate; not
  the Oakley dog, used three times, nor Burleigh Court's, short sleeves), a red bus through the
  rain at night (Pexels 5687585, 19.5-23.5s; was the frozen man: Bianca, no big freeze in the UK)
  -> Ruthin hot tub, rain dripping off an umbrella (was a snowy wing mirror) -> Ilsington map at
  the window (the payoff, Scott), a drop falling on the cut; no snow left. The dark street (a car
  on the same street) is out (Scott: the car then the bus was "a waste", a duplicate), and with
  it Langshott's fireside tea (the second tea), so five pairs, four hotels tagged, 22.5s, -15.4
  LUFS, end card on beat 36.
  "November" holds across the first cut, "everywhere else" swapping to "at ours" as the bass of
  Deep Classy House (from 142.6s, its second breakdown; the first, at 40.97s, has a woman
  singing: Scott wasn't sure about it) comes back; end card "Which November / are you having?",
  white CB kept. The deck reel's autumn grade, pushed warmer, on the hotel shots (Scott: "give it an autumn
  grade", "make the difference more noticeable"); each hotel shot dissolves in over 14
  frames on the beat and warms up from the cold look (Scott: "a crossfade so it warms up"),
  cuts back to stock stay hard;
  polish pass: hook line exits
  clear (a "y" tail peeked under "November"), scone starts after its own cut, scone and tea
  slowed with interpolation so they don't run out, 24fps stock interpolated to 30, dissolve
  into the end card; final (out/november-out-there.mp4); ticket in `out/november-out-there-ticket.txt`
  (comment post, not branded Cosy Escapes (Scott), suggested Tue 3 Nov, five hotels tagged;
  confirm the spaniel is Wild Boar's). Story `november-out-there-story` (1 Nov): the reel two beats in, four pairs (tea out),
  17.4s, -15.3 LUFS, ticket `out/november-out-there-story-ticket.txt` (poll Everywhere else / At ours).
  Disk: `out/amc-2026-reel-{soul,dirty}.mp4` also skip-worktree and deleted locally (unchanged on the branch). Stock from Scott (Pexels is blocked here): rain-window (Pexels
  12742709), wet-dog (10914653), snowy-mirror (19555153, in place of wipers),
  snowy-car (13272962, the opener, in place of ice scraping), dark-street (5687585, cropped
  from landscape), frozen-face (11120675, in place of cold breath), puddle (14880665) and umbrella-drip
  (13666287, cropped 9:16, 24 -> 30fps) in place of snowy-car and snowy-mirror.
- `departures-keswick`: "Departures" episode 1 (`departures/` engine, mixed format; Scott:
  one hotel a reel, "it can be a series"). A split-flap departures board in black and gold
  (KESWICK, PITLOCHRY, WOLVERHAMPTON, DARTMOOR; the other rows are the next episodes, not
  Ruthin), Keswick flips to BOARDING, the frame turns over flap by flap (`flaps.tsx`; video
  shots use poster stills in the turns) into the trip: stock corridor with a suitcase
  (Pexels 8044819), platform (12169863), hand out of the car window over the moors
  (15307404), then Lake District Castle Inn Hotel & Spa (two lines on the label; Scott's
  photos in `public/hotels/castle-inn/`): garden under the fells, fell walk, cycling, pool,
  fireside last (pans from the table to the lit stove: Scott wanted more of the table).
  The photos are camera moves with real depth (`scripts/still-depth-dolly.py`, MiDaS small
  from the MiDaS GitHub release in ~/.cache/midas: near things travel further; no handheld:
  Scott found the handheld sway fake; "add more depth", "look more real, not AI"); constant
  speed, every shot gliding the same way so the cuts flow (Scott: "not so stop start"),
  depth softened and parallax low on the red-backpacked walker (it wobbled); preview 4.
  Cosy autumn grade (Scott) on everything, stock quieter. Soft synthesised flap sounds
  (`scripts/flap-sfx.py`). Music: Happy Feels by MarkJuly (Scott's pick over Peaceful
  Acoustic Guitar for energy) from 121.10s, the turn on the chorus at 124.8s; it is also
  on the Dad birthday chat reel (from 7.13s): flagged. 21.0s, -16.7 LUFS; preview 4 sent. Going out as an Instagram Story (Scott, 16 Oct: a new
  hotel), link sticker "Now boarding" to Castle Inn's CBH page.
  Next episodes: The Mount (Wolverhampton; `public/hotels/the-mount/`, check the adventure
  golf and golf course are the hotel's), Atholl Palace (Pitlochry; one photo so far),
  Ilsington (Dartmoor; aerial and breakfast clips in `public/campaigns/departures/hotels/`).
  Window seat and a moving rounded-squares collage (The Mount's unused shots) to follow.
- `the-mount-collage`: the moving tile wall (`collage/` engine; Scott: "dynamic squares, a
  moving collage", with The Mount's photos). The Mount Country Manor Hotel, Wolverhampton,
  and its golf club (the pavilion is signed "The Mount Golf and Country Club"): Scott's
  photos in `public/hotels/the-mount/`, 20 used, each entering once (pizza and adventure
  golf left out). On Cooking Groove (Scott's pick) to the end of the trimmed file, 23.7s
  (Scott: "it doesn't have to be 15 seconds, the track, don't constrain"). Tiles, not cards
  (Scott: "we did cards already"): a 2 x 3 grid, even gutters, small corners; the 3D is the
  wall's (Scott: "the 3D depth is cool if they look like tiles and not cards"): one plane
  tilted back and turning slowly as one, tiles with thickness (a solid edge) casting
  shadows, a moving tile lifting off the wall and setting flat on the hit. Shift, slide
  and collide on the track's accents (after "jerky", "pop and lock", "no little jerk when
  they stop", "more energy"): tiles slide in from the side and shove their row along
  (`shoved`), knocking the end tile off (`shovedOff`); a tile grows into the scene on the
  big hits; nothing moves once stopped; holds through the stop and the quiet bar; the
  scene behind shifts framing on every landing (Scott: use the background in the
  choreography). Label "WOLVERHAMPTON / The Mount / Country Manor / Hotel & Golf" (the full
  name, Scott) held ~3s (Scott:
  too quick), bottom row clear under it. End card over the blurred, darkened wall (Scott
  first wanted black, then "doesn't have to be black"): "Pudding first, / or the
  four-poster?" (Scott wasn't sure about "Which square / would you pick?", nor that the
  dessert is a fondant: never name a dish the photo may not show). Cosy autumn
  grade. -15.3 LUFS. Final after a polish pass (grid 10px up, clear of the CB mark). The ending
  (Scott: the blurred-wall end card was "kind of abrupt"): the fondant flies up out of the
  wall to fill the frame on the 39.5 kick (`end.zoom`), the wall dropping into shadow,
  holds a beat, fades to black on 40.5, the question rises on black. Two more track tries
  (Scott): `the-mount-collage-swing` (Bring Back the Swing, EvolvingVibes, Pixabay 617230,
  120 BPM from 7.38s, 21.8s) and `the-mount-collage-shuffle` (Funk Jazz Shuffle Groove,
  Catch22Music, Pixabay 358859, 110 BPM, 23.7s). Scott chose the shuffle (Cooking Groove
  already went out on the Foodie Breaks Story; the swing's hits fell between the moves), so
  it is retimed to its own hits (`SHUFFLE` map in the spec): it swings, off-beats at n + 2/3
  not n + 1/2; from 3.83s (kick on beat 0); the pavilion collision on its heaviest kick (32);
  the fondant flies up 39 -> 40, black on 41 2/3, the line held to 47.5 (~3s; Scott: "end
  card needs to hold longer"), 25.9s. Landings average 1.8x the track's beat
  strength (Cooking Groove cut: 1.4x). `the-mount-collage-shuffle` is the version to post.
  Any pattern, any number of tiles, any song: layouts are data.
- `cbh-comic-flip`: the Marvel-style intro (Scott: "like the Marvel movies intro, the comic
  book flipbooks into the logo"; `comicflip/`, a silent mock-up, 10s): 77 photos from across
  the collection (`comicflip/photos.ts`, interleaved by hotel, no festive decor) riffle past
  flicking up over their top edge like a stack of prints (Scott: like Marvel "but not ripped":
  no left-spine comic turn, no comic art, black and gold, our monogram), the first four held
  28/24/20/16 frames with a slow push-in, then faster to a blur; at full speed the CB crossfades in,
  Marvel style (Scott: "a cross fade into the CB"; the earlier pull-back out of the C was
  replaced): pages keep flipping inside the letters while the outside dissolves to black,
  the CB easing back from 2.4x to its place in the logo; the riffle slows, the CB fills with gold, the official logo fades up round it
  (aligned to the CB in the logo's own viewBox), shimmer. 12.3s mock-up sent; waiting on a track
  with a build and a big hit, then cut to it.
- `cbh-mosaic`: the mosaic (Scott: the comic flip was "great execution but just too Marvel";
  `cbh-comic-flip` parked; `mosaic/`, silent mock-up, 12s): Castle Inn's garden under the fells
  fills the frame, then one unbroken camera move draws back (anchor moves with 1/s, so the
  first tile stays in view) to show it is one tile in a wall of the collection (69 photos,
  `mosaic/photos.ts`: the flip's set with Waterton Park, the duck plate, in place of Hythe
  Imperial, Scott; Waterton sits just above the first tile so it reads large); the CB rises
  out of the wall as a photomosaic, rippling out from that tile (bright warm photos inside,
  the rest to black); polish (Scott): the blocky edges dissolve to the CB's true outline,
  the grout lights gold, then the tiles turn gold one by one in a sweep from the C to the B;
  logo and shimmer. Waterton Park is now Scott's five photos from the CBH site
  (`public/hotels/waterton-park/`: aerial, Walton Hall, indoor pool, outdoor hot tub,
  afternoon tea), the duck plate out; the aerial is the big tile above the first one.
  The wall holds (Scott: "show the big wall a little more before morphing"): the zoom runs
  through keys on a monotone cubic, so it slows over the full wall (~5.5-8s) without
  stopping; the wall is 40 x 70 so its edges never show. Variety (Scott: "I can see all the
  same photos everywhere"): 111 listed, 96 after dropping exact duplicates kept in two
  folders; each photo gives up to four crops (centre, both ends, a detail), 378 tiles, each
  used 2-11 times; no photo within 4 cells of itself; the first tile and Waterton's aerial
  above it are placed by the builder, so spacing covers them. Repeats still showed on the full
  wall and a random shuffle looked busy (Scott: "just one shuffle each, like a ripple that
  creates the CB, and not so AI looking"): two walls from the builder, CELLS_PRE (a mix, no
  CB hint, 7-8 uses a tile, the first tile and Waterton set in it) and CELLS (the CB's); one
  wave from the first tile (frame 172, 2.2 frames a cell) turns each tile over once (rotateY,
  10 frames, its far side shaded) onto its CB tile, which warms or dims as it lands. Music (after A Simple Reveal
  Logo, "a sound effect", and Bring Back the Swing, "not going to work"): Soul Retro Groove
  by alexguz (Pixabay 378379; also on Hardwick Hall search, Scott: "you can use it";
  "loungey, uplifting"), `public/mosaic/soul-retro-groove.mp3` from 15.5s (Scott: the
  percussion came in "right at the end"): a soft chord on the first photo, the intro's hush
  as the camera draws back, the band in (21.14s) as the wave starts (frame 170), the gold
  (frame 326) on the downbeat two bars later; ends on the piano's last chord (Scott: "let
  the piano finish", then 19.3s was "too long"): the chord at 16.1s, faded over the last
  second: 17.2s, -15.8 LUFS. Posted 16 Oct as a plain Instagram Story (no CTA, no sticker:
  a brand moment). Going out as a plain
  Instagram Story (no stickers, no text: Scott).
  `scripts/mosaic-grid.py` builds `public/mosaic/atlas.jpg` and `mosaic/grid.ts` (rerun
  after editing the photos).
  Variations (Scott: "more cool takes and variations ... just brand moments I can use";
  `MOSAIC_VARIANTS` in `Mosaic.tsx`, all on the same timeline and track): `cbh-mosaic-foodie`
  (the wall all plates, `photos-foodie.ts`, built with `--name foodie --details 3`: 36 photos,
  no Hythe, no Waterton duck; opens on Murrays' plate, the fondant above it), `cbh-mosaic-mono`
  (behind the wave the wall turns black and white outside the CB's true outline, so a colour
  CB rises out of a monochrome collection; the wall fades early so its edges never show),
  `cbh-mosaic-reverse` (played backwards from just after the shimmer: the gold CB breaks into
  the wall and dives into Castle Inn's garden; silent, 15s, an opener). The variants reuse
  Soul Retro Groove (a brand sound across the set; flagged to Scott).
- Brand moments, new takes (Scott: "a whole new take, not the mosaic in a different way, like these
  new logo moments"; `src/hotel-film/stings/`): `cbh-circle-c`, "Every circle is a C": match cuts
  on round plates lit in darkness, each rim landing on the C's own outer circle (centre 216.2,
  154.5, r 156.9 in the logo viewBox; `cbh-logo-c-only.svg` / `-b-only.svg` split from the CB),
  turning and slowing to a stop as the last becomes the gold C; the B joins, the CB settles into
  the logo, shimmer. Eight plates (Scott: "needs more plates"; he sent 14 overhead shots from
  the CBH site, `public/stings/plates/`), breakfast to dinner, light and dark alternating,
  two versions cut to Scott's five loungey Pixabay options (`CIRCLE_C_VARIANTS`; the first
  plate on a beat, cuts quickening over four beats, Hintlesham held a beat, the gold C on the
  hit): `cbh-circle-c` on Deep House Sunset (Sunset House Grooves, 538759; the C on the drop
  at 94.05s, after the kickless bar; 15/11/9/7/6/5/5/15 frames, 7.0s, -15.4 LUFS) and
  `cbh-circle-c-cocktail` on Jazz Cocktail Lounge Music (alex-morgan, 556246; plates through
  the band's stop over the piano, Hintlesham on the drum fill, the C as the band returns at
  52.02s; 17/12/10/8/7/5/5/16, 7.3s, -15.8 LUFS). Not cut: Lounge Soul (614873, on
  clocks-go-back), Lounge Chill Nu Jazz Restaurant (587425, busy, its breaks are 4s+), Lounge
  by prettyjohn1 (494159, bossa, steady then a fade: no hit). Plates: Gomersal full English, Donnington Manor breakfast, Low Wood Bay,
  Waterton chicken, The Mount fish and chips, Donnington & Co (the held-up plate; 1024px, so
  only 5 frames), Gisborough, Hintlesham (the C). Rims run to the edge are extended with
  `scripts/plate-pad.py` (`plates/padded/`). Not used: Gisborough 1 (the same photo already in),
  Gisborough 2, Rutland (rims run well off), Haycock, Langshott, Ramside (empty black plate
  only), Donnington & Co 2 and 3 (plates too small), Donnington Manor 2 (slates). It ends on the offer ("so it doesn't look like we just do restaurants"):
  "Foodie Breaks / from £139" in cream Cormorant; then (Scott: "or just use the white CB")
  a white C into the corner CB with the offer centred was tried, then back to gold (Scott:
  "kinda like the gold logo": the gold C is the payoff, and it matches the mosaic's logo
  moments): gold C, B joins, full logo and shimmer, the offer under it. Then (20 Oct, Scott: "make it longer through
  the cycling so it looks like speed then slow") one cycle for both tracks (`CYCLE`): 21 plate
  shots, 14 frames down to a blur at 2 and back out to 12, Hintlesham held 18 as the C; the spin
  follows the cut rhythm (`SPIN`); the slow-down sits on the last 2s before the hit. 8.9s,
  -15.6 / -15.9 LUFS. The text offer is off (`SHOW_OFFER`; Scott adds Instagram's Foodie Breaks
  link sticker in the space under the logo); a light motion blur on the 2-3 frame plates. `cbh-where-next` (a departures board
  settling on WHERE / NEXT?) parked: Scott already did a departures one. Offered next: a
  postmark (a hotel postcard turning to a CB-franked address side) or a brass key fob. Scott then
  suggested photos falling into a stack that builds the CB, tiles flipping to gold, or "something
  else entirely than photos or tiles"; the stack would repeat the mosaic's gold-tile ending, so
  offered instead (16 Oct): a gold wax seal pressed into the CB (relief lit with SVG lighting
  filters), a door opening on a dark hall with the light on the floor shaped as the CB, steam
  from a cup of tea gathering into the CB.
  `cbh-wax-seal`, "Sealed" (Scott: "go for it" on the wax seal): a cream envelope on a dark
  walnut table under a warm pool of light, gold wax pooling in dollops on the flap's tip, a
  brass seal with a walnut handle coming down out of the blur above the camera, pressing,
  lifting off to leave the CB in the wax (raised letters, an inner ring, the wax squeezed out
  in a lumpy rim); the light moves across the relief so it glints while the camera pushes in;
  the pressed CB turns flat gold as the scene falls to black, settles into the logo, shimmer.
  All drawn and lit from height maps by `scripts/wax-seal.py` (no photos; the CB from
  `cbh-logo-cb-only.svg`; world at 2x, `ONLY=f1,f2 STILLS=dir` renders check stills), which
  writes `public/stings/wax-seal.mp4` (270 frames) and prints where the CB sits on its last
  frame for `WaxSeal.tsx`. Silent mock-up, 12.5s.
  `cbh-sash-window`, "Every window, a different view" (Scott's pick of the collage ideas: sash
  window, slats, contact sheet and loupe, pop-up book, postmark): a dark room and a Georgian
  six-over-six sash window, every pane a different hotel's view (21 exteriors), swapping one
  by one; the panes clear in a diagonal sweep to one view through the glass (Castle Inn's
  garden under the fells, a depth push, `public/stings/window-view.mp4`); the lower sash
  slides up behind the upper (its bars seen through the upper glass), the camera pushes out
  through the opening (the room 7x, the garden 1.2x: parallax), fade to the gold logo and
  shimmer. 15s, -15.7 LUFS, cut to the last 15s of Jazz Cocktail Lounge (alex-morgan, Pixabay
  556246, from 147.97s): panes swap through the band's stop, clear as it comes back (frame
  134), the push (222-268) lands on its last two hits, the garden holds in the hush, the logo
  on the final chord (frame 370). Scott sent five tracks (16 Oct); not used: Lounge Chill
  Nu Jazz (busy), Lounge by prettyjohn1 (35s, mostly a fade), Lounge Soul (already on
  clocks-go-back).
- `depth-demo` / `depth-demo-linkedin` and `depth-breakdown` / `depth-breakdown-linkedin`
  (`stings/DepthDemo.tsx`, `DepthBreakdown.tsx`; 9:16 and 4:5): Scott's own LinkedIn showing the
  depth moves, on two Pexels photos he picked (`public/demo/`: a coffee cup by a rainy cafe
  window, a hiker above a mountain lake; Pexels is blocked here, so he uploads). Demo (19s),
  the mountain only (Scott: "the mountain looks great, the coffee cup is less impressive",
  "show the map of the mountain, it really pops"): "One photo", its depth map sweeping across
  and holding ("Map its depth"), the move on the drop ("Move the camera"), its layers apart in
  3D ("Become 3D"), "Made from / one photo" (Scott: "No footage / Just depth" was "an AI tell": no "not X, just Y" lines); no full stops (Scott: "lose the punctuation").
  His own brand, not CBH's (Scott: "change the font so it's my LinkedIn, not CB"): Inter
  Display (`stings/personal-type.ts`, `public/fonts/InterDisplay-*.otf`), white text, lines
  and accents in place of the CBH cream and gold; the depth maps keep their colours (Scott:
  the map "really pops"). Step 07 is "Map the depth" (Scott didn't like "Or let a model
  read it").
  Breakdown (38.7s,
  Scott: "how it is made ... screenshots, hand drawn the lines, depth map then moves then 3D",
  "add the mountain too"): 01-06 on the coffee (screenshots, the lines drawing on, the depth
  map, the cup lifting out, the move, its layers apart in 3D on the drop), 07-10 on the
  mountain (MiDaS reads it, the hillside traced, the move, its layers in 3D; the 3D steps
  "Become 3D"), "Crossing into / the third dimension" (Scott: stronger than "Made from two photos"; the post's hook too). The ending was then set inside the mountain (Scott: "more realistic ... needs to be wow"):
  the photo's layers part a little and the camera glides (each layer scaled to fill the frame
  at rest, so only the parallax shows), and the line rises from behind the near hillside to sit
  between the lake and the hill, solid type casting a shadow on the mountain, the hiker standing
  in front of it; the scene dims a touch so the white reads. Steps 06 "Pull it apart", 10 "Step
  inside" (Scott wanted stronger than "Become 3D"); labels in Inter Medium 54px over a soft dark
  band. The mountain's middle layer is filled behind the hillside (no walker-shaped hole in the
  lake); the mountain moves reframed with more margin (the hillside slid off the left edge and
  smeared). The walker is traced to his boots and joined to the rock in the matte (Scott: "he needs to be standing on the thing like real"); the line rises through a soft edge over the lake; the lake behind the hillside is filled in both back layers, toned to the water beside it. 41.2s; posted on Scott's LinkedIn 17 Oct as `depth-breakdown-linkedin-mobile.mp4` (opens on the thumbnail frame: the app previews the first frame, which was black), post in `out/depth-linkedin-post.txt`. Hard cuts on the bar between steps (crossfades
  ghosted the cup). The 3D swings 20 degrees (at 30 the far layer slid off, leaving black). Deep House Sunset (from 27.0s and 44.76s). The coffee's depth is drawn by hand
  (`make-coffee-depth.py`); the cup and the mountain's hillside move as layers (`--layer`,
  Scott: "watch the warping", the rail kinked behind the cup); assets from
  `make-breakdown-assets.py`.
- `low-wood-bay` (+ `-story`, `-silent`): "Weekend loaded", built on `claude/relaxed-newton-8vytys`
  (its source, notes and the full ticket live there); renders and tickets copied to `out/` here,
  with `out/low-wood-bay-ticket-short.txt` in Scott's short layout (16 Oct). Booking URL slug is a
  guess: confirm. End card redone to the house label order (20 Oct, Scott: "the house rule
  place in gold caps underline then the cream cormorant hotel name"): WINDERMERE, LAKE DISTRICT
  in gold caps with its underline on top, Low Wood Bay / Resort & Spa in cream Cormorant
  beneath (it had the name over a gold place line); `EndCard`'s new `placeFirst` in
  FootageFilm, used by the loading engine. Patch `out/low-wood-bay-end-card.patch` (for that
  branch), the four renders re-copied to `out/`.
- `waterton-park-island`: "Its own island" (`ripple/` engine, new: Scott asked for a Waterton
  Park reel after the five CBH-site photos came in). Walton Hall stands on an island in a lake
  reached by a footbridge (confirmed, 18 Oct: the hotel is two parts, Walton Hall on the island with 22 rooms, the restaurant, bar and the leisure club with its pool at lake level, and a newer building on the mainland with 41 rooms), so every cut is a ripple: a ring
  spreads across the water from a point in the outgoing shot and the next shot shows inside
  it, the crest bending the picture like a lens of water (`scripts/ripple-reel.py`, config
  `public/hotels/waterton-park/ripple.json`; a first try with a sine crest smeared into
  streaks). Stills as depth moves (`still-depth-dolly.py`): aerial drawing back from the hall
  to the island (label WAKEFIELD / Waterton Park Hotel & Spa), garden path to the footbridge
  ("Its own island, / one bridge in"), afternoon tea, indoor pool, prosecco in the hot tub,
  rippling into black: "Shall we cross / the bridge?", white CB kept. Cosy autumn grade.
  Jazz Corporate Cafe (alex-morgan, Pixabay 556232; unused on the mosaic) from 58.07s: the
  bass drops under the label, the first ripple as the band returns, one every two bars, the
  track's own ending under the end card. 27.9s, -15.5 LUFS. Preview 1 sent. Scott "not keen on
  the ripples" (keep the depth moves: "the depth is cool"; the music stays for now, he's not
  sold on it either): preview 2 is hard cuts on the same downbeats (`mode: "cut"`,
  `cut.json` -> `picture-cut.mp4`), the hot tub fading to black for the end card. Preview 3: more motion on the afternoon tea
  (Scott; a glide round the stand); its legs then stretched ("nauseating": MiDaS read the stand's
  top as far, its base near), so the tea now uses a hand-made depth map (`--depth-img`,
  `make-tea-depth.py`): the setting glides as one solid layer over the room (preview 4). The stand's arch still stretched (Scott: "it's warped in the stand on top"), so the stand is now its own rigid layer (`make-tea-stand-mask.py`: the arch fitted to the wire, plates and food traced; `--layer-near 0.81 --fill-full --hole 23`, parallax 24, dolly 0.025: the fill reaches only as far as the stand slides; wider left a smudge in the bokeh, tighter left ghost plate rims, Scott: "fix it ... so it can't be spotted"), out of the depth map (preview 5). Depth moves are now the house signature (Scott:
  "nobody is doing it like that"; in the skill). Story `waterton-park-island-story` (for Sun 18 Oct, Scott: the day before the AMC, a hotel Story rather than another logo moment; the name wall held for the AMC day): aerial and label for two bars (its own move, `clips/aerial-story.mp4`: drawing back while drifting sideways, parallax 48, so the island's trees pass the hall against the far fields and it ends on the footbridge; Scott: "the parallax on the opening could be better"), then a bar each for the footbridge (the line; a stronger push in up the path, `clips/walton-hall-story.mp4` on a hand-made depth map, `make-walton-hall-depth.py`, Scott: "move in more"), the tea, the indoor pool (reframed for the Story, `clips/indoor-pool-story.mp4`: tighter and higher so the pool and swimmers lead, not the spa bath's foam) and the four-poster bedroom (Scott's photo, `bedroom.jpg`, on a hand-made depth map, `make-bedroom-depth.py`: MiDaS bowed the footstool's legs and the armchair's edge, Scott: "check the warp", "always do by hand, more precise"; the spa massage close-up not used), end card, music fading (`fadeOut`); no hot tub (it reads as summer for October, Scott); over 15s is fine (Scott: "can go over"): 17.7s, -15.5 LUFS. Sticker suggested: "Cross the bridge" to the CBH page.
- Revanista 2.0.11 LinkedIn carousels (`revanista-gn` / `revanista-cb`, on `claude/loving-brown-0k56ps`):
  GN fine (Scott). The CB one was "garbage" (the GN layout on black), and a cream redo of
  the GN layout was still GN ("gn is gn"), so (19 Oct) CB has its own design,
  `src/linkedin/RevanistaCB.tsx`, same words. A menu-card take was "too old school", so it is
  modern, after Lee's Deliciously Autumn 4:5 and the reels; then Revanista's own devices
  (Scott): the cover is their mock-up on its studio grey, red decoration painted out
  (`make-devices-clean.py`, in the patch; `devices-clean.png` copied to `out/revanista-cb/`),
  black Cormorant over it. Scott liked the cover, so all three slides are on its studio grey
  (one busy slide over the blurred rate sheet wasn't "premium"; four slides were one too many:
  "should be 3 pages"): the six as soft white tiles, two by three (gold numeral, black
  Cormorant name, balanced sans line), and the close, black so it lands like GN's navy
  (cream Cormorant, the URL on a cream pill, Revanista's white logo). The CB is gold (Scott:
  not black; white doesn't read on the grey). No gold underlines or rules (Scott: "too many
  underlines in gold"): gold is only the small caps, the tile numbers and the CB. Polish and
  spacing passes done (the same label-to-headline gap on every slide); final. Emailed to
  Chris and Bianca, scheduled Tue 20 Oct 9am ("in case you want to run it at some point").
  Patch `out/revanista-cb-fresh.patch`, slides and PDF in `out/`.
- `up-next`: built on `claude/loving-brown-0k56ps` (source and notes there: the Stories "Up next"
  screen, Rowton Hall and Speech House, Fashion Deep House, 28.5s); its render copied to
  `out/up-next.mp4` and its ticket written here in the short layout, `out/up-next-ticket.txt` (20 Oct). The circles
  no longer jitter (Scott: "are the bubbles supposed to be jittery"): their float moved from
  `top` (snapped to whole pixels, so they ticked a pixel at a time) onto the transform, and the
  tapped circle's ring is an SVG circle locked to the Lens; patch `out/up-next-smooth.patch` for
  that branch; picture re-rendered with the mastered audio kept; `out/up-next-silent.mp4` remade. Story
  `up-next-story` (Scott, 20 Oct: "got the story cut"): the same cluster and track, Rowton only,
  opening on the drop, three shots (house with its parallax, tea, pool; lounge out), end card:
  14.5s, -15.6 LUFS (limiter then a fixed gain); spec `upNextStory` in the same patch;
  `out/up-next-story.mp4` and `-silent`.
  Fashion Deep House carries an AudioJungle voice watermark (Scott, 20 Oct: "it is saying audio
  jungle"): never use it; `up-next.mp4` and `up-next-story.mp4` must not go out with it. The
  Story goes out silent with an in-app sound (Wed 21 Oct, ticket `out/up-next-story-ticket.txt`),
  now all four Rowton shots (Scott: "the full four pics": house, tea, lounge, pool), then (21 Oct)
  Scott's dinner and canopied bedroom added (the bedroom framed on the bed, `pos: "84% 50%"`;
  his tea-in-robes garden shot dropped: "keep it autumn"): house, tea, pool, lounge, dinner,
  bedroom pulling out into the close, 20.5s (was 16.5s); the pool, dinner and bedroom as depth
  moves (Scott: "do the depth layer on some shots"; auto first, then hand-drawn: MiDaS as the
  reference, maps by hand in `public/campaigns/up-next/make-rowton-depth.py`, clips in
  `up-next/clips/`; in the patch, now ~10 MB with the clips),
  UI sounds (Scott: "add the sound effects like the button press"; `scripts/up-next-sfx.py`,
  the engine's `sfx`): a soft pop as each circle comes in (seven, rising a pentatonic step each),
  a click and a small thump on the press; no whooshes; peaks -15 dBFS so the in-app Good Day
  sits over them: `out/up-next-story-sfx.mp4` (the one to post; `-silent` has none). Not
  "Where to next?" behind the bed (Ruthin's reveal); the end now matches the beginning (Scott):
  `end.cluster`, the bedroom shuts back into its circle, ringed as seen, and the header turns
  from "Up next" to "Where to next?" over CLASSICBRITISHHOTELS.COM in gold caps; sticker
  "Up next: Rowton Hall" to Rowton's CBH page; the swap slowed into a clear transition (Up next lifts away, a
  beat, the line rises) and the cluster eases in with slight depth by circle size, at the start
  before the press too (`place()`: the picked circle opens from where the depth put it); a beat's
  hold before the swap and a soft two-note chime as the line arrives (Scott: "still looking at
  the circle"), 21.5s,
  `out/up-next-story-silent.mp4` (the watermarked `up-next-story.mp4` deleted); the spec change
  is in `out/up-next-smooth.patch` (regenerated against the branch, which has moved on: Root's
  imports merged by hand); in-app sound "Good Day" (30s, Scott). The reel needs a new track;
  `out/up-next-silent.mp4` meanwhile.
- `ruthin-castle-depth`: a depth reel like Waterton's mixed with real footage (Scott, 20 Oct:
  "another parallax one like waterton ... mixed with real footage", an SEO-sheet hotel, "choose
  one you can do best": Ruthin, rank 19). Stills as depth moves on hand-drawn depth maps
  (`public/hotels/ruthin-castle/make-depth.py`: solid blocks, sky by colour) alternating with
  Ruthin's own autumn phone footage on hard cuts (`scripts/cut-picture.py`, `cut.json`): clock
  tower (label NORTH WALES / Ruthin Castle / Hotel & Spa), sumac and ruins, the peacock on the
  wall ("A castle / since the 1200s"), the Tafarn y Ddraig sign, the plate by the fire, the
  steaming hot tub, the carved white bed fading out; end card "Fancy a night / in a castle?".
  Lounge Soul (Kulakovka, Pixabay 614873; not in any posted film) from 4.41s: tower over the
  quiet intro, band in on the first cut; a still a bar (3.48s), footage half a bar. 27.8s,
  -15.5 LUFS. First version sent. Bianca didn't like Lounge Soul (20 Oct): never use it again.
  Now on "Autumn Piano" by leberch (Pixabay 611124, Scott's pick): solo piano, played freely, so
  the cuts sit on its chords (from 7.84s): stills ~4s, footage as ~1.3s glimpses, end card on
  the 28.61s chord; the track mastered +6 dB through a limiter (`autumn-piano-mastered.mp3`),
  26.7s, -15.5 LUFS. The line sits high over the castle (`top: 450`; it covered the peacock's
  head). Second version sent. Polish: the tower push tilts up as it goes in (`--glide-y`, new in
  still-depth-dolly.py) so the tower's top stays in frame; the hot tub clip lifted (contrast,
  warmth: a per-shot `vf` in cut-picture.py). Polished version sent.
  The end card is now inside the bedroom (Scott: "in the middle layer in the bedroom ... or black
  end card?"): the bed plays on to the end, a push held to the top of the photo so the headboard
  sinks, the crest framed just left of the words; "Fancy a night / in a castle?" (96/80, top 230)
  rises from behind the headboard (its traced outline, `make-bed-matte.py`, as the alpha of
  `clips/white-bed-fg.webm`, played over the words: RippleFilm's `endCard.scene`) and settles over
  the red curtains. The 1200s line is a quarter bigger with a stronger shade (Scott: "hard to
  notice"). 26.7s, -15.6 LUFS. Sent. Then (Scott: "come up sooner", "and smoother"): the words
  rise on the 25.84s note (frame 535), a 66-frame eased glide, the crest framed clear of them.
- `phantom-cb`: the Halloween candle (candle dies, an ember on the wick, smoke picks out the CB in
  gold, "Happy Halloween" only), source now here (`src/hotel-film/phantom/`): the flame at a true
  30fps, the two clips never overlap, the smoke clip's candle and wicks hidden and its wick lined up
  on the flame's, a black point on the plain smoke only, soft edges all round. `out/phantom-cb.mp4`.
  Not posted (Scott, 31 Oct): saved as a brand moment. Render with `TMPDIR=/dev/shm/...` (Chrome
  crashed on the low disk).
- `bonfire-night`: the Bonfire Night film (from `claude/sharp-darwin-suaml5`) with the firework CB
  (from `claude/loving-brown-0k56ps`) as its ending, on the Bonfire piano throughout (two hearth bars
  repeated on the beat to reach the end), the burst on a bar with the shell's thump and crackle;
  `out/bonfire-night.mp4`, 25.9s, -15.7 LUFS, built with ffmpeg; reel and Story Thu 5 Nov.
- `cbh-screens`: a virtual space (Scott: "windows or squares flying past ... like TV screens ...
  so it's like a virtual space"; `stings/ScreenSpace.tsx`, CSS 3D, 21.1s, -15.5 LUFS): the
  camera drifts through the dark past gold-edged screens, footage (portrait, 720px proxies in
  `public/stings/screens/`: full-size clips timed the render out) alternating with stills on a
  barely-there push (the mosaic's photos less anything green and sunny: Scott, "should
  probably be winter footage"), gold dust; it pushes on at the drop, eases into one screen
  until it is the frame: the Kingfisher's dessert by the fire (slowed 0.42x with minterpolate,
  `hero-slow.mp4`), labelled BEDFORD / The Kingfisher (the only label: the flying ones pass too
  fast to read). One smooth speed curve that never quite stops, soft sway, the hand-offs to and
  from the full-frame shot matched to the pixel (Scott: "smoother, more natural"); then faster
  (Scott: "kind of drags"). End card (Scott: "a different end card", "which one caught your
  eye"): the screen drifts back up into the space as other screens fade up round it, "Which
  one / caught your eye?" over them, white CB. Music (Scott: "something Bianca will like"; Deep
  House Sunset was out): Rich Enough (Instrumental) by pietix (Pixabay 510327) from 138.44s,
  two bars before its full drop (142.5s, the push), landing four bars later. Snapped to the beat
  (Scott: "snap to the beat a bit more"): every moment on the track's grid (112.5 BPM, 16 frames
  a beat, `beat(n)`), the camera surging on each beat (same mean speed), the end screens up a
  group a beat, the screen back in two beats, the question on the next bar; the text rises in
  12 frames (Scott: "comes up kinda slow"). 21.1s. Flicker fix (Scott: "it splits and
  flickers", a screen on the end card): no clip loops (each plays once, timed so it runs out
  as its screen passes, holding its first frame while far off; only clips long enough round
  the end card), and every screen hangs square to the camera (Chrome dropped a plane turned
  on Y for a few frames where it hung over the frame's edge; the camera's yaw went too);
  footage through OffthreadVideo; each proxy one shot (the syrup pour, map and pub sign clips
  had cuts in them). Checked frame by frame. One engine, two cuts (`makeSpace(cut)`, beats
  from the drop): Story `cbh-screens-story` (14.9s, -15.5 LUFS) opens a bar before the drop,
  lands three bars on, the question on beat 20; both hold the hero clip's steady stretch.
  Ticket `out/cbh-screens-ticket.txt` (short layout, a conversation post). Sent.
- UI explainers (Scott, 20 Oct: the clean animated UI videos he saw, "virtual UI type one
  again"): `holdsworth-weekend`, "Weekend: booked" (`calendar/WeekendCalendar.tsx`, 9:16, silent
  mock-up, 21.7s): a weekend calendar in black and gold under "Free this weekend?", a thumb
  drags each plan from the tray into its slot (Fri check in 3pm, Sat massage 11am, afternoon
  tea 3pm, dinner 7:30pm, Sun breakfast in bed 9am), each opening into a 16:9 window on
  Holdsworth House's photo (landscape stills, so a window not full frame; barely-there push),
  then "Weekend: booked" and HALIFAX, WEST YORKSHIRE / Holdsworth House Hotel where the tray
  was. Not Fairlawns (Scott: "not Fairlawns again"). Needs a track. And for GN
  `gn-conversion-demo` (`linkedin/GNConversionDemo.tsx`, 4:5, silent, 13.3s): GN's +30% as two
  booking pages (industry average, our hotels), guests working down dates, room, pay, more
  dropping away on the left, each booking adding to a Booked bar, ours 30% longer, the +30%
  chip, then the gn-conversion card's own words (Scott liked the UI but found it "hard to
  follow"). `gn-ai-recommends` (`linkedin/GNSearchDemo.tsx`, 4:5, silent, 15s; Scott: "be the
  hotel AI recommends", GN wrote an article on it; the 69% search page was dropped, it had
  gone out): one idea a beat, each named by a white line over the page ("Travellers ask AI
  where to stay", "It answers with a shortlist", "And picks one"): the question typed and sent,
  the AI answer writing, three hotels, the middle one lighting up lime as the Top pick, Crown Quarter (GN's Wexford hotel; was "Your hotel", Scott: the audience isn't all hoteliers),
  a lime thumb tapping it; the page draws back to "Be the hotel / AI recommends" in white Source
  Serif over a lime rule. No figures. On GN navy #152C3D with a soft light
  behind the page (Scott: not the white background with the silver bars). Sent.
- Gala Awards Dinner team photo (Bianca, 21 Oct: add Georgina, else post the team shot on
  LinkedIn): `scripts/gala-composite.py` cuts her from her only photo (a dance-floor candid,
  laughing, mid-stride) with rembg, light matched, whoever is in front traced by hand,
  `out/gala/`. Tried in the back row (centre: Bianca, neck "so twisted", move her left; then
  head only over the blazer's shoulder: Scott, "just a head poking out"); now `edge`: all of
  her, walking into the line-up from the left, a step behind the first woman. Light sharpening
  only (denoised looked "too smeared"); her hand and legs matched to the team's backlit pink.
  Bianca ("I can't", how about between me and Katie, or Katie and Chris; Bianca is the
  turtleneck, Katie the off-shoulder redhead, Chris the light blazer): now `bianca-katie`, just
  behind between them, her face and neckline in the gap; Scott: "but then she has no body",
  so her leg and sandal stand in the backdrop gap under Katie's hem, on the back of the stage;
  "looks like one leg": her other foot (the planted one mirrored) beside it. Katie and Chris
  also built (`katie-chris`: head beside Chris, her stepping leg between his legs,
  `out/gala/team-with-georgina-katie-chris.jpg`); both sent to compare. Then Scott sent the
  stage moment (winners with medals; Georgina left, holding the bottle): the post is now a
  collage of the original team shot over it, no compositing (`scripts/gala-collage.py`, 4:5; stage crop clear of the men at the left (Scott), a polish
  pass: less stage floor, more of the winners, light local contrast and shadow lift;
  `out/gala/gala-post-collage.jpg`, and `-blend` with a feathered seam). Sent.
- Post-AMC video (AMC 2026, Annual Members Conference, 19 Oct; Bianca: "I'm going to entrust the
  post AMC video to you, brief incoming"): waiting on the brief. Assets so far in
  `public/campaigns/amc-2026/` (banner and arrivals, AV desk, Stronger Together keynote, sales
  panel, the team with "Celebrating 25 Years of Classic British Hotels" balloons, winners on
  stage, dance floor, gala team shot, a 9.7s venue clip of the golf buggies and terrace; clips
  from Scott, 21 Oct, as 30fps H.264 proxies: `registration-arrivals.mp4` (2.5s, portrait,
  guests at the CB registration desk), `registration-desk.mp4` (3.7s, the team at the desk
  with a 25 Years balloon), `venue-flags-terrace.mp4` (8.9s, flags, golf buggies, a pan to
  the lamp post and terrace); then `speaker-data.mp4` (6.7s, 11:16, a speaker by the data
  slides), `speaker-wedding-report.mp4` (9.6s, 16:11, the 2026 Wedding Industry Report talk),
  `sales-panel-wide.mp4` (1.4s) and `sales-panel.mp4` (21.8s, the panel, moderator on the mic),
  `awards-marketing-champion.mp4` (1.9s, 22:00, the Marketing Champion slide from the tables);
  `breakfast-spread.mp4` (2.9s, 09:35, the buffet on its trestle), `exhibitors-walk.mp4` (18s,
  10:07, a walk past the suppliers' stands into the room), `phill-keynote.mp4` (9.8s, 10:34,
  Phill under his MD slide, the room listening), `stronger-together-keynote.mp4` (1.0s),
  `speaker-afternoon.mp4` (2.1s, 15:23, a speaker gesturing at the charts);
  `awards-donnington.mp4` (53s, 22:03, 720p, with sound: the Sales Superstar Award announced,
  "And The Winner Is" at ~28s, Donnington Group named and the room cheering from ~32s, the
  loudest stretch of the clip, as the winners walk up: the night's applause for the film)). The
  Event Photography folder is on Dropbox (Scott's home link, needs a shared /scl/ link). It is
  CBH's 25th year (the 25 Years badge on the slides and boards): a likely thread for the film.
  Collages for LinkedIn (Scott: "a cool collage with the best photos ... or a gif even ... that
  cycles through a few"): `scripts/amc-mosaic.py` (nine photos in a day-to-night grid, still,
  GIF and MP4 build) and `amc-wall` (`src/linkedin/AmcWall.tsx`, 4:5, silent, 8s loop): three
  photo tiles pushing to their next photo in turn round a black tile with FOREST OF ARDEN in
  gold caps over "25th Anniversary / AMC" in cream Cormorant; `amc-wall-gif` is the same
  without the slow push-in, for a smaller GIF (`out/gala/amc-wall.gif`). Then (Scott: "house
  style full underline caps and smoother", "no photos duplicated"): the caps' still underline
  the full width of the words, 30-frame sine-eased pushes where the new photo covers the old one
  (which drifts a third as far and dims), one push a second, 12s loop; then slower (Scott: "is the switching too fast"): a push every
  1.7s, 40 frames, each photo held 5s; then the winners (Donnington Group, The Imperial
  Llandudno, Hogarths) in the big top tile, five photos a tile, 15 in all, each once, no scene
  twice (the second Stronger Together shot swapped for the wide room), 25s loop. No winner
  photos exist in the Dropbox for Ramside Estates or Hythe Imperial (the phone photos run
  10:00-10:04 PM, Marketing Champion to Donnington); Ilsington's award is only in a video,
  IMG_5298.MOV (2:30; its last 15s unchecked, may hold the winners on stage: a frame could be
  pulled from it). Scott: they are all named in the post anyway, so the wall goes out with the
  three. Polish pass: the wider balloons shot (both stars whole), the flat daylight shots warmed,
  a faint vignette in every photo tile. A landscape layout `amc-wall-landscape` (16:9, the tall
  tile down the left, the big tile top right) is registered but not rendered: Scott is posting
  the 4:5, which fills more of the LinkedIn feed. Bianca's notes (21 Oct): AV crew out ("they
  look bored"), Georgina dancing out (her "G standing"), Louise kept (the woman at the CB
  lectern, 11:31 AM, straight after her name slide), Phill in (cropped close at the CB lectern
  from the Stronger Together shot; the wide room with his MD slide opens the big tile), Rachel
  ("the big boss", burgundy jacket, right) is at the welcome stand; single-person and room shots
  faster, groups held longer: each shot has its own `hold`, every tile's holds sum to the 20s
  loop, offsets chosen so pushes are at least 30 frames apart and nothing moves in the first 20.
- `amc-2026-reel` (4:5) / `amc-2026-story` (9:16): the post-AMC film
  (`src/hotel-film/amc/AmcReel.tsx`). Two cuts rejected (Club No Copyright: "music is
  terrible"; Driving Ambition with depth moves: "the music and depth moves aren't working"; the
  depth clips in `clips/` and `depth/` are now unused). Third cut (Scott: "you already made a cool
  collage so the video just keep the momentum ... get creative"): the AMC wall come to life. A
  wall of panels rebuilds on the beat (layouts F, V2, T3, Q4 as data in `SCENES`, each panel
  pushing in over the old on its beat, staggered 3 frames, swaps inside a panel drifting the old
  photo aside like the wall's tiles; the gutters travel with the panels), text tiles in the house
  style (THE KEYNOTE / Stronger together). Day in order on the groove (registration, arrivals,
  Rachel at the welcome stand, exhibitors, Phill, Louise and the speakers, the panel), the night
  from the horns (58.75s): Marketing Champion, The Imperial | Hogarths, the room with "And the
  winner is", the name (SALES SUPERSTAR 2026 / Donnington Group label) and the stage from Scott's
  second phone clip (`awards-donnington-1080.mp4`: the upload decodes only to 20.1s, the rest is
  corrupt; steady from 8.0s of the proxy; no audio), the medals, Table 3, the balloons, the gala
  team, then the gold "25" end card. Light it Up Boy (Mixkit 849) from 42.62s, jumping on a bar to
  88 beats on (87.0s) under the 25, gold landing on the last hit (91.24s). The music stays on top
  (Scott: "if you can't blend it just put the music over"): the host's voice was too thin to dip
  for, so only the room's cheer (first clip, 32.3s) swells in under the name and settles ~8 dB
  under the music. Volume ramps in 0.025 steps (a per-frame value overflowed ffmpeg's
  expression). Story: the winners, the room, Donnington (its own crop, `spos`), the 25.
  -15.5 / -15.6 LUFS, peaks -1.2 / -1.6.
  Polish pass (Scott: "take out the weaker shots", "try a few different tracks"): out went the
  exhibitors' backs, the banner, the soft Phill close-up, the two distant speakers (speaker-data,
  speaker-afternoon) and the cut-off Donnington trophy photo; the day is now registration, the
  arrivals | Rachel split, the keynote three-up (Phill, the tile, the room under Stronger
  Together), the talks three-up (sales panel, Louise, the wedding report); the medals, Table 3
  and the balloons in one three-up, then the gala team. Clips carry a `stop` (where their usable
  footage ends) and slow just enough to last at slower tempos. One edit on any track
  (`AMC_TRACKS`: beat, `name` = the track's big moment, where Donnington is named, beat 28;
  `outro`/`hit` = where the end card's music plays from and the last hit the gold lands on):
  `amc-2026-reel` / `-story` on Light it Up Boy (the name where the horns lift), and
  `amc-2026-reel-dirty` (Dirty Thinkin': the night through its breakdown, the name as the band
  comes back full, 70.02s), `-soul` (Soul Funky Vibes: the band stops dead, "And the winner is"
  over the quiet pickup, the name as the band crashes back in, 112.06s; the gold on its stop at
  176.06s), `-attraction` (Attraction, 104 BPM: the name as the kick comes back, 129.28s; the
  gold on its last bar's stop, 184.66s). Each has a Story composition too (`amc-2026-story-<id>`),
  rendered once a track is picked.
  Graded (Scott: "give them a grade"): SVG filters on every photo and clip (`GRADES`): the day's
  flat daylight warmed with a little contrast; the night's neon magenta tamed to a warm rose (blue
  pulled down and into green, so skin comes back), deeper blacks, saturation 0.75. Prototyped in
  numpy first (matrix, contrast about a pivot, saturation), then the same steps as feColorMatrix /
  feComponentTransfer in sRGB.
  Longer (Scott: "another collage section ... a minute or less", "a few more overlays", "make
  the 25 pop more, that's a big deal, maybe a counter"): a six-tile wall (`G6`, tiles a half beat
  apart, then four swaps) between the talks and the night, from the shots the cut didn't use (the
  room under the Stronger Together slide, the sales panel close, the exhibitors' stand and the
  walk into the room, the speaker gesturing, the wide room, the data talk, Phill wide, the
  terrace and flags), a text tile "19 OCTOBER 2026 / Annual / Members / Conference" swapping
  in; "THE EVENING / Gala Awards Dinner" over the night's first shot; WINNER captions on The
  Imperial and Hogarths panels (`caption`). The name is now beat 44, the end beat 68 (Story
  38-56). The end card counts: the numerals, a window onto the gala team, tick up from 1, quick
  then slowing, landing on 25 on the last hit, where the gold floods in a few frames, the 25
  pops and glows, the shimmer crosses, "Here's to the next" above and YEARS in gold caps beneath;
  held ~3s (Story 1.5s). No new AMC material was in the uploads (the IMG_ clips are all proxies
  already; 20261019_095616 is the arrivals clip).
  The counter is a flipbook (Scott: "cycle through different shots ... like a Marvel flipbook or
  shutter"): numbers 1-24 each open on a different shot of the day in order (`FLIP`; stills from
  the clips in `stills/`), each kicking in at 1.06x like a shutter; 25 lands four frames before
  the hit (`LAND`) so only 25 takes the gold. The early numbers tick every 2-3 frames,
  which Scott is happy with. (The reel brief's "no flashing or very fast sections, no repeated
  shots, gentle movement only on stills" are Scott's own notes, not Bianca's.)
  Crops (Scott: "20 23 21 and 24 need better crops"): each flipbook shot is placed by hand
  (`f` = where its people are in the photo, put at the numerals' middle; `z` zoom; `placeFlip`
  clamps it to cover the frame); 24, held longest, is now the gala team (25 floods gold at once,
  so the team was barely seen); the balloons-wide shot is out of the flipbook. The strokes are
  only ~100px wide, so the shots read as fragments: the flipbook now also runs faintly across
  the whole frame behind the numerals (blurred, ~26% bright), the numerals the bright windows,
  the background falling to black as 25 lands.
  Sound on the 25 (Scott: "add sound effects to the 25", "or use filtered sound"; a house-rule
  exception he asked for): `scripts/amc-25-sfx.py` reads each track's outro/hit and the count's
  timing from AmcReel.tsx and writes `sfx/counter-<track>.wav` (a soft shutter tick per number,
  rising a little in pitch; on 25 a low noise thud, no sine boing, under a bright bell ting; a
  faint shimmer under the light sweep; a small room) and `sfx/outro-<track>.wav` (the end card's
  stretch of the track through a low-pass: muffled to 500 Hz as the room goes dark, opening to
  3.2 kHz with the count, full band as 25 lands), and `sfx/board-<track>.wav` for the winners
  board (Scott: "a subtle sound effect on the year's winners": a soft breath as it comes up, a
  muted tick at 880 Hz as each award lands, ticks near -18 dBFS; `BOARD_AT`, `ROWS_AT`,
  `ROW_EVERY` in AmcReel.tsx). The landing's chime softened and shortened (Scott: "a bit much";
  4 partials, decays 0.3-0.9s, a fifth of the thud); counter ticks -16 dBFS under the -6 landing.
  Rerun it after changing a track, the count or the board's timing.
  Then (Scott: the chime and whoosh at the end "too much and fake, like whoosh and then ching"):
  the ting and the shimmer are gone; 25 lands on the ticks, a soft thud and the music opening out
  of the filter. The room's cheer is only its first burst now (from 32.3s, faded out by ~3.2s):
  after it the first phone's sound carries the host talking, which can't match the second
  phone's picture of him giving the award (Scott). The opening stops before the camera pans to
  the burgundy jacket (Scott): the desk's steady first second at half speed
  (`registration-desk-slow.mp4`, minterpolate), then the arrivals full frame, then Rachel's
  welcome-stand photo full frame (the arrivals | Rachel split is gone).
  The winners board slower (Scott: "too fast to read ... hold a beat to register"): an award a
  beat (`ROW_EVERY` 1) from 62.8, the full board held to 71 (`BOARD_END`); to keep the length
  (Dirty Thinkin' reaches its last hit just past beat 74), the walk-up is 48-58 and Georgina's
  clean shot 58-62.3.   The gala team shot shows the whole photo (Scott: "get Bianca on the left in too, everyone in"):
  the group spans 91% of the square photo's width and a 4:5 crop keeps 80%, so `whole` fits it
  edge to edge with a blurred, darkened copy above and below (the ceiling and stage), the edges
  masked soft.   Longer still (Scott: the winners and the evening label "still too fast to read ... extend
  the song a beat or two"): the name is beat 46 (NIGHT fixed at 32), the Marketing Champion shot
  and THE EVENING label six beats (label ~2.7s), the awards a beat and a half apart from 64.8,
  the full board to 78, the gala team 78-82, the end card on 82 (a downbeat, NAME + 36). Dirty
  Thinkin' runs short, so its music jumps back 16 beats at NAME + 20 (`rewindAt`/`rewindBack`),
  on a downbeat, and reaches its outro exactly on the end card. ~49.5s. Story unchanged
  (NAME - 6 to NAME + 12).   The Imperial | Hogarths split comes in half a beat earlier (37.5; Scott: "this scene ... a
  half beat longer"), THE EVENING label to NIGHT + 5.1. Final: Scott is going with the original
  (`amc-2026-reel`, Light it Up Boy) and the Story; the Soul Funky, Dirty Thinkin' and
  Attraction versions in `out/` are from the cut before this last change.   Last notes: "And the winner is" builds a word at a time on the track's beats ("And the" a
  half beat apart, "winner", "is", each punching in; Scott: "like a drum ... boom boom boom";
  no drum sound added); the winners-on-stage shot cropped clear of the sound man (pos 79%); the
  Marketing Champion shot cropped onto Phill and the presenter (pos 74%: the slide's words were
  cut off). Scott is going with the original and Attraction (plus the Story).   Then The Imperial | Hogarths six beats (38-44; Scott: "still too quick to register"), the
  song two beats longer (NAME 48, board 66.3-80, end 84), captions up half a push after landing.
  The Story (NAME - 6 on) is unchanged by it and final.   The board slower again (Scott: "3 beats longer ... not rushed"): an award every two beats, the
  full board to 84, end NAME + 40 (a bar longer). Attraction's reel starts at beat -2 (`start`):
  at -4 it opened on a second of the track's own silence (a break bar, 99.2-100.35s).   The first phone's sound is out altogether (Scott: "I can barely hear Phill, just take that
  sound clip out"): music, the counter and the board only. The Donnington label holds to
  NAME + 10.5.   Story on Attraction too (`amc-2026-story-attraction`, Scott), the complete Story, over 15s
  (Scott: "no 15 second limit, just make it complete"; `storyFrom`/`storyHold` are there if a
  track ever needs it shorter).   Lorraine (the woman at the registration desk, the opening shot) a second longer (Scott): the
  desk shot runs to beat 2, the clip's steady second at a third of speed (minterpolate,
  `registration-desk-slow.mp4`, 3.2s), cropped at 30% so she is in frame from the first frame;
  the arrivals 2-4.   Then the arrivals two seconds (2-6; Scott: "too fast"), Rachel 6, keynote 10, talks 14, the wall
  18-32 with its swaps at 22/24/26/28.   The Stories now start on the winners' split (NAME - 10; Scott: "too fast on the story"), so
  The Imperial | Hogarths get their three seconds: ~16.8s on Light it Up Boy, ~18.5s on
  Attraction.   Copy (Scott: "more creative than the gala, the keynote ... use the space for witty",
  "suggest and apply"): STRONGER TOGETHER / Coffee first, then the plan (keynote tile); 19 OCTOBER
  2026 / 25 years, one room (day tile); GALA AWARDS DINNER / Then came the trophies (the night's
  label); "The trophy cabinet" (the winners board).   Counter sound more premium (Scott): a fine watch's tic-tac per number (two crisp clicks
  2.6ms apart over a faint brass ring, hiss rolled off, tic a touch left, tac a touch right,
  ~-16 dBFS) and 25 seating home like a latch (a crisp clack, then a deep soft clunk, a blink of
  metal sheen; no chime or whoosh), in a small warm stereo room.   Then no sound on 25 at all (Scott: the clunk was in the way, "the song will land right
  there"; the ticks peak -16 dBFS), and the keynote tile "THE KEYNOTE / Side by side since 2001"
  (Scott: "something about together", then "don't repeat together": the slide beside it says it; CBH since 2001, its 25 years; not "Coffee first, then the
  plan" or "Phill sets the tone"; the Stronger Together slide is in the room shot beside it).   Disk: the session's allowance is nearly spent (the repo's history is ~19 GB of committed
  renders), so renders run one at a time and only finals get committed.
  Winners board (Scott: "a cool overlay for the winners", with the post's list): over the
  winners on stage (B64.3-70, after two clean seconds of that shot: it is Georgina's only one, left
  with the bottle; Scott), the shot dimmed and blurred enough that no face reads under the type, "This year's winners", then all six
  awards a half beat apart, the award in gold caps tracking in over the winner in cream (no
  underlines): Founder Member, Ramside Estates; Revenue Rockstar, Hythe Imperial Hotel; Sales
  Superstar, Donnington Group; Marketing Champion, The Imperial Hotel, Llandudno; The Enquiry Ace,
  Hogarths Stone Manor Hotel; Guest Experience, Ilsington Country House Hotel and Spa. The
  winner panels' captions now name their awards (MARKETING CHAMPION / The Imperial, ENQUIRY ACE /
  Hogarths). Gala team from 70, end 74. Phill's keynote shot zoomed in on him (it was the backs
  of heads); YEARS 52px.
  The ending is now CBH's 25 Years lockup (Scott: "bonus points if you can get it like the lock
  up"): after the count lands and holds, the gold Cormorant 25 shrinks into place as the dark
  rounded diamond with the gold 25 / YEARS mark comes up, the bar wipes out to the right and
  EMPOWERING / INDEPENDENTS fade in (`Lockup`, `LOCK`, `lockupY` per cut). It is the real file
  now (Scott, 22 Oct: "there's the real 25 lockup", "just use the real file"):
  `public/brand/cbh-25-years-lockup.png` (607 x 250, its own thin white keyline), shown as it is
  in two parts: the picture clipped to the diamond's outline comes up, then the bar wipes out
  behind it (`scripts/amc-25-mark.py` traces that outline and measures the bar and the 25 into
  `amc/mark25.ts`). Blended (Scott: "it just looks like it's tacked on", "blend it ... with the
  black end card"): the counted gold 25 shrinks and travels onto the lockup's own 25 while the
  diamond (its traced outline in the charcoal, white keyline) grows out from behind it and travels
  with it, YEARS closes up into the lockup's, the file's diamond takes over as they land, the bar
  runs out, and the card eases from black to the lockup's charcoal so the diamond and bar sit in
  it (only the keyline, the gold and the words show), a slow push to the end. Rachel's gala
  welcome speech (Scott: "make sure she's featured"; `rachel-welcome.jpg`, red top at the lectern
  under the Gala Awards Dinner / Welcome slide; `rachel-welcome-wide.jpg` the room, unused) opens
  the night (beats 32-36, under the GALA AWARDS DINNER label), Marketing Champion 36-38; she is
  number 15 in the flipbook (the banner shot out to keep 24); the Stories now start on her
  (NAME - 16). The evening label is "GALA AWARDS DINNER / Then came the trophies" (Scott
  tried "Then came the talks and trophies", then went back). The count lands on the lockup's own 25 (Scott: "the 25 looks different now is the
  issue"): 1-24 in Cormorant, then 25 is the lockup's interlocked 25 with its YEARS beneath,
  traced large from Scott's zoomed screenshot (`public/brand/cbh-25-years-zoom.jpg`, BIG25 and
  BIGYEARS in `amc/mark25.ts`, mapped onto the file's units), in the lockup's gold `#b08d47`; it
  shrinks as one mark onto the file's own 25 (`big25`, `lockScale` per cut).
  Then Scott chose to end on the black and gold 25 rather than go on to the charcoal lockup (it
  read as a second ending after the music's last hit): "Empowering Independents" in cream
  Cormorant above the 25 in place of "Here's to the next", the gold 25 and YEARS held 95 frames
  after the hit. The lockup ending is kept behind `END_ON_LOCKUP` (off).
  The CB's shimmer on the 25 (Scott: "a shimmer over the 25 too like the CB"): CBLogo's band
  (110 degrees, -60% to 160% over 30 frames) across the 25 and YEARS themselves, from the hit + 40
  (after the line and YEARS are in); the old full-frame sweep only grazed the narrow 25.
  Rachel's face was soft (Scott: "her face is blurry in the reel"): all her welcome photos are
  low-light phone shots, soft in the files; the close-up is now the sharper of the two
  (`rachel-welcome.jpg`) and it is no longer enlarged to fill the frame: shown whole over its own
  soft copy (`whole`), zoomed part way towards her (`zoom` 1.6 reel, `szoom` 1.95 Story, anchored
  at `pos`/`spos`), so it is smaller than the photo in the reel and about its size in the Story.
  In the reel its left edge is held in the gap between "Gala" and "Awards" on the slide (`edge`,
  Scott: not "la Awards Dinner"), the push growing from that edge so it never cuts into "Awards".
  Scott: "forget the Story" (22 Oct): only the reels change from here.
  Polish pass (Scott: "polish pass then I'll submit"): checked every half second and the sound;
  the ending's music dies away cleanly after the last hit. The "...inner Is" slide behind The
  Imperial and Hogarths can't be cropped out (it sits level with their heads); left as context.
  Finals: `amc-2026-reel-attraction` (59.7s, the one Scott prefers) and `amc-2026-reel` (53.8s).
  The trophy cabinet spaced out (Scott: "give some separation here between each"): 50px between
  the awards (was 26), 58 under the heading.
  The reel's 25 raised out of the bottom (Scott: "bring that up past the safe zone"; LinkedIn's
  player controls covered YEARS): `big25` scale 4.4 at 620 (was 5.0 at 700), the line at 180, so
  YEARS ends ~300px above the bottom edge. Scott and I both prefer the Attraction reel.
  The Marketing Champion clip is out (Scott: "fast and doesn't add much"): Rachel's welcome holds
  32-38, straight into The Imperial | Hogarths.
  Labels held longer (Scott: "hold the AMC hit a little longer in the second scene", "any other
  labels too quick?"): the opening FOREST OF ARDEN / 25th Anniversary AMC label to beat 5.5
  (through the arrivals, ~4s), the keynote three-up 10-15 (a beat more, the tile ~2.9s), talks
  15-19, the wall from 19 (its swaps unchanged).
  "And the winner is" pops (Scott: "pop more like boom boom boom boom"): a word a beat on the
  four beats before the name (`WINNER_HITS`), 112px, each slamming in at 1.45x from its left edge
  (clear of the word before; 1.7x from the centre ran the words together) and settling with a
  small overshoot in 8 frames, the room kicking 3.5% on each hit (`kick` in Film). No flashes.
  The Imperial | Hogarths captions raised (Scott: "these need bringing up"; the player bar sat over
  them): bottom 120 (was 48), level with the labels, the shade rising with them.
  Cover (Scott: "embed the 25 thumbnail ... so it looks like that is the cover"):
  `out/amc-2026-reel-attraction-cover.mp4` = the reel with the end frame
  (`out/amc-2026-reel-attraction-thumbnail.jpg`) as its single first frame (feeds preview frame
  one; the sound delayed a frame so the sync holds) and as the MP4's attached cover picture.
  Rebuild it with ffmpeg after any re-render of the reel.
  FINAL (22 Oct, Scott: "so good ... give me the final"): `out/amc-2026-reel-attraction.mp4`, 4:5,
  1080x1350, 59.7s, -16.3 LUFS (its peaks allow no more), no black frames, the only still stretch
  the full trophy cabinet. `amc-2026-reel` (Light it Up Boy) kept in step as the alternative. Keynote tile now "Side by side / since 2001" (Scott:
  "don't repeat together"); nothing sounds on the 25 itself.
- `amc-2026-wide`: the 16:9 highlight film (Bianca, 22 Oct; her amends and Scott's notes through 24 Oct: the
  flags' swipe lands on the drum roll's crash, the handshake retimed without its frozen frames in
  `scripts/blur-slide.py`, the sponsors' wall pops in on the beat, the CB on the last crash; 65.2s, due to Bianca
  Monday morning). The room under "And the winner is" (all cuts, `ROOM_WINNER`) is the first phone's clean pan
  30.77-32.43s in real slow motion (`awards-room-winner-slow.mp4`, 0.44x): the screen shows "Donnington Group" from
  32.5s (Scott: it gave the winner away before the drop); wide and Attraction Story re-rendered 26 Oct, the 4:5
  reels not yet. FINAL, submitted (22 Oct, Scott: "perfect
  ... call it done"): `out/amc-2026-wide.mp4`, 1920x1080, 30fps, 56.3s, -17.0 LUFS, peaks -2.7 dB, the 25 half a beat after the track's last note (91.475s + half a beat, `late`; Scott: "still half a beat off"), on
  Light it Up Boy (the feedback reel's track, so the two are a set; Bianca's "And it goes like this..."
  song was never identified). `landscape()` cut, own `LANDSCAPE` scenes, count at the end (Scott and I
  both preferred it to `amc-2026-wide-open25`, the count-first variant, kept registered). Flags, the
  desk in true slow motion (cut before Georgina comes in), Liz and Georgina at the welcome stand |
  arrivals, morning Q4 (breakfast, stands, the stands busy, Fango), Phill with WELCOME / Side by side
  since 2001, the faces, talks Q4 (panel, data talk, the room still, colour energies), speakers in
  three columns (Louise, Nick Saunders, wedding report), "Here's to 25 years" | balloons, Rachel's
  welcome (her voice out: it didn't carry), "And the winner is", The Imperial, Hogarths and Donnington
  popping in a bar apart (Donnington on the close-up of the woman in black with the award), the trophy
  cabinet over it (a small gold trophy over each award, `Trophy`, wide only), the quiz winners (winners-stage.jpg is the quiz, never label it an award), Table 3
  full bleed with a Ken Burns pull-out, the gala team full bleed, the count (shots unlike any in the film,
  24 the team) to the gold 25. Splits full bleed like the 4:5. The phone uploads are variable frame rate
  with dropped frames: proxies made with minterpolate to 30fps and cut to stretches without holes;
  slowed clips use real slow-motion files, never `playbackRate` (Scott: "like a flipbook"). Render one
  at a time: two at once collide in /tmp and fail.
  Bianca's micro-amends (26 Oct, `LANDSCAPE2`/`landscapeAmends`): the Forest of Arden aerial
  (`forest-of-arden-aerial.mp4`) in place of the golf carts, shorter, its label fading with the push into the
  welcome stand; Vanity Group is La Bottega Collective (full frame, `stand-la-bottega.jpg`, Ken Burns), the
  morning Q4 with the exhibition floor (IMG_5088, `exhibitors-floor.jpg`) and Paul Robinson Wines' stand so no
  stand shows twice, Eventurous | Alkimii | fango in three columns; the three winners 2.5 beats each; Hayley's
  table (`table-7-medals.jpg`) before Table 3 and the stage; the team full bleed, pulling out from 1.4x;
  the logo wall in Bianca's order (Nick's lowercase logo, Paul Robinson Wines as text). Delivered at 1080p,
  11 Mbps two-pass, 320k audio (render `--crf=8`, then ffmpeg): Teams compresses on playback.
  Then (26 Oct, Bianca's second notes): the exhibitors one G6 wall (La Bottega, Alkimii, Double Dutch from
  IMG_5089, fango, Paul Robinson, the WedPro floor; Eventurous out), the morning a V2 (buffet | a guest walking in,
  `exhibitors-walk-in.mp4`, a crop following him), the marketing panel top left of the talks, Allen Simpson (UKH)
  in the speakers with a pull-out, FOREST OF ARDEN HOTEL & COUNTRY CLUB (`labelCaps`), "Empowering independents
  / since 2001", "With Thanks to Our Partners", the team a beat longer in a black border (`pullTo` < 1). Soft
  stills deblurred by `scripts/amc-sharpen.py` (`-sharp.jpg` copies); the crowd from Scott's uncompressed clip.
  Final sent 26 Oct (out/amc-2026-wide.mp4); Scott's Double Dutch photo with its two people never came as a file.
- `amc-feedback` (source and notes on `claude/loving-brown-0k56ps`; copied here 23 Oct with its assets
  as `src/hotel-film/amc/AmcFeedback.tsx`, registered in Root, the reply patch applied): now opens on
  David Allen at the Access Hospitality lectern (Scott's photo, `amc-feedback/david-allen.jpg`, the
  clear beats before the first card), and has a 16:9 cut, `amc-feedback-wide` (Scott: "need the
  landscape version"; the file builds both from `build(wide)`: board hung under the title and scaled to
  clear the player bar, photos full bleed, team and Table 3 framed on the people). Rachel's quote is out (James,
  Laura, Nicole) and her welcome photo opens the night behind Nicole's card (Scott, 23 Oct).
  `out/amc-feedback-wide.mp4` (37.0s) is the current cut, the one Scott wants (landscape only);
  `out/amc-feedback.mp4` (4:5) is older and not re-rendered. CBH's reply now "Thanks to
  every member, colleague, partner and sponsor who joined us. Here's to the next 25!" (Scott:
  "say colleague too", "or just thanks"); render in `out/amc-feedback.mp4` here (37.0s, -15.6
  LUFS), the change as `out/amc-feedback-reply.patch` for that branch (not pushed there).
- `cbh-key-fob` (Story; source and notes on `claude/loving-brown-0k56ps`, render and ticket copied
  to `out/` here): posted 22 Oct as an Instagram Story, link sticker "Find your next key" (Scott's
  wording; the ticket said "Find your key") under the logo.
- `cbh-written`, "Written in" (Scott, 25 Oct: a mixtape cover whose portrait is made of its lyrics, "something like
  that with the words or images making up the CB"; `stings/WrittenCB.tsx`, 9:16, silent mock-up): a page of
  the collection's stays run on like lyrics (hotel names and lines from the reels, `STAYS`), opening close on the
  first line, lit as the camera reads it, the page lying back in perspective; it draws back to the full page, the
  page lies back like the ground and the CB becomes 3D (Scott: no "rumble", "more like becomes 3D, rises smoothly,
  morphs the space around it, kinda like the magnet reel"): the page is a three.js surface (its words drawn into
  a texture laid out exactly as the opening's CSS type, so the hand-over at frames 192-206 doesn't move a word)
  and first the words morph (Scott: "need to see the words morph more before the CB appears"): ripples run in
  across the page towards the middle and its lines are drawn up and in (frames 200-290); then the C and B rise up
  through it in one smooth pull as solids traced from the logo's own SVG outlines
  (three.js extrusions, bevelled edge, walls on the outline; Scott: the height-map letters' walls smeared, "check
  the b", "hand trace if you have to"; the C stops short of the B's stem and that gap stays dark, "that should
  be dark"), risen as the page's own (its cream words on their tops, bright as the page dims, grey walls)
  and only then turning gold (Scott: "they should be the letters from the CB then turn gold then the shimmer"),
  the page round them
  lifted on a wide rise and drawn in towards them, shadow at their feet; the camera one keyframed path
  (monotone cubic, Scott: "camera needs to be smoother"), only ever drawing back, the page only lying further
  back (the depth move is the camera dropping lower), all but still once the letters start (Scott: "less camera
  movement after the reveal, focus on the CB rise"); the ripples' rings follow the CB's outline (a signed distance
  field; Scott: "less circle ripples and more CB shape ripples"); then they sink back,
  the CB fills solid gold and becomes the logo, shimmer. 17.3s. The 3D page never goes below the film's black. Render with `--gl=angle`. Renders with `--public-dir` set to a slim folder (brand SVGs and fonts only) when the
  disk is tight. First version sent; needs a track.
- `cbh-screen-time-{yorkshire,north-west-wales,east-midlands}` (`screentime/ScreenTime.tsx`, 26.5s): a
  weekend screen-time report (CBH black and gold, a generic look) whose "Most used" apps open into the
  hotels; Deep Classy House's unused opening (kick at 16.30s on the first app). Autumn/winter only, fresh
  Reel Bank footage (Rowton, Low Wood Bay, Gisborough, Rutland, Kingfisher), every shot at real speed
  (Scott: no slow motion), a different hotel each app and never twice in a row, white CB to the end (no
  gold shimmer: Bianca). Sent 29 Oct. Then: the notification's app icon is the gold CB
  (`brand/cb-watermark-gold.png`; the corner CB stays white); the black card is plain black (Scott: a gold
  glow sat "right in the middle of the black card", removed); never the Kingfisher river or roast-table
  clips again (Scott: "stop using that same kingfisher clip"; East & Midlands is "Long lunch": carving then
  the cocktail); Gisborough only on its best shots (Scott: the ivy and frosty terrace "not inspiring"):
  Yorkshire is Crisp mornings (misty sunrise, snowy garden), Holdsworth fireside, Waterton winter sunset,
  Gisborough Lie-in (bedroom). Re-sent 29 Oct. Region names are only in the hotel labels (Scott asked
  about adding the region; suggested leaving it to the post copy). Next: a December festive Screen time
  from the Christmas footage; a Christmas party edit (Phill, 29 Oct) once there is party footage.
- Tickets and post copy: no hyphens in the wording (Scott, 30 Oct: "avoid too many hyphens ... in general"):
  "screen time report", "sleeping in", "canopied bed", not "screen-time", "lie-in", "four-poster".
- Screen time Stories `cbh-screen-time-<region>-story` (30 Oct): the top three apps (Yorkshire drops the second
  Gisborough), the hook held (Scott: "too fast the UI, that's the hook": 2s on the notification, the report 2s,
  the first app at 5s on the kick), 17.5s; Yorkshire suggested for Fri 30 Oct with a "Switch off" sticker.
- `stick-flip-rowton` (`doodle/StickFlip.tsx`, `StickReel`): the stick-figure flipbook (Scott: "similar to the hand
  drawn CB", "more about the motion"), gold ink on black card (Scott's idea, so it reads premium; the pencil pad
  look is `stick-flip-mock`): office at 4:59pm under a rain cloud, five o'clock, a lightbulb, he grabs the case
  and runs to a doodled Rowton Hall, its door opens into Rowton's dusk shot; then the weekend as gags opening into
  Rowton's own clips (`hotels/rowton-hall/screen-time/`): fizz popped (welcome fizz), a dive (the pool), cake (cut
  by the fire), a leap into the four-poster (the canopied bed); "Out of office / till Monday". Funkee Monkeee
  (Mixkit 1140, 120 BPM, from 5.69s, the band on the lightbulb), every scene on a downbeat; audio lifted 2.3 dB
  on the mocks after the render (the reel needs none: -15.6 LUFS as rendered). 32.3s. Polish: each page lifts away over its top edge in its last 8 frames (`FlipOut`), landing on the downbeat, uncovering the next drawing; the shots open out of the drawings inside a gold ink ring (`InkRing`). No scribbled words on the page (Scott: "take the words out"; "Pop!",
  "Cheers!", the heart read gaggy): the timestamps and the z only. Next (Scott: "later"): the same skeleton as
  the Christmas party / work-event edit once there is footage: a corporate day (Scott: "meeting, dinner,
  celebrations, breakfast", "Fawlty Towers theme"): British farce in the drawings only (the toast flies, the
  flipchart folds, a cork just misses him), every real shot calm and polished; the tone only, nothing of the
  show itself (no characters, title card or lines); an end line like "Leave the planning / to us".
  Draft `stick-flip-xmas` (30 Oct, Scott: "it's going to be at Hogarths Stone Manor"): the doodled house is
  Hogarths' Christmas entrance (canopy, bow, five lit trees, garland pillars, sliding glass doors) opening into
  `festive/graded/hogarths-entrance.jpg` (KIDDERMINSTER / Hogarths Stone Manor: confirm the photo is Stone
  Manor); gags still on stand-in footage (Fairlawns crackers, the Hogarths chef, Ramside tree, treehouse bath)
  until Hogarths' own; needs a festive funk track (Scott: "a Christmas funky edit, similar vibe").
  Now all Stone Manor (Scott's CBH site photos and its own festive reels, cut on the beat into
  `hotels/hogarths-stone-manor/festive/`): the doodle a timbered manor with tall chimneys and oak doors
  (from its spring clip); arrival, drinks tray, turkey, toast, bed, bath; 34.3s. The party is Fri 20 Nov
  (Scott), so the timestamps run Fri 20 Nov 4:59pm to Sat 21 Nov 10am. Rowton's goes out Fri 11 Dec.
- `november-best-loved` (+ `-silent`, `-carousel`): the CBH newsletter's six (Hatherley Manor, Ramside
  Hall, Frensham Pond, Forest of Arden, Donnington, Rowton Hall), light so it scrolls (Scott: "light on
  the funk and music"), one calm shot a hotel, six beats each, on a low indie track, 24s (after the polish: no flags, the bath held); carousel 4:5 with the from prices
  and the email's small print; ticket `out/november-best-loved-ticket.txt`.
- `cbh-flipbook-winter` (`flipbook/HardbackFlip.tsx`, 27.9s, Happy Feels from 40.79s, its unused
  middle): a black cloth hardback with the gold CB opens, the camera pushes into the right page, each page
  turns to the next hotel full-bleed (Gisborough sunrise and snowy garden, Low Wood Bay sunset, Rutland
  bath, Rowton dusk, Waterton still; no Kingfisher), pulls back, "Which page / would you stay in?", white CB.
  Sent; Scott: "needs work and a polish, it messes up in the beginning and could be much more". Known
  faults: the cover vanishes mid-turn (around 1.8-2.0s), the book jumps sideways as the camera moves, the
  inside cover pops from black to cream (~3s), and each "turn" is a flat 2D squash (scaleX of cos), not a
  page: it needs a real curl (curved page, its back, the shadow on the page below) and more of the book
  seen. Charcoal background with a lighter middle (may read like the glow Scott disliked).
- `cbh-postit-weekend` (`postit/PostItList.tsx`, 21.0s, -15.8 LUFS, sent 29 Oct; Bring Back the Swing from 40.87s, unused): a
  sticky note over the blurred shot; a line drawing draws itself, the word writes in, a gold tick, the note
  peels and the shot clears: Snow day (Gisborough snowy garden), Lake views, Bath time, Evening stroll;
  "Which would you / tick off first?". Render with `--concurrency=1` (Chrome crashed at 2-4).
- `haycock-manor-depth` / `-story`: Haycock Manor (Wansford), a depth reel from the hotel's photos (RippleFilm,
  `src/hotels/haycock-manor-depth.ts`): cocktail pour (label), blue lounge, tea in oak boxes, birdcage restaurant,
  Prevost plate, gold bath, beamed bedroom; "Cocktail first, / or the gold bath?"; Late Night Big Band Swing
  (nickpanek, Pixabay 236168), 28.1s. Warping polished (Scott, 31 Oct): softened depth blocks bent the walls, so the
  pour and the tea stand are tight traced rigid layers (`make-depth.py` `tight()`, the carafe mouth's whole rim inside:
  "check the glass rim") standing on continuous table ramps, `--fill-full --hole 12` (a wide hole showed as smudged
  boxes), and the rooms move on smooth ramps only (`depth/*-ramp.png`). Recut to the band (Scott: "cuts more on the
  music or it just looks like a slideshow"): punch ins on the same photo (pour, tea's top box, gold basin) on its accents,
  three unhurried shots through the quiet passage, the three horn stabs after the stop as three plates (marble plates
  and fish and chips added, flat overhead moves), 12 shots. Story (the reel's beats 17-34, 16.2s,
  `cut-story.json`) for Wed 4 Nov, ticket `out/haycock-manor-depth-story-ticket.txt`. CBH lists it as Peterborough (Wansford).
  `haycock-manor-meetings`: the 16:9 meetings and events cut (Scott: "landscape version for meetings and events", "same
  music same style", "not just meetings, after the meetings a drink, convenience, class", "get food in there too"): the
  same beats, led by Scott's meeting room photos (`meeting-*.jpg`, smooth room depth from `make-depth.py` `room()`,
  moves in `clips-wide/`, `cut-meetings.json` with `"size": "1920x1080"`, new in cut-picture.py): Fitzwilliam (label
  PETERBOROUGH), then (Scott: "make it dynamic, beat cut or match cut ... a counter") a cut on every beat through the
  rooms with each table in the same place (`m-*.mp4`), MEETING SPACES counting 1 to 7 (RippleSpec `counter`) landing on
  the U-shape suite; lines "Just off the / A1 and A47" (blue lounge), "Two AA Rosette / restaurants" (Prevost 3, the
  Haycock Kitchen 2), "After the meeting, / a drink"; tea, the plates, the pour, the bedroom;
  "Where's your / next away day?". RippleSpec `wide` (label, lines, end card and CB placed for 1920 x 1080). The page's
  "up to 350 delegates" is left off (its table tops out at 40 theatre style). 28.1s, -15.6 LUFS. Scott's later
  bedroom and bathroom photos (`bedroom-attic`, `bedroom-garden-patio`, `suite-attic`, `bathroom-silver-bath`,
  `bedroom-tan-sofa`) are 1024px: soft above a small crop.
  Fitzwilliam only once (Scott: "you show this room twice"): stone, oval, small boardroom (1-3), the suite 4-7.
  Reel and Story parallax raised (Scott: "try to improve the parallax, it is for socials"; a landscape guest cut was
  tried and dropped: "nah just keep it"): every shot glides sideways (glide 120-150 px, parallax 60-70 on the room
  ramps, 50 on the two rigid layers with `--hole 18`: at 70 the tea's wall streaked and the coaster's edge smeared).
  `haycock-manor-collage`: The Mount's tile wall for Haycock (Scott: "another tiles dancing style reel ... to that new
  jazz track"), `src/hotels/haycock-manor-collage.ts`. Then (Scott: "a better part of the song and do better beat
  match"): an edit of the track's two hardest-hitting phrases (56.30-67.47s and 78.63s to its end, the quiet phrase
  between cut on the phrase boundary: `music/nickpanek-big-band-collage-edit.mp3`, from the +1.7 dB limited copy),
  every move on a hit, the cocktail filling the frame on the band's biggest hit, black on its final hit; 25.4s,
  -15.6 LUFS. Finished at crf 20 (the disk was nearly full). Then (Scott: "too many stops not enough action"):
  something moves on nearly every beat (a ring move: every tile steps one cell round at once; shoves; six scene
  changes on hits), no stillness over a beat and a half; layouts generated by a script, written out as data.
  The reel's birdcage shot flickered (Scott: "flickering odd the birdcages": the thin wires twinkled under the bigger
  glide): rendered at 2160x3840 and scaled down, glide 100, parallax 45. Disk: ten old renders in `out/` (depth demo
  and breakdowns, mosaic variants, amc-2026-wide-open25) are skip-worktree and deleted locally to free space; they are
  unchanged on the branch (`git update-index --no-skip-worktree` and `git checkout` restore them).
- `cbh-screens` / `-story` end line now "Flying visit, / or stay a while?" (Scott, 31 Oct: better than "Which one
  caught your eye?", "like just flying through or something to do with hotels").
- This week (w/c 2 Nov, Scott): Mon the map reveal post and Story (cbh-journey), Tue the leaves reveal Story
  (autumn-leaves-cb), Wed Haycock Story if still on, Thu Bonfire Night post and Story with the firework CB:
  `out/stories-week-2-nov.txt`.
- `magnet-cb` (source brought here from `claude/hook-browser-path`, `src/hotel-film/magnet/`): the magnet brand moment
  now relates to the hotels (Scott, 31 Oct: "got to make it relate to CB somehow, or hotels"; no map, he ruled that out
  first time): it opens on four hotels, one every two beats on a hard cut (Low Wood Bay's candles, Hogarths' fireside
  whisky, the Kingfisher's lanterns, Haycock's gold basin), the gold in each lifting out as filings (their places are
  each photo's brightest warm points, `scripts/magnet-hotel-glints.py` -> `hotel-glints.json` and the 9:16 crops in
  `public/campaigns/magnet/hotels/`) as the picture dims; then the pull, strike, lock and logo as before. Music lifted
  to -15.6 LUFS. 16.9s. Sent. The filings are now thin
  tapered needles that lie still as they lift and snap into line (Scott: the short round pieces "could be mistaken for bugs or
  maggots").
- `cbh-baubles-cb` (`stings/BaublesCB.tsx`, work in progress, not rendered): baubles and multicoloured lights in
  depth, the gold CB hanging in the middle, the camera drifting to it, the lights brightening as Christmas Jazz's band
  comes back (from 33.3s; stop 43.2s, back 44.25s); every bauble reflects a hotel at Christmas (the festive graded
  photos). Scott's ask, separate from the other session's fairy-light `cbh-christmas-cb`.
- `autumn-leaves-story` ("Autumn suits us", `leaves/AutumnLeavesReel.tsx`, registered here 1 Nov, its shots restored
  from 1b101756): the Story for Sun 1 Nov, re-rendered with the leaves' glow fix, the four stills now depth moves
  (Scott: "are there depth moves on the leaves story": they were flat Ken Burns; `campaigns/autumn-leaves-reel/
  make-depth.py`, warp-free: Gisborough's house a plane with the lawn coming forward, Hintlesham's bottle and glass a
  rigid layer over the table, Wild Boar's plate a rigid layer over the soft room, Langshott's stand and fire a plane with
  the tablecloth coming forward; `Shot.depth`, Story only, the reel keeps its Ken Burns). The render's music came out
  ~5 dB quiet, so the 29 Oct render's soundtrack (same timing) is muxed back on: 25.9s, -16.0 LUFS. Sticker "Find your
  autumn stay" to the hotels page (no autumn breaks page) or a Walk / Fireside poll.
  Gisborough's move redone (Scott: "a weird angle and warped": the sideways glide over the lawn ramp leaned the house's
  verticals): a straight push with a slight tilt up, parallax 22, no glide. Scott asked whether the week had too many
  brand moments and for "one without the logo, just the white CB", then "the leaves reveal is the best part", "the
  white mark is just the watermark", "that's the signature": the Story keeps its gold CB ending. Registered but not
  rendered: `autumn-leaves-story-line` (Scott: "without the gold logo ... a one liner, land hard": the gust uncovers a
  cream Cormorant one-liner lying on the ground, which stays as the end card, white CB on; `line` prop, now "Autumn suits us" moved from the
  opening to the end (Scott: "It suits you too" too on the nose); tried "Walk first, / or fireside?" (no), offered Autumn, done properly / Leave it to us / Autumn, as it
  should be; its render's music comes out ~5 dB quiet, so +4.8 dB through a limiter after the render); the line uncovers
  behind the gust only, no opening flurry, 12 leaves a cut (was 24), Ruthin (now its breakfast table by the window, Scott's photo, a depth glide: the table front a ramp, the rest one plane) and Hintlesham four beats each (Story 27.5s, -16.1 LUFS; this retimes
  every Story cut, so `out/autumn-leaves-story.mp4`, the gold one, is from before it), `autumn-leaves-story-plain` (the five hotels only, 14.0s) and `autumn-leaves-story-bare` (the reveal, the
  gold CB with no wordmark or shimmer; LeafPile `bare`). Advice given: too many logo endings this week (leaves Sun, map
  reveal Mon, firework Thu): move the map reveal later in November, a hotel post Monday.
- `the-kingfisher`, `whittlebury-park-stay-dine` (+ `-story` cuts): done.
