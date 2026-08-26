import json
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[1]
base='https://apps.laxmannepal.com.np/Nisulka-Tools/'
tools=json.loads((ROOT/'data/tools.json').read_text(encoding='utf-8'))
items=[(base,'1.0','daily')]
for t in tools:
    if t.get('status')=='hidden' or not t.get('url'): continue
    u=t['url']
    if not u.startswith('http'): u=base.rstrip('/')+'/'+u.lstrip('/')
    items.append((u,'0.8','weekly'))
if (ROOT/'categories').exists():
    for p in sorted((ROOT/'categories').glob('*.html')):
        items.append((f'{base}categories/{p.stem}.html','0.7','weekly'))
seen=set();clean=[]
for u,p,f in items:
    u=u.replace('category.html?category=','categories/')
    if u not in seen:
        seen.add(u);clean.append((u,p,f))
today=datetime.now(timezone.utc).date().isoformat()
xml=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u,p,f in clean:
    xml.append(f'  <url><loc>{escape(u)}</loc><lastmod>{today}</lastmod><changefreq>{f}</changefreq><priority>{p}</priority></url>')
xml.append('</urlset>')
(ROOT/'sitemap.xml').write_text('\n'.join(xml)+'\n',encoding='utf-8')
print(f'Generated canonical sitemap with {len(clean)} URLs.')
