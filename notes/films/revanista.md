# Revanista carousels

**Status:** Final; emailed, scheduled Tue 20 Oct.  
**Compositions:** `revanista-gn`, `revanista-cb`  
**Client:** Revanista (LinkedIn carousels for GN and CB)

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

Revanista 2.0.11 LinkedIn carousels (`revanista-gn` / `revanista-cb`, on `claude/loving-brown-0k56ps`): GN fine (Scott). The CB one was "garbage" (the GN layout on black), and a cream redo of the GN layout was still GN ("gn is gn"), so (19 Oct) CB has its own design, `src/linkedin/RevanistaCB.tsx`, same words. A menu-card take was "too old school", so it is modern, after Lee's Deliciously Autumn 4:5 and the reels; then Revanista's own devices (Scott): the cover is their mock-up on its studio grey, red decoration painted out (`make-devices-clean.py`, in the patch; `devices-clean.png` copied to `out/revanista-cb/`), black Cormorant over it. Scott liked the cover, so all three slides are on its studio grey (one busy slide over the blurred rate sheet wasn't "premium"; four slides were one too many: "should be 3 pages"): the six as soft white tiles, two by three (gold numeral, black Cormorant name, balanced sans line), and the close, black so it lands like GN's navy (cream Cormorant, the URL on a cream pill, Revanista's white logo). The CB is gold (Scott: not black; white doesn't read on the grey). No gold underlines or rules (Scott: "too many underlines in gold"): gold is only the small caps, the tile numbers and the CB. Polish and spacing passes done (the same label-to-headline gap on every slide); final. Emailed to Chris and Bianca, scheduled Tue 20 Oct 9am ("in case you want to run it at some point"). Patch `out/revanista-cb-fresh.patch`, slides and PDF in `out/`.
