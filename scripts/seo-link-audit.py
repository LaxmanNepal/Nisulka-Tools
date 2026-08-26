import json,re
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
BASE='/Nisulka-Tools/'
tools=json.loads((ROOT/'data/tools.json').read_text(encoding='utf-8'))
html_files=list(ROOT.rglob('*.html'))
known={p.relative_to(ROOT).as_posix() for p in html_files}
links={};broken=[];external=[]
for p in html_files:
    if '.git' in p.parts or 'node_modules' in p.parts: continue
    text=p.read_text(encoding='utf-8',errors='ignore')
    found=re.findall(r'<a\b[^>]*?href=[\"\']([^\"\']+)',text,re.I)
    links[p.relative_to(ROOT).as_posix()]=[]
    for href in found:
        if href.startswith(('#','mailto:','tel:','javascript:')): continue
        if href.startswith(('http://','https://')):
            if 'apps.laxmannepal.com.np/Nisulka-Tools/' not in href:
                external.append({'from':str(p.relative_to(ROOT)),'url':href})
                continue
            href=urlparse(href).path
        if href.startswith(BASE): href=href[len(BASE):]
        clean=href.split('?',1)[0].split('#',1)[0].lstrip('/')
        target=(ROOT/clean) if clean else ROOT/'index.html'
        if clean.endswith('/'):
            target=target/'index.html'
        if clean and not target.exists() and not href.endswith('/'):
            broken.append({'from':str(p.relative_to(ROOT)),'url':href})
        links[p.relative_to(ROOT).as_posix()].append(clean)
inbound={}
for hs in links.values():
    for h in hs:
        if h: inbound[h]=inbound.get(h,0)+1
orphans=[]
for rel in known:
    if rel in {'index.html','404.html','offline.html','category.html'} or rel.startswith(('categories/','assets/')): continue
    if rel.startswith('tools/') and rel.endswith('index.html') and inbound.get(rel,0)==0:
        orphans.append(rel)
report={'html_pages':len(html_files),'broken_links':broken,'broken_count':len(broken),'orphan_tool_pages':sorted(orphans),'orphan_count':len(orphans),'external_links':external}
(ROOT/'reports').mkdir(exist_ok=True)
(ROOT/'reports/seo-links.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
if broken: raise SystemExit(1)
