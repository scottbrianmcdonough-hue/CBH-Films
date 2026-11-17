from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn

def plain(d, font):
    """Body and headings in one font, headings black (Word's defaults are blue Calibri Light)."""
    for name, size in (("Normal", 11), ("Heading 1", 18), ("Heading 2", 14), ("Heading 3", 12), ("List Bullet", 11)):
        st = d.styles[name]
        st.font.name = font
        st.element.rPr.rFonts.set(qn("w:asciiTheme"), font) if False else None
        rf = st.element.get_or_add_rPr().get_or_add_rFonts()
        for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"): rf.set(qn(a), font)
        for a in ("w:asciiTheme", "w:hAnsiTheme", "w:cstheme", "w:eastAsiaTheme"):
            if rf.get(qn(a)) is not None: del rf.attrib[qn(a)]
        st.font.size = Pt(size)
        st.font.color.rgb = RGBColor(0, 0, 0)
        if name.startswith("Heading"): st.font.bold = True; st.font.italic = False
