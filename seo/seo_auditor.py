#!/usr/bin/env python3

"""
Nisulka Tools SEO Auditor

Scans:
    /tools/*/index.html

Generates:
    /data/seo-audit.json
    /data/seo-audit.md

No external Python packages required.
"""

import os
import re
import json
from html import unescape
from datetime import datetime


# ============================================================
# CONFIGURATION
# ============================================================

TOOLS_DIR = "tools"
DATA_DIR = "data"

JSON_FILE = os.path.join(
    DATA_DIR,
    "seo-audit.json"
)

MARKDOWN_FILE = os.path.join(
    DATA_DIR,
    "seo-audit.md"
)

SITE_URL = (
    "https://apps.laxmannepal.com.np/"
    "Nisulka-Tools"
)


# ============================================================
# BASIC HELPERS
# ============================================================

def clean_text(value):
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


def get_title(html):

    match = re.search(
        r"<title[^>]*>(.*?)</title>",
        html,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return ""

    return clean_text(
        match.group(1)
    )


def get_meta(html, name=None, property_name=None):

    if name:

        pattern = (
            r'<meta\b[^>]*'
            r'\bname=["\']'
            + re.escape(name)
            + r'["\'][^>]*'
            r'\bcontent=["\'](.*?)["\']'
        )

    elif property_name:

        pattern = (
            r'<meta\b[^>]*'
            r'\bproperty=["\']'
            + re.escape(property_name)
            + r'["\'][^>]*'
            r'\bcontent=["\'](.*?)["\']'
        )

    else:

        return ""

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


def get_canonical(html):

    pattern = (
        r'<link\b[^>]*'
        r'\brel=["\']canonical["\']'
        r'[^>]*'
        r'\bhref=["\'](.*?)["\']'
    )

    match = re.search(
        pattern,
        html,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return ""

    return unescape(
        match.group(1).strip()
    )


def get_headings(html, heading):

    pattern = (
        rf"<{heading}\b[^>]*>"
        rf"(.*?)"
        rf"</{heading}>"
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

    match = re.search(
        r'\balt=["\'](.*?)["\']',
        image,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return False

    return bool(
        match.group(1).strip()
    )


def get_schema(html):

    scripts = re.findall(
        r'<script\b[^>]*'
        r'type=["\']application/ld\+json["\']'
        r'[^>]*>'
        r'(.*?)'
        r'</script>',
        html,
        re.IGNORECASE | re.DOTALL
    )

    schemas = []

    for script in scripts:

        try:

            data = json.loads(
                script.strip()
            )

            schemas.append(data)

        except Exception:

            continue

    return schemas


def get_tool_meta(html, key):

    pattern = (
        r'<meta\b[^>]*'
        r'\bname=["\']tool:'
        + re.escape(key)
        + r'["\'][^>]*'
        r'\bcontent=["\'](.*?)["\']'
    )

    match = re.search(
        pattern,
        html,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return ""

    return unescape(
        match.group(1).strip()
    )


# ============================================================
# CHECK FUNCTIONS
# ============================================================

def check_title(title):

    length = len(title)

    if not title:

        return 0, "Missing page title"

    if 30 <= length <= 60:

        return 10, "Title length is good"

    if length < 30:

        return 6, "Title is too short"

    return 6, "Title is too long"


def check_description(description):

    length = len(description)

    if not description:

        return 0, "Missing meta description"

    if 120 <= length <= 160:

        return 10, "Meta description length is good"

    if length < 120:

        return 6, "Meta description is too short"

    return 6, "Meta description is too long"


def check_h1(h1):

    count = len(h1)

    if count == 1:

        return 10, "Exactly one H1 found"

    if count == 0:

        return 0, "H1 is missing"

    return 5, "Multiple H1 headings found"


def check_h2(h2):

    if len(h2) >= 1:

        return 5, "H2 headings found"

    return 0, "No H2 headings found"


def check_canonical(canonical):

    if not canonical:

        return 0, "Canonical URL is missing"

    if canonical.startswith("https://"):

        return 10, "HTTPS canonical found"

    return 5, "Canonical exists but is not HTTPS"


def check_open_graph(
    og_title,
    og_description
):

    score = 0

    if og_title:
        score += 5

    if og_description:
        score += 5

    if score == 10:

        message = (
            "Open Graph metadata is complete"
        )

    elif score == 5:

        message = (
            "Open Graph metadata is incomplete"
        )

    else:

        message = (
            "Open Graph metadata is missing"
        )

    return score, message


def check_robots(robots):

    if not robots:

        return 0, "Robots meta tag is missing"

    if "noindex" in robots.lower():

        return 0, "Page contains noindex"

    return 5, "Page is indexable"


def check_schema(schema):

    if schema:

        return 10, "Structured data found"

    return 0, "Structured data is missing"


def check_images(html):

    images = get_images(html)

    if not images:

        return 5, "No images found"

    missing = 0

    for image in images:

        if not image_has_alt(image):

            missing += 1

    if missing == 0:

        return 10, "All images have alt text"

    return (
        5,
        f"{missing} image(s) missing alt text"
    )


def check_logo(logo_file):

    if os.path.isfile(logo_file):

        return 5, "Tool logo found"

    return 0, "logo.jpg is missing"


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

        message = (
            "Tool metadata is complete"
        )

    else:

        message = (
            "Tool metadata is incomplete"
        )

    return score, message


# ============================================================
# AUDIT TOOL
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

    if not os.path.isfile(index_file):

        return None


    with open(
        index_file,
        "r",
        encoding="utf-8"
    ) as file:

        html = file.read()


    # --------------------------------------------------------
    # Extract information
    # --------------------------------------------------------

    title = get_title(html)

    description = get_meta(
        html,
        name="description"
    )

    canonical = get_canonical(html)

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

    h1 = get_headings(
        html,
        "h1"
    )

    h2 = get_headings(
        html,
        "h2"
    )

    schema = get_schema(html)

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
    # Individual checks
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


    score, message = check_h2(
        h2
    )

    checks["h2"] = {
        "score": score,
        "max": 5,
        "message": message,
        "count": len(h2),
        "values": h2
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
        "schema_count": len(schema)
    }


    score, message = check_images(
        html
    )

    checks["images"] = {
        "score": score,
        "max": 10,
        "message": message
    }


    score, message = check_logo(
        logo_file
    )

    checks["logo"] = {
        "score": score,
        "max": 5,
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
    # Calculate score
    # --------------------------------------------------------

    points = sum(
        check["score"]
        for check in checks.values()
    )

    max_points = sum(
        check["max"]
        for check in checks.values()
    )


    score = round(
        (
            points /
            max_points *
            100
        ),
        1
    ) if max_points else 0


    # --------------------------------------------------------
    # Grade
    # --------------------------------------------------------

    if score >= 90:

        grade = "A"

    elif score >= 80:

        grade = "B"

    elif score >= 70:

        grade = "C"

    elif score >= 60:

        grade = "D"

    else:

        grade = "F"


    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendations = []

    for check in checks.values():

        if check["score"] < check["max"]:

            recommendations.append(
                check["message"]
            )


    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    return {

        "name": tool_name or slug,

        "slug": slug,

        "url": (
            f"{SITE_URL}/tools/"
            f"{slug}/"
        ),

        "score": score,

        "grade": grade,

        "points": points,

        "max_points": max_points,

        "checks": checks,

        "recommendations": recommendations,

        "audited_at": (
            datetime.utcnow().isoformat()
            + "Z"
        )

    }


# ============================================================
# MARKDOWN REPORT
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

        issue_count = len(
            tool.get(
                "recommendations",
                []
            )
        )

        lines.append(
            f"| {index} "
            f"| {tool['name']} "
            f"| {tool['score']}/100 "
            f"| {tool['grade']} "
            f"| {issue_count} |"
        )


    lines.append("")

    lines.append(
        "## Recommendations"
    )

    lines.append("")


    for tool in results:

        recommendations = tool.get(
            "recommendations",
            []
        )

        if not recommendations:

            continue


        lines.append(
            f"### {tool['name']}"
        )

        lines.append("")


        for recommendation in recommendations:

            lines.append(
                f"- {recommendation}"
            )

        lines.append("")


    return "\n".join(lines)


# ============================================================
# MAIN
# ============================================================

def main():

    print("")
    print(
        "======================================"
    )
    print(
        "NISULKA TOOLS SEO AUDITOR"
    )
    print(
        "======================================"
    )
    print("")


    # --------------------------------------------------------
    # Check tools directory
    # --------------------------------------------------------

    if not os.path.isdir(TOOLS_DIR):

        print(
            "ERROR: tools/ directory does not exist."
        )

        return 1


    # --------------------------------------------------------
    # Create data directory
    # --------------------------------------------------------

    os.makedirs(
        DATA_DIR,
        exist_ok=True
    )


    results = []


    # --------------------------------------------------------
    # Scan tools
    # --------------------------------------------------------

    for slug in sorted(
        os.listdir(TOOLS_DIR)
    ):

        tool_dir = os.path.join(
            TOOLS_DIR,
            slug
        )

        if not os.path.isdir(tool_dir):

            continue


        print(
            f"Auditing: {slug}"
        )


        try:

            result = audit_tool(
                slug
            )

            if result is None:

                print(
                    "  SKIPPED: index.html missing"
                )

                continue


            results.append(
                result
            )


            print(
                f"  Score: "
                f"{result['score']}/100"
            )

            print(
                f"  Grade: "
                f"{result['grade']}"
            )

            print(
                f"  Issues: "
                f"{len(result['recommendations'])}"
            )

            print("")


        except Exception as error:

            print(
                f"  ERROR: {error}"
            )

            print("")


    # --------------------------------------------------------
    # Sort by score
    # --------------------------------------------------------

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )


    # --------------------------------------------------------
    # Add ranking
    # --------------------------------------------------------

    for rank, tool in enumerate(
        results,
        start=1
    ):

        tool["rank"] = rank


    # --------------------------------------------------------
    # Average
    # --------------------------------------------------------

    if results:

        average_score = round(
            sum(
                tool["score"]
                for tool in results
            ) / len(results),
            1
        )

    else:

        average_score = 0


    # --------------------------------------------------------
    # Final JSON
    # --------------------------------------------------------

    report = {

        "site": "Nisulka Tools",

        "site_url": SITE_URL,

        "generated_at": (
            datetime.utcnow().isoformat()
            + "Z"
        ),

        "total_tools": len(results),

        "average_score": average_score,

        "tools": results

    }


    # --------------------------------------------------------
    # Write JSON
    # --------------------------------------------------------

    with open(
        JSON_FILE,
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
    # Write Markdown
    # --------------------------------------------------------

    markdown = generate_markdown(
        results
    )


    with open(
        MARKDOWN_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(
            markdown
        )


    # --------------------------------------------------------
    # Final console output
    # --------------------------------------------------------

    print(
        "======================================"
    )

    print(
        "SEO AUDIT COMPLETE"
    )

    print(
        "======================================"
    )

    print(
        f"Total tools: {len(results)}"
    )

    print(
        f"Average score: "
        f"{average_score}/100"
    )

    print("")

    print(
        "Rankings:"
    )

    print(
        "--------------------------------------"
    )


    for tool in results:

        print(
            f"{tool['rank']}. "
            f"{tool['name']} — "
            f"{tool['score']}/100 "
            f"({tool['grade']})"
        )


    print("")

    print(
        f"Generated: {JSON_FILE}"
    )

    print(
        f"Generated: {MARKDOWN_FILE}"
    )

    print("")


    return 0


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    raise SystemExit(
        main()
    )
