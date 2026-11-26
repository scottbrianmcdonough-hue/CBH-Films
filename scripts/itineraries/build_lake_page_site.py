"""Lake District itinerary page mock-up in the live classicbritishhotels.com style (Scott's screenshots, 26 Nov):
white page, logo + nav + black pill BOOK NOW, centred breadcrumb, rounded hero inside the margins, gold caps eyebrow,
light display serif H1 (60px), title line between thin rules, offer-card style hotel cards, pill buttons, rounded
category tiles. Fonts: ivypresto-display and gill-sans-nova are Adobe Fonts; stand-ins are Cormorant Garamond (light)
and the system Gill Sans (Mac) / Gill Sans MT (Windows Office), then Lato."""
import base64, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import lake_map

IMG = pathlib.Path(sys.argv[1])
LOGO = pathlib.Path(sys.argv[2])
OUT = pathlib.Path(sys.argv[3])


def img(name):
    return "data:image/jpeg;base64," + base64.b64encode((IMG / f"{name}.jpg").read_bytes()).decode()


logo = "data:image/svg+xml;base64," + base64.b64encode(LOGO.read_bytes()).decode()


def ph(label):
    return f'<div class="ph"><span>Image needed<br><b>{label}</b></span></div>'


def fig(name, cap, credit=""):
    c = f'<span class="credit">{credit}</span>' if credit else ""
    return f'<figure><img src="{img(name)}" alt="{cap}"><figcaption>{cap}{c}</figcaption></figure>'


OH = ("orrest-head-windermere-view", "Windermere from Orrest Head", "Photo: Peter S, CC BY-SA 2.0")


def stop(time, title, body):
    return f'<div class="stop"><div class="time">{time}</div><div><h4>{title}</h4><p>{body}</p></div></div>'


def group(label, colour, stops, figs=""):
    return f'<div class="group"><div class="tag"><i style="background:{colour}"></i>{label}</div>{stops}{figs}</div>'


M, L, A, E = "#779096", "#869674", "#755c78", "#1d1d1b"  # 2026 palette secondaries as wayfinding: morning blue (the lake), lunch green (the fells), afternoon heather; evening black (the hotels). Gold stays for the brand touches and the hotel pins

one_night = f"""
<h3>Day 1 · Windermere and Ambleside</h3>
{group("Morning", M, stop("9:30am", "Orrest Head", "Start in Windermere village with the short climb up Orrest Head, about 20 minutes from the station on foot. From the top you see the whole lake, with the Langdale Pikes beyond."), f'<div class="strip one">{fig(*OH)}</div>')}
{group("Lunch", L, stop("12:30pm", "Bowness", "Walk down to Bowness for lunch by the water."))}
{group("Afternoon", A, stop("2:00pm", "Windermere Lake Cruises", "Step on board at Bowness. The boats run between Bowness, Ambleside and Lakeside, so you see the lake from the middle of it.") + stop("3:00pm", "Ambleside", "Get off at Waterhead and walk into Ambleside to see the tiny Bridge House over Stock Beck. Stock Ghyll Force waterfall is a short walk from the town. Then take the boat back to Bowness, or the 555 bus to Windermere."), f'<div class="strip">{fig("low-wood-bay-jetty", "Windermere, calm and clear")}{fig("windermere-lake-cruises-mv-teal-bowness", "MV Teal at Bowness", "Photo: Nthep, CC BY-SA 4.0")}{fig("bridge-house-ambleside", "Bridge House, Ambleside", "Photo: Jennifer Petrie, CC BY-SA 2.0")}</div>')}
{group("Evening · choose your base", E, stop("6:00pm", "Low Wood Bay Resort &amp; Spa", "Right on the shore of Windermere. Spend the evening in the spa, rated 5 Bubbles by the Good Spa Guide, with its lake view infinity pools and fellside sauna. Then dinner at The W, or at Blue Smoke on the Bay, where dishes are cooked on a wood fired grill.") + stop("6:00pm", "Or Wild Boar Estate", "A traditional inn under 10 minutes from Bowness. Have a candlelit dinner in the Grill &amp; Smokehouse, with a pint from its own microbrewery."), f'<div class="strip two">{fig("low-wood-bay-infinity-pool", "The infinity pool at Low Wood Bay")}{fig("wild-boar-smokehouse", "The Smoke House at Wild Boar Estate")}</div>')}
<h3>Day 2 · Before you head home</h3>
{group("Morning", M, stop("10:00am", "Grasmere", "After breakfast, drive north to Grasmere. Visit Dove Cottage, where William Wordsworth wrote many of his best known poems, and pick up some Grasmere Gingerbread before you leave."), f'<div class="strip two">{fig("grasmere-lake-and-village", "Grasmere, its lake and village from above", "Photo: Peter S, CC BY-SA 2.0")}{fig("dove-cottage-grasmere", "Dove Cottage, Wordsworth&#39;s home in Grasmere", "Photo: Strobilomyces, CC BY-SA 3.0")}</div>')}
"""

two_nights = f"""
<h3>Day 1 · Windermere</h3>
{group("Morning", M, stop("9:30am", "Orrest Head", "Begin with the short walk up Orrest Head from Windermere village for a view down the length of the lake."))}
{group("Lunch and afternoon", A, stop("12:30pm", "Bowness, then the lake", "Lunch by the water in Bowness, then a Windermere Lake Cruise to Ambleside to look round the town."))}
{group("Evening · choose your base", E, stop("6:00pm", "Low Wood Bay Resort &amp; Spa or Wild Boar Estate", "Stay at Low Wood Bay for the spa and its lake view infinity pools, or at Wild Boar Estate for a fireside dinner in the Grill &amp; Smokehouse."), f'<div class="strip two">{fig("low-wood-bay-restaurant", "Dinner at Low Wood Bay Resort &amp; Spa")}{fig("wild-boar-exterior", "Wild Boar Estate, near Windermere")}</div>')}
<h3>Day 2 · Grasmere and the north</h3>
{group("Morning", M, stop("8:00am", "Staying at Low Wood Bay Resort &amp; Spa?", "Start the day in the lake view infinity pool.") + stop("8:00am", "Staying at Wild Boar Estate?", "Before breakfast, follow the trails up through the woodland behind the inn to its tarn.") + stop("10:00am", "Grasmere", "Head to Grasmere for Dove Cottage (William Wordsworth’s home from 1799 to 1808) and the Wordsworth Museum, and a stop for Grasmere Gingerbread."), f'<div class="strip one">{fig("wild-boar-woodland-tarn", "A morning walk to the tarn at Wild Boar Estate")}</div>')}
{group("Lunch and afternoon", A, stop("12:30pm", "Keswick", "Drive north over Dunmail Raise to Keswick, a market town ringed by fells, for lunch.") + stop("2:30pm", "Castlerigg Stone Circle", "A short drive up to a ring of standing stones with fells on every side.") + stop("4:00pm", "Keswick Launch", "A boat trip round Derwentwater, with Catbells rising from the far shore."), f'<div class="strip two">{fig("keswick-and-derwentwater-aerial", "Keswick and Derwentwater from the air", "Photo: Lieven Smits, CC BY-SA 4.0")}{fig("castlerigg-stone-circle", "Castlerigg Stone Circle", "Photo: HeritageDaily, CC BY-SA 4.0")}</div>')}
{group("Evening", E, stop("6:30pm", "Lake District Castle Inn Hotel &amp; Spa", "Spend your second night by Bassenthwaite Lake, under 15 minutes from Keswick. Have a swim in the indoor pool, then a Cumbrian ale in the Castle Inn Tavern, where the garden looks across the lake to Skiddaw."), f'<div class="strip one">{fig("castle-inn-terrace-fells", "The garden terrace at Lake District Castle Inn Hotel &amp; Spa")}</div>')}
<h3>Day 3 · A walk before home</h3>
{group("Morning", M, stop("9:30am", "Catbells or Whinlatter", "For a classic Lakeland walk, climb Catbells above Derwentwater. The path is short but steep, and the view from the top takes in the whole lake. For something gentler, try the trails at Whinlatter Forest.") + stop("12:30pm", "Ashness Bridge", "Stop for the famous view over Derwentwater, then head home."), f'<div class="strip one">{fig("catbells-and-derwentwater", "Catbells above Derwentwater", "Photo: RKL, CC BY-SA 2.0")}</div>')}
"""

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

hotels = [
    ("low-wood-bay-from-the-water", "Low Wood Bay Resort &amp; Spa", "Lake District National Park (Lake Windermere)", "Lakeside spa stay", "On the shore of Windermere, with a 5 Bubble spa and lake view infinity pools. Dinner is at The W or Blue Smoke on the Bay. Your base for the south Lakes."),
    ("wild-boar-exterior", "Wild Boar Estate", "Lake District National Park (Windermere)", "Fireside inn in the woods", "A traditional inn under 10 minutes from Bowness, with ancient woodland and a tarn behind it. Dinner is by candlelight in the Grill &amp; Smokehouse, with ales from its own microbrewery."),
    ("castle-inn-lawn", "Lake District Castle Inn Hotel &amp; Spa", "Bassenthwaite/Keswick, Lake District", "The north Lakes and the fells", "Set in gardens by Bassenthwaite Lake, under 15 minutes from Keswick. After a day on the fells there's the indoor pool and spa, then a Cumbrian ale in the Castle Inn Tavern. Your base for the north Lakes."),
]
cards = "".join(
    f'<article class="card"><img src="{img(n)}" alt="{h}"><div class="cb"><div class="meta">{loc}</div><h4>{h}</h4><p>{d}</p>'
    f'<div class="btns"><a class="pill" href="#">Book now</a><a class="pill outline" href="#">Details</a></div></div></article>'
    for n, h, loc, t, d in hotels
)

tiles = (
    f'<a class="tile" href="#" style="background-image:url({img("low-wood-bay-aerial")})"><span>Lake District hotels</span></a>'
    f'<a class="tile" href="#" style="background-image:url({img("castle-inn-indoor-pool")})"><span>Spa &amp; Wellness</span></a>'
    f'<a class="tile" href="#" style="background-image:url({img("hebden-bridge-canal")})"><span>Yorkshire itineraries<small>Coming soon</small></span></a>'
)

SERIF = "'ivypresto-display','Cormorant Garamond',Georgia,serif"
SANS = "'gill-sans-nova','Gill Sans','Gill Sans MT',Lato,sans-serif"

html = f"""<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lake District Itineraries (mock-up)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Lato:wght@300;400;700&display=swap">
<style>
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
h1{{font-family:{SERIF};font-weight:300;font-size:60px;line-height:1.1;margin:14px 0 30px}}
.rules{{max-width:986px;margin:0 auto;border-top:1px solid var(--ink);border-bottom:1px solid var(--ink);padding:11px 0;font-size:16px;font-weight:400}}
.lede{{max-width:860px;margin:56px auto 0;text-align:center;font-size:19px;line-height:1.85}}
h2{{font-family:{SERIF};font-weight:300;font-size:32px;line-height:1.2;margin:8px 0 14px}}
h3{{font-family:{SERIF};font-weight:300;font-size:26px;margin:48px 0 6px;padding-bottom:10px;border-bottom:1px solid var(--line)}}
h4{{font-family:{SERIF};font-weight:400;font-size:24px;line-height:1.25;margin:0 0 4px}}
.jump{{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:44px 0 10px}}
.jump .pill{{font-size:13px;padding:10px 22px}}
.statement{{background:linear-gradient(to bottom,var(--warm),#fff);margin:70px 0 0;padding:90px 40px 70px;text-align:center}}
.statement p{{font-family:{SERIF};font-weight:300;font-size:44px;line-height:1.3;max-width:1150px;margin:0 auto}}
.split{{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;padding:60px 0}}
.split img{{width:100%;border-radius:12px;display:block;aspect-ratio:4/3.3;object-fit:cover}}
.caps{{font-size:17px;font-weight:600;letter-spacing:0;text-transform:uppercase;margin:0 0 14px;font-family:{SANS}}}
.split p,.body p{{color:#585858}}
.quick{{margin:22px 0 0;display:grid;grid-template-columns:120px 1fr;gap:8px 18px;font-size:15.5px;border-top:1px solid var(--line);padding-top:18px}}
.quick dt{{color:var(--gold);font-size:12.5px;font-weight:600;letter-spacing:0;text-transform:uppercase;padding-top:3px}}.quick dd{{margin:0;color:#585858}}
section.itin{{padding:70px 0 20px}}section.itin .head{{text-align:center;max-width:780px;margin:0 auto 10px}}section.itin .head p{{color:#585858}}
.group{{margin:26px 0 10px}}
.tag{{color:var(--gold);font-size:13px;font-weight:600;letter-spacing:0;text-transform:uppercase;margin-bottom:8px}}
.tag i{{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:9px;vertical-align:1px;box-shadow:0 0 0 1px #b99a5c}}
.stop{{display:grid;grid-template-columns:110px 1fr;gap:20px;padding:14px 0;border-top:1px solid var(--line)}}
.time{{font-family:{SERIF};font-size:26px;font-weight:300;line-height:1.2}}.stop p{{margin:0;color:#585858}}
.strip{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:16px 0 8px}}.strip.two{{grid-template-columns:1fr 1fr}}.strip.one{{grid-template-columns:1fr}}.strip.one figure img{{aspect-ratio:21/8}}
figure{{margin:0}}figure img{{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border-radius:12px}}figcaption{{font-size:14px;font-style:italic;color:var(--grey);padding-top:8px}}.credit{{display:block;font-style:normal;font-size:11.5px;color:#9a9a9a;margin-top:2px}}
.ph{{aspect-ratio:3/2;border-radius:12px;background:repeating-linear-gradient(45deg,#f5f3f0,#f5f3f0 10px,#eceae5 10px,#eceae5 20px);border:1px dashed #cfc8bb;display:flex;align-items:center;justify-content:center;text-align:center;font-size:13px;color:#8b8478}}.ph b{{font-weight:600;color:#6d675c}}
.map{{border-radius:12px;height:440px;background:linear-gradient(135deg,#e3e9e2,#cfdcd5);display:flex;align-items:center;justify-content:center;color:#55635a;font-size:15px}}
.key{{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;margin:16px 0 0;font-size:14px}}.key span::before{{content:"";display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--c);margin-right:8px}}
.center{{text-align:center}}
.cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:30px}}
.card{{border:1px solid var(--line);display:flex;flex-direction:column;background:#fff}}.card img{{width:100%;aspect-ratio:5/3;object-fit:cover;display:block}}
.card .cb{{padding:22px 20px 22px;display:flex;flex-direction:column;flex:1}}.card .meta{{color:var(--gold);font-size:13px;font-weight:600;text-transform:uppercase;line-height:1.45;margin-bottom:8px}}.cta{{text-align:center;margin-top:44px}}
.card h4{{font-size:24px;margin-bottom:10px;text-wrap:balance}}.card p{{font-size:15.5px;color:#585858;flex:1;margin:0 0 18px}}.btns{{display:flex;gap:10px}}
.tips ul{{columns:2;column-gap:60px;padding-left:20px;margin:16px 0 0;color:#585858}}.tips li{{margin:0 0 12px;break-inside:avoid}}
.gallery{{display:grid;grid-template-columns:2fr 1fr 1fr;grid-auto-rows:210px;gap:12px;margin-top:26px}}.gallery img{{width:100%;height:100%;object-fit:cover;border-radius:12px}}.gallery .big{{grid-row:span 2}}
details{{border-bottom:1px solid var(--line);padding:18px 0}}summary{{cursor:pointer;font-family:{SERIF};font-size:24px;font-weight:300;list-style:none;display:flex;justify-content:space-between;align-items:center}}
summary::-webkit-details-marker{{display:none}}summary::after{{content:"+";font-family:{SANS};font-size:26px;font-weight:300}}details[open] summary::after{{content:"\\2212"}}details p{{margin:10px 0 0;color:#585858}}
.tiles{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}}
.tile{{position:relative;height:220px;border-radius:12px;overflow:hidden;background:center/cover no-repeat #2b2b28;display:flex;align-items:flex-end;justify-content:center;text-decoration:none}}
.tile::after{{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55),rgba(0,0,0,0) 60%)}}
.tile span{{position:relative;z-index:1;color:#fff;font-family:{SERIF};font-size:28px;font-weight:400;text-align:center;padding:0 16px 22px;line-height:1.15}}.tile small{{display:block;font-family:{SANS};font-size:12px;letter-spacing:0;text-transform:uppercase;margin-top:6px;color:var(--gold)}}
.tile.soon{{background:linear-gradient(135deg,#3a3a35,#1d1d1b)}}
section.block{{padding:70px 0 10px}}
footer{{margin-top:90px;background:var(--ink);color:#bdbdbd;text-align:center;padding:40px;font-size:14px}}
@media(max-width:900px){{header{{padding:10px 16px}}.search,nav.main{{display:none}}header .pill{{margin-left:auto}}.wrap{{padding:0 16px}}.hero{{height:380px}}h1{{font-size:42px}}.statement p{{font-size:30px}}
.split,.cards,.tiles{{grid-template-columns:1fr;gap:24px}}.strip,.strip.two{{grid-template-columns:1fr}}.strip.one{{max-width:100%}}.tips ul{{columns:1}}.gallery{{grid-template-columns:1fr 1fr}}.stop{{grid-template-columns:80px 1fr}}}}
{lake_map.CSS.replace('{', '{{').replace('}', '}}') if False else ''}</style><style>{lake_map.CSS}</style></head><body>
<div class="note">Working draft of the Lake District itinerary page for review: layout and copy draft, not live. Credited photos are Creative Commons placeholders.</div>
<header><a class="logo" href="#"><img src="{logo}" alt="Classic British Hotels &amp; Resorts"></a>
<div class="search">Search hotels <svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></div>
<nav class="main"><a class="dd" href="#">Hotels</a><a class="dd" href="#">Offers &amp; Inspiration</a><a class="dd" href="#">Meetings</a><a href="#">Gifts</a></nav>
<a class="pill" href="#">Book now</a></header>
<div class="wrap">
<div class="crumb">Home<i>/</i>Travel Guide<i>/</i><b>Lake District Itineraries</b></div>
<div class="hero" style="background-image:url('{img("low-wood-bay-aerial")}')"></div>
<div class="titleblock"><div class="eyebrow">Travel guide</div><h1>Lake District Itineraries</h1>
<div class="rules">One or two nights in the Lakes, with one of our hotels as your base</div>
<p class="lede">Spend a night or two in the Lake District, with a cruise on Windermere and a walk on the fells, and one of our hotels to come back to each evening.</p>
<div class="jump"><a class="pill outline" href="#one">1 night</a><a class="pill outline" href="#two">2 nights</a><a class="pill outline" href="#rain">Rainy day</a><a class="pill outline" href="#map">Map</a><a class="pill outline" href="#stay">Where to stay</a><a class="pill outline" href="#tips">Top tips</a><a class="pill outline" href="#faqs">FAQs</a></div></div>
</div>
<div class="statement"><p>England's largest national park, and three of our hotels to explore it from.</p></div>
<div class="wrap">
<div class="split"><img src="{img("low-wood-bay-spa-view")}" alt="The spa at Low Wood Bay, looking out over Windermere">
<div><div class="caps">About the Lake District</div>
<p>The Lake District is a UNESCO World Heritage Site, with Windermere, England's largest lake, at its heart.</p>
<p>In spring there are the daffodils that William Wordsworth (the poet behind “I Wandered Lonely as a Cloud”) wrote about, and in autumn the fells turn copper. Winter is quieter, with log fires to come back to. Windermere has its own station, linked to the West Coast Main Line at Oxenholme, and the M6 brings you to the edge of the park at Kendal and Penrith.</p>
<dl class="quick"><dt>Best for</dt><dd>Walkers, couples, spa lovers, foodies</dd><dt>Ideal stay</dt><dd>1 to 2 nights</dd><dt>Covers</dt><dd>Windermere, Bowness, Ambleside, Grasmere, Keswick, Derwentwater, Bassenthwaite Lake</dd><dt>Highlights</dt><dd>Orrest Head, Windermere Lake Cruises, Dove Cottage, Castlerigg Stone Circle, Catbells</dd><dt>Our hotels</dt><dd><div class="meta">Low Wood Bay Resort &amp; Spa, Lake District National Park (Lake Windermere); Wild Boar Estate, Lake District National Park (Windermere); Lake District Castle Inn Hotel &amp; Spa, Bassenthwaite/Keswick, Lake District</div></dd></dl></div></div>
<section class="itin" id="one"><div class="head"><div class="eyebrow">Itinerary</div><h2>One night in the Lake District</h2><p>A night by Windermere: a walk and a lake cruise, then the evening at a lakeside spa or a fireside inn.</p></div>{one_night}<div class="cta"><a class="pill" href="#stay">Choose your hotel</a></div></section>
<section class="itin" id="two"><div class="head"><div class="eyebrow">Itinerary</div><h2>Two nights in the Lake District</h2><p>Both sides of the Lakes: Windermere and Grasmere in the south, then Keswick and Derwentwater in the north.</p></div>{two_nights}<div class="cta"><a class="pill" href="#stay">Choose your hotel</a></div></section>
<div class="split" id="rain"><div class="strip two" style="margin:0">{fig("castle-inn-indoor-pool", "The indoor pool at Castle Inn")}{fig("castle-inn-spa-relaxation", "The spa relaxation room at Castle Inn")}</div>
<div><div class="caps">If it rains</div><h2>Rainy day alternative</h2><p>If it rains, there's plenty to do indoors. Spend the afternoon in the thermal spa at Low Wood Bay, or the indoor pool and steam room at Lake District Castle Inn Hotel &amp; Spa. Explore the boats at Windermere Jetty Museum in Bowness, or, from March to mid December, Beatrix Potter's Hill Top near Hawkshead, about 30 minutes from Wild Boar Estate (check dates with the National Trust). In Keswick, there's the Derwent Pencil Museum.</p></div></div>
<section class="block center" id="map"><div class="eyebrow">The route</div><h2>Map</h2><div class="mapwrap">{lake_map.svg()}{lake_map.legend()}</div>
<div class="key"><span style="--c:{M}">Morning</span><span style="--c:{L}">Lunch</span><span style="--c:{A}">Afternoon</span><span style="--c:#1d1d1b">Our hotels (evenings)</span></div></section>
<section class="block" id="stay"><div class="center"><div class="eyebrow">Where to stay</div><h2>Our hotels in the Lake District</h2></div><div class="cards">{cards}</div></section>
<section class="block tips" id="tips"><div class="caps">Top tips</div><ul>
<li>Book lake cruises and Dove Cottage ahead in summer and the school holidays.</li><li>Parking in Bowness, Ambleside and Keswick fills early; the 555 bus links Windermere, Ambleside, Grasmere and Keswick.</li>
<li>Pack waterproofs and proper boots, even for short walks: the weather on the fells turns quickly.</li><li>Book dinner when you book your room, especially at weekends.</li><li>Hill Top closes in January and February, and some attractions keep shorter winter hours, so check before you go.</li>
<li>Fancy a wild swim in Bassenthwaite Lake? Licences are available at Castle Inn reception.</li></ul></section>
<section class="block"><div class="center"><div class="eyebrow">Gallery</div><h2>The Lakes, our way</h2></div><div class="gallery"><img class="big" src="{img("low-wood-bay-lime-room-lake-view-bath")}" alt="A lake view room with a feature bath at Low Wood Bay Resort &amp; Spa"><img src="{img("low-wood-bay-blue-smoke-restaurant")}" alt="Blue Smoke on the Bay at Low Wood Bay Resort &amp; Spa"><img src="{img("wild-boar-dining")}" alt="Dining at Wild Boar Estate"><img src="{img("wild-boar-local-ales")}" alt="Local ales at Wild Boar Estate"><img src="{img("castle-inn-four-poster-room")}" alt="A canopied bedroom at Lake District Castle Inn Hotel &amp; Spa"></div></section>
<section class="block" id="faqs"><div class="center"><div class="eyebrow">Good to know</div><h2>Lake District FAQs</h2></div>{faq_html}</section>
<section class="block"><div class="center"><div class="eyebrow">Plan your next break</div><h2>More inspiration</h2></div><div class="tiles">{tiles}</div></section>
</div><footer>Classic British Hotels &amp; Resorts · draft for review</footer></body></html>"""
OUT.write_text(html)
print(OUT, len(html) // 1024, "KB")
