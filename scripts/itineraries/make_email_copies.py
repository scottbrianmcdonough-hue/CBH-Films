"""Email-size copies of the Lake District itinerary files (the full-size set is ~40 MB, over most mail limits).

Writes out/itineraries/email/: the HTML with its photos re-encoded smaller (hero 1600px, the rest 1000px), the Word doc
with its photos re-encoded at 1000px, the PDF printed from that HTML (every FAQ open), and source-preview.html.txt (the
HTML source with the photo data shortened, for reading). Run after make_lake_page.sh and package_docx.py.
"""
import base64
import io
import pathlib
import re
import subprocess
import zipfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "out/itineraries"
OUT = SRC / "email"
OUT.mkdir(exist_ok=True)


def shrink(raw, maxw, q=72):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
    return buf.getvalue()


# HTML: the first photo is the hero, kept sharper
html = (SRC / "lake-district-itinerary-page-mockup.html").read_text()
first = [True]


def reencode(m):
    width = 1600 if first[0] else 1000
    first[0] = False
    return "data:image/jpeg;base64," + base64.b64encode(shrink(base64.b64decode(m.group(1)), width)).decode()


small = re.sub(r"data:image/jpeg;base64,([A-Za-z0-9+/=]+)", reencode, html)
(OUT / "Lake District itinerary page mockup.html").write_text(small)
(OUT / "source-preview.html.txt").write_text(
    re.sub(r"(data:image/[a-z+]+;base64,)[A-Za-z0-9+/=]{40,}", r"\1…(photo data)…", small))

# Word doc
src_docx = SRC / "Lake District itinerary page working draft.docx"
with zipfile.ZipFile(src_docx) as zi, zipfile.ZipFile(OUT / src_docx.name, "w", zipfile.ZIP_DEFLATED) as zo:
    for item in zi.infolist():
        data = zi.read(item.filename)
        if item.filename.startswith("word/media/") and item.filename.lower().endswith((".jpg", ".jpeg")):
            data = shrink(data, 1000)
        zo.writestr(item, data)

# PDF, printed from the small HTML with every FAQ answer open
js = f"""
const {{chromium}} = require('playwright');
(async () => {{
  const b = await chromium.launch(); const p = await b.newPage({{viewport: {{width: 1400, height: 900}}}});
  await p.goto('file://' + {str(OUT / 'Lake District itinerary page mockup.html')!r}, {{waitUntil: 'load'}});
  await p.addStyleTag({{content: 'header{{position:static!important}}'}});
  await p.evaluate(() => document.querySelectorAll('details').forEach(d => {{ d.open = true; }}));
  await p.pdf({{path: {str(OUT / 'Lake District itinerary page mockup.pdf')!r}, width: '1400px', printBackground: true}});
  await b.close();
}})();
"""
tmp = pathlib.Path(__file__).with_name("_email_pdf.js")
tmp.write_text(js)
try:
    subprocess.run(["node", str(tmp)], check=True)
finally:
    tmp.unlink()
for f in sorted(OUT.iterdir()):
    print(f"{f.stat().st_size / 1e6:5.1f} MB  {f.name}")
