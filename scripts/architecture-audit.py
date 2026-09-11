#!/usr/bin/env python3
"""Nisulka Tools V2 architecture audit.

Read-only audit that maps repository files, discoverable tools, categories and
assets; validates registry integrity; checks local references; and reports
orphans and duplicate/near-duplicate content without changing product UI.
"""
from __future__ import annotations

import hashlib
import html
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
TOOLS_ROOT = ROOT / "tools"
DATA_ROOT = ROOT / "data"
REPORT_ROOT = ROOT / "reports"
REPORT_ROOT.mkdir(exist_ok=True)
BASE_PREFIX = "/Nisulka-Tools/"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(value).lower()).strip("-")


def tokens(value: str) -> set[str]:
    stop = {"the", "to", "and", "online", "free", "generator", "tool"}
    return {x for x in re.split(r"[^a-z0-9]+", str(value).lower()) if x and x not in stop}


def resolve_local_ref(source: Path, raw: str) -> Path | None:
    raw = html.unescape(raw.strip())
    if not raw or raw.startswith(("#", "data:", "mailto:", "tel:", "javascript:", "http://", "https://", "//")):
        return None
    clean = urlsplit(raw).path
    if clean.startswith(BASE_PREFIX):
        return ROOT / clean[len(BASE_PREFIX):].lstrip("/")
    if clean.startswith("/"):
        return None
    return (source.parent / clean).resolve()


def file_inventory():
    files = [p for p in ROOT.rglob("*") if p.is_file() and ".git" not in p.parts]
    return files, dict(sorted(Counter((p.suffix.lower() or "[no extension]") for p in files).items()))


def is_tool_entry(index: Path) -> bool:
    parts = index.relative_to(TOOLS_ROOT).parts
    # Supported tool layouts are tools/<slug>/index.html and
    # tools/<category>/<slug>/index.html. Ignore nested asset indexes.
    return len(parts) in (2, 3)


def tool_inventory():
    tools = []
    for index in sorted(p for p in TOOLS_ROOT.rglob("index.html") if is_tool_entry(p)):
        tool_dir = index.parent
        assets = [p.relative_to(ROOT).as_posix() for p in tool_dir.rglob("*") if p.is_file()]
        content = index.read_text(encoding="utf-8", errors="replace")
        title = re.search(r"<title[^>]*>(.*?)</title>", content, re.I | re.S)
        tools.append({
            "folder": tool_dir.relative_to(ROOT).as_posix(),
            "index": index.relative_to(ROOT).as_posix(),
            "nameHint": re.sub(r"\s+", " ", html.unescape(title.group(1)).strip()) if title else tool_dir.name,
            "assetCount": len(assets),
            "assets": assets,
            "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
        })
    return tools


def local_reference_audit(files: list[Path]):
    broken, checked = [], 0
    attr_re = re.compile(r"(?:src|href)\s*=\s*['\"]([^'\"]+)['\"]", re.I)
    for path in files:
        if path.suffix.lower() not in {".html", ".css", ".js", ".mjs", ".webmanifest", ".xml"}:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for raw in attr_re.findall(text):
            target = resolve_local_ref(path, raw)
            if target is None:
                continue
            checked += 1
            if not target.exists():
                broken.append({
                    "source": path.relative_to(ROOT).as_posix(),
                    "reference": raw,
                    "resolved": target.relative_to(ROOT).as_posix() if target.is_relative_to(ROOT) else str(target),
                })
    return {"checked": checked, "broken": broken}


def duplicate_assets(files: list[Path]):
    buckets = defaultdict(list)
    for path in files:
        if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".css", ".js", ".mjs", ".json"}:
            try:
                digest = hashlib.sha256(path.read_bytes()).hexdigest()
            except OSError:
                continue
            buckets[digest].append(path.relative_to(ROOT).as_posix())
    return [paths for paths in buckets.values() if len(paths) > 1]


def main() -> int:
    tools_catalog = load_json(DATA_ROOT / "tools.json")
    categories_catalog = load_json(DATA_ROOT / "categories.json")
    if not isinstance(tools_catalog, list) or not isinstance(categories_catalog, list):
        raise SystemExit("Catalog files must contain arrays")

    active = [t for t in tools_catalog if t.get("status") != "hidden"]
    tool_dirs = tool_inventory()
    catalog_paths = {str(t.get("path", "")).strip("/") for t in active}
    errors, warnings = [], []

    for field in ("slug", "url", "path"):
        for value, count in Counter(str(t.get(field, "")).lower() for t in active).items():
            if value and count > 1:
                errors.append(f"duplicate catalog {field}: {value}")

    for t in active:
        path = str(t.get("path", "")).strip("/")
        target = TOOLS_ROOT / path / "index.html"
        if not target.exists():
            errors.append(f"catalog tool has no index.html: {t.get('slug')} -> {target.relative_to(ROOT)}")
        logo = str(t.get("logo", "")).strip()
        if logo:
            logo_path = resolve_local_ref(ROOT / "index.html", logo)
            if logo_path is not None and not logo_path.exists():
                warnings.append(f"catalog logo missing: {t.get('slug')} -> {logo}")

    orphans = []
    for item in tool_dirs:
        folder = item["folder"].removeprefix("tools/")
        if folder not in catalog_paths:
            orphans.append(folder)
            warnings.append(f"filesystem tool not in catalog: {folder}")

    category_by_slug = {str(c.get("slug")): c for c in categories_catalog}
    expected = defaultdict(list)
    for t in active:
        slug = str(t.get("categorySlug") or norm(t.get("category")))
        expected[slug].append(str(t.get("slug")))
        if slug not in category_by_slug:
            errors.append(f"tool references missing category: {t.get('slug')} -> {slug}")
    for slug, category in category_by_slug.items():
        actual = [str(x) for x in category.get("tools", [])]
        wanted = sorted(expected.get(slug, []), key=str.lower)
        if sorted(actual, key=str.lower) != wanted:
            errors.append(f"category membership drift: {slug} catalog={wanted} data={sorted(actual, key=str.lower)}")
        if int(category.get("toolCount", -1)) != len(wanted):
            errors.append(f"category count drift: {slug} count={category.get('toolCount')} expected={len(wanted)}")

    duplicate_candidates = []
    for i, a in enumerate(active):
        at = tokens(a.get("name", ""))
        for b in active[i + 1:]:
            bt = tokens(b.get("name", ""))
            union = at | bt
            overlap = len(at & bt) / len(union) if union else 0
            if overlap >= 0.6:
                duplicate_candidates.append({"a": a.get("slug"), "b": b.get("slug"), "tokenOverlap": round(overlap, 2)})
                warnings.append(f"potential duplicate tools: {a.get('name')} / {b.get('name')}")

    files, extensions = file_inventory()
    refs = local_reference_audit(files)
    for item in refs["broken"]:
        errors.append(f"broken local reference: {item['source']} -> {item['reference']}")

    identical_assets = duplicate_assets(files)
    for paths in identical_assets:
        warnings.append("identical asset files: " + " ↔ ".join(paths))

    generated_category_issues = []
    categories_root = ROOT / "categories"
    if categories_root.exists():
        for slug in category_by_slug:
            expected_page = categories_root / slug / "index.html"
            if not expected_page.exists():
                generated_category_issues.append(slug)
                warnings.append(f"category page not generated yet: categories/{slug}/")

    report = {
        "schemaVersion": 2,
        "repository": "LaxmanNepal/Nisulka-Tools",
        "summary": {
            "catalogTools": len(active), "filesystemTools": len(tool_dirs), "categories": len(category_by_slug),
            "orphanToolFolders": len(orphans), "potentialDuplicatePairs": len(duplicate_candidates),
            "identicalAssetGroups": len(identical_assets), "files": len(files),
            "brokenLocalReferences": len(refs["broken"]), "errors": len(errors), "warnings": len(warnings)
        },
        "categories": categories_catalog, "tools": tool_dirs, "orphans": sorted(orphans),
        "potentialDuplicates": duplicate_candidates, "identicalAssets": identical_assets,
        "brokenReferences": refs["broken"], "generatedCategoryIssues": sorted(generated_category_issues),
        "fileExtensions": extensions, "errors": errors, "warnings": warnings
    }
    (REPORT_ROOT / "architecture-audit.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Nisulka Tools — V2 Architecture Audit", "",
        f"**Catalog tools:** {len(active)}  |  **Filesystem tools:** {len(tool_dirs)}  |  **Categories:** {len(category_by_slug)}",
        f"**Files:** {len(files)}  |  **Broken local references:** {len(refs['broken'])}  |  **Errors:** {len(errors)}  |  **Warnings:** {len(warnings)}", "",
        "## Architecture map", "", "| Area | Count |", "|---|---:|",
        f"| Catalog tools | {len(active)} |", f"| Filesystem tool entry points | {len(tool_dirs)} |",
        f"| Categories | {len(category_by_slug)} |", f"| Orphan tool folders | {len(orphans)} |",
        f"| Potential duplicate pairs | {len(duplicate_candidates)} |", f"| Identical asset groups | {len(identical_assets)} |",
        f"| Files | {len(files)} |", "", "## Errors"
    ]
    lines += [f"- ❌ {x}" for x in errors] or ["- ✅ None"]
    lines += ["", "## Warnings"] + ([f"- ⚠️ {x}" for x in warnings] or ["- ✅ None"])
    lines += ["", "## Orphan tool folders"] + ([f"- `{x}`" for x in sorted(orphans)] or ["- None"])
    lines += ["", "## Potential duplicate tools"] + ([f"- `{x['a']}` ↔ `{x['b']}` ({x['tokenOverlap']:.0%} token overlap)" for x in duplicate_candidates] or ["- None"])
    lines += ["", "## Identical assets"] + ([f"- {' ↔ '.join(paths)}" for paths in identical_assets] or ["- None"])
    lines += ["", "## Extension inventory"] + [f"- `{k}`: {v}" for k, v in extensions.items()]
    (REPORT_ROOT / "architecture-audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"V2 Architecture Audit: {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
