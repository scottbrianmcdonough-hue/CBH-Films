# Black Friday: the queue

**Status:** Recast with only the 14 hotels in the sale (5 Nov); hold until all 14 offers show on the site.  
**Compositions:** `black-friday-queue`, `black-friday-queue-story`  
**Hotels:** the 14 in the sale: Burleigh Court, Jockey Club Rooms, Oaklands Hall, The Alfriston, Skipton, Gomersal Park, Forest of Arden, Whittlebury Park, Dalmahoy, Ruthin Castle, Holdsworth House, Waterton Park, Oakley Hall, The Imperial  
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

Ticket refreshed (4 Nov, for the launch Mon 9 Nov): the hook ends on the full bleed card, the post closes on booking (🗝️ Book now) instead of asking for comments (a sale post), the emoji 🔓 on "the wait is over", the hotels listed in the notes, the Story (17.5s) with a "Book now" link sticker suggested for 9am beside the static post.

Only the 14 (Bianca, 5 Nov, on Teams: "from next week it's all about BF ... we're only spotlighting the 14 for the rest of
Nov"): every shot now from a hotel in the sale, each hotel once, same timeline and track. The window (two beats each):
Burleigh Court's fireside table, Jockey Club Rooms' dining room, Oaklands Hall's fireplace, The Alfriston's fireside
table, Skipton's afternoon tea, Gomersal Park's afternoon tea, Forest of Arden from the air, Whittlebury Park's spa
pool; then Dalmahoy's syrup pour bursts out on the drop, a cut on beat 22 to Ruthin's clock tower under "The wait is
over" (in the window's list, so the line stays on top), then full frame Holdsworth's tea by the fire, Waterton's
afternoon tea, Oakley Hall's winter sun exterior (the dog clip read as summer) and The Imperial's breakfast in bed,
which cuts to the campaign's bed. The window shows only the middle of a clip, so the stills are slow pushes fitted
to the window itself (`scripts/window-push.py`, near their own resolution; clips in
`public/campaigns/black-friday-2026/fourteen/`); Holdsworth, Oakley and The Imperial full frame are `still-push.py`
pushes. The Story shows the first ten. Ticket updated (hook, post line, hotels, the hold). 21.8s, -15.0 LUFS; Story
17.5s, -15.4 LUFS.

Labels (Scott, 5 Nov: "should we add the location and the hotel name", then "suggest and apply"): the house order on
every hotel. In the window, a small caption at its foot over a soft shade (gold caps place, underline, the name in
cream Cormorant), fading in after each cut and out before the next, Dalmahoy's leaving as the window bursts; full
frame, from Ruthin on, the house label low on the left (bottom 520). The burst itself stays clean under "The wait is
over". Places kept short so they read in two beats: The Cotswolds, Newmarket, Lincolnshire, East Sussex, North
Yorkshire, West Yorkshire, Warwickshire, Northamptonshire, Edinburgh, North Wales, Halifax, West Yorkshire, Wakefield,
Hampshire, Llandudno.

Labels in Lee's tight mauve caps, no underline (5 Nov, to match the official artwork and the carousels); the small
window captions over a darker shade, caps 25px bold, so the mauve reads over bright shots. The full frame labels sit on
a soft corner vignette, not a band across the frame (Scott: "does the black bar have to be across the whole width"):
darkest behind the words, fading out by two thirds across.

A countdown, not a queue (Bianca, 5 Nov: "people dont queue here for BF"): "The countdown is on", SALE OPENS IN over a clock running three days down to 00:00:00:00 by the stop, "The sale is open" and a Book now button, then the burst and The wait is over as before; the post opens "The countdown is over"; every link now https://classicbritishhotels.com/black-friday/ (Bianca: live next Mon with the offers). Files `black-friday-countdown.mp4` and `-story`.

Less countdown (Scott, 5 Nov: the sale is already open when the reel goes up): only the last ten seconds, in real time (00:00:10 to 00:00:00 by the stop), under "The wait is almost over", so the reel is the moment it opens; the payoff "The wait is over" on the drop.

Already open (Scott, 5 Nov: the reel goes up a day after the sale opens, "the wait is over already and still 5 4 3 2 1"): the page says BLACK FRIDAY SALE / Now open over the window (14 HOTELS IN THE SALE), Up to 30% off beneath it, then a 5 4 3 2 1 on the beats (13 to 17) punching in, the Book now tap and the burst into The wait is over. No clock or progress bar.

Polish (Scott, 5 Nov: the count "soft and bounce a bit so eyes follow", "not so much smudge", "the label needs to come
at same time as image"): the 5 4 3 2 1 in a regular weight with a faint glow, each number springing up into place (a
damped overshoot) and fading before the next; every hotel label now arrives on its shot's cut (3 frames) and leaves on
the next; the shades behind the labels lighter, the text shadows doing more of the work.

North to south (Bianca, 5 Nov), as the carousels: the window Dalmahoy, Skipton, Holdsworth, Gomersal, Waterton, The Imperial, Ruthin, Oaklands Hall; Forest of Arden's autumn aerial bursts out on the drop; Jockey Club's Hyperion statue under The wait is over; then Whittlebury's bedroom, Burleigh Court's and The Alfriston's firesides with Oakley Hall between (new window and full frame pushes in `fourteen/`). The wait is over over a deeper top shade with a shadow on the words (it was hard to read over Ruthin). The window bounces on the beat between the headings with a slight rock (Scott).

The window drifts like a screensaver (Scott: "slower on the bouncing, think like Windows screensaver"): straight lines at a steady speed, turning back at the edges of a small box between the headings. The heading over it "Across the collection" (Scott: no hotel count on top).

No drift (Scott: "lose the drifting, doesnt add anything"); the offer under the window counts up, Up to 0% off to Up to 30% off over the first eleven beats, then the 5 4 3 2 1 (Scott: "a counter up to 30 then 5 4 3 2 1").

The 30% counts up slower (Scott: "I don't see the counting 30 by the time I'm done reading"): from beat 4, evenly, landing just before the 5 4 3 2 1.

A recap before the end card (Scott: "cycle through them all again rapidly before the Black Friday Sale, like a recap shutter"): the 14, north to south, a hard cut each, quickening from five frames to two over three beats, each kicking in at 1.06x; the end card three beats later (reel 35, Story 27). Black Friday Sale in Cormorant 600 on the end card, as on the carousel covers (Scott: "bold the font so it looks premium like Lee's").

The shades behind the labels held steady (Scott: the shadow "disappears and reappears before it changes in the box"): the window caption's shade stays from the start to the burst and the full frame vignette from the first full frame label to the recap; only the words change.

The page uses the space (Scott: "a lot of black space ... do like the UI"): the window 920 x 900 across the width (was 640 x 660), the headings moved up, the offer, count and Book now below it; window clips remade for the new window (`window-push.py` WIN). The recap calm and steady (Scott: "not so manic", "a calmer steady shutter"): five beats, every shot the same length (~6 frames), a light 1.03 kick; the end card holds eight beats. Reel 24.5s, Story 20.2s.

Polish pass (5 Nov): the offer under the window fades in as it starts counting (it sat at "Up to 0% off" for the first four beats).

No fireplaces (Scott, 5 Nov: "enough fireplaces, get the cosy interiors, beds, food"): Holdsworth pancakes, Gomersal the bedroom, Waterton the chicken plate, Oaklands the bedroom in the window; Burleigh Court the salmon plate and The Alfriston afternoon tea full frame; the recap the same.
