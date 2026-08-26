import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
intel=json.loads((ROOT/'reports/seo-intelligence.json').read_text()); actions=[]
weights={'title':30,'description':25,'keywords':18,'faq':12,'related':10,'content':10,'category':8,'url':6,'logo':3}
reasons={'title':'Create a unique search-intent title','description':'Improve the description to a specific 50–165 character summary','keywords':'Add genuine search-intent keywords','faq':'Add useful questions users actually ask','related':'Add relevant internal links','content':'Expand useful explanatory content','category':'Assign a clear category','url':'Define a stable canonical URL','logo':'Add a recognizable tool logo'}
for t in intel.get('tools',[]):
    for m in t.get('missing',[]):
        impact=weights.get(m,5); priority='critical' if t['score']<50 or impact>=25 else 'high' if impact>=18 else 'medium'
        actions.append({'tool':t['name'],'slug':t['slug'],'score':t['score'],'type':m,'priority':priority,'impact':impact,'reason':reasons.get(m,'Improve this SEO element')})
actions.sort(key=lambda x:(-{'critical':3,'high':2,'medium':1}[x['priority']],-x['impact'],x['score']))
summary={'total_actions':len(actions),'critical':sum(x['priority']=='critical' for x in actions),'high':sum(x['priority']=='high' for x in actions),'medium':sum(x['priority']=='medium' for x in actions),'actions':actions}
(ROOT/'reports/seo-action-plan.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k!='actions'},indent=2))
