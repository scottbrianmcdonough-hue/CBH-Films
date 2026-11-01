# Teenage Psycho (Lily Thomson): book cover

Not a CBH job: Bianca's daughter Lily's book, self-published on Lulu. 5 x 8 in trim, 0.125 in bleed, 300 dpi.

- Chosen: `out/Teenage-Psycho-front-cover-5x8-red.png` (red, no notebook lines; Bianca, 30 Oct: "looks great").
  Her blood is darkened on red and the lens made solid (`src/art-red.png`).
- Everything on the cover is Lily's own drawing and handwriting, lifted from her photos (`src/sketch.png`,
  `src/sketch2.png`) by `src/trace.py` (front art), `src/small_title.py`, `src/blurb.py` + `src/flow.py`
  (the handwritten blurb, re-flowed onto lines) and the panda stamp (`src/stamp.png`).
- Layouts: `layout.py` (pink), `paper-layout.py` (notebook), `red-layout.py` (red), `layout-sketch.py`
  (title top, name bottom, as her little box sketch); render with the `render*.js` files (playwright).
- Next: the back cover in red once Lily has rewritten her blurb (lift it from a new photo with blurb.py),
  then the spine and full wrap once the page count and paper type are known.
