#!/usr/bin/env python3

import os
import re
import json
import html
from pathlib import Path
from urllib.parse import urlparse


# ============================================================
# CONFIGURATION
# ============================================================

TOOLS_DIR = Path("tools")
REPORT_DIR = Path("seo/reports")

SITE_URL = "https://apps.laxmannepal.com.np/Nisulka-Tools"

REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# SCORING
# ============================================================

MAX_SCORE = 100


def status_for_score(score):

    if score >= 90:
        return "🟢 Excellent"

    if score >= 80:
        return "🟢 Good"

    if score >= 70:
        return "🟡 Needs improvement"

    if score >= 60:
        return "🟠 Weak"

    return "🔴 Poor"


# ============================================================
# HTML HELPERS
# ============================================================

def get_title(content):

    match = re.search(
        r"<title[^>]*>(.*?)</title>",
        content,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return ""

    return clean_text(match.group(1))


def get_meta(content, name=None, property_name=None):

    pattern = r"<meta\b[^>]*>"

    for tag in re.findall(
        pattern,
        content,
        re.IGNORECASE
    ):

        if name:

            name_match = re.search(
                r'name=["\']([^"\']+)["\']',
                tag,
                re.IGNORECASE
            )

            if not name_match:
                continue

            if name_match.group(1).lower() != name.lower():
                continue

        if property_name:

            property_match = re.search(
                r'property=["\']([^"\']+)["\']',
                tag,
                re.IGNORECASE
            )

            if not property_match:
                continue

            if property_match.group(1).lower() != property_name.lower():
                continue

        content_match = re.search(
            r'content=["\'](.*?)["\']',
            tag,
            re.IGNORECASE | re.DOTALL
        )

        if content_match:
            return clean_text(content_match.group(1))

    return ""


def get_canonical(content):

    match = re.search(
        r'<link\b[^>]*rel=["\']canonical["\'][^>]*>',
        content,
        re.IGNORECASE
    )

    if not match:
        return ""

    tag = match.group(0)

    href = re.search(
        r'href=["\'](.*?)["\']',
        tag,
        re.IGNORECASE | re.DOTALL
    )

    if not href:
        return ""

    return href.group(1).strip()


def get_headings(content):

    headings = {}

    for level in range(1, 7):

        matches = re.findall(
            rf"<h{level}[^>]*>(.*?)</h{level}>",
            content,
            re.IGNORECASE | re.DOTALL
        )

        headings[level] = [
            clean_text(x)
            for x in matches
            if clean_text(x)
        ]

    return headings


def get_body_text(content):

    body_match = re.search(
        r"<body[^>]*>(.*?)</body>",
        content,
        re.IGNORECASE | re.DOTALL
    )

    if not body_match:
        return ""

    body = body_match.group(1)

    # Remove scripts/styles
    body = re.sub(
        r"<script\b.*?</script>",
        " ",
        body,
        flags=re.IGNORECASE | re.DOTALL
    )

    body = re.sub(
        r"<style\b.*?</style>",
        " ",
        body,
        flags=re.IGNORECASE | re.DOTALL
    )

    body = re.sub(
        r"<noscript\b.*?</noscript>",
        " ",
        body,
        flags=re.IGNORECASE | re.DOTALL
    )

    body = re.sub(
        r"<[^>]+>",
        " ",
        body
    )

    return clean_text(
        html.unescape(body)
    )


def clean_text(value):

    value = html.unescape(value)

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


def count_words(text):

    if not text:
        return 0

    return len(
        re.findall(
            r"\b[\w'-]+\b",
            text
        )
    )


# ============================================================
# CHECKS
# ============================================================

def add_check(checks, name, passed, points, message):

    checks.append({
        "name": name,
        "passed": passed,
        "points": points,
        "message": message
    })


def audit_tool(tool_dir):

    index_file = tool_dir / "index.html"

    slug = tool_dir.name

    result = {
        "slug": slug,
        "path": str(index_file),
        "score": 0,
        "status": "",
        "checks": [],
        "warnings": [],
        "errors": [],
        "recommendations": []
    }

    if not index_file.exists():

        result["errors"].append(
            "index.html is missing."
        )

        result["status"] = "🔴 Poor"

        return result

    content = index_file.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    title = get_title(content)

    description = get_meta(
        content,
        name="description"
    )

    canonical = get_canonical(content)

    viewport = get_meta(
        content,
        name="viewport"
    )

    robots = get_meta(
        content,
        name="robots"
    )

    og_title = get_meta(
        content,
        property_name="og:title"
    )

    og_description = get_meta(
        content,
        property_name="og:description"
    )

    og_url = get_meta(
        content,
        property_name="og:url"
    )

    headings = get_headings(content)

    body_text = get_body_text(content)

    word_count = count_words(body_text)

    # ========================================================
    # TITLE
    # ========================================================

    if not title:

        add_check(
            result["checks"],
            "Title",
            False,
            10,
            "Missing <title>."
        )

        result["errors"].append(
            "Missing page title."
        )

    else:

        length = len(title)

        if 30 <= length <= 65:

            add_check(
                result["checks"],
                "Title",
                True,
                10,
                f"Good title length ({length} characters)."
            )

        elif length < 30:

            add_check(
                result["checks"],
                "Title",
                False,
                5,
                f"Title is too short ({length} characters)."
            )

            result["recommendations"].append(
                "Make the title more descriptive."
            )

        else:

            add_check(
                result["checks"],
                "Title",
                False,
                5,
                f"Title is long ({length} characters)."
            )

            result["recommendations"].append(
                "Shorten the title to approximately 30–65 characters."
            )

    # ========================================================
    # META DESCRIPTION
    # ========================================================

    if not description:

        add_check(
            result["checks"],
            "Meta description",
            False,
            10,
            "Missing meta description."
        )

        result["errors"].append(
            "Missing meta description."
        )

    else:

        length = len(description)

        if 120 <= length <= 170:

            add_check(
                result["checks"],
                "Meta description",
                True,
                10,
                f"Good description length ({length} characters)."
            )

        elif length < 120:

            add_check(
                result["checks"],
                "Meta description",
                False,
                5,
                f"Description is short ({length} characters)."
            )

            result["recommendations"].append(
                "Expand the meta description with useful, specific information."
            )

        else:

            add_check(
                result["checks"],
                "Meta description",
                False,
                5,
                f"Description is long ({length} characters)."
            )

            result["recommendations"].append(
                "Shorten the meta description."
            )

    # ========================================================
    # CANONICAL
    # ========================================================

    if canonical:

        add_check(
            result["checks"],
            "Canonical URL",
            True,
            8,
            "Canonical URL exists."
        )

        if not canonical.startswith("https://"):

            result["warnings"].append(
                "Canonical URL does not use HTTPS."
            )

    else:

        add_check(
            result["checks"],
            "Canonical URL",
            False,
            8,
            "Missing canonical URL."
        )

        result["errors"].append(
            "Missing canonical URL."
        )

    # ========================================================
    # VIEWPORT
    # ========================================================

    if viewport:

        add_check(
            result["checks"],
            "Mobile viewport",
            True,
            5,
            "Mobile viewport is configured."
        )

    else:

        add_check(
            result["checks"],
            "Mobile viewport",
            False,
            5,
            "Missing mobile viewport."
        )

        result["errors"].append(
            "Missing viewport meta tag."
        )

    # ========================================================
    # H1
    # ========================================================

    h1_count = len(headings[1])

    if h1_count == 1:

        add_check(
            result["checks"],
            "H1 heading",
            True,
            8,
            f"Exactly one H1 found: {headings[1][0]}"
        )

    elif h1_count == 0:

        add_check(
            result["checks"],
            "H1 heading",
            False,
            8,
            "No H1 heading found."
        )

        result["errors"].append(
            "Missing H1."
        )

    else:

        add_check(
            result["checks"],
            "H1 heading",
            False,
            4,
            f"{h1_count} H1 headings found."
        )

        result["warnings"].append(
            "Use one primary H1 heading."
        )

    # ========================================================
    # H2
    # ========================================================

    h2_count = len(headings[2])

    if h2_count >= 2:

        add_check(
            result["checks"],
            "Content structure",
            True,
            5,
            f"{h2_count} H2 sections found."
        )

    elif h2_count == 1:

        add_check(
            result["checks"],
            "Content structure",
            True,
            3,
            "One H2 section found."
        )

    else:

        add_check(
            result["checks"],
            "Content structure",
            False,
            5,
            "No H2 sections found."
        )

        result["recommendations"].append(
            "Add useful H2 sections explaining the tool."
        )

    # ========================================================
    # CONTENT DEPTH
    # ========================================================

    if word_count >= 800:

        add_check(
            result["checks"],
            "Content depth",
            True,
            12,
            f"{word_count} words detected."
        )

    elif word_count >= 500:

        add_check(
            result["checks"],
            "Content depth",
            True,
            9,
            f"{word_count} words detected."
        )

        result["recommendations"].append(
            "Consider adding more genuinely useful information."
        )

    elif word_count >= 300:

        add_check(
            result["checks"],
            "Content depth",
            False,
            6,
            f"Only {word_count} words detected."
        )

        result["warnings"].append(
            "Tool page may be relatively thin."
        )

    else:

        add_check(
            result["checks"],
            "Content depth",
            False,
            2,
            f"Only {word_count} words detected."
        )

        result["errors"].append(
            "Very little textual content."
        )

        result["recommendations"].append(
            "Add original explanations, instructions, use cases and FAQs."
        )

    # ========================================================
    # OPEN GRAPH
    # ========================================================

    og_score = 0

    if og_title:
        og_score += 1

    if og_description:
        og_score += 1

    if og_url:
        og_score += 1

    if og_score == 3:

        add_check(
            result["checks"],
            "Open Graph",
            True,
            5,
            "Open Graph metadata is configured."
        )

    else:

        add_check(
            result["checks"],
            "Open Graph",
            False,
            2,
            f"{og_score}/3 Open Graph properties found."
        )

        result["recommendations"].append(
            "Complete Open Graph metadata."
        )

    # ========================================================
    # STRUCTURED DATA
    # ========================================================

    schema_present = (
        "application/ld+json" in content
    )

    if schema_present:

        add_check(
            result["checks"],
            "Structured data",
            True,
            8,
            "JSON-LD structured data found."
        )

    else:

        add_check(
            result["checks"],
            "Structured data",
            False,
            8,
            "No JSON-LD structured data found."
        )

        result["recommendations"].append(
            "Add appropriate Schema.org JSON-LD."
        )

    # ========================================================
    # FAQ
    # ========================================================

    faq_present = bool(
        re.search(
            r"frequently asked questions|faq",
            content,
            re.IGNORECASE
        )
    )

    if faq_present:

        add_check(
            result["checks"],
            "FAQ content",
            True,
            5,
            "FAQ content detected."
        )

    else:

        add_check(
            result["checks"],
            "FAQ content",
            False,
            5,
            "No FAQ content detected."
        )

        result["recommendations"].append(
            "Add useful FAQs specific to the tool."
        )

    # ========================================================
    # INTERNAL LINKS
    # ========================================================

    links = re.findall(
        r'<a\b[^>]*href=["\']([^"\']+)["\']',
        content,
        re.IGNORECASE
    )

    internal_links = [
        link
        for link in links
        if (
            link.startswith("/")
            or link.startswith("../../")
            or link.startswith("../")
        )
    ]

    if len(internal_links) >= 3:

        add_check(
            result["checks"],
            "Internal links",
            True,
            5,
            f"{len(internal_links)} internal links found."
        )

    elif len(internal_links) >= 1:

        add_check(
            result["checks"],
            "Internal links",
            False,
            3,
            f"Only {len(internal_links)} internal link(s) found."
        )

        result["recommendations"].append(
            "Add useful links to related tools and site sections."
        )

    else:

        add_check(
            result["checks"],
            "Internal links",
            False,
            1,
            "No internal links found."
        )

        result["recommendations"].append(
            "Add internal links to related tools."
        )

    # ========================================================
    # IMAGES / ALT TEXT
    # ========================================================

    images = re.findall(
        r"<img\b[^>]*>",
        content,
        re.IGNORECASE
    )

    missing_alt = 0

    for image in images:

        alt = re.search(
            r'alt=["\']([^"\']*)["\']',
            image,
            re.IGNORECASE
        )

        if not alt or not alt.group(1).strip():

            missing_alt += 1

    if not images:

        add_check(
            result["checks"],
            "Image accessibility",
            True,
            3,
            "No content images requiring alt text."
        )

    elif missing_alt == 0:

        add_check(
            result["checks"],
            "Image accessibility",
            True,
            3,
            "All images have alt attributes."
        )

    else:

        add_check(
            result["checks"],
            "Image accessibility",
            False,
            1,
            f"{missing_alt} image(s) missing alt text."
        )

        result["recommendations"].append(
            "Add meaningful alt text to content images."
        )

    # ========================================================
    # TOOL CONTENT
    # ========================================================

    tool_terms = [
        "how to use",
        "how it works",
        "features",
        "privacy",
        "steps",
        "instructions",
        "uses"
    ]

    detected_sections = sum(
        1
        for term in tool_terms
        if term in content.lower()
    )

    if detected_sections >= 4:

        add_check(
            result["checks"],
            "Helpful tool information",
            True,
            6,
            f"{detected_sections} useful information sections detected."
        )

    elif detected_sections >= 2:

        add_check(
            result["checks"],
            "Helpful tool information",
            False,
            4,
            f"{detected_sections} useful information sections detected."
        )

        result["recommendations"].append(
            "Expand the page with tool-specific educational content."
        )

    else:

        add_check(
            result["checks"],
            "Helpful tool information",
            False,
            1,
            "Very little educational/tool information detected."
        )

        result["recommendations"].append(
            "Explain how the tool works, when to use it and its limitations."
        )

    # ========================================================
    # DUPLICATE / GENERIC CONTENT WARNING
    # ========================================================

    generic_phrases = [
        "free online tool",
        "fast and easy",
        "simple and easy to use",
        "use our tool"
    ]

    generic_count = sum(
        1
        for phrase in generic_phrases
        if phrase in content.lower()
    )

    if generic_count >= 3:

        result["warnings"].append(
            "Page contains several generic marketing phrases."
        )

        result["recommendations"].append(
            "Replace generic copy with specific, original information about the tool."
        )

    # ========================================================
    # CALCULATE SCORE
    # ========================================================

    score = sum(
        check["points"]
        for check in result["checks"]
        if check["passed"]
    )

    # Normalize against 100 because some failed checks
    # still award partial points.
    max_possible = sum(
        check["points"]
        for check in result["checks"]
    )

    if max_possible > 0:

        score = round(
            (score / max_possible) * MAX_SCORE
        )

    else:

        score = 0

    score = max(
        0,
        min(
            MAX_SCORE,
            score
        )
    )

    result["score"] = score

    result["status"] = status_for_score(
        score
    )

    result["word_count"] = word_count

    result["title"] = title

    result["description"] = description

    return result


# ============================================================
# MARKDOWN REPORT
# ============================================================

def create_markdown_report(result):

    lines = []

    lines.append(
        f"# SEO Audit — {result['slug']}"
    )

    lines.append("")

    lines.append(
        f"## {result['status']} — {result['score']}/100"
    )

    lines.append("")

    lines.append(
        f"**Content words:** {result.get('word_count', 0)}"
    )

    lines.append("")

    lines.append(
        "## Checks"
    )

    lines.append("")

    lines.append(
        "| Check | Status | Details |"
    )

    lines.append(
        "|---|---|---|"
    )

    for check in result["checks"]:

        status = (
            "✅ Pass"
            if check["passed"]
            else "⚠️ Review"
        )

        message = (
            check["message"]
            .replace("|", "\\|")
        )

        lines.append(
            f"| {check['name']} | {status} | {message} |"
        )

    if result["errors"]:

        lines.append("")

        lines.append(
            "## ❌ Errors"
        )

        lines.append("")

        for error in result["errors"]:

            lines.append(
                f"- {error}"
            )

    if result["warnings"]:

        lines.append("")

        lines.append(
            "## ⚠️ Warnings"
        )

        lines.append("")

        for warning in result["warnings"]:

            lines.append(
                f"- {warning}"
            )

    if result["recommendations"]:

        lines.append("")

        lines.append(
            "## 💡 Recommendations"
        )

        lines.append("")

        for recommendation in result["recommendations"]:

            lines.append(
                f"- {recommendation}"
            )

    lines.append("")

    lines.append(
        "## Page information"
    )

    lines.append("")

    lines.append(
        f"**Title:** {result.get('title', '')}"
    )

    lines.append("")

    lines.append(
        f"**Description:** {result.get('description', '')}"
    )

    lines.append("")

    return "\n".join(lines)


# ============================================================
# GITHUB ACTION SUMMARY
# ============================================================

def create_github_summary(results):

    summary_file = os.environ.get(
        "GITHUB_STEP_SUMMARY"
    )

    if not summary_file:

        print(
            "GITHUB_STEP_SUMMARY is not available."
        )

        return

    total = len(results)

    if total == 0:

        return

    average = round(
        sum(
            result["score"]
            for result in results
        ) / total
    )

    excellent = sum(
        1
        for result in results
        if result["score"] >= 90
    )

    good = sum(
        1
        for result in results
        if 80 <= result["score"] < 90
    )

    needs_work = sum(
        1
        for result in results
        if result["score"] < 80
    )

    lines = []

    lines.append(
        "# 🔎 Nisulka Tools SEO Audit"
    )

    lines.append("")

    lines.append(
        f"## Overall SEO Score: **{average}/100**"
    )

    lines.append("")

    lines.append(
        f"**Tools audited:** {total}  "
        f"**Excellent:** {excellent}  "
        f"**Good:** {good}  "
        f"**Needs work:** {needs_work}"
    )

    lines.append("")

    lines.append(
        "### Tool Scores"
    )

    lines.append("")

    lines.append(
        "| Tool | Score | Status | Words |"
    )

    lines.append(
        "|---|---:|---|---:|"
    )

    for result in sorted(
        results,
        key=lambda x: x["score"]
    ):

        lines.append(
            f"| `{result['slug']}` | "
            f"**{result['score']}/100** | "
            f"{result['status']} | "
            f"{result.get('word_count', 0)} |"
        )

    lines.append("")

    lines.append(
        "### 🔴 Priority Improvements"
    )

    lines.append("")

    priority_found = False

    for result in sorted(
        results,
        key=lambda x: x["score"]
    ):

        if result["score"] >= 80:
            continue

        priority_found = True

        lines.append(
            f"#### `{result['slug']}` — "
            f"{result['score']}/100"
        )

        for recommendation in result[
            "recommendations"
        ][:5]:

            lines.append(
                f"- {recommendation}"
            )

        lines.append("")

    if not priority_found:

        lines.append(
            "🎉 No tools are currently below 80/100."
        )

    lines.append("")

    lines.append(
        "### 📊 Score Guide"
    )

    lines.append("")

    lines.append(
        "| Score | Meaning |"
    )

    lines.append(
        "|---:|---|"
    )

    lines.append(
        "| 90–100 | 🟢 Excellent |"
    )

    lines.append(
        "| 80–89 | 🟢 Good |"
    )

    lines.append(
        "| 70–79 | 🟡 Needs improvement |"
    )

    lines.append(
        "| 60–69 | 🟠 Weak |"
    )

    lines.append(
        "| 0–59 | 🔴 Poor |"
    )

    lines.append("")

    lines.append(
        "> This is a Nisulka Tools technical/content "
        "audit score. It is not a Google ranking score "
        "and does not guarantee search rankings or AdSense approval."
    )

    with open(
        summary_file,
        "a",
        encoding="utf-8"
    ) as f:

        f.write(
            "\n".join(lines)
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)

    print(
        "NISULKA TOOLS SEO AUDITOR"
    )

    print("=" * 60)

    if not TOOLS_DIR.exists():

        print(
            "No tools directory found."
        )

        return

    results = []

    for tool_dir in sorted(
        TOOLS_DIR.iterdir()
    ):

        if not tool_dir.is_dir():
            continue

        print(
            f"Auditing: {tool_dir.name}"
        )

        result = audit_tool(
            tool_dir
        )

        results.append(
            result
        )

        report_file = (
            REPORT_DIR /
            f"{tool_dir.name}.md"
        )

        report_file.write_text(
            create_markdown_report(result),
            encoding="utf-8"
        )

        print(
            f"  Score: {result['score']}/100 "
            f"{result['status']}"
        )

    # ========================================================
    # SAVE JSON
    # ========================================================

    json_file = (
        REPORT_DIR /
        "seo-results.json"
    )

    json_file.write_text(
        json.dumps(
            results,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    # ========================================================
    # GITHUB SUMMARY
    # ========================================================

    create_github_summary(
        results
    )

    # ========================================================
    # CONSOLE SUMMARY
    # ========================================================

    print()
    print("=" * 60)
    print("SEO RESULTS")
    print("=" * 60)

    for result in sorted(
        results,
        key=lambda x: x["score"]
    ):

        print(
            f"{result['score']:>3}/100 "
            f"{result['status']} "
            f"{result['slug']}"
        )

    print("=" * 60)

    if results:

        average = round(
            sum(
                r["score"]
                for r in results
            ) / len(results)
        )

        print(
            f"Average SEO Score: {average}/100"
        )

    print(
        f"Reports saved to: {REPORT_DIR}"
    )


if __name__ == "__main__":

    main()
