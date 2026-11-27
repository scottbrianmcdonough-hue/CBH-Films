"""A mock-up of the embedded route map: the Lakes drawn from approximate coordinates, the attractions numbered in route
order (the key lists attractions only), towns named on the map, our hotels as pins. Not to survey accuracy: a mock-up of what the embed would show."""
# colours: the attractions in the brand gold with ink numbers, the hotels and towns in ink
GOLD, INK = "#C39E55", "#1d1d1b"


def X(lon):
    return (lon + 3.26) * 1100 + 20


def Y(lat):
    return (54.715 - lat) * 1892 + 20


def poly(pts):
    return " ".join(f"{X(lo):.1f},{Y(la):.1f}" for la, lo in pts)


LAKES = {
    "Windermere": [(54.427, -2.962), (54.41, -2.951), (54.39, -2.934), (54.37, -2.924), (54.35, -2.929), (54.325, -2.944), (54.325, -2.962), (54.35, -2.946), (54.37, -2.941), (54.39, -2.953), (54.41, -2.969)],
    "Grasmere": [(54.456, -3.03), (54.458, -3.02), (54.452, -3.012), (54.447, -3.018), (54.449, -3.03)],
    "Rydal Water": [(54.449, -2.998), (54.448, -2.985), (54.445, -2.986), (54.446, -2.999)],
    "Thirlmere": [(54.563, -3.066), (54.55, -3.058), (54.53, -3.05), (54.522, -3.045), (54.522, -3.052), (54.535, -3.06), (54.552, -3.069)],
    "Derwentwater": [(54.596, -3.146), (54.585, -3.132), (54.567, -3.137), (54.553, -3.152), (54.558, -3.167), (54.575, -3.166), (54.59, -3.16)],
    "Bassenthwaite Lake": [(54.693, -3.226), (54.675, -3.205), (54.655, -3.193), (54.64, -3.19), (54.638, -3.197), (54.655, -3.208), (54.675, -3.222), (54.69, -3.236)],
}
LAKE_LABELS = {"Windermere": (54.35, -2.985, -78), "Derwentwater": (54.544, -3.165, 0), "Bassenthwaite Lake": (54.662, -3.245, -60), "Thirlmere": (54.543, -3.035, -70)}  # Grasmere the lake is left unlabelled: the town carries the name
FELLS = {"Skiddaw": (54.651, -3.147), "Helvellyn": (54.527, -3.016), "Blencathra": (54.639, -3.05)}

# the attractions, numbered for the key (Lee, 27 Nov: "use that key for attractions only and put the towns on the map
# itself"); places nudged a little apart where markers would overlap (the map is a mock-up, not to scale)
STOPS = [  # (n, name, lat, lon)
    (1, "Orrest Head", 54.392, -2.893), (2, "Windermere Lake Cruises", 54.392, -2.942), (3, "Dove Cottage", 54.452, -3.008),
    (4, "Castlerigg Stone Circle", 54.603, -3.098), (5, "Keswick Launch", 54.583, -3.146), (6, "Catbells", 54.569, -3.170),
    (7, "Ashness Bridge", 54.567, -3.120),
]
TOWNS = [  # (name, lat, lon, label dx, dy, anchor)
    ("Windermere", 54.378, -2.907, -9, -6, "end"), ("Bowness", 54.363, -2.918, -9, 4, "end"), ("Ambleside", 54.432, -2.963, -9, -6, "end"),
    ("Grasmere", 54.458, -3.024, -9, 0, "end"), ("Keswick", 54.600, -3.134, -9, -8, "end"),
]
HOTELS = [("Low Wood Bay|Resort &amp; Spa", 54.408, -2.953, (16, -14, "start")), ("Wild Boar Estate", 54.356, -2.866, (36, 26, "end")), ("Lake District Castle Inn|Hotel &amp; Spa", 54.683, -3.205, (16, -14, "start"))]
ROUTE = [(54.392, -2.893), (54.363, -2.918), (54.392, -2.942), (54.432, -2.963), (54.408, -2.953), (54.432, -2.963), (54.452, -3.008),
         (54.50, -3.03), (54.56, -3.07), (54.600, -3.134), (54.603, -3.098), (54.583, -3.146), (54.64, -3.17), (54.683, -3.205),
         (54.62, -3.18), (54.569, -3.170), (54.567, -3.120)]


def svg():
    o = ['<svg viewBox="0 0 500 770" role="img" aria-label="Route map of the Lake District itineraries">',
         '<rect width="500" height="770" fill="#e9eee4"/>']
    # soft fell shading
    for name, (la, lo) in FELLS.items():
        x, y = X(lo), Y(la)
        for r, op in ((70, .05), (48, .06), (28, .07)):
            o.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{r}" ry="{r*.7:.0f}" fill="#6f7d5f" opacity="{op}"/>')
        o.append(f'<text x="{x:.0f}" y="{y+4:.0f}" text-anchor="middle" font-size="10.5" fill="#6b7461" font-family="Lato,sans-serif">{name.upper()}</text>')
    for name, pts in LAKES.items():
        o.append(f'<polygon points="{poly(pts)}" fill="#a9c3cf" stroke="#93b1bf" stroke-width="1"/>')
    for name, (la, lo, rot) in LAKE_LABELS.items():
        x, y = X(lo), Y(la)
        o.append(f'<text x="{x:.0f}" y="{y:.0f}" transform="rotate({rot} {x:.0f} {y:.0f})" text-anchor="middle" font-size="13" font-style="italic" fill="#5d7f8f" font-family="Cormorant Garamond,serif">{name}</text>')
    o.append(f'<polyline points="{poly(ROUTE)}" fill="none" stroke="#1d1d1b" stroke-width="2" stroke-dasharray="5 5" stroke-linejoin="round" opacity=".55"/>')
    o.append(f'<polyline points="{poly([(54.363, -2.918), (54.356, -2.866)])}" fill="none" stroke="{INK}" stroke-width="2" stroke-dasharray="3 4"/>')
    for name, la, lo, (dx, dy, anchor) in HOTELS:
        x, y = X(lo), Y(la)
        o.append(f'<g><path d="M{x:.0f} {y:.0f} l-9 -14 a11 11 0 1 1 18 0 z" fill="{INK}" stroke="#fff" stroke-width="2"/><circle cx="{x:.0f}" cy="{y-19:.0f}" r="4.5" fill="{GOLD}"/>')
        o.append(f'<text x="{x+dx:.0f}" y="{y+dy:.0f}" text-anchor="{anchor}" font-size="12.5" font-weight="700" fill="#1d1d1b" font-family="Lato,sans-serif" paint-order="stroke" stroke="#e9eee4" stroke-width="3">{"".join(f'<tspan x="{x+dx:.0f}" dy="{0 if i == 0 else 15}">{part}</tspan>' for i, part in enumerate(name.split("|")))}</text></g>')
    for name, la, lo, dx, dy, anchor in TOWNS:
        x, y = X(lo), Y(la)
        o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="3.5" fill="{INK}"/><text x="{x+dx:.0f}" y="{y+dy+4:.0f}" text-anchor="{anchor}" font-size="12.5" fill="{INK}" font-family="Lato,sans-serif" paint-order="stroke" stroke="#e9eee4" stroke-width="3">{name}</text>')
    for n, name, la, lo in STOPS:
        x, y = X(lo), Y(la)
        o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="11" fill="{GOLD}" stroke="#fff" stroke-width="2"/><text x="{x:.0f}" y="{y+4:.0f}" text-anchor="middle" font-size="11" font-weight="700" fill="{INK}" font-family="Lato,sans-serif">{n}</text>')
    # map furniture: zoom buttons, north arrow, attribution
    o.append('<g font-family="Lato,sans-serif"><rect x="452" y="16" width="32" height="64" rx="6" fill="#fff" stroke="#d6d6d0"/><line x1="452" y1="48" x2="484" y2="48" stroke="#d6d6d0"/>'
             '<text x="468" y="38" text-anchor="middle" font-size="18" fill="#444">+</text><text x="468" y="70" text-anchor="middle" font-size="18" fill="#444">&#8722;</text>'
             '<path d="M30 36 l7 -20 l7 20 l-7 -5 z" fill="#1d1d1b"/><text x="37" y="52" text-anchor="middle" font-size="11" fill="#1d1d1b">N</text>'
             '<text x="490" y="760" text-anchor="end" font-size="9.5" fill="#8b9384">Map draft · not to scale</text></g>')
    o.append("</svg>")
    return "".join(o)


def legend():
    rows = "".join(f'<li><b>{n}</b>{name}</li>' for n, name, _, _ in STOPS)
    return (f'<div class="maplegend">'
            f'<ol>{rows}</ol><div class="hotels"><i></i><span>Our hotels: Low Wood Bay Resort &amp; Spa, Wild Boar Estate, Lake District Castle Inn Hotel &amp; Spa</span></div><div class="hotels town"><i></i><span>Towns are named on the map</span></div>'
            f'<a class="pill outline" href="#">Open in Google Maps</a></div>')


CSS = """.mapwrap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:40px;align-items:start;margin-top:26px;text-align:left}
.mapwrap svg{width:100%;height:auto;border-radius:12px;display:block;border:1px solid #e4e2de}
.maplegend ol{list-style:none;padding:0;margin:0 0 20px;columns:1}.maplegend li{display:flex;align-items:center;gap:14px;padding:8px 0;border-bottom:1px solid #e4e2de;font-size:16px}
.maplegend li b{flex:none;width:26px;height:26px;border-radius:50%;background:#C39E55;color:#1d1d1b;font-size:12px;display:flex;align-items:center;justify-content:center}
.maplegend .hotels{display:flex;gap:12px;align-items:flex-start;font-size:15px;color:#585858;margin-bottom:22px}.maplegend .hotels i{flex:none;width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#1d1d1b;margin-top:4px;box-shadow:inset 0 0 0 4.5px #1d1d1b,inset 0 0 0 9px #C39E55}
.maplegend .town i{width:8px;height:8px;border-radius:50%;transform:none;background:#1d1d1b;box-shadow:none;margin:8px 4px 0}
@media(max-width:900px){.mapwrap{grid-template-columns:1fr}}"""
