import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; R=ROOT/'reports'
def load(n,d=None):
 p=R/n
 return json.loads(p.read_text()) if p.exists() else (d if d is not None else {})
current=load('seo-intelligence.json',{}); history=load('seo-history.json',[]); previous=history[-2] if len(history)>1 else None
prev_tools=load('seo-intelligence-previous.json',{}).get('tools',[]); prev={x.get('slug'):x for x in prev_tools}; improved=[]; regressed=[]
for x in current.get('tools',[]):
 p=prev.get(x.get('slug'))
 if not p: continue
 d=x.get('score',0)-p.get('score',0)
 if d>=3: improved.append({'slug':x['slug'],'name':x.get('name',''),'from':p.get('score',0),'to':x['score'],'change':d})
 elif d<=-3: regressed.append({'slug':x['slug'],'name':x.get('name',''),'from':p.get('score',0),'to':x['score'],'change':d})
report={'current_score':current.get('average_score',0),'previous_score':previous.get('average_score') if previous else None,'score_change':round(current.get('average_score',0)-(previous.get('average_score',0) if previous else current.get('average_score',0)),1),'improved':sorted(improved,key=lambda x:-x['change']),'regressed':sorted(regressed,key=lambda x:x['change']),'new_tools':[x['slug'] for x in current.get('tools',[]) if x.get('slug') not in prev]}
(R/'seo-change.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n'); (R/'seo-intelligence-previous.json').write_text(json.dumps(current,indent=2,ensure_ascii=False)+'\n'); print(json.dumps({'score_change':report['score_change'],'improved':len(improved),'regressed':len(regressed),'new_tools':len(report['new_tools'])},indent=2))
