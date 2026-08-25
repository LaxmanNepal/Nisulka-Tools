import json
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
tools=json.loads((ROOT/'data/tools.json').read_text(encoding='utf-8'))
base='https://apps.laxmannepal.com.np/Nisulka-Tools/'
urls=[(base,'1.0','daily')]
for t in tools:
    if t.get('status')=='hidden' or not t.get('url'): continue
    u=t['url']
    if not u.startswith('http'): u=base.rstrip('/')+'/'+u.lstrip('/')
    urls.append((u,'0.8','weekly'))
seen=set(); clean=[]
for u,p,f in urls:
    u=u.replace(' ','%20')
    if u not in seen:
        seen.add(u); clean.append((u,p,f))
today=datetime.now(timezone.utc).date().isoformat()
xml=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u,p,f in clean:
    xml += [f'  <url><loc>{u}</loc><lastmod>{today}</lastmod><changefreq>{f}</changefreq><priority>{p}</priority></url>']
xml.append('</urlset>')
(ROOT/'sitemap.xml').write_text('\n'.join(xml)+'\n',encoding='utf-8')
print(f'Generated sitemap with {len(clean)} URLs.')
