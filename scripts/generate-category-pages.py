import json, pathlib, re
root=pathlib.Path(__file__).resolve().parents[1]
def read(name):
 x=json.loads((root/'data'/name).read_text());return json.loads(x['content']) if isinstance(x,dict) and 'content' in x else x
tools=read('tools.json');cats={}
for t in tools:
 if t.get('status')=='hidden':continue
 name=t.get('category') or 'Other Tools';slug=t.get('categorySlug') or re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-');cats[slug]=name
out=root/'categories';out.mkdir(exist_ok=True)
for slug,name in cats.items():
 html='''<!doctype html><html><head><meta http-equiv="refresh" content="0; url=../category.html?category='''+slug+'''"><link rel="canonical" href="https://apps.laxmannepal.com.np/Nisulka-Tools/category.html?category='''+slug+'''"></head><body><a href="../category.html?category='''+slug+'''">Open '''+name+''' tools</a></body></html>'''
 (out/(slug+'.html')).write_text(html)
print(f'Generated {len(cats)} category entry pages')
