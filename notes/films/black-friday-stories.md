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
