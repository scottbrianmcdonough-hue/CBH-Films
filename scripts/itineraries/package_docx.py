"""Turn a Claude Docs docx export (the saved tool result) into Lee's Word working doc: drop the To check
section, bookmark the section headings and link the contents line to them.
Usage: python3 package_docx.py <export.txt> <workdir> <out.docx>"""
import json, base64, re, zipfile, sys, os, shutil

src, work, out = sys.argv[1:4]
shutil.rmtree(work, ignore_errors=True)
os.makedirs(work)
arr = json.load(open(src))
d = json.loads(arr[1]['text'])
raw = os.path.join(work, 'raw.docx')
open(raw, 'wb').write(base64.b64decode(d['data']['bytes_b64']))
u = os.path.join(work, 'u')
zipfile.ZipFile(raw).extractall(u)
p = os.path.join(u, 'word', 'document.xml')
x = open(p).read()

m = re.search(r'<w:p\b(?:(?!</w:p>).)*?<w:pStyle w:val="Heading2"/>(?:(?!</w:p>).)*?To check before it goes live.*?</w:p>', x, flags=re.S)
if m:
    s = [st.start() for st in re.finditer(r'<w:p\b', x[:m.end()])]
    s = [a for a in s if a <= m.start() + 5][-1]
    x = x[:s] + x[x.rfind('<w:sectPr'):]
x = re.sub(r'<w:r><w:t xml:space="preserve"> · </w:t></w:r><w:r><w:t xml:space="preserve">To check</w:t></w:r>', '', x)

heads = ['Hero', 'Intro', 'Quick view', '1 night itinerary', '2 night itinerary', 'Rainy day alternative', 'Map',
         'Where to stay', 'Top tips', 'Gallery', 'FAQs', 'Links out', 'Images']
slug = lambda t: 's_' + re.sub(r'[^a-z0-9]+', '_', t.lower()).strip('_')
n = [900]


def bm(mm):
    para = mm.group(0)
    t = ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', para))
    if t in heads:
        n[0] += 1
        para = para.replace('</w:pPr>', '</w:pPr><w:bookmarkStart w:id="%d" w:name="%s"/><w:bookmarkEnd w:id="%d"/>' % (n[0], slug(t), n[0]), 1)
    return para


x = re.sub(r'<w:p\b(?:(?!</w:p>).)*?<w:pStyle w:val="Heading2"/>.*?</w:p>', bm, x, flags=re.S)
labels = {'Hero': 'Hero', 'Intro': 'Intro', 'Quick view': 'Quick view', '1 night': '1 night itinerary',
          '2 nights': '2 night itinerary', 'Rainy day': 'Rainy day alternative', 'Map': 'Map', 'Where to stay': 'Where to stay',
          'Top tips': 'Top tips', 'Gallery': 'Gallery', 'FAQs': 'FAQs', 'Links out': 'Links out', 'Images': 'Images'}


def link(par):
    return re.sub(r'<w:r><w:t xml:space="preserve">([^<]+)</w:t></w:r>',
                  lambda mm: ('<w:hyperlink w:anchor="%s"><w:r><w:rPr><w:color w:val="1155CC"/><w:u w:val="single"/></w:rPr>'
                              '<w:t xml:space="preserve">%s</w:t></w:r></w:hyperlink>' % (slug(labels[mm.group(1)]), mm.group(1)))
                  if mm.group(1) in labels else mm.group(0), par)


for key in ['Contents:', 'Explore the Lakes:']:
    i = x.find(key)
    if i < 0:
        print('missing', key)
        continue
    a = x.rfind('<w:p>', 0, i)
    e = x.find('</w:p>', i)
    x = x[:a] + link(x[a:e]) + x[e:]
open(p, 'w').write(x)
plain = re.sub(r'<[^>]+>', '', x)
if os.path.exists(out):
    os.remove(out)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(u):
        for f in files:
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, u))
print('bookmarks', n[0] - 900, 'links', x.count('w:hyperlink w:anchor'), 'to check left:', 'To check before' in plain,
      'Wainwright:', 'Wainwright' in plain, 'Lonely as a Cloud:', 'Lonely as a Cloud' in plain)
