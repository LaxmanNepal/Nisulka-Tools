import json,re
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
tools=json.loads((ROOT/'data/tools.json').read_text(encoding='utf-8'))
active=[t for t in tools if t.get('status')!='hidden']
def tokens(t):
 s=' '.join([t.get('name',''),t.get('description',''),' '.join(t.get('keywords',[]) or []),t.get('category','')]).lower()
 return set(re.findall(r'[a-z0-9]{3,}',s))
tok={t.get('slug',''):tokens(t) for t in active}; opps=[]; links=[]; cann=[]
for t in active:
 s=t.get('slug',''); score=0; reasons=[]
 if len(t.get('description',''))<80: score+=22; reasons.append('thin description')
 if not t.get('keywords'): score+=20; reasons.append('missing keywords')
 peers=[]
 for o in active:
  if o.get('slug')==s: continue
  overlap=len(tok[s]&tok.get(o.get('slug',''),set()))
  if overlap>=3: peers.append((overlap,o))
 for overlap,o in sorted(peers,reverse=True)[:5]: links.append({'from':s,'to':o.get('slug'),'strength':min(100,overlap*15)})
 if not peers: score+=12; reasons.append('few semantic neighbours')
 if not t.get('category'): score+=10; reasons.append('missing category')
 opportunity=min(100,score+max(0,20-len(peers)*2))
 if opportunity>=30: opps.append({'slug':s,'name':t.get('name',''),'opportunity':opportunity,'reasons':reasons})
for i,a in enumerate(active):
 for b in active[i+1:]:
  ta,tb=tok.get(a.get('slug',''),set()),tok.get(b.get('slug',''),set()); union=ta|tb; ratio=len(ta&tb)/len(union) if union else 0
  if ratio>=0.55 and a.get('category')==b.get('category'):
   cann.append({'a':a.get('slug'),'b':b.get('slug'),'similarity':round(ratio*100,1),'reason':'high semantic overlap in the same category'})
by_from=defaultdict(list)
for x in links: by_from[x['from']].append(x)
for s in by_from: by_from[s]=sorted(by_from[s],key=lambda x:-x['strength'])[:4]
report={'opportunities':sorted(opps,key=lambda x:-x['opportunity']),'internal_link_opportunities':dict(by_from),'cannibalization_risks':cann,'counts':{'opportunities':len(opps),'link_targets':len(links),'cannibalization_risks':len(cann)}}
(ROOT/'reports').mkdir(exist_ok=True);(ROOT/'reports/seo-opportunities.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8'); print(json.dumps(report['counts'],indent=2))
