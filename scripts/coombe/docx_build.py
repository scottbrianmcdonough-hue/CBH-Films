"""Word versions of the Coombe Abbey travel guide and LinkedIn article, from the same copy as the HTML proofs."""
import io, re, sys
from pathlib import Path
from PIL import Image
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
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
    w, h = im.size; W = 6.1; H = min(W * h / w, 3.1)   # cap the height so pages fill and photos sit with their text
    d.add_picture(b, width=Inches(H * w / h), height=Inches(H))
    pp = d.paragraphs[-1]; pp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pp.paragraph_format.keep_with_next = True; pp.paragraph_format.space_before = Pt(6); pp.paragraph_format.space_after = Pt(3)
    c = d.add_paragraph(); c.alignment = WD_ALIGN_PARAGRAPH.CENTER; c.paragraph_format.space_after = Pt(12); r = c.add_run(cap); r.italic = True; r.font.size = Pt(9); r.font.color.rgb = RGBColor(0x5d, 0x5a, 0x55)

def build(blocks, out, seo=None):
    d = Document(); plain(d, "Georgia")
    for sec in d.sections: sec.left_margin = sec.right_margin = Cm(2.2); sec.top_margin = sec.bottom_margin = Cm(2.2)
    pf = d.styles["Normal"].paragraph_format; pf.space_after = Pt(8); pf.line_spacing = 1.15
    for h, before in (("Heading 1", 0), ("Heading 2", 16)):
        hf = d.styles[h].paragraph_format; hf.space_before = Pt(before); hf.space_after = Pt(6); hf.keep_with_next = True
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
        elif k == "closer":
            cap = d.add_paragraph(); cap.alignment = WD_ALIGN_PARAGRAPH.CENTER; cap.paragraph_format.space_before = Pt(24)
            r = cap.add_run(b[1]); r.bold = True; r.font.size = Pt(9); r.font.color.rgb = RGBColor(0xc7, 0xab, 0x77)
            r._element.get_or_add_rPr().append(__import__("docx.oxml", fromlist=["parse_xml"]).parse_xml('<w:spacing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="40"/>'))
            h = d.add_heading(b[2], level=2); h.alignment = WD_ALIGN_PARAGRAPH.CENTER
            body = d.add_paragraph(); body.alignment = WD_ALIGN_PARAGRAPH.CENTER; runs(body, b[3])
            t = d.add_table(rows=1, cols=1); t.alignment = 1
            t.autofit = False; t.columns[0].width = Inches(1.6)
            tblPr = t._tbl.tblPr
            for el in tblPr.findall("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tblW"): tblPr.remove(el)
            from docx.oxml import parse_xml as _px
            tblPr.append(_px('<w:tblW xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:w="2304" w:type="dxa"/>'))
            tblPr.append(_px('<w:tblLayout xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:type="fixed"/>'))
            cell = t.rows[0].cells[0]; cell.width = Inches(1.6)
            from docx.oxml import parse_xml
            cell._tc.get_or_add_tcPr().append(parse_xml('<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="clear" w:color="auto" w:fill="000000"/>'))
            bp = cell.paragraphs[0]; bp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            bp.paragraph_format.space_before = Pt(5); bp.paragraph_format.space_after = Pt(5)
            br = bp.add_run(b[4]); br.bold = True; br.font.size = Pt(10); br.font.color.rgb = RGBColor(0xff, 0xff, 0xff)
            d.add_paragraph()
        elif k == "box":
            d.add_heading(b[1], level=2)
            for x in b[2]: runs(d.add_paragraph(), x)
    d.save(out)

M = C.GUIDE_META
# no page details section in the Word doc (Scott, 17 Nov: "get rid of the notes section in the word doc")
build(C.GUIDE, OUT / "Coombe Abbey travel guide.docx")
build(C.ARTICLE, OUT / "Coombe Abbey LinkedIn article.docx")
print("ok")
