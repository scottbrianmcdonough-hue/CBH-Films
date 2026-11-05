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
