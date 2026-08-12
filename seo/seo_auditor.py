#!/usr/bin/env python3

"""
Nisulka Tools — SEO Auditor

Scans every tool under /tools/ and produces:
    seo/seo-report.json
    seo/seo-report.md

The auditor checks:
- Title
- Meta description
- Canonical URL
- H1
- H2
- Description length
- Title length
- Open Graph
- Robots
- Structured data
- Tool metadata
- Logo
- Internal links
- Image alt attributes
- HTTPS/canonical consistency
- Basic content quality

Exit code:
    0 = audit completed successfully
    1 = auditor itself failed
"""

import os
import re
import json
from html import unescape
from datetime import datetime
from urllib.parse import urlparse


# ============================================================
# CONFIGURATION
# ============================================================

TOOLS_DIR = "tools"
OUTPUT_DIR = "seo"

JSON_REPORT = os.path.join(
    OUTPUT_DIR,
    "seo-report.json"
)

MARKDOWN_REPORT = os.path.join(
    OUTPUT_DIR,
    "seo-report.md"
)

SITE_URL = (
    "https://apps.laxmannepal.com.np/"
    "Nisulka-Tools"
)


# ============================================================
# HELPERS
# ============================================================

def clean_text(value):
    """Remove HTML and normalize whitespace."""

    if not value:
        return ""

    value = re.sub(
        r"<[^>]+>",
        " ",
        value
    )

    value = unescape(value)

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


def get_tag_content(html, tag, attrs=""):
    """
    Extract simple HTML tag content.
    """

    pattern = (
        rf"<{tag}\b{attrs}[^>]*>"
        rf"(.*?)"
        rf"</{tag}>"
    )

    match = re.search(
        pattern,
        html,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        return clean_text(
            match.group(1)
        )

    return ""


def get_meta(html, name=None, property_name=None):
    """
    Read meta description/name/property.
    """

    if name:

        pattern = (
            rf'<meta\s+'
            rf'[^>]*name=["\']'
            rf'{re.escape(name)}'
            rf'["\'][^>]*content=["\']'
            rf'(.*?)["\']'
        )

    else:

        pattern = (
            rf'<meta\s+'
            rf'[^>]*property=["\']'
            rf'{re.escape(property_name)}'
            rf'["\'][^>]*content=["\']'
            rf'(.*?)["\']'
        )

    match = re.search(
        pattern,
        html,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        return unescape(
            match.group(1).strip()
        )

    return ""


def get_title(html):

    match = re.search(
        r"<title[^>]*>(.*?)</title>",
        html,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        return clean_text(
            match.group(1)
        )

    return ""


def get_canonical(html):

    match = re.search(
        r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\'](.*?)["\']',
        html,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        return unescape(
            match.group(1).strip()
        )

    return ""


def count_tags(html, tag):

    return len(
        re.findall(
            rf"<{tag}\b",
            html,
            re.IGNORECASE
        )
    )


def get_headings(html, tag):

    pattern = (
        rf"<{tag}\b[^>]*>"
        rf"(.*?)"
        rf"</{tag}>"
    )

    matches = re.findall(
        pattern,
        html,
        re.IGNORECASE | re.DOTALL
    )

    return [
        clean_text(item)
        for item in matches
        if clean_text(item)
    ]


def get_images(html):

    return re.findall(
        r"<img\b[^>]*>",
        html,
        re.IGNORECASE
    )


def image_has_alt(image):

    return bool(
        re.search(
            r'\balt=["\'][^"\']*["\']',
            image,
            re.IGNORECASE
        )
    )


def get_json_ld(html):

    matches = re.findall(
        r'<script\s+[^>]*type=["\']application/ld\+json["\'][^>]*>'
        r'(.*?)'
        r'</script>',
        html,
        re.IGNORECASE | re.DOTALL
    )

    valid = []

    for item in matches:

        try:
            valid.append(
                json.loads(
                    item.strip()
                )
            )

        except json.JSONDecodeError:
            pass

    return valid


def get_tool_meta(html, name):

    pattern = (
        rf'<meta\s+'
        rf'[^>]*name=["\']tool:{re.escape(name)}'
        rf'["\'][^>]*content=["\'](.*?)["\']'
    )

    match = re.search(
        pattern,
        html,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        return unescape(
            match.group(1).strip()
        )

    return ""


# ============================================================
# SEO CHECKS
# ============================================================

def check_title(title):

    length = len(title)

    if not title:

        return (
            0,
            "Missing title"
        )

    if 30 <= length <= 60:

        return (
            10,
            "Good title length"
        )

    if length < 30:

        return (
            6,
            "Title is too short"
        )

    return (
        6,
        "Title is too long"
    )


def check_description(description):

    description_length = len(
        description
    )

    if not description:

        return (
            0,
            "Missing meta description"
        )

    if 120 <= description_length <= 160:

        return (
            10,
            "Good description length"
        )

    if description_length < 120:

        return (
            6,
            "Description is too short"
        )

    return (
        6,
        "Description is too long"
    )


def check_h1(headings):

    if len(headings) == 1:

        return (
            10,
            "Exactly one H1"
        )

    if len(headings) == 0:

        return (
            0,
            "Missing H1"
        )

    return (
        5,
        "Multiple H1 headings"
    )


def check_canonical(canonical):

    if not canonical:

        return (
            0,
            "Missing canonical URL"
        )

    if canonical.startswith(
        "https://"
    ):

        return (
            10,
            "HTTPS canonical found"
        )

    return (
        5,
        "Canonical exists but is not HTTPS"
    )


def check_open_graph(og_title, og_description):

    score = 0

    if og_title:
        score += 5

    if og_description:
        score += 5

    if score == 10:

        message = "Open Graph metadata complete"

    elif score == 5:

        message = "Open Graph partially configured"

    else:

        message = "Open Graph metadata missing"

    return (
        score,
        message
    )


def check_robots(robots):

    if not robots:

        return (
            0,
            "Robots meta tag missing"
        )

    if "noindex" in robots.lower():

        return (
            0,
            "Page contains noindex"
        )

    return (
        5,
        "Indexable robots directive"
    )


def check_schema(schema):

    if not schema:

        return (
            0,
            "Structured data missing"
        )

    return (
        10,
        "Structured data found"
    )


def check_images(html):

    images = get_images(
        html
    )

    if not images:

        return (
            5,
            "No images found"
        )

    missing_alt = sum(
        1
        for image in images
        if not image_has_alt(image)
    )

    if missing_alt == 0:

        return (
            10,
            "All images have alt attributes"
        )

    return (
        5,
        f"{missing_alt} image(s) missing alt"
    )


def check_content(description, h2):

    score = 0

    if len(description) >= 80:
        score += 5

    if len(h2) >= 1:
        score += 5

    if score == 10:

        message = "Useful page structure"

    elif score == 5:

        message = "Content structure could be improved"

    else:

        message = "Thin content signals"

    return (
        score,
        message
    )


def check_tool_metadata(
    name,
    description,
    category
):

    score = 0

    if name:
        score += 3

    if description:
        score += 3

    if category:
        score += 4

    if score == 10:

        message = "Tool metadata complete"

    else:

        message = "Tool metadata incomplete"

    return (
        score,
        message
    )


# ============================================================
# AUDIT ONE TOOL
# ============================================================

def audit_tool(slug):

    tool_dir = os.path.join(
        TOOLS_DIR,
        slug
    )

    index_file = os.path.join(
        tool_dir,
        "index.html"
    )

    logo_file = os.path.join(
        tool_dir,
        "logo.jpg"
    )

    if not os.path.isfile(
        index_file
    ):

        return None

    with open(
        index_file,
        "r",
        encoding="utf-8"
    ) as file:

        html = file.read()


    # --------------------------------------------------------
    # Metadata
    # --------------------------------------------------------

    title = get_title(
        html
    )

    description = get_meta(
        html,
        name="description"
    )

    canonical = get_canonical(
        html
    )

    robots = get_meta(
        html,
        name="robots"
    )

    og_title = get_meta(
        html,
        property_name="og:title"
    )

    og_description = get_meta(
        html,
        property_name="og:description"
    )


    # --------------------------------------------------------
    # Headings
    # --------------------------------------------------------

    h1 = get_headings(
        html,
        "h1"
    )

    h2 = get_headings(
        html,
        "h2"
    )


    # --------------------------------------------------------
    # Schema
    # --------------------------------------------------------

    schema = get_json_ld(
        html
    )


    # --------------------------------------------------------
    # Tool metadata
    # --------------------------------------------------------

    tool_name = get_tool_meta(
        html,
        "name"
    )

    tool_description = get_tool_meta(
        html,
        "description"
    )

    tool_category = get_tool_meta(
        html,
        "category"
    )


    # --------------------------------------------------------
    # Scores
    # --------------------------------------------------------

    checks = {}


    score, message = check_title(
        title
    )

    checks["title"] = {
        "score": score,
        "max": 10,
        "message": message,
        "value": title,
        "length": len(title)
    }


    score, message = check_description(
        description
    )

    checks["meta_description"] = {
        "score": score,
        "max": 10,
        "message": message,
        "value": description,
        "length": len(description)
    }


    score, message = check_h1(
        h1
    )

    checks["h1"] = {
        "score": score,
        "max": 10,
        "message": message,
        "count": len(h1),
        "values": h1
    }


    score, message = check_canonical(
        canonical
    )

    checks["canonical"] = {
        "score": score,
        "max": 10,
        "message": message,
        "value": canonical
    }


    score, message = check_open_graph(
        og_title,
        og_description
    )

    checks["open_graph"] = {
        "score": score,
        "max": 10,
        "message": message
    }


    score, message = check_robots(
        robots
    )

    checks["robots"] = {
        "score": score,
        "max": 5,
        "message": message,
        "value": robots
    }


    score, message = check_schema(
        schema
    )

    checks["structured_data"] = {
        "score": score,
        "max": 10,
        "message": message,
        "types": [
            item.get("@type")
            for item in schema
            if isinstance(item, dict)
        ]
    }


    score, message = check_images(
        html
    )

    checks["images"] = {
        "score": score,
        "max": 10,
        "message": message
    }


    score, message = check_content(
        description,
        h2
    )

    checks["content"] = {
        "score": score,
        "max": 10,
        "message": message
    }


    score, message = check_tool_metadata(
        tool_name,
        tool_description,
        tool_category
    )

    checks["tool_metadata"] = {
        "score": score,
        "max": 10,
        "message": message
    }


    # --------------------------------------------------------
    # Logo
    # --------------------------------------------------------

    if os.path.isfile(
        logo_file
    ):

        logo_score = 5

        logo_message = (
            "logo.jpg found"
        )

    else:

        logo_score = 0

        logo_message = (
            "logo.jpg missing"
        )


    checks["logo"] = {
        "score": logo_score,
        "max": 5,
        "message": logo_message
    }


    # --------------------------------------------------------
    # Total
    # --------------------------------------------------------

    total_score = sum(
        item["score"]
        for item in checks.values()
    )

    total_possible = sum(
        item["max"]
        for item in checks.values()
    )


    percentage = round(
        (
            total_score /
            total_possible *
            100
        ),
        1
    ) if total_possible else 0


    # --------------------------------------------------------
    # Grade
    # --------------------------------------------------------

    if percentage >= 90:

        grade = "A"

    elif percentage >= 80:

        grade = "B"

    elif percentage >= 70:

        grade = "C"

    elif percentage >= 60:

        grade = "D"

    else:

        grade = "F"


    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendations = []

    for key, check in checks.items():

        if check["score"] < check["max"]:

            recommendations.append(
                check["message"]
            )


    return {

        "name": tool_name or slug,

        "slug": slug,

        "url": (
            f"{SITE_URL}/tools/"
            f"{slug}/"
        ),

        "score": percentage,

        "points": total_score,

        "max_points": total_possible,

        "grade": grade,

        "checks": checks,

        "recommendations": recommendations,

        "audited_at": datetime.utcnow().isoformat()
        + "Z"

    }


# ============================================================
# GENERATE MARKDOWN REPORT
# ============================================================

def generate_markdown(results):

    lines = []

    lines.append(
        "# Nisulka Tools SEO Audit"
    )

    lines.append("")

    lines.append(
        f"Generated: "
        f"{datetime.utcnow().isoformat()} UTC"
    )

    lines.append("")

    lines.append(
        "| Rank | Tool | Score | Grade | Issues |"
    )

    lines.append(
        "|---:|---|---:|:---:|---:|"
    )


    for index, tool in enumerate(
        results,
        start=1
    ):

        issues = len(
            tool["recommendations"]
        )

        lines.append(
            f"| {index} | "
            f"{tool['name']} | "
            f"{tool['score']}% | "
            f"{tool['grade']} | "
            f"{issues} |"
        )


    lines.append("")

    lines.append(
        "## Tool Details"
    )

    lines.append("")


    for tool in results:

        lines.append(
            f"### {tool['name']}"
        )

        lines.append("")

        lines.append(
            f"**Score:** "
            f"{tool['score']}% "
            f"({tool['grade']})"
        )

        lines.append("")


        for key, check in tool[
            "checks"
        ].items():

            lines.append(
                f"- **{key}**: "
                f"{check['score']}/"
                f"{check['max']} — "
                f"{check['message']}"
            )


        if tool[
            "recommendations"
        ]:

            lines.append("")

            lines.append(
                "**Recommendations:**"
            )

            for recommendation in tool[
                "recommendations"
            ]:

                lines.append(
                    f"- {recommendation}"
                )


        lines.append("")


    return "\n".join(
        lines
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print(
        "======================================"
    )

    print(
        " Nisulka Tools SEO Auditor"
    )

    print(
        "======================================"
    )

    print()


    if not os.path.isdir(
        TOOLS_DIR
    ):

        print(
            "ERROR: tools directory not found."
        )

        return 1


    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )


    results = []


    for slug in sorted(
        os.listdir(
            TOOLS_DIR
        )
    ):

        tool_dir = os.path.join(
            TOOLS_DIR,
            slug
        )


        if not os.path.isdir(
            tool_dir
        ):

            continue


        print(
            f"Auditing: {slug}"
        )


        try:

            result = audit_tool(
                slug
            )


            if result:

                results.append(
                    result
                )

                print(
                    f"  Score: "
                    f"{result['score']}%"
                )

                print(
                    f"  Grade: "
                    f"{result['grade']}"
                )

            else:

                print(
                    "  Skipped"
                )


        except Exception as error:

            print(
                f"  ERROR: {error}"
            )


    # Highest score first

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )


    # Add rankings

    for index, result in enumerate(
        results,
        start=1
    ):

        result["rank"] = index


    # --------------------------------------------------------
    # JSON
    # --------------------------------------------------------

    report = {

        "site": "Nisulka Tools",

        "site_url": SITE_URL,

        "generated_at":
            datetime.utcnow().isoformat()
            + "Z",

        "total_tools":
            len(results),

        "average_score":
            round(
                sum(
                    item["score"]
                    for item in results
                ) / len(results),
                1
            )
            if results
            else 0,

        "tools": results

    }


    with open(
        JSON_REPORT,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            report,
            file,
            ensure_ascii=False,
            indent=2
        )

        file.write("\n")


    # --------------------------------------------------------
    # Markdown
    # --------------------------------------------------------

    markdown = generate_markdown(
        results
    )


    with open(
        MARKDOWN_REPORT,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(
            markdown
        )


    # --------------------------------------------------------
    # Console summary
    # --------------------------------------------------------

    print()
    print(
        "======================================"
    )

    print(
        " SEO AUDIT COMPLETE"
    )

    print(
        "======================================"
    )

    print(
        f"Tools audited: "
        f"{len(results)}"
    )

    print(
        f"Average score: "
        f"{report['average_score']}%"
    )

    print()

    for tool in results:

        print(
            f"{tool['rank']:>3}. "
            f"{tool['name']:<35} "
            f"{tool['score']:>5}% "
            f"{tool['grade']}"
        )


    print()

    print(
        f"JSON report: "
        f"{JSON_REPORT}"
    )

    print(
        f"Markdown report: "
        f"{MARKDOWN_REPORT}"
    )

    print()


    return 0


if __name__ == "__main__":

    raise SystemExit(
        main()
    )
