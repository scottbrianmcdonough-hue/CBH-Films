"""Tidy the itinerary mock-up for handover.

Reads the self-contained mock-up (images inlined) and writes:
  <out_dir>/index.html          indented, one comment per page section, images and CSS linked
  <out_dir>/css/itinerary.css   the styles, one rule per block, grouped under comments
  <out_dir>/images/*.jpg|svg    the photos (web sized) and the logo
and rewrites the single file in place, indented the same way with its images still inlined.

Usage: python3 tidy_site.py <mockup.html> <image_dir> <out_dir>
"""
import base64
import hashlib
import io
import pathlib
import re
import sys

from PIL import Image

SRC, IMG_DIR, OUT = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
html = SRC.read_text()

# ---------------------------------------------------------------- images
by_hash = {hashlib.sha1(p.read_bytes()).hexdigest(): p.stem for p in IMG_DIR.glob("*.jpg")}
(OUT / "images").mkdir(parents=True, exist_ok=True)
(OUT / "css").mkdir(exist_ok=True)
names = {}


def to_file(m):
    uri = m.group(0)
    if uri in names:
        return names[uri]
    kind, data = re.match(r"data:image/([a-z+]+);base64,(.*)", uri, re.S).groups()
    raw = base64.b64decode(data)
    if kind.startswith("svg"):
        name = "cbh-logo.svg"
        (OUT / "images" / name).write_bytes(raw)
    else:
        name = by_hash.get(hashlib.sha1(raw).hexdigest(), f"image-{len(names) + 1}") + ".jpg"
        im = Image.open(io.BytesIO(raw)).convert("RGB")
        if im.width > 2400:
            im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
        im.save(OUT / "images" / name, quality=84, optimize=True, progressive=True)
    names[uri] = "images/" + name
    return names[uri]


# ---------------------------------------------------------------- CSS
SECTIONS = [  # first selector of each group -> its heading
    (":root", "Colours"), ("*", "Base"), (".note", "Draft banner"), ("header", "Site header"),
    (".pill", "Buttons"), (".wrap", "Layout"), (".crumb", "Breadcrumb"), (".hero", "Hero"),
    (".titleblock", "Title and intro"), ("h2", "Type"), (".toc", "Contents"), (".quick", "Quick view"),
    (".about", "About the Lake District"), (".day", "Itineraries"), (".group", "Itineraries: time of day"),
    (".stop", "Itineraries: stops"), (".strip", "Photo strips"), ("figure", "Photo strips"),
    (".map", "Map"), (".mapwrap", "Map"), (".maptabs", "Map"), (".maplegend", "Map"), (".key", "Map"),
    (".time-morning", "Time of day colours"), (".tag", "Itineraries: time of day"), ("#rain", "Rainy day"), (".cards", "Where to stay"), (".card", "Where to stay"),
    (".tips", "Top tips"), (".gallery", "Gallery"), ("details", "FAQs"), (".faq", "FAQs"),
    (".tiles", "More inspiration"), (".tile", "More inspiration"), ("footer", "Footer"), ("@media", "Phones and tablets"),
]


def fmt_decls(body, pad):
    decls = [d.strip() for d in re.split(r";(?![^(]*\))", body) if d.strip()]
    return "".join(f"{pad}{d.split(':', 1)[0].strip()}: {d.split(':', 1)[1].strip()};\n" if ":" in d else f"{pad}{d};\n" for d in decls)


def fmt_css(css):
    out, i, last = [], 0, None
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    while i < len(css):
        j = css.find("{", i)
        if j < 0:
            break
        sel = css[i:j].strip()
        if sel.startswith("@media"):
            depth, k = 1, j + 1
            while depth:
                depth += {"{": 1, "}": -1}.get(css[k], 0)
                k += 1
            inner = fmt_css(css[j + 1:k - 1])
            out.append(f"\n/* {'Phones and tablets'} */\n{sel} {{\n" + "".join("  " + l + "\n" if l else "\n" for l in inner.strip("\n").split("\n")) + "}\n")
            i = k
            continue
        k = css.find("}", j)
        head = next((h for s, h in SECTIONS if sel.split(",")[0].split(" ")[0].split(":")[0] in (s,) or sel.startswith(s + " ") or sel == s), None)
        if head and head != last:
            out.append(f"\n/* {head} */\n")
            last = head
        sels = ",\n".join(s.strip() for s in sel.split(","))
        out.append(f"{sels} {{\n{fmt_decls(css[j + 1:k], '  ')}}}\n")
        i = k + 1
    return "".join(out).lstrip("\n")


# time of day: the inline colours become named classes, the colours themselves custom properties
TIMES = {"#779096": ("morning", "#1d1d1b"), "#869674": ("lunch", "#1d1d1b"), "#755c78": ("afternoon", "#fff"), "#1d1d1b": ("evening", "#fff")}


def time_class(m):
    tag, before, colour, after = m.group(1), m.group(2), m.group(3).lower(), m.group(4)
    name = TIMES[colour][0]
    cls = re.search(r'class="([^"]*)"', before + after)
    rest = re.sub(r'\s*class="[^"]*"', "", before + after)
    return f'<{tag} class="{(cls.group(1) + " ") if cls else ""}time-{name}"{rest}>'


colours = "|".join(TIMES)
html = re.sub(r'<(i|b|span)([^>]*?)\s*style="(?:background|--c):(' + colours + r')(?:;color:#(?:fff|1d1d1b))?"([^>]*)>', time_class, html, flags=re.I)
html = html.replace('<div class="strip two" style="margin:0">', '<div class="strip two">')
TIME_ROOT = ":root{" + ";".join(f"--{n}:{c}" for c, (n, _) in TIMES.items()) + "}"
TIME_CSS = ("".join(f".time-{n}{{--c:var(--{n});--on:{on}}}" for _, (n, on) in TIMES.items())
            + ".tag i,.maplegend li b{background:var(--c);color:var(--on)}"
            + "#rain .strip{margin:0}")

styles = re.findall(r"<style>(.*?)</style>", html, re.S)
css = fmt_css(styles[0].replace("}", "}" + TIME_ROOT, 1) + "".join(styles[1:]) + TIME_CSS)  # the time colours sit with the others at the top

# ---------------------------------------------------------------- HTML
VOID = {"meta", "link", "img", "br", "hr", "input", "source", "path", "circle", "rect", "ellipse", "line", "polyline", "polygon", "use", "stop"}
INLINE = {"a", "span", "strong", "b", "em", "i", "small", "br", "img", "sup", "sub", "u", "code", "label", "time", "tspan"}
LABELS = {  # comment shown above each top-level block, by id or class; sections without one use their eyebrow
    "header": "Site header", "hero": "Hero", "titleblock": "Title, quick facts, intro and contents",
    "statement": "Statement", "split": "About the Lake District", "one": "1 night itinerary",
    "two": "2 night itinerary", "map": "Map", "stay": "Where to stay", "tips": "Top tips", "faqs": "FAQs",
    "rain": "Rainy day alternative", "footer": "Footer", "note": "Draft banner (mock-up only)",
}
TOKEN = re.compile(r"<!--.*?-->|<[^>]+>|[^<]+", re.S)


def parse(src):
    """A small tree: (tag, attrs_text, children) for elements, str for text."""
    root = ("#root", "", [])
    stack = [root]
    for t in TOKEN.findall(src):
        if t.startswith("<!--"):
            continue
        if t.startswith("</"):
            name = t[2:-1].strip().lower()
            while len(stack) > 1:
                node = stack.pop()
                if node[0] == name:
                    break
        elif t.startswith("<!"):
            stack[-1][2].append(t)
        elif t.startswith("<"):
            m = re.match(r"<([a-zA-Z0-9]+)(.*?)(/?)>$", t, re.S)
            name, attrs, selfclose = m.group(1), m.group(2), m.group(3)
            node = (name, attrs + ("/" if selfclose and not attrs.rstrip().endswith("/") else ""), [])  # keep "/>": inside SVG it matters
            stack[-1][2].append(node)
            if not selfclose and name.lower() not in VOID - {"path", "circle", "rect", "ellipse", "line", "polyline", "polygon", "use", "stop"}:
                stack.append(node)
        else:
            stack[-1][2].append(t)
    return root


def raw(node):
    if isinstance(node, str):
        return node
    name, attrs, kids = node
    if (name.lower() in VOID or attrs.endswith("/")) and not kids:
        return f"<{name}{attrs}>"
    return f"<{name}{attrs}>" + "".join(raw(k) for k in kids) + f"</{name}>"


ROWS = {"jump", "gallery", "tiles", "main", "cards", "strip"}  # grid or flex containers


def is_leaf(node):
    """Kept on one line: inline elements, and anything holding text directly."""
    if isinstance(node, str):
        return True
    name, attrs, kids = node
    cls = re.search(r'class="([^"]*)"', attrs)
    if cls and ROWS & set(cls.group(1).split()) and not any(isinstance(k, str) and k.strip() for k in kids):
        return False
    if name.lower() in INLINE | {"title", "style", "text"}:
        return True
    return any(isinstance(k, str) and k.strip() for k in kids) or (kids and all(not isinstance(k, str) and k[0].lower() in INLINE for k in kids if not (isinstance(k, str) and not k.strip())) and any(not isinstance(k, str) for k in kids))


def label(node):
    if isinstance(node, str):
        return None
    name, attrs, _ = node
    cls = re.search(r'class="([^"]*)"', attrs)
    keys = re.findall(r'\bid="([^"]+)"', attrs) + (cls.group(1).split() if cls else []) + [name]
    for k in keys:
        if k in LABELS:
            return LABELS[k]
    if name == "section":
        m = re.search(r'class="eyebrow">([^<]+)<', raw(node))
        if m:
            return m.group(1).strip()
    return None


def render(node, depth, out, top=False):
    pad = "  " * depth
    if isinstance(node, str):
        if node.strip():
            out.append(pad + node.strip())
        return
    name, attrs, kids = node
    if top and label(node):
        out.append("")
        out.append(f"{pad}<!-- {label(node)} -->")
    if is_leaf(node) or name.lower() in VOID or not kids:
        out.append(pad + raw(node).strip())
        return
    out.append(f"{pad}<{name}{attrs}>")
    body_level = name.lower() in {"body", "main"} or (name.lower() == "div" and 'class="wrap"' in attrs)
    for k in kids:
        render(k, depth + 1, out, top=body_level)
    out.append(f"{pad}</{name}>")


def tidy(doc):
    tree = parse(doc)
    out = []
    for k in tree[2]:
        render(k, 0, out)
    text = "\n".join(out)
    return re.sub(r"\n{3,}", "\n\n", text) + "\n"


linked = re.sub(r"data:image/[a-z+]+;base64,[A-Za-z0-9+/=]+", to_file, html)
linked = re.sub(r"<style>.*?</style>", "", linked, flags=re.S).replace("</head>", '<link rel="stylesheet" href="css/itinerary.css"></head>', 1)
(OUT / "index.html").write_text(tidy(linked))
(OUT / "css" / "itinerary.css").write_text("/* Lake District itinerary page: mock-up styles (draft for review) */\n\n" + css)

inlined = re.sub(r"<style>.*?</style>", "", html, flags=re.S).replace("</head>", "<style>\n" + "".join("  " + l + "\n" if l else "\n" for l in css.rstrip("\n").split("\n")) + "</style></head>", 1)
SRC.write_text(tidy(inlined))
print("images", len(names), "| index.html lines", (OUT / "index.html").read_text().count("\n"), "| css lines", css.count("\n"))
