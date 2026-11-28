"""Lake District itinerary page mock-up in the live classicbritishhotels.com style (Scott's screenshots, 26 Nov):
white page, logo + nav + black pill BOOK NOW, centred breadcrumb, rounded hero inside the margins, gold caps eyebrow,
light display serif H1, offer-card style hotel cards, pill buttons, rounded category tiles. Fonts: ivypresto-display
and gill-sans-nova are Adobe Fonts; stand-ins are Cormorant Garamond (light) and the system Gill Sans (Mac) / Gill Sans
MT (Windows Office), then Lato.

Round 2 (Lee's notes, 27 Nov):
  - Intro: "Your stay in the Lake District", one line under it, the buttons, then "About the Lake District" as its own
    section with the copy full width and the three hotels as thumbnails linking to their pages.
  - Itineraries: big Day 1 / Day 2 headings that work as anchors; each day's list kept together on one side with its
    photos on the other, swapping sides day to day; fewer photos; "Allow 2 hours" in place of clock times.
  - Map: the key is for attractions only, towns named on the map itself.
  - Top tips with an icon each; a top attractions list; "More itineraries" and "More inspiration" as two sections.
"""
import base64, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import lake_map

IMG = pathlib.Path(sys.argv[1])
LOGO = pathlib.Path(sys.argv[2])
OUT = pathlib.Path(sys.argv[3])


def img(name):
    return "data:image/jpeg;base64," + base64.b64encode((IMG / f"{name}.jpg").read_bytes()).decode()


logo = "data:image/svg+xml;base64," + base64.b64encode(LOGO.read_bytes()).decode()


def fig(name, cap, credit=""):
    c = f'<span class="credit">{credit}</span>' if credit else ""
    return f'<figure><img src="{img(name)}" alt="{cap}"><figcaption>{cap}{c}</figcaption></figure>'


# ------------------------------------------------------------------ itineraries

def stop(allow, title, body):
    a = f'<div class="allow">{allow}</div>' if allow else ""
    return f'<div class="stop"><h4>{title}</h4>{a}<p>{body}</p></div>'


def group(label, stops):
    return f'<div class="group"><div class="tag">{label}</div>{stops}</div>'


def day(anchor, n, title, groups, figs, flip=False):
    return (f'<div class="day{" flip" if flip else ""}" id="{anchor}">'
            f'<div class="dayhead"><span class="dayno">Day {n}</span><span class="daytitle">{title}</span></div>'
            f'<div class="daybody"><div class="daylist">{groups}</div><div class="dayimgs">{figs}</div></div></div>')


one_night = (
    day("one-day1", 1, "Windermere and Ambleside",
        group("Morning", stop("Allow 1 hour", "Orrest Head", "Start in Windermere village with the short climb up Orrest Head, about 20 minutes from the station on foot. From the top you see the whole lake, with the Langdale Pikes beyond."))
        + group("Lunch", stop("Allow 1 hour", "Bowness", "Walk down to Bowness for lunch by the water."))
        + group("Afternoon", stop("Allow 2 to 3 hours", "Windermere Lake Cruises and Ambleside", "Step on board at Bowness. The boats run between Bowness, Ambleside and Lakeside, so you see the lake from the middle of it. Get off at Waterhead and walk into Ambleside to see the tiny Bridge House over Stock Beck, with Stock Ghyll Force waterfall a short walk from the town. Then take the boat back, or the 555 bus to Windermere."))
        + group("Evening · choose your base", stop("", "Low Wood Bay Resort &amp; Spa", "Right on the shore of Windermere. Spend the evening in the spa, rated 5 Bubbles by the Good Spa Guide, with its lake view infinity pools and fellside sauna. Then dinner at The W, or at Blue Smoke on the Bay, where dishes are cooked on a wood fired grill.") + stop("", "Or Wild Boar Estate", "A traditional inn under 10 minutes from Bowness. Have a candlelit dinner in the Grill &amp; Smokehouse, with a pint from its own microbrewery.")),
        fig("orrest-head-windermere-view", "Windermere from Orrest Head", "Photo: Peter S, CC BY-SA 2.0")
        + fig("windermere-lake-cruises-mv-teal-bowness", "MV Teal at Bowness", "Photo: Nthep, CC BY-SA 4.0")
        + fig("low-wood-bay-infinity-pool", "The infinity pool at Low Wood Bay")),
    day("one-day2", 2, "Before you head home",
        group("Morning", stop("Allow half a day", "Grasmere", "After breakfast, drive north to Grasmere. Visit Dove Cottage, where William Wordsworth wrote many of his best known poems, and pick up some Grasmere Gingerbread before you leave.")),
        fig("grasmere-lake-and-village", "Grasmere, its lake and village from above", "Photo: Peter S, CC BY-SA 2.0"),
        flip=True),
)

two_nights = (
    day("two-day1", 1, "Windermere",
        group("Morning", stop("Allow 1 hour", "Orrest Head", "Begin with the short walk up Orrest Head from Windermere village for a view down the length of the lake."))
        + group("Lunch and afternoon", stop("Allow 3 hours", "Bowness, then the lake", "Lunch by the water in Bowness, then a Windermere Lake Cruise to Ambleside to look round the town."))
        + group("Evening · choose your base", stop("", "Low Wood Bay Resort &amp; Spa or Wild Boar Estate", "Stay at Low Wood Bay for the spa and its lake view infinity pools, or at Wild Boar Estate for a fireside dinner in the Grill &amp; Smokehouse.")),
        fig("low-wood-bay-restaurant", "Dinner at Low Wood Bay Resort &amp; Spa")
        + fig("wild-boar-smokehouse", "The Smoke House at Wild Boar Estate")),
    day("two-day2", 2, "Grasmere and the north",
        group("Before breakfast", stop("Allow 1 hour", "Staying at Low Wood Bay Resort &amp; Spa?", "Start the day in the lake view infinity pool.") + stop("Allow 1 hour", "Staying at Wild Boar Estate?", "Follow the trails up through the woodland behind the inn to its tarn."))
        + group("Morning", stop("Allow 2 hours", "Grasmere", "Head to Grasmere for Dove Cottage (William Wordsworth’s home from 1799 to 1808) and the Wordsworth Museum, and a stop for Grasmere Gingerbread."))
        + group("Lunch and afternoon", stop("Allow 1 hour", "Keswick", "Drive north over Dunmail Raise to Keswick, a market town ringed by fells, for lunch.") + stop("Allow 45 minutes", "Castlerigg Stone Circle", "A short drive up to a ring of standing stones with fells on every side.") + stop("Allow 1 hour", "Keswick Launch", "A boat trip round Derwentwater, with Catbells rising from the far shore."))
        + group("Evening", stop("", "Lake District Castle Inn Hotel &amp; Spa", "Spend your second night by Bassenthwaite Lake, under 15 minutes from Keswick. Have a swim in the indoor pool, then a Cumbrian ale in the Castle Inn Tavern, where the garden looks across the lake to Skiddaw.")),
        fig("keswick-and-derwentwater-aerial", "Keswick and Derwentwater from the air", "Photo: Lieven Smits, CC BY-SA 4.0")
        + fig("castle-inn-terrace-fells", "The garden terrace at Lake District Castle Inn Hotel &amp; Spa"),
        flip=True),
    day("two-day3", 3, "A walk before home",
        group("Morning", stop("Allow 2 to 3 hours", "Catbells or Whinlatter", "For a classic Lakeland walk, climb Catbells above Derwentwater. The path is short but steep, and the view from the top takes in the whole lake. For something gentler, try the trails at Whinlatter Forest.") + stop("Allow 30 minutes", "Ashness Bridge", "Stop for the famous view over Derwentwater, then head home.")),
        fig("catbells-and-derwentwater", "Catbells above Derwentwater", "Photo: RKL, CC BY-SA 2.0")),
)

# ------------------------------------------------------------------ attractions (on the page for now; pages of their own later)

attractions = [
    ("Windermere Lake Cruises", "Bowness, Ambleside and Lakeside", "Boats across England's largest lake, hop on and off between the three piers."),
    ("Orrest Head", "Windermere", "A short climb from Windermere village to a view of the whole lake."),
    ("Dove Cottage and the Wordsworth Museum", "Grasmere", "William Wordsworth's home from 1799 to 1808."),
    ("Beatrix Potter's Hill Top", "Near Hawkshead", "Her farmhouse home, open from March to mid December."),
    ("Windermere Jetty Museum", "Bowness", "Boats and the stories of the lake, a good one for a rainy day."),
    ("Castlerigg Stone Circle", "Near Keswick", "A ring of standing stones with fells on every side."),
    ("Keswick Launch", "Derwentwater", "A boat trip round the lake, with stops for walks along the shore."),
    ("Catbells", "Derwentwater", "A short, steep climb with one of the best views in the Lakes."),
]
attr_html = "".join(f'<div class="attr"><h4>{n}</h4><div class="meta">{p}</div><p>{d}</p></div>' for n, p, d in attractions)

# ------------------------------------------------------------------ FAQs

faqs = [
    ("What can I do with one night in the Lake District?", "Walk up Orrest Head for a view over Windermere, take a lake cruise from Bowness to Ambleside, then spend the evening at Low Wood Bay Resort &amp; Spa on the shore of Windermere or by the fire at Wild Boar Estate. Before heading home, visit Wordsworth's Dove Cottage in Grasmere."),
    ("Is two nights enough for the Lake District?", "Yes. Two nights is enough to see both the south and north Lakes: Windermere, Ambleside and Grasmere first, then Keswick, Castlerigg Stone Circle and Derwentwater, with a walk up Catbells before you leave."),
    ("Where should I stay in the Lake District?", "Stay by Windermere for lake cruises and Grasmere, or near Keswick for Derwentwater and the northern fells. Low Wood Bay Resort &amp; Spa sits on the shore of Windermere, Wild Boar Estate is a traditional inn in its own woodland near Windermere, and Lake District Castle Inn Hotel &amp; Spa is near Bassenthwaite Lake, less than 15 minutes from Keswick."),
    ("Where is Wild Boar Estate in the Lake District?", "Wild Boar Estate is near Windermere, under 10 minutes from Bowness, with ancient woodland and a tarn behind it. It has its own microbrewery and the Grill &amp; Smokehouse restaurant, and Beatrix Potter's Hill Top and Dove Cottage are both around 30 minutes away."),
    ("What can I do in the Lake District when it rains?", "Spend the day in a spa, such as the thermal spa at Low Wood Bay, or visit Windermere Jetty Museum. From March to mid December, Beatrix Potter's Hill Top is open too (check dates with the National Trust)."),
    ("When is the best time to visit the Lake District?", "Any time of year. Spring and summer are best for the lakes and long walks. Autumn and winter are quieter, with log fires to come back to."),
    ("What is the best short walk in the Lake District?", "Orrest Head, about 20 minutes up from Windermere village, looks out over the whole lake. For something bigger, climb Catbells above Derwentwater."),
]
faq_html = "".join(f"<details{' open' if i == 0 else ''}><summary>{q}</summary><p>{a}</p></details>" for i, (q, a) in enumerate(faqs))

# ------------------------------------------------------------------ hotels (names and place lines as each hotel's CBH page)

hotels = [
    ("low-wood-bay-from-the-water", "Low Wood Bay Resort &amp; Spa", "Lake District National Park (Lake Windermere)", "On the shore of Windermere, with a 5 Bubble spa and lake view infinity pools. Dinner is at The W or Blue Smoke on the Bay. Your base for the south Lakes."),
    ("wild-boar-exterior", "Wild Boar Estate", "Lake District National Park (Windermere)", "A traditional inn under 10 minutes from Bowness, with ancient woodland and a tarn behind it. Dinner is by candlelight in the Grill &amp; Smokehouse, with ales from its own microbrewery."),
    ("castle-inn-lawn", "Lake District Castle Inn Hotel &amp; Spa", "Bassenthwaite/Keswick, Lake District", "Set in gardens by Bassenthwaite Lake, under 15 minutes from Keswick. After a day on the fells there's the indoor pool and spa, then a Cumbrian ale in the Castle Inn Tavern. Your base for the north Lakes."),
]
cards = "".join(
    f'<article class="card"><img src="{img(n)}" alt="{h}"><div class="cb"><div class="meta">{loc}</div><h4>{h}</h4><p>{d}</p>'
    f'<div class="btns"><a class="pill" href="#">Book now</a><a class="pill outline" href="#">Details</a></div></div></article>'
    for n, h, loc, d in hotels
)
thumbs = "".join(
    f'<a class="thumb" href="#"><img src="{img(n)}" alt="{h}"><span class="meta">{loc}</span><span class="name">{h}</span></a>'
    for n, h, loc, d in hotels
)

# ------------------------------------------------------------------ top tips, each with a line icon

ICONS = {
    "ticket": "M3 8h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 8v10",
    "bus": "M5 4h14v12H5zM5 10h14M8 19v-3M16 19v-3M8 13h.01M16 13h.01",
    "rain": "M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM12 12v6a2 2 0 0 0 4 0",
    "dinner": "M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10",
    "calendar": "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
    "swim": "M3 17c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 21c3 0 3-2 6-2s3 2 6 2 3-2 6-2M15 7a2 2 0 1 0 0-.01M8 13l4-5 3 3",
}


def icon(name):
    return (f'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="{ICONS[name]}" fill="none" stroke="currentColor" '
            f'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')


tips = [
    ("ticket", "Book lake cruises and Dove Cottage ahead in summer and the school holidays."),
    ("bus", "Parking in Bowness, Ambleside and Keswick fills early; the 555 bus links Windermere, Ambleside, Grasmere and Keswick."),
    ("rain", "Pack waterproofs and proper boots, even for short walks: the weather on the fells turns quickly."),
    ("dinner", "Book dinner when you book your room, especially at weekends."),
    ("calendar", "Hill Top closes in January and February, and some attractions keep shorter winter hours, so check before you go."),
    ("swim", "Fancy a wild swim in Bassenthwaite Lake? Licences are available at Castle Inn reception."),
]
tip_html = "".join(f'<li class="tip">{icon(i)}<span>{t}</span></li>' for i, t in tips)

# ------------------------------------------------------------------ more itineraries / more inspiration
# every tile has a photo (Scott, 28 Nov); Cotswolds reuses one already on this page until its destination photo comes in

itin_tiles = (
    f'<a class="tile" href="#" style="background-image:url({img("hebden-bridge-canal")})"><span>Yorkshire itineraries<small>Coming soon</small></span></a>'
    f'<a class="tile" href="#" style="background-image:url({img("wild-boar-exterior")})"><span>Cotswolds itineraries<small>Coming soon</small></span></a>'
    f'<a class="tile" href="#" style="background-image:url({img("destination-edinburgh-scotland")})"><span>Scotland itineraries<small>Coming soon</small></span></a>'
)
insp_tiles = (
    f'<a class="tile" href="#" style="background-image:url({img("low-wood-bay-aerial")})"><span>Lake District hotels</span></a>'
    f'<a class="tile" href="#" style="background-image:url({img("castle-inn-indoor-pool")})"><span>Spa &amp; Wellness</span></a>'
    f'<a class="tile" href="#" style="background-image:url({img("dalmahoy-golf-course")})"><span>Golf breaks</span></a>'
)

SERIF = "'ivypresto-display','Cormorant Garamond',Georgia,serif"
SANS = "'gill-sans-nova','Gill Sans','Gill Sans MT',Lato,sans-serif"

css = f"""
:root{{--ink:rgb(9,9,10);--grey:#6b6b6b;--line:#e4e2de;--warm:#f6f3ef;--gold:#C39E55}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:{SANS};word-spacing:.1em;font-weight:300;font-size:17px;line-height:1.75;color:var(--ink);background:#fff}}
a{{color:inherit}}
.note{{background:#fbf6ea;font-size:13px;padding:7px 16px;text-align:center;color:#7a6630;letter-spacing:0}}
header{{display:flex;align-items:center;gap:28px;padding:10px 40px;border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:10}}
header .logo img{{height:62px;display:block}}
.search{{display:flex;align-items:center;justify-content:space-between;background:#f0efed;border-radius:800px;padding:10px 22px;width:220px;font-family:{SERIF};font-size:19px;color:#8a8a8a}}
.search svg{{width:16px;height:16px}}
nav.main{{margin-left:auto;display:flex;align-items:center;gap:26px;font-size:17px;font-weight:400}}
nav.main a{{text-decoration:none}}nav.main .dd::after{{content:"";display:inline-block;width:6px;height:6px;border-right:1.5px solid var(--ink);border-bottom:1.5px solid var(--ink);transform:rotate(45deg);margin:0 0 4px 8px}}
.pill{{display:inline-block;background:var(--ink);color:#fff;border:1px solid var(--ink);border-radius:800px;padding:12px 30px;text-decoration:none;font-family:{SANS};font-weight:400;font-size:15px;letter-spacing:0;text-transform:uppercase;line-height:1.2}}
.pill.outline{{background:#fff;color:var(--ink)}}
.wrap{{max-width:1180px;margin:0 auto;padding:0 40px}}
.crumb{{text-align:center;font-size:16px;color:#9a9a9a;padding:46px 0 20px}}.crumb b{{color:var(--ink);font-weight:400}}.crumb i{{font-style:normal;margin:0 10px}}
.hero{{border-radius:12px;overflow:hidden;height:640px;background:center/cover no-repeat}}
.titleblock{{text-align:center;padding:70px 0 0}}
.eyebrow{{color:var(--gold);font-size:14px;font-weight:600;letter-spacing:0;text-transform:uppercase}}
h1{{font-family:{SERIF};font-weight:300;font-size:60px;line-height:1.1;margin:14px 0 18px}}
.sub{{font-size:20px;color:#585858;margin:0}}
h2{{font-family:{SERIF};font-weight:300;font-size:36px;line-height:1.2;margin:8px 0 14px}}
h4{{font-family:{SERIF};font-weight:400;font-size:24px;line-height:1.25;margin:0 0 4px}}
.jump{{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:40px 0 0}}
.jump .pill{{font-size:13px;padding:10px 22px}}
.about{{padding:80px 0 10px}}.about h2{{text-align:center}}.about p{{color:#585858}}
.quick{{margin:26px 0 0;display:grid;grid-template-columns:120px 1fr;gap:8px 18px;font-size:15.5px;border-top:1px solid var(--line);padding-top:18px}}
.quick dt{{color:var(--gold);font-size:12.5px;font-weight:600;letter-spacing:0;text-transform:uppercase;padding-top:3px}}.quick dd{{margin:0;color:#585858}}
.thumbs{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}}
.thumb{{text-decoration:none;display:block}}.thumb img{{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border-radius:12px}}
.thumb .meta{{display:block;color:var(--gold);font-size:12.5px;font-weight:600;text-transform:uppercase;line-height:1.45;margin:12px 0 2px}}
.thumb .name{{display:block;font-family:{SERIF};font-size:22px;line-height:1.25}}
section.itin{{padding:80px 0 20px}}section.itin .head{{text-align:center;max-width:780px;margin:0 auto 10px}}section.itin .head p{{color:#585858}}
.day{{margin:56px 0 0;scroll-margin-top:100px}}
.dayhead{{display:flex;align-items:baseline;gap:22px;padding-bottom:14px;border-bottom:1px solid var(--ink);margin-bottom:8px}}
.dayno{{font-family:{SERIF};font-weight:300;font-size:56px;line-height:1;font-variant-numeric:lining-nums}}
.daytitle{{font-size:15px;font-weight:600;text-transform:uppercase;color:var(--gold)}}
.daybody{{display:grid;grid-template-columns:1.25fr 1fr;gap:56px;align-items:start}}
.day.flip .daylist{{order:2}}.day.flip .dayimgs{{order:1}}
.dayimgs{{display:grid;gap:18px;padding-top:26px;position:sticky;top:110px}}
.group{{margin:22px 0 6px}}
.tag{{color:var(--gold);font-size:13px;font-weight:600;letter-spacing:0;text-transform:uppercase;margin-bottom:4px}}
.stop{{padding:12px 0 14px;border-top:1px solid var(--line)}}.stop p{{margin:6px 0 0;color:#585858}}
.allow{{display:inline-block;font-size:13px;font-weight:600;text-transform:uppercase;color:var(--grey);background:#f3f1ed;border-radius:800px;padding:3px 12px;margin-top:4px}}
figure{{margin:0}}figure img{{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border-radius:12px}}figcaption{{font-size:14px;font-style:italic;color:var(--grey);padding-top:8px}}.credit{{display:block;font-style:normal;font-size:11.5px;color:#9a9a9a;margin-top:2px}}
.cta{{text-align:center;margin-top:44px}}
.split{{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;padding:60px 0}}
.caps{{font-size:17px;font-weight:600;letter-spacing:0;text-transform:uppercase;margin:0 0 14px;font-family:{SANS}}}
.split p{{color:#585858}}
#rain .strip{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.attractions{{display:grid;grid-template-columns:repeat(4,1fr);gap:0 28px;margin-top:30px}}
.attr{{border-top:1px solid var(--ink);padding:18px 0 26px}}.attr h4{{font-size:22px}}.attr .meta{{color:var(--gold);font-size:12.5px;font-weight:600;text-transform:uppercase;margin:4px 0 8px}}.attr p{{margin:0;font-size:15.5px;color:#585858}}
.center{{text-align:center}}
.cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:30px}}
.card{{border:1px solid var(--line);display:flex;flex-direction:column;background:#fff}}.card img{{width:100%;aspect-ratio:5/3;object-fit:cover;display:block}}
.card .cb{{padding:22px 20px 22px;display:flex;flex-direction:column;flex:1}}.card .meta{{color:var(--gold);font-size:13px;font-weight:600;text-transform:uppercase;line-height:1.45;margin-bottom:8px}}
.card h4{{font-size:24px;margin-bottom:10px;text-wrap:balance}}.card p{{font-size:15.5px;color:#585858;flex:1;margin:0 0 18px}}.btns{{display:flex;gap:10px}}
.tips ul{{list-style:none;padding:0;margin:26px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:0 48px}}
.tip{{display:flex;gap:18px;align-items:flex-start;padding:18px 0;border-top:1px solid var(--line);color:#585858}}
.tip .icon{{flex:none;width:34px;height:34px;color:var(--gold);margin-top:2px}}
.gallery{{display:grid;grid-template-columns:2fr 1fr 1fr;grid-auto-rows:210px;gap:12px;margin-top:26px}}.gallery img{{width:100%;height:100%;object-fit:cover;border-radius:12px}}.gallery .big{{grid-row:span 2}}
details{{border-bottom:1px solid var(--line);padding:18px 0}}summary{{cursor:pointer;font-family:{SERIF};font-size:24px;font-weight:300;list-style:none;display:flex;justify-content:space-between;align-items:center}}
summary::-webkit-details-marker{{display:none}}summary::after{{content:"+";font-family:{SANS};font-size:26px;font-weight:300}}details[open] summary::after{{content:"\\2212"}}details p{{margin:10px 0 0;color:#585858}}
.tiles{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}}
.tile{{position:relative;height:220px;border-radius:12px;overflow:hidden;background:center/cover no-repeat #2b2b28;display:flex;align-items:flex-end;justify-content:center;text-decoration:none}}
.tile::after{{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55),rgba(0,0,0,0) 60%)}}
.tile span{{position:relative;z-index:1;color:#fff;font-family:{SERIF};font-size:28px;font-weight:400;text-align:center;padding:0 16px 22px;line-height:1.15}}.tile small{{display:block;font-family:{SANS};font-size:12px;letter-spacing:0;text-transform:uppercase;margin-top:6px;color:var(--gold)}}
section.block{{padding:70px 0 10px}}
footer{{margin-top:90px;background:var(--ink);color:#bdbdbd;text-align:center;padding:40px;font-size:14px}}
@media(max-width:900px){{header{{padding:10px 16px}}.search,nav.main{{display:none}}header .pill{{margin-left:auto}}.wrap{{padding:0 16px}}.hero{{height:380px}}h1{{font-size:42px}}
.split,.cards,.tiles,.thumbs,.daybody{{grid-template-columns:1fr;gap:24px}}.day.flip .daylist{{order:1}}.day.flip .dayimgs{{order:2}}.dayimgs{{position:static;padding-top:0}}.dayno{{font-size:44px}}
.attractions{{grid-template-columns:1fr 1fr}}.tips ul{{grid-template-columns:1fr}}.gallery{{grid-template-columns:1fr 1fr}}}}
"""

html = f"""<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your stay in the Lake District (mock-up)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Lato:wght@300;400;700&display=swap">
<style>{css}</style><style>{lake_map.CSS}</style></head><body>
<div class="note">Working draft of the Lake District itinerary page for review, round 2: layout and copy draft, not live. Credited photos are Creative Commons placeholders.</div>
<header><a class="logo" href="#"><img src="{logo}" alt="Classic British Hotels &amp; Resorts"></a>
<div class="search">Search hotels <svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></div>
<nav class="main"><a class="dd" href="#">Hotels</a><a class="dd" href="#">Offers &amp; Inspiration</a><a class="dd" href="#">Meetings</a><a href="#">Gifts</a></nav>
<a class="pill" href="#">Book now</a></header>
<div class="wrap">
<div class="crumb">Home<i>/</i>Travel Guide<i>/</i><b>Lake District Itineraries</b></div>
<div class="hero" style="background-image:url('{img("low-wood-bay-aerial")}')"></div>
<div class="titleblock"><div class="eyebrow">Travel guide</div><h1>Your stay in the Lake District</h1>
<p class="sub">Itineraries for a one or two night break, based at one of our hotels.</p>
<div class="jump"><a class="pill outline" href="#one">1 night</a><a class="pill outline" href="#two">2 nights</a><a class="pill outline" href="#rain">Rainy day</a><a class="pill outline" href="#attractions">Attractions</a><a class="pill outline" href="#map">Map</a><a class="pill outline" href="#stay">Where to stay</a><a class="pill outline" href="#tips">Top tips</a><a class="pill outline" href="#faqs">FAQs</a></div></div>
<section class="about" id="about"><h2>About the Lake District</h2>
<p>The Lake District is a UNESCO World Heritage Site, with Windermere, England's largest lake, at its heart, and three of our hotels to explore it from.</p>
<p>In spring there are the daffodils that William Wordsworth (the poet behind “I Wandered Lonely as a Cloud”) wrote about, and in autumn the fells turn copper. Winter is quieter, with log fires to come back to. Windermere has its own station, linked to the West Coast Main Line at Oxenholme, and the M6 brings you to the edge of the park at Kendal and Penrith.</p>
<dl class="quick"><dt>Best for</dt><dd>Walkers, couples, spa lovers, foodies</dd><dt>Ideal stay</dt><dd>1 to 2 nights</dd><dt>Covers</dt><dd>Windermere, Bowness, Ambleside, Grasmere, Keswick, Derwentwater, Bassenthwaite Lake</dd><dt>Highlights</dt><dd>Orrest Head, Windermere Lake Cruises, Dove Cottage, Castlerigg Stone Circle, Catbells</dd></dl>
<div class="thumbs">{thumbs}</div></section>
<section class="itin" id="one"><div class="head"><div class="eyebrow">Itinerary</div><h2>One night in the Lake District</h2><p>A night by Windermere: a walk and a lake cruise, then the evening at a lakeside spa or a fireside inn.</p></div>{"".join(one_night)}<div class="cta"><a class="pill" href="#stay">Choose your hotel</a></div></section>
<section class="itin" id="two"><div class="head"><div class="eyebrow">Itinerary</div><h2>Two nights in the Lake District</h2><p>Both sides of the Lakes: Windermere and Grasmere in the south, then Keswick and Derwentwater in the north.</p></div>{"".join(two_nights)}<div class="cta"><a class="pill" href="#stay">Choose your hotel</a></div></section>
<div class="split" id="rain"><div class="strip">{fig("castle-inn-indoor-pool", "The indoor pool at Castle Inn")}{fig("castle-inn-spa-relaxation", "The spa relaxation room at Castle Inn")}</div>
<div><div class="caps">If it rains</div><h2>Rainy day alternative</h2><p>If it rains, there's plenty to do indoors. Spend the afternoon in the thermal spa at Low Wood Bay, or the indoor pool and steam room at Lake District Castle Inn Hotel &amp; Spa. Explore the boats at Windermere Jetty Museum in Bowness, or, from March to mid December, Beatrix Potter's Hill Top near Hawkshead, about 30 minutes from Wild Boar Estate (check dates with the National Trust). In Keswick, there's the Derwent Pencil Museum.</p></div></div>
<section class="block" id="attractions"><div class="center"><div class="eyebrow">What to see</div><h2>Top attractions</h2></div><div class="attractions">{attr_html}</div></section>
<section class="block center" id="map"><div class="eyebrow">The route</div><h2>Map</h2><div class="mapwrap">{lake_map.svg()}{lake_map.legend()}</div></section>
<section class="block" id="stay"><div class="center"><div class="eyebrow">Where to stay</div><h2>Our hotels in the Lake District</h2></div><div class="cards">{cards}</div></section>
<section class="block tips" id="tips"><div class="center"><div class="eyebrow">Good to know</div><h2>Top tips</h2></div><ul>{tip_html}</ul></section>
<section class="block"><div class="center"><div class="eyebrow">Gallery</div><h2>The Lakes, our way</h2></div><div class="gallery"><img class="big" src="{img("low-wood-bay-lime-room-lake-view-bath")}" alt="A lake view room with a feature bath at Low Wood Bay Resort &amp; Spa"><img src="{img("low-wood-bay-blue-smoke-restaurant")}" alt="Blue Smoke on the Bay at Low Wood Bay Resort &amp; Spa"><img src="{img("wild-boar-dining")}" alt="Dining at Wild Boar Estate"><img src="{img("wild-boar-local-ales")}" alt="Local ales at Wild Boar Estate"><img src="{img("castle-inn-four-poster-room")}" alt="A canopied bedroom at Lake District Castle Inn Hotel &amp; Spa"></div></section>
<section class="block" id="faqs"><div class="center"><div class="eyebrow">Good to know</div><h2>Lake District FAQs</h2></div>{faq_html}</section>
<section class="block"><div class="center"><div class="eyebrow">Plan your next break</div><h2>More itineraries</h2></div><div class="tiles">{itin_tiles}</div></section>
<section class="block"><div class="center"><div class="eyebrow">Ideas for your stay</div><h2>More inspiration</h2></div><div class="tiles">{insp_tiles}</div></section>
</div><footer>Classic British Hotels &amp; Resorts · draft for review</footer></body></html>"""
OUT.write_text(html)
print(OUT, len(html) // 1024, "KB")
