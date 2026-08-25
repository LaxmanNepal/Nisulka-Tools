#!/usr/bin/env python3
"""Dependency-free Nisulka Tools architecture/SEO health validator."""
from __future__ import annotations
import html, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; TOOLS=ROOT/'tools'; REPORT_DIR=ROOT/'reports'; REPORT_DIR.mkdir(exist_ok=True)

def clean(v):
    v=re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>',' ',v,flags=re.I|re.S)
    return re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',v)).strip()

def tags(src,tag): return [clean(x) for x in re.findall(fr'<{tag}\b[^>]*>(.*?)</{tag}>',src,re.I|re.S)]
def attrs(src,tag,name): return re.findall(fr'<{tag}\b[^>]*\b{name}=["\']([^"\']+)["\']',src,re.I|re.S)

def validate(path):
    src=path.read_text(encoding='utf-8',errors='replace'); rel=path.relative_to(ROOT).as_posix(); errors=[]; warnings=[]
    if '<!doctype html>' not in src.lower(): errors.append('missing HTML5 doctype')
    if not tags(src,'title'): errors.append('missing <title>')
    else:
        n=len(tags(src,'title')[0]);
        if not 20<=n<=65: warnings.append(f'title length is {n}; target is 20-65')
    if len(tags(src,'h1'))!=1: errors.append(f'expected exactly one H1, found {len(tags(src,"h1"))}')
    if not re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'][^"\']{50,170}["\']',src,re.I|re.S): warnings.append('meta description should normally be 50-170 characters')
    if not re.search(r'<meta[^>]+name=["\']robots["\']',src,re.I): warnings.append('missing robots meta')
    if not re.search(r'<link[^>]+rel=["\']canonical["\']',src,re.I): warnings.append('missing canonical')
    if 'innerHTML' in src: warnings.append('uses innerHTML; verify all inserted content is escaped')
    if re.search(r'\beval\s*\(',src): errors.append('uses eval()')
    if 'site-header-mount' not in src: warnings.append('missing shared header mount')
    if 'site-footer-mount' not in src: warnings.append('missing shared footer mount')
    if 'nisulka-tool-core' not in src and 'nisulka-boot.js' not in src: warnings.append('shared Nisulka core is not referenced')
    if 'http://' in src and 'localhost' not in src: warnings.append('contains insecure http:// reference')
    if re.search(r'<script[^>]+src=["\']https?://',src,re.I): warnings.append('contains external script dependency')
    return {'file':rel,'errors':errors,'warnings':warnings,'status':'FAIL' if errors else ('WARN' if warnings else 'PASS')}

def main():
    files=sorted(TOOLS.rglob('index.html')) if TOOLS.exists() else []
    results=[validate(p) for p in files]; failed=sum(x['status']=='FAIL' for x in results); warned=sum(x['status']=='WARN' for x in results); passed=len(results)-failed-warned
    report={'toolCount':len(results),'passed':passed,'warnings':warned,'failed':failed,'results':results}
    (REPORT_DIR/'tool-health.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    lines=['# Nisulka Tools — Tool Health Report','',f"**Tools:** {len(results)} | **Passed:** {passed} | **Warnings:** {warned} | **Failed:** {failed}",'']
    for r in results:
        lines.append(f"## {r['status']} — `{r['file']}`")
        for x in r['errors']: lines.append(f'- ❌ {html.escape(x)}')
        for x in r['warnings']: lines.append(f'- ⚠️ {html.escape(x)}')
        if not r['errors'] and not r['warnings']: lines.append('- ✅ All architecture checks passed')
        lines.append('')
    (REPORT_DIR/'tool-health.md').write_text('\n'.join(lines),encoding='utf-8')
    print(f'Nisulka Tool Health: {passed} passed, {warned} warnings, {failed} failed')
    return 1 if failed else 0
if __name__=='__main__': raise SystemExit(main())
