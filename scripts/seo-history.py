import json
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]; R=ROOT/'reports'; R.mkdir(exist_ok=True)
def load(n):
 p=R/n
 return json.loads(p.read_text()) if p.exists() else {}
i=load('seo-intelligence.json'); a=load('seo-action-plan.json'); o=load('seo-opportunities.json'); l=load('seo-links.json')
entry={'date':datetime.now(timezone.utc).date().isoformat(),'average_score':i.get('average_score',0),'tools':i.get('tool_count',0),'critical':i.get('critical',0),'high':i.get('high',0),'actions':a.get('total_actions',0),'opportunities':o.get('counts',{}).get('opportunities',0),'cannibalization':o.get('counts',{}).get('cannibalization_risks',0),'broken_links':l.get('broken_count',0),'orphans':l.get('orphan_count',0)}
p=R/'seo-history.json'; history=json.loads(p.read_text()) if p.exists() else []
history=[x for x in history if x.get('date')!=entry['date']]; history.append(entry); history=history[-52:]
p.write_text(json.dumps(history,indent=2)+'\n'); print(json.dumps(entry,indent=2))
