import json, pathlib
root=pathlib.Path(__file__).resolve().parents[1]
def read_json(name):
    x=json.loads((root/'data'/name).read_text())
    return json.loads(x['content']) if isinstance(x,dict) and 'content' in x else x
tools=read_json('tools.json');seo=read_json('tool-seo.json');faq=read_json('tool-faq.json')
report={'tool_count':len(tools),'missing_seo':[],'missing_faq':[],'missing_keywords':[],'duplicate_slugs':[],'duplicate_urls':[]}
slugs=set();urls=set()
for t in tools:
 s=str(t.get('slug',''));u=str(t.get('url',''))
 if s in slugs:report['duplicate_slugs'].append(s)
 if u in urls:report['duplicate_urls'].append(u)
 slugs.add(s);urls.add(u)
 if s not in seo.get('overrides',{}):report['missing_seo'].append(s)
 if not faq.get('overrides',{}).get(s) and not faq.get('defaults'):report['missing_faq'].append(s)
 if not t.get('keywords'):report['missing_keywords'].append(s)
report['seo_coverage']=round(100*(len(tools)-len(report['missing_seo']))/max(len(tools),1),1)
report['faq_coverage']=round(100*(len(tools)-len(report['missing_faq']))/max(len(tools),1),1)
(root/'reports').mkdir(exist_ok=True);(root/'reports/seo-coverage.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if report['duplicate_slugs'] or report['duplicate_urls']:raise SystemExit(1)
