# Black Friday: hotel Stories

**Status:** Template built, Dalmahoy test rendered (3 Nov); hold posting until each hotel's offer syncs to the site.  
**Compositions:** `black-friday-story-<slug>` for the 14 participating hotels  
**Hotels:** Skipton, Waterton Park, Gomersal Park, Ruthin Castle, Jockey Club Rooms, Whittlebury Park, Burleigh Court, Oaklands Hall, Oakley Hall, Dalmahoy, Forest of Arden, Holdsworth House, The Alfriston, The Imperial  
**Music:** What the Funk by Rockot (Pixabay 549053)

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

Scott, 3 Nov: "reels and stuff for the participating hotels" (the 14 with an offer on the 2026 sheet, Black_Friday_Promo_List_.xlsx). Bianca (CBH-133): after the launch post, follow ups "regional focused with participating hotels in a carousel". Photos for Skipton, Jockey Club Rooms, Burleigh Court, Oaklands Hall, The Alfriston, The Imperial and Gomersal Park from the CBH site via Scott (`public/hotels/<slug>/`); the others from earlier films.

`src/hotels/black-friday-stories.ts` on MEReel (which now plays .mp4 shots and has an offer card, `end.offer`): the place in gold caps and the name over the first shot (8 beats), two more shots 4 beats each, then BLACK FRIDAY SALE in the campaign mauve with its underline, the offer in cream Cormorant and the terms in small sans, white CB throughout. Music from beat 19 (9.497s), offer card on beat 35 (17.16s), 12.0s, -16.0 LUFS. Offers exactly as the sheet; Forest of Arden's has no percentage ("A Black Friday B&B rate, advance purchase"); The Alfriston books 27 to 30 Nov only (post on the 27th); Jockey Club's blackout covers 23 Nov to 5 Dec. Places for Burleigh Court (Minchinhampton), Oaklands Hall (Laceby) and The Alfriston (Alfriston, East Sussex) to confirm.

Regional carousels (`src/hotel-film/carousel/BlackFridayCarousel.tsx`, `black-friday-carousel-<region>`, 4:5, render with --sequence): Yorkshire & Scotland (Skipton, Waterton, Gomersal, Holdsworth, Dalmahoy), The Midlands & East (Forest of Arden, Whittlebury, Jockey Club Rooms, Oaklands Hall), The South (Burleigh Court, Oakley Hall, The Alfriston), Wales (Ruthin, The Imperial). Slide 1 the official bed artwork as supplied (Scott: "use the official artwork assets where possible"; the launch post has the curtains), a slide per hotel (place in gold caps, name, offer in a mauve pill, terms), the close with the region over "The wait is over" and the countdown URL.
Covers alternate the two official 4:5 files in posting order (Scott: "can't be using the same cover for four posts"): Yorkshire & Scotland bed, Midlands & East curtains, the South bed, Wales curtains (the launch post has the curtains, so the first carousel opens on the bed).

## Christmas markets carousel

Rebuilt from the blog itself (Scott sent its text and 12 photos, `public/campaigns/christmas-markets/`, brief in `blog-brief.txt`): `christmas-markets-carousel`, 10 slides 4:5. Cover the out of focus tree full bleed, "The markets, and where to stay"; eight markets each framed as a 16:9 window on black over a soft copy of its photo (the blog photos are 1024 x 576), the market in gold caps, dates only where the blog gives them, "Stay at" and the paired hotel: Birmingham (Hogarths Solihull), Leeds (Gomersal Park or Waterton Park), Chester (Rowton Hall), Winchester (Oakley Hall), Durham (The Morritt), Worcester (Hogarths Stone Manor), Canterbury (Donnington Manor or Hythe Imperial), Gloucester Quays (Hatherley Manor); close "Plan your market weekend" over the toast. Left out: Chichester, Guildford (its photo has fake snow), Seven Sisters, Blair Castle, Keswick, Piece Hall (dates TBC).
Then full bleed (Scott: "don't like the photo in the middle like that", "full bleed"): each blog photo cropped 4:5 on its subject (a 461px window of the 1024 x 576 photo), upscaled LANCZOS with a light unsharp mask into `<name>-4x5.jpg`, the market, dates and hotel at the bottom over a soft shade, the CB bottom right.
Then the house label only (Scott: "too much information in the lower third, trim it nice and clean, leave the details for the posts"): the market in gold caps with its underline, the hotel in cream Cormorant (long names on two lines), the CB bottom right; dates and second hotels moved to the post.
Then the market as hero (Scott: "more about the markets ... we lost the market context"): what the market is in gold caps with its underline (Frankfurt Christmas Market, Cathedral Christmas Market, Victorian Christmas Fayre, Christmas Festival, at the docks), the city in cream Cormorant 112px, "Stay at <hotel>" one small italic line; dates still in the post.
Worcester (Scott: "just a street lamp, got a better crop or pic?"): the blog's lantern swapped for Hogarths Stone Manor's own festive door (a frame of its festive arrival clip, `worcester-stone-manor-door-4x5.jpg`, full res 9:16 so sharp).

Regional carousels checked and sent (Scott, 5 Nov: "need the regional focused carousels"; Bianca, 5 Nov: "do it as
regional clusters", only the 14): the four sets as built, all 14 hotels once each. Waterton's slide is now its four
poster bedroom, not the summer aerial (November: cosy interiors where we have them); Ruthin keeps the castle (its plate
sat under the label, the breakfast photo is 1024px). Still summery, new photos wanted: Skipton (canal), Forest of
Arden (the exterior). The South carries The Alfriston's offer, bookable 27 to 30 November only: post it from the
27th, or say so in the copy. Wales has only two hotels (four slides).

CBH site photos for the seven hotels with footage (Scott, 5 Nov, one hotel a message), saved where new: Whittlebury
(`bedroom.jpg`), Holdsworth (`exterior-gateposts`, `canopied-bedroom`, `pancakes`, `robes-fizz`), Waterton (`island-house`,
`footbridge-autumn` (a 1920 x 773 panorama, soft at 4:5), `twin-bedroom`, `chicken-plate`, `leisure-pool`), Ruthin
(`afternoon-tea`, `hot-tub-fizz`), Oakley Hall (`exterior`, `bedroom`, `dessert`, `afternoon-tea`, `picnic` (summer)),
Forest of Arden (new folder: `aerial-autumn`, `aerial-lake`, `bedroom`, `chef-afternoon-tea`, `pool`), Dalmahoy
(`exterior`, `bedroom`, `salmon-plate`, `pool`, `golf-burn`); the rest matched photos already in the repo. Forest of
Arden's regional slide is now the autumn aerial (centred on the hotel); carousels re-rendered and sent.

Checked against the 2026 promo sheet (Catherine's updated version, Scott typed it out, 5 Nov): every offer matched.
Fixes (Scott): Gomersal is "Gomersal Park Hotel & Spa" (its CBH page; carousel and Story); Dalmahoy's carousel slide is
its exterior over the course, not the fireside lounge (it read like Holdsworth's fireplace beside it); Forest of Arden
leads on "Advance purchase B&B rate", non refundable, no percentage (carousel and Story); The Alfriston's terms say
"Book 27 to 30 November only"; Whittlebury and Oaklands Hall terms carry their boards and "selected dates" for the
blackouts; the tickets note Jockey Club's blackout over Black Friday weekend (23 Nov to 5 Dec). The Imperial stays "up
to 30%". The hold stands: nothing posts until all 14 offers show on the site.

Sheet updated again (Catherine, 5 Nov): Gomersal and Ruthin are 20% from BAR plus 20% off food and drink (was 25%); Skipton and Waterton stay at 25%. Carousel slides, Stories and tickets changed (`FD20`).

Type matched to Lee's official artwork (Scott, 5 Nov: "match like his with the purple pink font and he doesn't use the
letter spacing"): on the Black Friday pieces only (the queue reel and Story, the regional carousels, the hotel
Stories), the place in tight mauve caps with no underline, the pill's caps tightened. After Black Friday everything
goes back to the house style (gold caps place over its underline, cream Cormorant name); nothing outside these files
changed.

Bianca's notes on the carousels (5 Nov): north to south, the regions posted Scotland & Yorkshire (Wed 11), Wales (Fri 13), the Midlands & East (Tue 17), the South (Fri 27) and the hotels in each from the most northerly down (`NORTH_TO_SOUTH`); each opens on its region graphic (the grid would show the launch photo again), the official artwork last; the link classicbritishhotels.com/black-friday on the slide and in the tickets.

Collage cover (Scott, 5 Nov: "not sure about the black title card ... do a collage of the ones featured, see how that looks for Yorkshire and Scotland"): the region slide is now the hotels featured as tiles, the most northerly wide across the top, the rest two by two, thin black gutters, the title over a soft dark centre. Built for all four regions; tried on Scotland & Yorkshire first.

Covers made premium (Scott: "elevate the composition, make it premium"): an editorial layout, a row of the hotels above and below a black band holding the words (no type over a photo), even 8px gutters, the region on one line, the URL small and tracked.

Covers in the official card's own order (Scott: "the covers can match Lee's cards better"): the region in tight pink caps where his card has THE WAIT IS OVER, Black Friday Sale in cream, his pink Save up to pill with the region's best offer from the sheet (30%, 30%, 18%, 30%; `BEST`).

The covers' Black Friday Sale in Cormorant 600, tightened a touch (Scott: "bold the font so it looks premium like Lee's").

No fireplaces (Scott, 5 Nov): Holdsworth pancakes, Oaklands Hall the bedroom, Burleigh Court the salmon plate, The Alfriston the bedroom.
- Photos made scroll stoppers (Scott, 5 Nov: "scroll stoppers and inspiring", "more cosy spa type stuff and interiors, autumny November", an exterior only if it's inspiring): Skipton afternoon tea, Waterton's footbridge in autumn, Gomersal's spa pool, Holdsworth robes and fizz, Dalmahoy's lamplit bedroom; Ruthin's carved white bed; Forest of Arden's autumn aerial, Whittlebury's spa pool, Jockey Club Rooms bedroom, Oaklands' plate; Burleigh's plate, Oakley's gold bed, The Alfriston's afternoon tea.
- Cover collages on a second photo of each hotel (`tile`), so no slide repeats on the cover (Scott, 5 Nov). Post copy rewritten for all four (Scott: "elevate the copy for each carousel ticket, it's weak"): a bold hook line from the photos (Long nights, well spent; A castle or the seafront?; After dark at the spa; It's Black Friday), then the sale line, then one picture of two stays.
- Wales cover four tiles (`coverTiles`; Scott, 5 Nov: "improve that Wales cover, match Lee's"): the bay from the Great Orme, Ruthin's breakfast by the window, The Imperial's afternoon tea, Ruthin Castle; it was two wide strips (two hotels) with the summer hot tub.
- Link for everything Black Friday (Bianca, 6 Nov): https://classicbritishhotels.com/black-friday/, live Mon 9 Nov with the offers; the hotel Stories' link stickers go there too when their tickets are written.
- Spotlights to start (Scott, 9 Nov: "carousels or reels for each of the hotels, maybe not 16 but something to start"): the four 30% hotels (Dalmahoy, The Imperial, Oakley Hall, The Alfriston) brought in line with the campaign: the place in Lee's mauve caps with no underline (MEReel `text.mauve`), cosy photos and no fireplaces (Dalmahoy bedroom, pancake pour, pool; The Imperial bay, breakfast in bed, afternoon tea; Oakley Hall front, afternoon tea, gold bedroom; The Alfriston bedroom, afternoon tea), and the offer card in Lee's tight caps (no underline) with the offer in Cormorant 600.
- Spotlight reels (Scott, 9 Nov: "do the spotlights ... like the Rutland Hall Four Roots reel"): `src/hotels/black-friday-spotlights.ts`, the Stories' template run longer, a day at the hotel a shot and a line at a time, ending on the offer card. Dalmahoy first as the sample: the house (EDINBURGH in mauve caps), "Breakfast / takes its time" (pancake pour), "Then a round / along the burn", "A length / before dinner" (pool), "Lamps low, / door closed" (bedroom), 30% off B&B. What the Funk from beat 19, six beats a scene.
- Regrouped (Bianca, 9 Nov: "North | East & Midlands | South | Scotland & Wales", "cheapest first" = lowest price first; Scott: "page is live, not Catherine's sheet"): offers and from prices from the live page (classicbritishhotels.com/offer-category/black-friday-offers/, 21 offers, 15 hotels, 9 Nov), each hotel at its lowest from price, lowest first, the pill "From £X" with the page's offer beneath, the cover's pill "Stays from £X" (the region's lowest). The North (Gomersal £85, Skipton £85, Waterton £95, Holdsworth £129), Scotland & Wales (Ruthin £85, The Imperial £95, Dalmahoy £108.20), East & Midlands (Oaklands £77.90, Whittlebury £80.10, Forest of Arden £91.30, Jockey Club Rooms £127.50), the South (Frensham Pond £77.60, Donnington Manor £86, Oakley Hall £88, Burleigh Court £134.25). The Alfriston isn't on the page (books 27 to 30 Nov only). Donnington is Donnington Manor, Sevenoaks (breakfast plate and a Donnington & Co plate; no other photos here). New CTA lines and the offer-category link in the tickets.
- No prices on the slides (Scott, 9 Nov: "keep the save up to 30%, put in order of cheapest first but don't put prices"): the covers back to Save up to 30%, each hotel's pill the page's offer (Gomersal, Waterton and Ruthin B&B plus food and drink discount; Skipton 25% off food and drink; Holdsworth save 10% on B&B; The Imperial save up to 30%; Dalmahoy 30% off B&B; Oaklands room only, B&B or dinner, B&B; Whittlebury B&B or dinner, B&B; Forest of Arden and Jockey Club Rooms B&B included; Frensham Pond and Donnington Manor save 20% on B&B; Oakley Hall room only or B&B; Burleigh 25% off, B&B included), the order still cheapest first; no prices in the post copy.

- Scott (10 Nov): "B&B sounds so uninviting". The North carousel's pills now lead with breakfast: Gomersal Park and Waterton
  Park "Breakfast plus dining savings" (the page's "B&B plus food and drink discount"; the longer wording wrapped the pill),
  Holdsworth "10% off, breakfast included" (was "Save 10% on B&B"). Skipton unchanged. Scotland & Wales the same
  (10 Nov): Ruthin "Breakfast plus dining savings", Dalmahoy "30% off, breakfast included", The Imperial unchanged. East & Midlands too:
  Oaklands "Room only, breakfast or half board", Whittlebury "Breakfast or half board" (Scott: "with breakfast or dinner too" was confusing), Forest of Arden and Jockey Club
  "Breakfast included". The South still says B&B. Every carousel ticket now Instagram 12:00 PM, Facebook 8:00 PM
  (Scott: "the usual time"). Contact sheets (JPG and PDF) made for each region from the rendered slides.
- Bianca (10 Nov): the campaign asset comes off the end of every regional carousel (it goes out on its own Mon 16 Nov,
  with the email); hotel slides on the hotel's exterior (Gomersal Park keeps its spa, its exterior isn't its best), the
  cover a mix of hero shots; "don't like the pink bed shot" (Gomersal's bedroom, out). Exteriors: Skipton canal
  reflection, Waterton footbridge, Holdsworth front, Ruthin castle, The Imperial seafront, Dalmahoy, Oaklands front,
  Whittlebury, Forest of Arden aerial, Jockey Club garden front, Frensham at dusk, Oakley Hall, Burleigh Court. Donnington
  Manor has no exterior in the repo, so it keeps its breakfast. Covers: food, spa and rooms (burger, Skipton tea, Waterton
  hot tub, Holdsworth breakfast in bed; Ruthin hot tub, Imperial breakfast in bed, Dalmahoy salmon; Oaklands plate,
  Whittlebury spa, Forest of Arden afternoon tea, Jockey Club dining room; Frensham restaurant, Donnington plate, Oakley
  tea, Burleigh bedroom). The South's pills now lead with breakfast too. Slides: North 5, Scotland & Wales 4, East &
  Midlands 5, South 5.
- Donnington Manor (Scott, 10 Nov): its Tudor exterior (the hotel slide) and breakfast on the terrace in front of the
  timber frame (the South cover, in place of the low res Donnington & Co plate), in `public/hotels/donnington-manor/`; a
  twin bedroom came too (`twin-bedroom.jpg`, not used: dated). The South posts Fri 20 Nov (was Black Friday itself).
