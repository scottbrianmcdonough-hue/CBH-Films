# Black Friday: the queue

**Status:** Full bleed ending in the artwork's layout, The Mount in for Low Wood Bay (3 Nov); confirm the sale dates and booking link.  
**Compositions:** `black-friday-queue`, `black-friday-queue-story`  
**Hotels:** Rowton Hall, The Mount, Gisborough, Haycock Manor, Waterton Park, Rutland Hall  
**Music:** Party Dance by prettyjohn1 (Pixabay 526227)

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

The Black Friday 2026 campaign (Scott, 2 Nov: "these are the black friday assets we need some reels around that"): THE WAIT IS OVER / Black Friday Sale / SAVE UP TO 30%, in the campaign's own mauve (`#A15272`, sampled from the pill) over two photos, a woman stretching in bed in a white robe and a woman in a robe opening the curtains. The five assets are in `public/campaigns/black-friday-2026/campaign/`; `bed-clean.jpg` is the clean right side of the landscape one (the text sits on the left), 675 x 1200, so 1.6x on a 9:16 frame. No clean curtains photo yet (its text sits over the window): ask for the originals, and which hotel the curtains room is.

Ideas offered first as mock-up strips (a 30% counter, lights on, a depth Story); Scott: "needs to be fresh ideas", so the counter (the AMC 25 again) and the depth Story were dropped.

The idea (`src/hotel-film/blackfriday/QueueReel.tsx`): the online sale's waiting room in CBH black. BLACK FRIDAY SALE in mauve caps, "You're in the queue", a "While you wait" window cycling through the hotels two beats each, "Your place in line" counting down from 2,481, a mauve progress bar, "Estimated wait: about a year / a few months / a couple of weeks / a few days / any minute now". The track plays muffled like hold music through its build (`queue-music.mp3`: 7.129-18.045s of the original band-limited 350-2600 Hz, then the full band). In the track's one-beat stop (16.97-18.04s) "It's your turn" and a mauve Enter button, a tap, and on the drop the window bursts to full frame (Haycock's smoked cocktail) as the band comes in, "The wait / is over" rising. Then Gisborough's misty sunrise, Rutland's lake sunset, Rowton's canopied bed and Rowton's robe, two beats each, the robe a match cut into the campaign's robe photo: "Black Friday / Sale" and the SAVE UP TO 30% pill in mauve, white CB. 110 BPM, beats at 16.37 frames, the drop beat 20, the end card beat 32 (Story 24), 40 beats (Story 32). 21.8s, -15.0 LUFS; Story (no shots after the drop) 17.5s, -15.4 LUFS. The window shows the middle of each portrait clip (Rutland's candlelit bath read as a tap and leaves there: swapped for Rowton's welcome fizz).

Next offered: "Shutters up" (a black roller shutter rising on each hotel like a shop on sale morning, the last on the campaign photo).

The ending is now the official artwork (Scott, 2 Nov: "use the official assets"): the 4:5 bed asset as supplied (its type, pill and gold logo), set at top 170 so the pill and logo clear the bottom 460px, over a blurred, darkened copy of the clean photo, a 1.00 to 1.02 push, no grain, vignette or white CB over it (`OFFICIAL_END`; the rebuilt Cormorant card is kept behind it). Two posts (Scott): this reel (`out/black-friday-queue-ticket.txt`) and a static post with the official file as the creative, text only (`out/black-friday-sale-static-ticket.txt`; suggested the curtains artwork, as the reel ends on the bed). Both link to https://classicbritishhotels.com/ until the sale page is known.

Launch Mon 9 Nov (Scott, 3 Nov): the static post with the official file goes out that day; ticket dated.

Landing page (Scott, 3 Nov): https://classicbritishhotels.com/black-friday-countdown/ (both tickets).

Low Wood Bay out (Scott, 3 Nov: it "doesn't need our marketing"): The Mount in its two window slots (beats 2 and 14), the four poster and the conservatory restaurant, slow pushes made from the stills (`public/hotels/the-mount/screen-time/`; The Mount has no footage). The reel is not regional, so the swap needn't be from the same area (Low Wood Bay is the Lakes, The Mount Wolverhampton).

Full bleed ending (Scott, 3 Nov, on the boxed official artwork: "don't like that, it's not full bleed and just a box under"; "get rid of the watermark CB"): the rebuilt card in the artwork's layout over the clean photo full frame: THE WAIT IS OVER in mauve caps, Black Friday / Sale in cream Cormorant, the mauve SAVE UP TO 30% pill, the CBH lockup (`brand/cbh-logo-on-light.svg`) bottom right as on the artwork; no white CB anywhere in the reel. 21.8s; Story 17.5s.

The toast (Rowton's welcome fizz, beat 12) framed on the glasses (Scott, 3 Nov: "crop the shot where they toast the glasses better"): a per clip `frame` in the window (the clip at 0.9 from source 0, 270), the clink filling it with the bucket behind.
