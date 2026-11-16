"""Build the Coombe Abbey HTML proofs (photos embedded as base64) and audit the copy.
Usage: python3 scripts/coombe/build.py [outdir]"""
import base64, html, io, json, re, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
import coombe_copy as C  # noqa

ROOT = Path(__file__).resolve().parents[2]
PHOTOS = ROOT / "public/hotels/coombe-abbey"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "out/coombe-abbey"

def b64(name, w=1400):
    im = Image.open(PHOTOS / name).convert("RGB")
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=78, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

def md(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\[([^\]]+)\]\((mailto:[^)\s]+)\)", r"<a href='\2'>\1</a>", t)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)

CSS = """
:root{--ink:#1d1d1b;--soft:#5d5a55;--gold:#c7ab77;--paper:#ffffff;--rule:#e7e2da;--note:#f6f2ea}
@media (prefers-color-scheme: dark){:root{--ink:#f2f0f0;--soft:#bdb7ad;--paper:#121211;--rule:#2e2c29;--note:#1d1b18}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.65 Georgia,'Times New Roman',serif}
main{max-width:720px;margin:0 auto;padding:40px 16px 80px}
h1{font-size:2.1rem;line-height:1.2;margin:.2em 0 .3em;font-weight:normal}
h2{font-size:1.4rem;line-height:1.3;margin:1.8em 0 .5em;font-weight:normal}
a{color:inherit}
.stand{font-size:1.15rem;color:var(--soft);margin:0 0 1.4em}
p{margin:0 0 1em}
strong{font-weight:700}
figure{margin:1.6em 0}
figure img{width:100%;height:auto;display:block;border-radius:2px}
figcaption{font:13px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:var(--soft);margin-top:6px}
ul{padding-left:1.1em;margin:0 0 1em}
li{margin:0 0 .7em}
.notes{background:var(--note);border:1px solid var(--rule);border-left:3px solid var(--gold);padding:14px 18px;margin:0 0 32px;font:14px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif}
.notes h3{margin:0 0 6px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--soft);font-weight:600}
.notes ul{margin:0;padding-left:1.1em}.notes li{margin:0 0 .45em}
"""

def render(blocks, notes, title, label, head_extra=""):
    o = [f"<!doctype html><html lang='en-GB'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{html.escape(title)}</title>{head_extra}<style>{CSS}</style></head><body><main>"]
    o.append("<aside class='notes'><h3>Notes for review (not part of the copy)</h3><ul>" + "".join(f"<li>{md(n)}</li>" for n in notes) + "</ul></aside>")
    for b in blocks:
        k = b[0]
        if k == "h1": o.append(f"<h1>{md(b[1])}</h1>")
        elif k == "h2": o.append(f"<h2>{md(b[1])}</h2>")
        elif k == "stand": o.append(f"<p class='stand'>{md(b[1])}</p>")
        elif k == "p": o.append(f"<p>{md(b[1])}</p>")
        elif k == "ul": o.append("<ul>" + "".join(f"<li>{md(i)}</li>" for i in b[1]) + "</ul>")
        elif k == "img": o.append(f"<figure><img src='{b64(b[1])}' alt='{html.escape(b[2])}'><figcaption>{md(b[2])}</figcaption></figure>")
        elif k == "box": o.append(f"<h2>{md(b[1])}</h2>" + "".join(f"<p>{md(p)}</p>" for p in b[2]))
    o.append("</main></body></html>")
    return "".join(o)

# ---------------------------------------------------------------- audit
BANNED = "actually genuinely honestly nestled delve tapestry elevate leverage robust unparalleled curated bespoke unforgettable seamless indulge rejuvenate ultimate proper".split()
IMPERATIVE = set("book take watch walk enjoy discover explore head bring stay try treat contact email call join visit find choose imagine picture relax unwind escape spend plan make let come ask leave grab check sit sink settle".split())
SMALL = {str(i) for i in range(0, 11)}
WORDNUM = "eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand".split()

def copy_units(blocks):
    """(kind, text) for every paragraph-like unit of the copy (notes box excluded)."""
    u = []
    for b in blocks:
        if b[0] in ("h1", "h2", "stand", "p"): u.append((b[0], b[1]))
        elif b[0] == "ul": u += [("li", i) for i in b[1]]
        elif b[0] == "img": u.append(("cap", b[2]))
        elif b[0] == "box": u += [("box", p) for p in b[2]]
    return [(k, re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", re.sub(r"\*\*", "", t))) for k, t in u]

def sentences(t): return [s for s in re.split(r"(?<=[.!?:])\s+", t) if s]

def shingles(t, n=6):
    w = re.findall(r"[a-z0-9£']+", t.lower()); return {" ".join(w[i:i+n]) for i in range(len(w)-n+1)}

def audit(blocks, sources, meta_texts=()):
    units = copy_units(blocks)
    text = "\n".join(t for _, t in units) + "\n" + "\n".join(meta_texts)
    R = {}
    R["em/en dashes"] = len(re.findall("[–—]", text))
    R["hyphenated words"] = re.findall(r"\b\w+-\w+\b", text)
    R["banned words"] = [w for w in BANNED if re.search(rf"\b{w}\w*", text, re.I)]
    R["fly the flag / breakdown"] = re.findall(r"fly the flag|breakdown", text, re.I)
    R["from X to Y"] = [m.group(0) for m in re.finditer(r"\bfrom\b[^.;:\n]{1,45}?\bto\b", text, re.I)]
    R["whether"] = re.findall(r"\bwhether\b", text, re.I)
    R["the kind of"] = re.findall(r"\bthe kind of\b", text, re.I)
    R["worth the trip / worth"] = re.findall(r"\bworth\b[^.\n]*", text, re.I)
    R["most"] = re.findall(r"[^.\n]*\bmost\b[^.\n]*", text, re.I)
    R["antithesis"] = re.findall(r"[^.\n]*(?:\bnot just\b|\brather than\b|\binstead of\b|\bmore than just\b|\bnot\b[^.\n]{0,40}\bbut\b|, not\b)[^.\n]*", text, re.I)
    R["triads (A, B and/or C)"] = [m.group(0) for m in re.finditer(r"\b[\w'£&]+(?: [\w'£&]+){0,4}, [\w'£&]+(?: [\w'£&]+){0,4},? (?:and|or) [\w'£&]+", text)]
    R["listing sentences (3+ commas)"] = [s for _, t in units for s in sentences(t) if s.count(",") >= 3]
    R["paragraphs over 350 chars"] = [(len(t), t[:60]) for k, t in units if len(t) >= 350]
    R["longest paragraph"] = max(len(t) for _, t in units)
    R["word count (headings and body, no captions)"] = sum(len(t.split()) for k, t in units if k != "cap")
    sents = [s for k, t in units if k in ("p", "li", "box", "stand") for s in sentences(t)]
    R["'The' sentence openers"] = [s[:50] for s in sents if s.startswith("The ")]
    R["'it' count"] = len(re.findall(r"\bit\b|\bit's\b", text, re.I))
    R["numerals 0 to 10 (not times/money/decimals)"] = [m.group(0) for m in re.finditer(r"(?<![£\d.])\b(\d+)\b(?![\d.]|\s?(?:am|pm)|\.\d)", text) if m.group(1) in SMALL]
    R["number words over ten"] = [w for w in WORDNUM if re.search(rf"\b{w}\b", text, re.I)]
    R["Champagne capitalised"] = re.findall(r"\bChampagne\b", text)
    R["command voice"] = [s[:60] for s in sents if re.sub(r"[^a-z]", "", s.split()[0].lower()) in IMPERATIVE]
    R["words in readers' mouths"] = re.findall(r"[^.\n]*\b(?:you'll|you will|you'd|you're|you think|you've)\b[^.\n]*", text, re.I)
    R["links not on classicbritishhotels.com"] = [u for u in re.findall(r"(?:https?://|www\.)\S+", text) if "classicbritishhotels.com" not in u]
    R["coombeabbey.com mentions"] = re.findall(r"coombeabbey\.com", text, re.I)
    R["direct booking claims"] = re.findall(r"book direct|best rate|commission", text, re.I)
    first = re.search(r"Coombe Abbey(?: Hotel)?", "\n".join(t for k, t in units if k != "cap"))
    R["first mention is the full name"] = bool(first and first.group(0) == "Coombe Abbey Hotel")
    R["placeholders in copy"] = re.findall(r"\[[^\]]*\]|TBC|to come", text, re.I)
    src = set().union(*(shingles(s) for s in sources))
    R["6 word runs shared with sources"] = sorted({" ".join(sh.split()) for sh in shingles(text) if sh in src})
    return R

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    M = C.GUIDE_META
    head = (f"<meta name='description' content='{html.escape(M['description'])}'>"
            f"<meta property='og:type' content='article'><meta property='og:site_name' content='Classic British Hotels'>"
            f"<meta property='og:locale' content='en_GB'><meta property='og:title' content='{html.escape(M['og_title'])}'>"
            f"<meta property='og:description' content='{html.escape(M['description'])}'><meta name='twitter:card' content='summary_large_image'>")
    (OUT / "coombe-abbey-travel-guide-proof.html").write_text(render(C.GUIDE, C.GUIDE_NOTES, M["title"], "Travel guide · leisure", head))
    (OUT / "coombe-abbey-linkedin-article-proof.html").write_text(render(C.ARTICLE, C.ARTICLE_NOTES, C.ARTICLE_META["title"], "LinkedIn article · meetings and events"))
    up = Path("/root/.claude/uploads/0e269233-fe29-52e3-a8d2-6f8b091e3ba3")
    sources = [p.read_text(errors="ignore") for p in [up / "9884b3e5-coombe-abbey-official-site-text.txt", up / "48b18642-coombe-abbey-meeting-room-capacities.txt", up / "78c9edc5-benchmark-cbh-linkedin-me-article-the-mount.txt", Path(sys.argv[2]) if len(sys.argv) > 2 else up / "none"] if p.exists()]
    rep = {"travel guide": audit(C.GUIDE, sources, [M["title"], M["description"], M["og_title"]]),
           "linkedin article": audit(C.ARTICLE, sources, [C.ARTICLE_META["title"]])}
    rep["travel guide"]["meta description length"] = len(M["description"])
    rep["travel guide"]["title tag length"] = len(M["title"])
    print(json.dumps(rep, indent=1, ensure_ascii=False))
