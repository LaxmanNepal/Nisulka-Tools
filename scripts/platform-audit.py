import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; errors=[]; warnings=[]
def exists(p):
 if not (ROOT/p).exists(): errors.append(f'Missing required file: {p}'); return False
 return True
for p in ['index.html','search.html','manifest.webmanifest','sw.js','robots.txt','sitemap.xml','data/tools.json']: exists(p)
if (ROOT/'manifest.webmanifest').exists():
 try:
  m=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
  if not m.get('name') or not m.get('short_name'): errors.append('PWA manifest missing name/short_name')
  if not m.get('start_url','').startswith('/Nisulka-Tools/'): errors.append('PWA start_url escapes app scope')
  if not m.get('scope','').startswith('/Nisulka-Tools/'): errors.append('PWA scope is incorrect')
  if not m.get('icons'): errors.append('PWA manifest has no icons')
  for s in m.get('shortcuts',[]):
   if not s.get('url','').startswith('/Nisulka-Tools/'): errors.append(f'PWA shortcut escapes scope: {s.get("url")}')
 except Exception as e: errors.append(f'Invalid manifest JSON: {e}')
if (ROOT/'robots.txt').exists() and 'Sitemap:' not in (ROOT/'robots.txt').read_text(encoding='utf-8'): warnings.append('robots.txt has no Sitemap directive')
if (ROOT/'seo-dashboard.html').exists() and 'noindex' not in (ROOT/'seo-dashboard.html').read_text(encoding='utf-8').lower(): errors.append('SEO dashboard must be noindex')
try:
 tools=json.loads((ROOT/'data/tools.json').read_text(encoding='utf-8'))
 if isinstance(tools,dict) and 'content' in tools: tools=json.loads(tools['content'])
 seen_s=set(); seen_u=set()
 for t in tools:
  slug=str(t.get('slug','')).strip(); url=str(t.get('url','')).strip()
  if not slug: errors.append(f'Tool missing slug: {t.get("name", "unknown")}')
  if slug in seen_s: errors.append(f'Duplicate tool slug: {slug}')
  if url in seen_u: errors.append(f'Duplicate tool URL: {url}')
  seen_s.add(slug); seen_u.add(url)
except Exception as e: errors.append(f'Unable to validate tool catalogue: {e}')
print(f'Platform audit: {len(errors)} errors, {len(warnings)} warnings')
for x in errors: print('ERROR:',x)
for x in warnings: print('WARN:',x)
if errors: sys.exit(1)
