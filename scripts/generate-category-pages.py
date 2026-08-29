import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'https://apps.laxmannepal.com.np/Nisulka-Tools/'

def read_tools():
    raw = json.loads((ROOT / 'data' / 'tools.json').read_text(encoding='utf-8'))
    return json.loads(raw['content']) if isinstance(raw, dict) and 'content' in raw else raw

def slugify(value):
    return re.sub(r'[^a-z0-9]+', '-', str(value).lower()).strip('-') or 'other-tools'

def category_key(tool):
    return tool.get('categorySlug') or slugify(tool.get('category') or 'Other Tools')

def tool_url(url):
    if not url:
        return '#'
    return url if str(url).startswith(('http://', 'https://', '/')) else '/' + str(url).lstrip('/')

def page(category, slug, tools):
    title = f'{category} — Free Online Tools | Nisulka Tools'
    description = f'Explore {len(tools)} free {category.lower()} tools from Nisulka Tools. Fast browser-based utilities for everyday digital work.'
    canonical = f'{BASE}categories/{slug}.html'
    cards = []
    items = []
    for i, t in enumerate(tools, 1):
        name = html.escape(str(t.get('name') or 'Tool'))
        href = html.escape(tool_url(t.get('url')), quote=True)
        logo = t.get('logo')
        logo_html = f'<img class="tool-card-logo" src="{html.escape(str(logo), quote=True)}" alt="" loading="lazy" decoding="async" width="72" height="72">' if logo else '<span class="tool-card-logo-fallback" aria-hidden="true">✦</span>'
        desc = html.escape(str(t.get('description') or 'Free online tool.'))
        cards.append(f'<article class="tool-card category-tool-card"><a class="tool-card-link" href="{href}"><div class="tool-card-icon-wrapper">{logo_html}</div><div class="tool-card-content"><h2 class="tool-card-title">{name}</h2><p class="tool-card-description">{desc}</p></div></a></article>')
        raw_url = str(t.get('url') or '')
        absolute = raw_url if raw_url.startswith(('http://','https://')) else BASE.rstrip('/') + '/' + raw_url.lstrip('/')
        items.append({'@type':'ListItem','position':i,'name':str(t.get('name') or 'Tool'),'url':absolute})
    schema = json.dumps({'@context':'https://schema.org','@type':'CollectionPage','name':title,'description':description,'url':canonical,'mainEntity':{'@type':'ItemList','numberOfItems':len(tools),'itemListElement':items}}, ensure_ascii=False).replace('</','<\\/')
    return f'''<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(title)}</title><meta name="description" content="{html.escape(description, quote=True)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{canonical}">
<meta property="og:type" content="website"><meta property="og:title" content="{html.escape(title, quote=True)}"><meta property="og:description" content="{html.escape(description, quote=True)}"><meta property="og:url" content="{canonical}">
<link rel="stylesheet" href="../assets/css/variables.css"><link rel="stylesheet" href="../assets/css/global.css"><link rel="stylesheet" href="../assets/css/components.css"><link rel="stylesheet" href="../assets/css/home.css"><link rel="stylesheet" href="../assets/css/home-enhancements.css"><link rel="stylesheet" href="../assets/css/tool-intelligence.css"><link rel="stylesheet" href="../assets/css/seo-page.css"><script type="application/ld+json">{schema}</script></head>
<body><div id="site-header-mount"></div><main>
<section class="home-hero"><div class="home-container"><span class="hero-eyebrow">NISULKA TOOLS</span><h1>{html.escape(category)}</h1><p>{html.escape(description)}</p></div></section>
<section class="tools-section"><div class="home-container"><nav aria-label="Breadcrumb" class="category-breadcrumb"><a href="../">Nisulka Tools</a><span aria-hidden="true">›</span><span>{html.escape(category)}</span></nav><div id="category-tools" class="tools-grid">{''.join(cards)}</div></div></section>
<section class="tool-intelligence-section"><div class="home-container"><span class="section-label">CATEGORY GUIDE</span><h2>Best free {html.escape(category)} tools</h2><p>Browse the Nisulka Tools {html.escape(category.lower())} collection. Each tool is focused on a specific task and designed to work directly in your browser.</p></div></section>
</main><div id="site-footer-mount"></div><script src="../assets/js/nisulka-tool-core.js"></script><script src="../assets/js/header.js"></script><script src="../assets/js/footer.js"></script></body></html>'''

tools = [t for t in read_tools() if t.get('status') != 'hidden']
groups = {}
for t in tools:
    slug = category_key(t)
    groups.setdefault(slug, {'name': t.get('category') or 'Other Tools', 'tools': []})['tools'].append(t)
out = ROOT / 'categories'
out.mkdir(exist_ok=True)
for slug, group in groups.items():
    (out / f'{slug}.html').write_text(page(group['name'], slug, group['tools']), encoding='utf-8')
print(f'Generated {len(groups)} standalone category pages with only their related tools.')
