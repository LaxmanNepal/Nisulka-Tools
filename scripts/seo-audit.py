import json,re
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
tools=json.loads((ROOT/'data/tools.json').read_text())
issues=[];seen=set()
for t in tools:
    s=t.get('slug','');u=t.get('url','')
    if s in seen: issues.append(f'duplicate slug: {s}')
    seen.add(s)
    if not t.get('name'): issues.append(f'{s}: missing name')
    if not t.get('description') or len(t.get('description',''))<50: issues.append(f'{s}: weak description')
    if not t.get('category'): issues.append(f'{s}: missing category')
    if not t.get('keywords'): issues.append(f'{s}: missing keywords')
    if not u: issues.append(f'{s}: missing URL')
for p in ROOT.rglob('*.html'):
    if '.git' in p.parts or 'node_modules' in p.parts: continue
    text=p.read_text(errors='ignore')
    if '<title' not in text.lower(): issues.append(f'{p.relative_to(ROOT)}: missing title')
    if 'rel="canonical"' not in text and "rel='canonical'" not in text: issues.append(f'{p.relative_to(ROOT)}: missing canonical')
    if 'meta name="description"' not in text and "meta name='description'" not in text: issues.append(f'{p.relative_to(ROOT)}: missing description')
report={'tools':len(tools),'issues':issues,'issue_count':len(issues),'status':'pass' if not issues else 'review'}
(ROOT/'reports').mkdir(exist_ok=True);(ROOT/'reports/seo-audit.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if any(x.startswith('duplicate') or 'missing URL' in x for x in issues): raise SystemExit(1)
