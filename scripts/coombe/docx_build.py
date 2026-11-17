"""Word versions of the Coombe Abbey travel guide and LinkedIn article, from the same copy as the HTML proofs."""
import io, re, sys
from pathlib import Path
from PIL import Image
from docx import Document
from docx.shared import Pt, Inches, RGBColor
sys.path.insert(0, str(Path(__file__).parent))
import coombe_copy as C
from docx_style import plain

ROOT = Path(__file__).resolve().parents[2]
PH = ROOT / "public/hotels/coombe-abbey"
OUT = ROOT / "out/coombe-abbey"

def runs(p, text):
    for part in re.split(r"(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))", text):
        if not part: continue
        m = re.match(r"\[([^\]]+)\]\(([^)]+)\)", part)
        if part.startswith("**"): r = p.add_run(part[2:-2]); r.bold = True
        elif m: r = p.add_run(m.group(1)); r.underline = True
        else: p.add_run(part)

def pic(d, name, cap):
    im = Image.open(PH / name).convert("RGB"); im.thumbnail((1600, 1600))
    b = io.BytesIO(); im.save(b, "JPEG", quality=82); b.seek(0)
    d.add_picture(b, width=Inches(6.2))
    c = d.add_paragraph(); r = c.add_run(cap); r.italic = True; r.font.size = Pt(9); r.font.color.rgb = RGBColor(0x5d, 0x5a, 0x55)

def build(blocks, out, seo=None):
    d = Document(); plain(d, "Georgia")
    if seo:
        d.add_heading("Page details", level=3)
        for k, v in seo: p = d.add_paragraph(); r = p.add_run(k + ": "); r.bold = True; p.add_run(v)
    for b in blocks:
        k = b[0]
        if k == "h1": d.add_heading(b[1], level=1)
        elif k == "h2": d.add_heading(b[1], level=2)
        elif k == "stand": p = d.add_paragraph(); r = p.add_run(b[1]); r.italic = True; r.font.size = Pt(13)
        elif k == "p": runs(d.add_paragraph(), b[1])
        elif k == "ul":
            for i in b[1]: runs(d.add_paragraph(style="List Bullet"), i)
        elif k == "img": pic(d, b[1], b[2])
        elif k == "box":
            d.add_heading(b[1], level=2)
            for x in b[2]: runs(d.add_paragraph(), x)
    d.save(out)

M = C.GUIDE_META
# no page details section in the Word doc (Scott, 17 Nov: "get rid of the notes section in the word doc")
build(C.GUIDE, OUT / "Coombe Abbey travel guide.docx")
build(C.ARTICLE, OUT / "Coombe Abbey LinkedIn article.docx")
print("ok")
