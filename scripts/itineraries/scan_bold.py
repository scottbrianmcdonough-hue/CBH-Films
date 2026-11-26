"""Post-process the mock-up: full hotel names in body copy, and the key attractions and hotels in bold for scanning
(text nodes only; not in headings, captions, buttons, FAQ questions or the nav)."""
import re, sys
p = sys.argv[1]
h = open(p).read()
HOT = [r"Low Wood Bay Resort &amp; Spa", r"Wild Boar Estate", r"Lake District Castle Inn Hotel &amp; Spa"]
SIGHTS = ["Windermere Lake Cruises", "Windermere Lake Cruise", "Windermere Jetty Museum", "Derwent Pencil Museum", "Castlerigg Stone Circle",
          "Stock Ghyll Force", "Grasmere Gingerbread", "Wordsworth Museum", "Whinlatter Forest", "Ashness Bridge", "Keswick Launch",
          "Orrest Head", "Dove Cottage", "Bridge House", "Hill Top", "Catbells"]
SKIP = {"h1", "h2", "h3", "h4", "figcaption", "summary", "a", "title", "dt", "nav", "header", "style", "script", "svg", "text", "strong", "b", "button", "meta", "ol"}  # ol: the map legend reads evenly, no bold
parts = re.split(r"(<[^>]+>)", h)
stack = []
out = []
def full(t):
    t = re.sub(r"Low Wood Bay(?! Resort)", "Low Wood Bay Resort &amp; Spa", t)
    t = re.sub(r"(?<!District )Castle Inn(?! Tavern| Hotel)", "Lake District Castle Inn Hotel &amp; Spa", t)
    return t
PLACES = ["Bassenthwaite Lake", "Windermere", "Bowness", "Ambleside", "Grasmere", "Keswick", "Derwentwater", "Hawkshead", "Kendal", "Penrith", "Oxenholme"]
def bold(t):
    for term in PLACES:
        # a destination once a paragraph, its first mention; not inside a longer name (Windermere Lake Cruises, Low Wood Bay)
        t = re.sub(r"(?<![\w>&;])(" + term + r")(?![\w<]| Lake Cruise| Jetty| Gingerbread| Launch| Resort| Stone)", r"<strong>\1</strong>", t, count=1)
    for term in HOT + SIGHTS:
        t = re.sub(r"(?<![\w>])(" + term + r")(?![\w<])", r"<strong>\1</strong>", t)
    # never nest: a sight inside a bolded hotel name
    t = re.sub(r"<strong>([^<]*)<strong>([^<]*)</strong>([^<]*)</strong>", r"<strong>\1\2\3</strong>", t)
    return t
for part in parts:
    if part.startswith("<"):
        m = re.match(r"<(/?)([a-zA-Z0-9]+)", part)
        if m and not part.endswith("/>"):
            tag = m.group(2).lower()
            if m.group(1):
                if tag in stack or (tag == "div" and "meta" in stack):
                    while stack and stack.pop() not in (tag, "meta" if tag == "div" else tag):
                        pass
            elif tag == "div" and 'class="meta"' in part:
                stack.append("meta")  # a hotel card's name and location line: as the website has it, never bolded
            elif tag not in {"img", "br", "meta", "link", "input", "i", "hr"}:
                stack.append(tag)
        out.append(part)
    else:
        body = "body" in stack and not (SKIP & set(stack)) and not any(s for s in stack if s == "div" and False)
        if body and part.strip():
            part = bold(full(part))
        elif "figcaption" in stack and part.strip():
            part = full(part)
        out.append(part)
h = "".join(out)
h = re.sub(r'alt="([^"]*)"', lambda m: 'alt="' + full(m.group(1)) + '"', h)  # image alt text uses the full names too
open(p, "w").write(h)
print("bold", h.count("<strong>"))
