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
