#!/usr/bin/env python3
"""Dependency-free Nisulka Tools architecture, catalog and SEO health validator."""
from __future__ import annotations
import html,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; TOOLS=ROOT/'tools'; DATA=ROOT/'data/tools.json'; REPORT_DIR=ROOT/'reports'; REPORT_DIR.mkdir(exist_ok=True)
def clean(v):
 v=re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>',' ',v,flags=re.I|re.S); return re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',v)).strip()
def tags(src,tag): return [clean(x) for x in re.findall(fr'<{tag}\b[^>]*>(.*?)</{tag}>',src,re.I|re.S)]
def attrs(src,tag,name): return re.findall(fr'<{tag}\b[^>]*\b{name}=["\']([^"\']+)["\']',src,re.I|re.S)
def validate(path):
 src=path.read_text(encoding='utf-8',errors='replace'); rel=path.relative_to(ROOT).as_posix(); errors=[]; warnings=[]
 if '<!doctype html>' not in src.lower(): errors.append('missing HTML5 doctype')
 titles=tags(src,'title'); h1=tags(src,'h1')
 if not titles: errors.append('missing <title>')
 elif not 20<=len(titles[0])<=65: warnings.append(f'title length is {len(titles[0])}; target is 20-65')
 if len(h1)!=1: errors.append(f'expected exactly one H1, found {len(h1)}')
 if not re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'][^"\']{50,170}["\']',src,re.I|re.S): warnings.append('meta description should normally be 50-170 characters')
 if not re.search(r'<meta[^>]+name=["\']robots["\']',src,re.I): warnings.append('missing robots meta')
 if not re.search(r'<link[^>]+rel=["\']canonical["\']',src,re.I): warnings.append('missing canonical')
 if 'site-header-mount' not in src: warnings.append('missing shared header mount')
 if 'site-footer-mount' not in src: warnings.append('missing shared footer mount')
 if 'nisulka-tool-core' not in src and 'nisulka-boot.js' not in src: warnings.append('shared Nisulka core is not referenced')
 if 'innerHTML' in src: warnings.append('uses innerHTML; verify all inserted content is escaped')
 if re.search(r'\beval\s*\(',src): errors.append('uses eval()')
 if re.search(r'http://',src,re.I) and 'localhost' not in src: warnings.append('contains insecure http:// reference')
 if re.search(r'<script[^>]+src=["\']https?://',src,re.I): warnings.append('contains external script dependency')
 return {'file':rel,'errors':errors,'warnings':warnings,'status':'FAIL' if errors else ('WARN' if warnings else 'PASS')}
def catalog_checks():
 errors=[]; warnings=[]
 if not DATA.exists(): return ['data/tools.json is missing'],[]
 try: items=json.loads(DATA.read_text(encoding='utf-8'))
 except Exception as e: return [f'data/tools.json invalid JSON: {e}'],[]
 if not isinstance(items,list): return ['data/tools.json must be an array'],[]
 slugs=[str(x.get('slug','')).lower() for x in items]; urls=[str(x.get('url','')).lower() for x in items]
 for value in sorted({x for x in slugs if x and slugs.count(x)>1}): errors.append(f'duplicate tool slug: {value}')
 for value in sorted({x for x in urls if x and urls.count(x)>1}): warnings.append(f'duplicate tool URL: {value}')
 for i,t in enumerate(items):
  for key in ('name','slug','url','category','status'):
   if not t.get(key): errors.append(f'catalog item {i} missing {key}')
  if t.get('status')=='active' and t.get('url'):
   p=str(t['url']).split('#',1)[0].split('?',1)[0].rstrip('/')
   if p.startswith('/Nisulka-Tools/tools/'):
    target=ROOT/p.removeprefix('/Nisulka-Tools/'); target=target/'index.html'
    if not target.exists(): warnings.append(f'catalog URL has no local page: {t["url"]}')
 return errors,warnings
def main():
 results=[validate(p) for p in sorted(TOOLS.rglob('index.html'))] if TOOLS.exists() else []
 ce,cw=catalog_checks(); failed=sum(x['status']=='FAIL' for x in results)+len(ce); warned=sum(x['status']=='WARN' for x in results)+len(cw); passed=len(results)-sum(x['status']!='PASS' for x in results)
 report={'toolCount':len(results),'passed':passed,'warnings':warned,'failed':failed,'catalogErrors':ce,'catalogWarnings':cw,'results':results}
 (REPORT_DIR/'tool-health.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
 lines=['# Nisulka Tools — Tool Health Report','',f'**Tools:** {len(results)} | **Passed:** {passed} | **Warnings:** {warned} | **Failed:** {failed}','']
 if ce: lines+=['## Catalog errors']+[f'- ❌ {html.escape(x)}' for x in ce]+['']
 if cw: lines+=['## Catalog warnings']+[f'- ⚠️ {html.escape(x)}' for x in cw]+['']
 for r in results:
  lines.append(f"## {r['status']} — `{r['file']}`")
  lines += [f'- ❌ {html.escape(x)}' for x in r['errors']]+[f'- ⚠️ {html.escape(x)}' for x in r['warnings']]
  if not r['errors'] and not r['warnings']: lines.append('- ✅ All architecture checks passed')
  lines.append('')
 (REPORT_DIR/'tool-health.md').write_text('\n'.join(lines),encoding='utf-8'); print(f'Nisulka Tool Health: {passed} passed, {warned} warnings, {failed} failed'); return 1 if failed else 0
if __name__=='__main__': raise SystemExit(main())
