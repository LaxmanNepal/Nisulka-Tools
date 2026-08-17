#!/usr/bin/env python3
"""Validate Nisulka Tools pages against the shared architecture contract.

Dependency-free validator intended for GitHub Actions and local use.
It checks structure and metadata without executing browser JavaScript.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
REPORT_DIR = ROOT / "reports"
REPORT_DIR.mkdir(exist_ok=True)

REQUIRED_PATTERNS = {
    "site-header-mount": r'id=["\']site-header-mount["\']',
    "site-footer-mount": r'id=["\']site-footer-mount["\']',
    "header.js": r'(?:\.\./)+assets/js/header\.js',
    "footer.js": r'(?:\.\./)+assets/js/footer\.js',
    "robots": r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'][^"\']*(?:index|follow)',
    "description": r'<meta[^>]+name=["\']description["\']',
    "canonical": r'<link[^>]+rel=["\']canonical["\']',
}


def clean_text(value: str) -> str:
    value = re.sub(r"<script\b[^>]*>.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<style\b[^>]*>.*?</style>", " ", value, flags=re.I | re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value)).strip()


def tag_content(source: str, tag: str) -> list[str]:
    return [clean_text(x) for x in re.findall(fr"<{tag}\b[^>]*>(.*?)</{tag}>", source, re.I | re.S)]


def attr(source: str, tag: str, name: str) -> list[str]:
    pattern = fr"<{tag}\b[^>]*\b{name}=[\"']([^\"']+)[\"']"
    return re.findall(pattern, source, re.I | re.S)


def validate(path: Path) -> dict:
    source = path.read_text(encoding="utf-8", errors="replace")
    rel = path.relative_to(ROOT).as_posix()
    errors: list[str] = []
    warnings: list[str] = []

    if "<!doctype html>" not in source.lower():
        errors.append("missing HTML5 doctype")

    for name, pattern in REQUIRED_PATTERNS.items():
        if not re.search(pattern, source, re.I | re.S):
            errors.append(f"missing required {name}")

    titles = tag_content(source, "title")
    if not titles:
        errors.append("missing <title>")
    elif not 20 <= len(titles[0]) <= 65:
        warnings.append(f"title length is {len(titles[0])}; target is 20-65 characters")

    h1 = tag_content(source, "h1")
    if len(h1) != 1:
        errors.append(f"expected exactly one H1, found {len(h1)}")

    descriptions = attr(source, "meta", "content")
    # The name/content pairing is checked separately to keep this dependency-free.
    if not re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'][^"\']{50,170}["\']', source, re.I | re.S):
        warnings.append("meta description should normally be 50-170 characters")

    if "innerHTML" in source:
        warnings.append("contains innerHTML; verify that untrusted input is never inserted unsafely")
    if re.search(r"\beval\s*\(", source):
        errors.append("uses eval(), which is prohibited by the project specification")

    for script_src in attr(source, "script", "src"):
        if script_src.startswith("http://") or script_src.startswith("https://"):
            if "header.js" not in script_src and "footer.js" not in script_src:
                warnings.append(f"external script dependency: {script_src}")

    # Check local links that clearly point at tool pages. Missing targets are errors.
    for href in attr(source, "a", "href"):
        if href.startswith(("#", "mailto:", "tel:", "http://", "https://", "javascript:")):
            continue
        clean = href.split("#", 1)[0].split("?", 1)[0]
        target = (path.parent / clean).resolve()
        if clean.endswith("/"):
            target = target / "index.html"
        if not target.exists():
            warnings.append(f"local link target not found: {href}")

    slug = path.parent.name
    expected_prefix = f"/Nisulka-Tools/tools/{slug}/"
    canonicals = attr(source, "link", "href")
    if canonicals and not canonicals[0].endswith(expected_prefix):
        warnings.append(f"canonical does not end with expected path {expected_prefix}")

    return {
        "file": rel,
        "slug": slug,
        "errors": errors,
        "warnings": warnings,
        "status": "FAIL" if errors else ("WARN" if warnings else "PASS"),
    }


def main() -> int:
    files = sorted(TOOLS.glob("*/index.html")) if TOOLS.exists() else []
    results = [validate(p) for p in files]
    failed = sum(r["status"] == "FAIL" for r in results)
    warned = sum(r["status"] == "WARN" for r in results)

    report = {
        "toolCount": len(results),
        "failed": failed,
        "warnings": warned,
        "passed": len(results) - failed - warned,
        "results": results,
    }
    (REPORT_DIR / "tool-health.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    lines = ["# Nisulka Tools — Tool Health Report", "", f"**Tools:** {len(results)}  |  **Passed:** {report['passed']}  |  **Warnings:** {warned}  |  **Failed:** {failed}", ""]
    for r in results:
        lines.append(f"## {r['status']} — `{r['file']}`")
        for item in r["errors"]:
            lines.append(f"- ❌ {html.escape(item)}")
        for item in r["warnings"]:
            lines.append(f"- ⚠️ {html.escape(item)}")
        if not r["errors"] and not r["warnings"]:
            lines.append("- ✅ Architecture and metadata checks passed")
        lines.append("")
    (REPORT_DIR / "tool-health.md").write_text("\n".join(lines), encoding="utf-8")

    print(f"Nisulka Tool Health: {report['passed']} passed, {warned} warnings, {failed} failed")
    for r in results:
        if r["status"] != "PASS":
            print(f"{r['status']}: {r['file']}")
            for item in r["errors"] + r["warnings"]:
                print(f"  - {item}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
