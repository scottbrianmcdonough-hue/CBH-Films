# cbh-films

Remotion project for Classic British Hotels (CBH) promo films. Moved here 1 Nov 2026 from
`scottbrianmcdonough-hue/my-video` (branch `claude/ecstatic-sagan-d8zvpg`), whose history had grown to 26 GB
of committed renders and kept filling the session disk. This repo has the code, scripts, assets and notes
with no history and no renders:

- Never commit renders (`out/*.mp4` etc. are ignored). Render into `/dev/shm` (tmpfs, ~16 GB) with
  `TMPDIR=/dev/shm/...`, check the file, then send it to Scott with SendUserFile. Only the text tickets in
  `out/` are kept in git.
- Every render named in the notes as `out/<id>.mp4` lives in the old repo (`my-video`, branch
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


- Tickets and post copy: no hyphens in the wording (Scott, 30 Oct: "avoid too many hyphens ... in general"):
  "screen time report", "sleeping in", "canopied bed", not "screen-time", "lie-in", "four-poster".
- Emoji in post copy (Scott, 3 Nov, Black Friday static post): few, and each one earning its place: an emoji that
  stands in for a word ("phone on 🔕"), carries the idea (🔓 for "the wait is over", 🗝️ beside "Book now", 🖤 for Black
  Friday), never decoration at the end of every line or a row of them; about three or four a post. Vary them from
  post to post (Scott, 10 Nov: "gotta start doing more varied emojis"; the Black Friday set had leaned on 🖤 🗝️ 🛎️). No lists of three
  (Scott: "avoid triad"), and don't ask for comments where people won't answer (a sale post closes on booking).
- Consistency (Scott, 5 Nov): keep films and posts looking consistent with each other; a campaign's pieces shouldn't
  look too different from the house style. When matching a supplied artwork (Black Friday: Lee's tight mauve caps),
  change as little as needed and keep the rest of the house look, then go back to the house style after the campaign
  (gold caps place, spaced, underlined; cream Cormorant name).
- No hashtags in post copy for now (Scott, 6 Nov: "if they don't add, they just clutter, going to try cleaner posts for a while without hashtags"): tickets leave out the Hashtags section; tag the hotels instead.
- End lines: an "X first, or Y?" question is good but not every time (Scott, 3 Nov: "getting to be a pattern");
  mix in a statement ("Tee off, / then turn in").

- Rules Scott and Bianca gave on single films that hold for every film (the film notes have the context):
  - Never name a dish the photo may not show (The Mount: the "fondant").
  - No "not X, just Y" lines ("an AI tell"); no "link in bio"; no "worth ..." end lines; nothing corny
    ("festive magic").
  - Slowed clips use real slow motion files (minterpolate), never `playbackRate`; footage at real speed
    unless a shot needs slowing (Screen time: no slow motion).
  - Depth moves on hand drawn depth maps, checked for warping ("always do by hand, more precise").
  - Never use Lounge Soul (Bianca) or Fashion Deep House (AudioJungle watermark): see `notes/music.md`.
  - Render one at a time: two renders at once collide in /tmp and fail.

## Notes: one file per film

Everything about each film (status, hotels, music, Scott's and Bianca's notes, file paths, timings) lives in
`notes/films/<film>.md`, with the index below and in `notes/README.md`. `notes/hotels.md` lists which films use
which hotel and `notes/music.md` which tracks are used (and banned); `notes/ideas.md` holds ideas not built.

- Before working on a film, read its note. Read `notes/hotels.md` and `notes/music.md` before picking shots or a
  track for a new one.
- After every change or new note from Scott, update the film's note (append to Notes, in the same plain style)
  and its status line in `notes/README.md`; add rows to the hotels and music pages when a film uses them. A new
  film gets a new note. Keep the notes as ordinary Markdown links (they are read on GitHub and may go into
  Obsidian later).

## Open work

- Branches: `main` has everything up to the Black Friday reel (PR #6, merged).
  `claude/sleepy-meitner-h0zycw` carries the newer work (showcase, journey, sketch,
  craft, rolodex), with no PR open yet; it is merged into `ccr-df0b465b-qqzrio` (search
  reels, sketch-to-life renderer), so that branch has everything. `claude/busy-wozniak-q1gnsk` (PR #4) is a separate
  session's style tests (three.js depth, window pane, split-screen Story, oak leaf), not
  merged into either.
- This week (w/c 2 Nov, Scott): Mon the map reveal post and Story (cbh-journey), Tue the leaves reveal Story
  (autumn-leaves-cb), Wed Haycock Story if still on, Thu Bonfire Night post and Story with the firework CB:
  `out/stories-week-2-nov.txt`.
  Bianca (2 Nov): nothing else scheduled; our Revanista post (`revanista-cb`) out Wed 4 Nov, the Nailcote M&E
  reel out Fri 6 Nov.

The film index (statuses), loaded with this file:

@notes/README.md
