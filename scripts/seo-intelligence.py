import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
tools=json.loads((ROOT/'data/tools.json').read_text(encoding='utf-8'))
def read(path, default):
    if not path.exists(): return default
    x=json.loads(path.read_text(encoding='utf-8'))
    return x.get('overrides',{}) if isinstance(x,dict) else default
seo=read(ROOT/'data/tool-seo.json',{}); faq=read(ROOT/'data/tool-faq.json',{})
scores=[]
for t in tools:
    if t.get('status')=='hidden': continue
    s=t.get('slug',''); meta=seo.get(s,{}) or {}; title=meta.get('title',''); desc=meta.get('description','') or t.get('description',''); checks=[]; score=0
    if title: score+=15; checks.append('title')
    if 35<=len(desc)<=165: score+=15; checks.append('description')
    elif desc: score+=7
    if t.get('category'): score+=10; checks.append('category')
    if t.get('keywords'): score+=10; checks.append('keywords')
    if t.get('url'): score+=10; checks.append('url')
    if s in faq or faq.get('defaults'): score+=10; checks.append('faq')
    if t.get('logo'): score+=5; checks.append('logo')
    if len(t.get('description',''))>=80: score+=10; checks.append('content')
    related=any(x.get('slug')!=s and x.get('status')!='hidden' and x.get('category')==t.get('category') for x in tools)
    if related: score+=10; checks.append('related')
    priority='critical' if score<50 else 'high' if score<70 else 'medium' if score<85 else 'good'
    scores.append({'slug':s,'name':t.get('name',''),'score':score,'priority':priority,'missing':[x for x in ['title','description','category','keywords','url','faq','logo','content','related'] if x not in checks]})
scores.sort(key=lambda x:x['score'])
summary={'tool_count':len(scores),'average_score':round(sum(x['score'] for x in scores)/max(1,len(scores)),1),'critical':sum(x['priority']=='critical' for x in scores),'high':sum(x['priority']=='high' for x in scores),'medium':sum(x['priority']=='medium' for x in scores),'good':sum(x['priority']=='good' for x in scores),'tools':scores}
(ROOT/'reports').mkdir(exist_ok=True);(ROOT/'reports/seo-intelligence.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k!='tools'},indent=2))
