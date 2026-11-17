# Coombe Abbey Hotel: new member pack

New member (16 Nov 2026), Brinklow Road, Binley, Warwickshire CV3 2AB (coombeabbey.com). Back to [all films](../README.md).

## Status

Bianca's checklist items 13 to 20 (travel guide, news page, socials intro, LinkedIn intro with GDS codes, LinkedIn
article, LinkedIn M&E reel, Ubersuggest and the performance spreadsheet, Pinterest). Started 16 Nov with the socials
intro (`out/coombe-abbey/15-socials-intro.txt`) and the travel guide (`out/coombe-abbey/13-travel-guide.txt`).

## Notes

- Facts from the hotel's own site only (Scott's source pack, 18 pages, 16 Nov); no CBH hotel page yet (it 404s).
- Waiting on: the sales profile PDF (GDS codes, meeting room capacities), 25 photos from the CBH media library, the
  press release (after hotel sign off), the CBH page URL, the hotel's social handles.
- Flags: the awards page lists a West Midlands Tourism Award dated 2027 (left out); Queen Elizabeth I on the overview
  vs Princess Elizabeth on the history page (only Princess Elizabeth used); ECOsmart Bronze vs Silver 2025 (Silver used).
- Photos (16 Nov): Scott's 25 from the CBH media library came inline only, not as files (the Metropole problem
  again), so none are in `public/hotels/coombe-abbey/` yet. Seen: aerial (moat, bridge, courtyard, autumn), the
  front over the parterre, the garden walk to the lake, two cloister hallways, Garden Room (two), steak being
  served, afternoon tea, the bar, Café in the Park, Lady Craven sitting room, Capability Brown room (canopied bed,
  spiral stair), a Crown double, Lake View bathroom (roll top bath), Dove Cottage bedroom; meeting rooms Cloisters
  (two, theatre lighting), Harrington, Walnut, De Camille, Stuart, Kellway, Griffin, and the Marquee set for dinner.
- M&E reel plan (16:9, the Nailcote / Haycock wide template): open on the aerial (label BINLEY, WARWICKSHIRE /
  Coombe Abbey Hotel), match cut on the screen down the boardrooms (Harrington, Walnut, Kellway, Stuart, De Camille,
  Griffin all have the table and the screen centred), the Cloisters for the big room, the hallway break, then the
  Garden Room, the bar and a room; "up to 500" only over the Marquee, the room it describes. Capacities for the
  others wait for the sales profile.
- Needs a photo of The Princess Elizabeth (the turret staircase is the TikTok hook) from the media library.
- 16 Nov, round two: Scott's steer, the LinkedIn article is M&E and B2B (agents, PAs, bookers) after The Mount (July
  2026), the travel guide B2C (its M&E section taken out). Room capacities from each room page (they win over the 2022
  brochure, since refurbished). Drafted `16-linkedin-intro.txt` (GDS codes as gaps) and `17-linkedin-article.txt`.
  Flags in the article: the Abbeygate page is headed Marquee and says 500; the Marquee page says 450 theatre and 350
  rounds (so the reel lands 350 on the Marquee dinner photo, or 450 if a theatre shot comes); De Camville has no room
  page; the Courthouse date (1817 vs 18th century) left out; ECOsmart Bronze vs Silver left out.
- 16 Nov: editorial pass on all four drafts (house rules, triads, facts rechecked against the site; the Walnut's 30 was theatre, not cabaret; ECOsmart out of the guide; the IG bio nod out).
- 16 Nov, proofs: the 30 photos came as a zip (now in `public/hotels/coombe-abbey/`, short names; the De Camille file
  renamed De Camville, the brochure's spelling). Travel guide and LinkedIn article rebuilt as HTML proofs with the photos
  embedded: copy in `scripts/coombe/coombe_copy.py`, `python3 scripts/coombe/build.py out/coombe-abbey` builds
  `out/coombe-abbey/*-proof.html` and prints the audit (dashes, banned words, triads, from X to Y, paragraph lengths,
  "The" openers, numerals, command voice, links, six word runs shared with the hotel's site and the benchmark). Open
  questions sit in each proof's notes box, not the copy. Contact kept as events@ (the series' address).
- 16 Nov, Scott: no Gunpowder Plot or kidnap anywhere (the guide, the article, the socials, the TikTok, the LinkedIn
  intro, the reel); history kept light (the abbey, the 500 acres, the Cravens, Capability Brown). The Princess Elizabeth
  stays as the TikTok hook, as a room quirk only.
- Article matched to The Mount's format (Scott's checklist): "Coombe Abbey Hotel: Where Business Meets 500 Acres", a
  one line subhead, two opening paragraphs, location, "121 Bedrooms ...", "Meeting and Function Spaces" (one line on
  what every room has, a bullet per room, then the packages), dining, team building (with the stay on for the weekend
  line), "Enquiries" with the series' contact line as a mailto. 708 words (The Mount 632). Proofs now minimal: no
  label above the title, no rules or boxes, only the notes box.
- M&E reel `coombe-abbey-meetings` (`src/hotels/coombe-abbey-me.ts`, MEReel, 16:9, ~33s): aerial; Harrington, Kellway
  and Walnut ("11 rooms to meet in"); Stuart, Griffin and De Camville ("From £45 per person"); the Cloisters ("Cabaret
  for 64", the band back in); Garden Room into the steak; the Marquee ("Dinner for 350", on the dinner shot); gardens
  ("500 acres of parkland"); The Lady Craven ("121 bedrooms", 24 hour packages); end card COVENTRY, WARWICKSHIRE /
  Coombe Abbey Hotel. Event Music by prettyjohn1 (Pixabay 595091) from 31.03s.
- 16 Nov: the guide's second line now "Coombe Abbey is the newest member of Classic British Hotels: nine centuries of history, with room service through the night." (Scott: "wears its nine centuries lightly" needed more impact).
- 16 Nov: precision trim on the article (Scott), 708 to about 665 words; same structure and facts.
- 16 Nov, Scott on the article: "why would anyone choose this one over others in the collection, needs a USP", "too many
  junction and capacities". USP now the second paragraph (the whole programme on one estate: the day in the Marquee,
  the evening at a mediaeval banquet, parkland between and 121 bedrooms); subhead "A Moated 12th Century Abbey Inside a
  Country Park, Ten Minutes from Coventry"; location heading "Easy to Reach, Easy to Switch Off"; the junction once;
  one capacity per room, the five boardrooms in one bullet ("up to 24"); Enquiries line on the one estate. Then "no
  prices": package prices out of the article and the reel (captions now "Lunch included" and "24 hour packages add
  dinner and a room"). 629 words. Reel re-rendered, -15.3 LUFS, 33.3s.
- 16 Nov, source and numbers check (Scott; notes box taken off the proofs, `render(..., None)`): every figure traced to
  the source pack, the room pages or the brochure. Corrected: Capability Brown laid out the gardens and the lake (not the
  500 acres); "nine centuries" is almost nine (1150); not every guest sleeps inside the moat (Park Priory); afternoon tea
  is served in "selected dining rooms" looking over the parkland (the Garden Room was only from a photo); "Crown
  Bedchambers make up the core" and "Overlooking the grounds" had no source; No Ordinary Hospitality Management is
  "rooted in Coventry", not "Coventry's". Fixed in the proofs and the socials, LinkedIn intro and travel guide tickets.
  The Abbeygate's 140 theatre style is confirmed by the brochure's capacity table (open question closed).
- 16 Nov, new music (Scott: "definitely needs new music", "more housey jazzy"; an indie rock edit was dropped before render): Jazz Cocktail Lounge Music (alex-morgan), edited by `scripts/coombe-me-music.py`; the band stops under the second set of rooms and returns on the Cloisters, a bar jump to the track's ending at the bedroom, the end card on its final hits and last chord. 37.0s, -15.1 LUFS. Mixkit is blocked here, so new tracks have to come from Scott.
- 16 Nov, wittier copy (Scott: "copy needs to be more witty"; the Marquee's numbers alone were "a waste of good copy"): captions "11 rooms, none of them beige", "The coffee doesn't run out" (lunch included on day packages), Cloisters "Cabaret for 64 / And the bar is next door", "Dinner under glass", Marquee "Bring the whole company / Up to 350 for dinner", "500 acres of breakout space / Go Ape is in the woods", "121 bedrooms / So nobody's late for the 9am"; post: "The monks didn't have WiFi. Your delegates will." Re-rendered, -15.1 LUFS.
- 16 Nov: the opening's eyebrow is the place, COVENTRY, WARWICKSHIRE (was MEETINGS & EVENTS; Scott), the line under the name "Ten minutes from the city centre".
- 17 Nov, polish (Scott: "some start after the transitions, it should be smooth all around", "some scenes are too
  fast to read", "little cool transitions ... beat matched", then "too many, keep it simple and slick, nice and
  clean"): MEReel `even` (opt in, so Haycock and Nailcote are untouched): every still drifts at one pace from its first
  frame (the Marquee's push linear, no ease in), panels land with the cut in a quick cascade (5 frames apart, 10 frame
  slides); MEScene `whip`, used twice only, landing on the beat: into the Cloisters as the band comes back, and into
  the bedroom on the jump to the track's ending; the other cuts are hard cuts on the downbeats. Two bars a scene from
  the Cloisters on (the music edit now runs to beat 129), ~41s. Copy trimmed: "Just off the M6", "Lunch included".
- 17 Nov, copy (Scott: "stronger copy than just cabaret for 64 ... maybe max capacity but not every room"): the Cloisters "Keynote under a chandelier / With its own bar next door"; one capacity in the film, the Marquee's maximum: "Bring the whole company / Up to 450 delegates".
- 17 Nov: panels in `even` mode are all there on the cut (a staggered panel showed black for a third of a second). Final polish render: 41.3s, -15.0 LUFS.
- 17 Nov (Scott: "at 22 there's like a sharp cut"): the picture, not the music (the one music join is at 30s); the hard cut from the dark steak to the white Marquee at 21.5s is now a quick crossfade on the same beat.
- 17 Nov: GDS codes in (CB mapping, live 17 Nov): Amadeus CVT889, Galileo 65059, Sabre 19277, Worldspan 09270, Dhisco 102239; the LinkedIn intro is complete.
- 17 Nov: the travel guide as a live Claude Doc for Scott's edits and comments: https://claude.ai/artifact/Cb9ZFXv5Nb9hid939DJcF2 (carry his changes back into `scripts/coombe/coombe_copy.py`).
- 17 Nov, travel guide lifted to Bianca's notes (location after the name, what's special, the offering before the history): "Coombe Abbey Hotel, Coventry" headline, a Why Coombe Abbey section, The Juliet's turret bathroom, tribute nights, Go Ape higher; Since 1150 moved after the park. Live doc, proofs and Word doc all match.

17 Nov: travel guide comments from Scott worked into the live doc and the Word file. Room service is out ("standard at hotels"), and Capability Brown is cut from the gardens line (he was mentioned three times). Go Ape is now a hook: it's on the estate, guests can go up in the trees in the morning and be back for afternoon tea, and Kids Stay Free includes a 10% Go Ape code. Parking now reads "charges apply". New facts from the hotel pages Scott pasted: Feature Doubles, the freshly cooked breakfast, Elvis and Bruno Mars tribute nights (with B&B), the We Cook, You Carve private roast for up to 40, The Avenue at Coombe, and the Coventry Tapestry and Tales of Tea at the Guildhall. The Price Promise and the Gunpowder Plot are left out. The Word doc is polished for submission: 11 photos, height capped, captions centred, 8 pages. Email to Bianca in `out/coombe-abbey/19-travel-guide-email.txt`.

17 Nov: Scott's edit of the Word guide synced back into the live doc and the copy script. The Muddy Stilettos award and the destination guide entries are out, and the Tripadvisor 2026 award stays. His file is saved as `out/coombe-abbey/Coombe Abbey travel guide (Scott's edit).docx`.

17 Nov, Bianca's feedback on the guide:
- "Newest member" is out, so the blog won't need amending later. The intro now reads "is part of the Classic British Hotels collection, set in Coombe Abbey Park near Coventry in Warwickshire".
- The first two paragraphs repeated each other, so the opening section now starts "Monks founded Coombe in 1150".
- The award winning afternoon tea moved into the dining section.
- Capability Brown moved into the grounds section ("500 acres of fresh air"), and the opener no longer mentions either.
