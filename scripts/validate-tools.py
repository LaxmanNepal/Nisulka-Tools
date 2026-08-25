import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
tools=json.loads((ROOT/'data/tools.json').read_text(encoding='utf-8'))
errors=[]; slugs=set(); urls=set()
for i,t in enumerate(tools,1):
    slug=t.get('slug','')
    for key in ('name','slug','url','category','categorySlug'):
        if not t.get(key): errors.append(f'#{i} {slug or "unknown"}: missing {key}')
    if slug in slugs: errors.append(f'{slug}: duplicate slug')
    slugs.add(slug)
    if t.get('url') in urls: errors.append(f'{slug}: duplicate url')
    urls.add(t.get('url'))
    if t.get('logo') and not str(t['logo']).startswith(('/','http')): errors.append(f'{slug}: invalid logo path')
print(f'Validated {len(tools)} tools.')
if errors:
    print('\n'.join(errors)); raise SystemExit(1)
