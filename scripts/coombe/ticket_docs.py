"""Word versions of the Coombe Abbey tickets (socials intro, LinkedIn intro, M&E reel post), plain black headings."""
import re, sys
from pathlib import Path
from docx import Document
from docx.shared import Pt, RGBColor
sys.path.insert(0, str(Path(__file__).parent))
from docx_style import plain, add_text

OUT = Path(__file__).resolve().parents[2] / "out/coombe-abbey"
HEADS = {"Hook", "Post", "CTA", "CTA:", "Notes", "Linktree", "Instagram profile link"}

def build(src, out, title):
    lines = (OUT / src).read_text().split("\n")
    d = Document(); plain(d, "Calibri")
    d.add_heading(title, level=1)
    for l in lines[1:]:
        t = l.rstrip()
        if t in HEADS or re.match(r"^Post \(.*\)$", t): d.add_heading(t.rstrip(":"), level=2); continue
        if not t: continue
        if t.startswith("- "): add_text(d.add_paragraph(style="List Bullet"), t[2:]); continue
        m = re.match(r"^(Time slot|Platforms|Creative|Title|Link|LinkedIn|Tags):\s*(.*)$", t)
        p = d.add_paragraph()
        if m: add_text(p, m.group(1) + ": ", bold=True); add_text(p, m.group(2))
        else: add_text(p, t)
    d.save(OUT / out)

build("15-socials-intro.txt", "Coombe Abbey socials intro.docx", "Coombe Abbey Hotel: socials intro (Instagram, Facebook, TikTok)")
build("16-linkedin-intro.txt", "Coombe Abbey LinkedIn intro.docx", "Coombe Abbey Hotel: LinkedIn intro (GDS)")
build("18-me-reel-ticket.txt", "Coombe Abbey M&E reel post.docx", "Coombe Abbey Hotel: LinkedIn M&E reel post")
print("ok")
