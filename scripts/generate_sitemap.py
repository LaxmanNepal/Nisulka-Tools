import json
from pathlib import Path
from datetime import datetime, timezone

BASE = "https://apps.laxmannepal.com.np/Nisulka-Tools/"
root = Path(__file__).resolve().parents[1]
data = json.loads((root / "data/tools.json").read_text(encoding="utf-8"))
urls = {"": None, "search.html": None}
for tool in data:
    if tool.get("status") == "hidden":
        continue
    url = str(tool.get("url", "")).strip()
    if url.startswith("/Nisulka-Tools/"):
        urls[url[len("/Nisulka-Tools/"):]] = None

now = datetime.now(timezone.utc).date().isoformat()
items = []
for path in sorted(urls):
    loc = BASE + path
    items.append(f"  <url><loc>{loc}</loc><lastmod>{now}</lastmod></url>")

xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(items) + "\n</urlset>\n"
(root / "sitemap.xml").write_text(xml, encoding="utf-8")
print(f"Generated sitemap with {len(items)} URLs")
