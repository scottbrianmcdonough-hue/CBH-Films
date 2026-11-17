# Low Wood Bay: Weekend loaded

**Status:** End card redone; confirm the booking URL slug.  
**Compositions:** `low-wood-bay`, `low-wood-bay-story`, `low-wood-bay-silent`  
**Hotels:** Low Wood Bay Resort & Spa

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

`low-wood-bay` (+ `-story`, `-silent`): "Weekend loaded", built on `claude/relaxed-newton-8vytys` (its source, notes and the full ticket live there); renders and tickets copied to `out/` here, with `out/low-wood-bay-ticket-short.txt` in Scott's short layout (16 Oct). Booking URL slug is a guess: confirm. End card redone to the house label order (20 Oct, Scott: "the house rule place in gold caps underline then the cream cormorant hotel name"): WINDERMERE, LAKE DISTRICT in gold caps with its underline on top, Low Wood Bay / Resort & Spa in cream Cormorant beneath (it had the name over a gold place line); `EndCard`'s new `placeFirst` in FootageFilm, used by the loading engine. Patch `out/low-wood-bay-end-card.patch` (for that branch), the four renders re-copied to `out/`.
- 17 Nov (Scott: the Story is going out midweek, so not "Weekend loaded"; "Relaxation loading" was too cliche): now
  "Lake mode / loading", then "Lake mode / on" at 100%. The source is now in this repo: `src/hotel-film/loading/`,
  `src/hotels/low-wood-bay.ts` (from `claude/relaxed-newton-8vytys`, with the place first end card from
  `out/low-wood-bay-end-card.patch`), the clips, track and sounds in `public/hotels/low-wood-bay/`; all four
  compositions registered. Story and silent Story re-rendered.
