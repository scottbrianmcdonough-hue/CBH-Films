# Nailcote Hall: meetings and events

**Status:** 16:9 sent (2 Nov), goes out Fri 6 Nov; 9:16 registered, not needed for now.  
**Compositions:** `nailcote-hall-meetings` (16:9, LinkedIn and website), `nailcote-hall-meetings-reel` (9:16, parked)  
**Hotels:** Nailcote Hall  
**Music:** Tech House Vibes (Mixkit 130)

[All films](../README.md) · [Hotels](../hotels.md) · [Music](../music.md)

## Notes

Bianca (2 Nov): "nailcote m&e reel out on Fri". Scott: "a nailcote reel like the haycock manor" (the meetings cut, `haycock-manor-meetings`); both formats, 9:16 for Instagram and 16:9 for LinkedIn and the website.

Photos in `public/hotels/nailcote-hall/`: 10 from the CBH site (exterior, Lant Suite, clubhouse by the pond and its terrace, a wedding in the grounds, Executive Double, Four Poster, golf with rhododendrons, the green and pond, the pool); the five food and drink stills (`oak-room-table`, `oak-room-hall`, `scallops`, `terrine-jar`, `afternoon-tea` 900x1350 portrait) came on the second send. Meeting rooms from nailcotehall.co.uk (Scott, full size, 2000px) in `rooms/`: Terrace Suite x2 (the second a wedding table: out), Wellingtonia Suite x2, Yew Suite x2, Lant Suite x2 (the second a wedding: out), Kenilworth Suite x2, Dudley Suite, the Clubhouse Pavilion (theatre rows and a dinner), Library, Boardroom. Two looks: older warm pink and tartan rooms (Terrace, Wellingtonia, Yew, Dudley?) and refitted grey ones under blue-lit coffers (Lant, Kenilworth): group them.

Facts (Scott, from the CBH hotel page and Nailcote's CBH meeting rooms page): 10 event spaces (Terrace, Wellingtonia, Yew, Lant, Kenilworth, Dudley, the Clubhouse Pavilion (spelt "Pavillion" on the site), Library, Boardroom, the Marquee; the Bistro is listed without capacities). Berkswell, Warwickshire. M42 J6 6.7 miles ("7 miles" fine), NEC 6.07 miles ("6 miles"; never round it up), Birmingham International Station 7 miles, Birmingham Airport 8 miles, Birmingham 13.49 miles; Kenilworth Castle 3.25 miles, Warwick Castle 7.95 miles. 49 bedrooms and suites, free Wi-Fi, free parking, EV charging. The Cromwell 9 hole par 3 course, home of the British Par 3 Championship; corporate golf days. Health club with indoor pool. Oak Room Restaurant (no rosettes listed: never mention rosettes, though old AA rosette plates hang in the hall). Built in 1640 (never "Tudor": the page doesn't say it), 15 acres. The FAQ's "up to 300" disagrees with the chart: chart figures only.

Capacities (Nailcote's CBH meeting rooms page); each caption takes the figure for the layout pictured:

| Room | Theatre | Cabaret | Reception | Dinner | Classroom | Boardroom | U-shape |
|---|---|---|---|---|---|---|---|
| Terrace Suite | 70 | 42 | 100 | 70 | 40 | 40 | 34 |
| Wellingtonia Suite | 40 | 21 | | 40 | 20 | 20 | 17 |
| Yew Suite | 30 | 14 | | 30 | 15 | 18 | 15 |
| Lant Suite | 150 | 70 | 150 | 120 | 80 | 60 | 50 |
| Kenilworth Suite | 60 | 35 | 60 | 60 | 50 | 36 | 32 |
| Dudley Suite | 40 | 28 | 50 | 40 | 30 | 24 | 26 |
| The Clubhouse Pavilion | 60 | 36 | 70 | 60 | 18 | 30 | 24 |
| Library | | | | 12 | | 12 | |
| Boardroom | | | | | | 10 | |
| The Marquee | | 200 | | 280 | | | |

Plan: the Haycock meetings beats in both formats from one edit: the exterior (label WARWICKSHIRE / Nailcote Hall), a cut a beat through the rooms with each table in the same place and a counter to 10 event spaces, each room named with its layout's figure, the location line (6 miles from the NEC, 7 from M42 J6), golf, food, the pool, the Four Poster, an end line. Leave out the wedding shots.

Batch D (Scott): the Marquee by night (dressed for Christmas: balloons, trees, crackers) and by day (round tables, glass walls onto the golf, blue chair sashes), Charley's Bar in the clubhouse (the sign reads "Charley's"), a pad and branded pencil on a meeting table (`pad-and-pencil.jpg`). The team building image is a KDM Events brochure page (collage, third party logos and award badges): not used, not saved.

Room lines (Scott: proper copy, witty and value led, the number worked in, not "U-shape 32"; one line a room, no repeated shapes, no em dashes; numbers exactly as the chart; details verified or visible). Draft, rooms counting up in size:
1. Boardroom: "Ten seats / Zero distractions" (Scott's line)
2. Library: "Twelve round the table / Books for company"
3. Yew Suite: "18 for the board / A tapestry for the backdrop"
4. Wellingtonia Suite: "20 down one long table / Every eye on the screen"
5. Dudley Suite: "28 in cabaret / Nobody stuck at the back"
6. Kenilworth Suite: "A U for 32 / Everyone face to face"
7. Terrace Suite: "Fold back the doors / Make room for 42"
8. The Clubhouse Pavilion: "60 facing the screen / The golf course at the break" (balcony over the course: CBH page)
9. Lant Suite: "Room for the big pitch / 150 in rows, 70 round tables" (its photo shows rounds, so both figures)
10. The Marquee: "Dinner for 280 / Then the dancefloor lights up" (stage, private bar, LED dancefloor: CBH FAQ)
Other lines: "6 miles from the NEC / 7 from M42 J6"; Charley's Bar "Minutes approved / Drinks at Charley's"; golf "Swap the slides / for the par 3"; end "The agenda's new / The house is from 1640".

First version (depth reel, the ripple engine): every photo a depth move at both sizes (`make-clips.py`, clips in `clips/` and `clips-wide/`, pictures `picture-tall.mp4`, `picture-wide.mp4`), a line for each of the ten rooms with its capacity, Tech House Vibes. Scott: "kill the depth moves", the room copy "too much", "a split screen or collage to show like 4 at a time", then sent the Ramside Hall M&E reel as the model ("like the ramside reel", "for the rooms you can do the three panel"), landscape first, then "just the 16:9".

Now (`src/hotel-film/me/MEReel.tsx`, a new engine on the Ramside template; spec `src/hotels/nailcote-hall-meetings.ts`): natural colour, plain stills on a slow push, crossfades, every scene on a downbeat (from beat 17 of the track, startAt 253). The house with MEETINGS & EVENTS / Nailcote Hall / Hotel, Golf & Country Club and "6 miles from the NEC, 7 from M42 J6, in Berkswell, Warwickshire"; the Kenilworth Suite full frame; on the groove two three panel splits sliding in a beat apart, each room named in caps (Lant Suite, Wellingtonia Suite, The Clubhouse Pavilion; Yew Suite, Boardroom, The Marquee); CORPORATE GOLF / A par 3 on the doorstep / The Cromwell course, home of the British Par 3 Championship (the green by the pond); DINING / Lunch in the Oak Room / Inside the house, built in 1640 (the table into the scallops); STAY OVER / Make a night of it (the pool, "A health club with an indoor pool", into the four poster, "49 bedrooms and suites"). Captions in the house style (Scott: "upgrade end card to house style", the Ramside reel was for the panels): gold caps eyebrow with its still underline, the headline in cream Cormorant, a small fact line. End card the house one: black, BERKSWELL, WARWICKSHIRE in gold caps underlined, Nailcote Hall / Hotel, Golf & Country Club in cream Cormorant, white CB. 27.5s, -16.0 LUFS. The ticket (`out/nailcote-hall-meetings-ticket.txt`) still describes the first version: rewrite it for this one.

Then (Scott: "the panels are too fast to read and some of the slides are too fast", "too much information on the first", "the subtitle text needs to be shorter and bigger"): the opening is MEETINGS & EVENTS / Nailcote Hall only; each split two bars with the panels a second apart; golf and dining 8 beats on one shot each (the scallops out), the stay over 6 beats a shot; fact lines shorter (Home of the British Par 3 Championship; In a house built in 1640; A health club and indoor pool; 49 bedrooms and suites) and 32px (was 22). End card on beat 77, 33.4s, -15.9 LUFS. A 720p compressed copy (crf 28, 2.9 MB) for the chat.

Full name (Scott: "it's called a long name"): Nailcote Hall Hotel, / Golf & Country Club as the opening title and on the end card, two even lines (no italic second line). Then little touches (Scott: "more engaging, just little touches", "suggest and apply"): the house two bars, not three (from beat 21, startAt 312); the camera gathers speed into Kenilworth's screen (its Nailcote logo; `push` 1 to 2.1 at 79% 27%, ease in) and cuts on the groove to the panels; each panel drifts its own way; hard cuts on the downbeats from the groove (`cut`), crossfades kept for the house and inside the stay over; headlines and the end card's name rise line by line out of masks; the end card a hard cut on the crash at 37.96s (beat 77, one of the track's strongest downbeats). 31.5s, -15.8 LUFS; chat copy 2.5 MB.

Polish pass (Scott): checked every half second; the splits' panels a beat apart (were a second, so each split sat half black for up to 2s), then a 3s hold; a deeper radial shade in the captions' corner (the gold caps were faint over the red curtain and the garden); the push into Kenilworth's screen eased to 1.9 (soft at 2.1 on a 2000px photo). No black frames; the music fades to silence at the end. 31.5s, -15.8 LUFS, 1920 x 1080, 30fps; chat copy 720p, 2.6 MB.

Jazzed up with Haycock (Scott: "do a polish on both, jazz it up"): golf "Swap the slides for the par 3"; DINING "Long lunch, older room / The Oak Room, in a house built in 1640"; a new AFTER HOURS beat over Charley's Bar, "Minutes approved / Drinks at Charley's Bar" (beats 65-69); the stay over 69-85, the end card on the crash at beat 85 (41.89s). 35.4s, -15.8 LUFS. The ticket's hook still fits; its post doesn't mention Charley's Bar.
