#!/usr/bin/env python3

"""
============================================================
NISULKA TOOLS — SEO & QUALITY AUDITOR
============================================================

This script scans every tool inside:

    tools/

and evaluates:

    SEO
    Content
    Technical SEO
    Performance
    Accessibility

It generates:

    data/seo/report.json
    data/seo/summary.md
    data/seo/tools.csv

The auditor is intentionally NON-DESTRUCTIVE.

It does not modify tool pages.
It only reports what should be improved.
============================================================
"""

import argparse
import csv
import json
import os
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urlparse


# ============================================================
# CONFIGURATION
# ============================================================

DEFAULT_TOOLS_DIR = "tools"
DEFAULT_OUTPUT_DIR = "data/seo"


SITE_BASE_URL = (
    "https://apps.laxmannepal.com.np/"
    "Nisulka-Tools"
)


# ============================================================
# HTML PARSER
# ============================================================

class SEOHTMLParser(HTMLParser):

    def __init__(self):

        super().__init__(
            convert_charrefs=True
        )

        self.title = ""

        self.in_title = False

        self.meta = []

        self.links = []

        self.images = []

        self.headings = []

        self.buttons = []

        self.inputs = []

        self.text_chunks = []

        self.script_count = 0

        self.style_count = 0

        self.external_scripts = []

        self.external_styles = []


    def handle_starttag(
        self,
        tag,
        attrs
    ):

        attrs_dict = dict(attrs)

        tag_lower = tag.lower()


        # -----------------------------------------------------
        # TITLE
        # -----------------------------------------------------

        if tag_lower == "title":

            self.in_title = True


        # -----------------------------------------------------
        # META
        # -----------------------------------------------------

        if tag_lower == "meta":

            self.meta.append(
                attrs_dict
            )


        # -----------------------------------------------------
        # LINKS
        # -----------------------------------------------------

        if tag_lower == "link":

            self.links.append(
                attrs_dict
            )


        # -----------------------------------------------------
        # IMAGES
        # -----------------------------------------------------

        if tag_lower == "img":

            self.images.append(
                attrs_dict
            )


        # -----------------------------------------------------
        # HEADINGS
        # -----------------------------------------------------

        if re.match(
            r"^h[1-6]$",
            tag_lower
        ):

            self.headings.append(
                {
                    "tag": tag_lower,
                    "text": ""
                }
            )


        # -----------------------------------------------------
        # BUTTONS
        # -----------------------------------------------------

        if tag_lower == "button":

            self.buttons.append(
                attrs_dict
            )


        # -----------------------------------------------------
        # INPUTS
        # -----------------------------------------------------

        if tag_lower in [
            "input",
            "textarea",
            "select"
        ]:

            self.inputs.append(
                {
                    "tag": tag_lower,
                    "attrs": attrs_dict
                }
            )


        # -----------------------------------------------------
        # SCRIPTS
        # -----------------------------------------------------

        if tag_lower == "script":

            self.script_count += 1

            src = attrs_dict.get(
                "src",
                ""
            )

            if src.startswith(
                "http://"
            ) or src.startswith(
                "https://"
            ):

                self.external_scripts.append(
                    src
                )


        # -----------------------------------------------------
        # STYLES
        # -----------------------------------------------------

        if tag_lower == "style":

            self.style_count += 1


        if tag_lower == "link":

            rel = attrs_dict.get(
                "rel",
                ""
            ).lower()


            href = attrs_dict.get(
                "href",
                ""
            )


            if (
                "stylesheet" in rel
                and (
                    href.startswith(
                        "http://"
                    )
                    or
                    href.startswith(
                        "https://"
                    )
                )
            ):

                self.external_styles.append(
                    href
                )


    def handle_endtag(
        self,
        tag
    ):

        if tag.lower() == "title":

            self.in_title = False


    def handle_data(
        self,
        data
    ):

        cleaned = (
            data
            .strip()
        )


        if not cleaned:

            return


        self.text_chunks.append(
            cleaned
        )


        if self.in_title:

            self.title += (
                " " +
                cleaned
            ).strip()


        if self.headings:

            last_heading = (
                self.headings[-1]
            )


            if last_heading["text"] == "":

                last_heading["text"] = cleaned


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def clean_text(text):

    return re.sub(
        r"\s+",
        " ",
        text or ""
    ).strip()


def word_count(text):

    words = re.findall(
        r"\b[\w'-]+\b",
        text or "",
        flags=re.UNICODE
    )

    return len(words)


def get_meta(
    parser,
    name=None,
    property_name=None
):

    for meta in parser.meta:

        meta_name = (
            meta.get(
                "name",
                ""
            )
            .strip()
            .lower()
        )


        meta_property = (
            meta.get(
                "property",
                ""
            )
            .strip()
            .lower()
        )


        if name and meta_name == name.lower():

            return meta.get(
                "content",
                ""
            ).strip()


        if (
            property_name
            and
            meta_property == property_name.lower()
        ):

            return meta.get(
                "content",
                ""
            ).strip()


    return ""


def get_canonical(parser):

    for link in parser.links:

        rel = (
            link.get(
                "rel",
                ""
            )
            .lower()
        )


        if "canonical" in rel:

            return link.get(
                "href",
                ""
            ).strip()


    return ""


def has_viewport(parser):

    viewport = get_meta(
        parser,
        name="viewport"
    )

    return bool(
        viewport
    )


def has_structured_data(html):

    return bool(
        re.search(
            r'<script[^>]+type=["\']application/ld\+json["\']',
            html,
            flags=re.IGNORECASE
        )
    )


def has_faq(html):

    patterns = [

        r"frequently asked questions",

        r"\bfaq\b",

        r"tool-faq",

        r"faq-section"

    ]


    for pattern in patterns:

        if re.search(
            pattern,
            html,
            flags=re.IGNORECASE
        ):

            return True


    return False


def has_how_to_section(html):

    patterns = [

        r"how to use",

        r"how it works",

        r"steps to use",

        r"step-by-step",

        r"steps"

    ]


    return any(
        re.search(
            pattern,
            html,
            flags=re.IGNORECASE
        )
        for pattern in patterns
    )


def has_privacy_section(html):

    patterns = [

        r"privacy",

        r"processed locally",

        r"processed in your browser",

        r"your files are not uploaded"

    ]


    return any(
        re.search(
            pattern,
            html,
            flags=re.IGNORECASE
        )
        for pattern in patterns
    )


def has_use_cases(html):

    patterns = [

        r"use cases",

        r"who can use",

        r"ideal for",

        r"perfect for",

        r"you can use"

    ]


    return any(
        re.search(
            pattern,
            html,
            flags=re.IGNORECASE
        )
        for pattern in patterns
    )


def has_limitations(html):

    patterns = [

        r"limitations",

        r"limitations and",

        r"things to know",

        r"important notes",

        r"please note"

    ]


    return any(
        re.search(
            pattern,
            html,
            flags=re.IGNORECASE
        )
        for pattern in patterns
    )


def has_related_tools(html):

    patterns = [

        r"related tools",

        r"more tools",

        r"you may also like",

        r"similar tools"

    ]


    return any(
        re.search(
            pattern,
            html,
            flags=re.IGNORECASE
        )
        for pattern in patterns
    )


def count_internal_links(
    parser
):

    count = 0


    for link in parser.links:

        href = link.get(
            "href",
            ""
        ).strip()


        if not href:

            continue


        if href.startswith(
            "#"
        ):

            continue


        if href.startswith(
            "/"
        ):

            count += 1

            continue


        if href.startswith(
            SITE_BASE_URL
        ):

            count += 1


    return count


def count_external_links(
    parser
):

    count = 0


    for link in parser.links:

        href = link.get(
            "href",
            ""
        ).strip()


        if (
            href.startswith(
                "http://"
            )
            or
            href.startswith(
                "https://"
            )
        ):

            if not href.startswith(
                SITE_BASE_URL
            ):

                count += 1


    return count


# ============================================================
# META QUALITY
# ============================================================

def score_title(
    title,
    tool_name
):

    issues = []

    points = 0


    title = clean_text(
        title
    )


    if not title:

        issues.append(
            (
                "HIGH",
                "Missing <title> tag."
            )
        )

        return 0, issues


    points += 5


    length = len(title)


    if length < 30:

        issues.append(
            (
                "MEDIUM",
                f"Title is short ({length} characters)."
            )
        )


    elif length > 65:

        issues.append(
            (
                "MEDIUM",
                f"Title may be too long ({length} characters)."
            )
        )


    else:

        points += 1


    if tool_name:

        if tool_name.lower() in title.lower():

            points += 1

        else:

            issues.append(
                (
                    "MEDIUM",
                    "Tool name is not clearly present in title."
                )
            )


    return min(points, 7), issues


def score_description(
    description,
    tool_name
):

    issues = []

    points = 0


    description = clean_text(
        description
    )


    if not description:

        issues.append(
            (
                "HIGH",
                "Missing meta description."
            )
        )

        return 0, issues


    points += 5


    length = len(
        description
    )


    if length < 100:

        issues.append(
            (
                "MEDIUM",
                f"Meta description is short ({length} characters)."
            )
        )


    elif length > 170:

        issues.append(
            (
                "LOW",
                f"Meta description may be too long ({length} characters)."
            )
        )


    else:

        points += 1


    if tool_name:

        if tool_name.lower() in description.lower():

            points += 1

        else:

            issues.append(
                (
                    "LOW",
                    "Tool name is not clearly present in meta description."
                )
            )


    return min(points, 7), issues


# ============================================================
# MAIN TOOL AUDIT
# ============================================================

def audit_tool(
    tool_dir,
    slug
):

    index_file = os.path.join(
        tool_dir,
        "index.html"
    )


    logo_file = os.path.join(
        tool_dir,
        "logo.jpg"
    )


    result = {

        "slug": slug,

        "path": tool_dir,

        "score": 0,

        "grade": "",

        "categories": {

            "seo": 0,

            "content": 0,

            "technical": 0,

            "performance": 0,

            "accessibility": 0

        },

        "issues": [],

        "checks": {},

        "stats": {}

    }


    # ---------------------------------------------------------
    # Basic files
    # ---------------------------------------------------------

    if not os.path.isfile(
        index_file
    ):

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": "index.html is missing."
            }
        )

        return result


    if not os.path.isfile(
        logo_file
    ):

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": "logo.jpg is missing."
            }
        )


    # ---------------------------------------------------------
    # Read HTML
    # ---------------------------------------------------------

    try:

        with open(
            index_file,
            "r",
            encoding="utf-8"
        ) as f:

            html = f.read()

    except Exception as error:

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": f"Unable to read index.html: {error}"
            }
        )

        return result


    parser = SEOHTMLParser()


    try:

        parser.feed(
            html
        )

    except Exception as error:

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": f"HTML parser error: {error}"
            }
        )


    # ---------------------------------------------------------
    # Metadata
    # ---------------------------------------------------------

    tool_name = get_meta(
        parser,
        name="tool:name"
    )


    tool_description = get_meta(
        parser,
        name="tool:description"
    )


    tool_category = get_meta(
        parser,
        name="tool:category"
    )


    tool_keywords = get_meta(
        parser,
        name="tool:keywords"
    )


    status = get_meta(
        parser,
        name="tool:status"
    )


    title = clean_text(
        parser.title
    )


    meta_description = get_meta(
        parser,
        name="description"
    )


    canonical = get_canonical(
        parser
    )


    robots = get_meta(
        parser,
        name="robots"
    )


    og_title = get_meta(
        parser,
        property_name="og:title"
    )


    og_description = get_meta(
        parser,
        property_name="og:description"
    )


    og_url = get_meta(
        parser,
        property_name="og:url"
    )


    # =========================================================
    # SEO — 30 POINTS
    # =========================================================

    seo_score = 0


    title_score, title_issues = score_title(
        title,
        tool_name
    )


    seo_score += min(
        title_score,
        7
    )


    for priority, message in title_issues:

        result["issues"].append(
            {
                "priority": priority,
                "message": message
            }
        )


    description_score, description_issues = score_description(
        meta_description,
        tool_name
    )


    seo_score += min(
        description_score,
        7
    )


    for priority, message in description_issues:

        result["issues"].append(
            {
                "priority": priority,
                "message": message
            }
        )


    # Canonical

    if canonical:

        seo_score += 4

    else:

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": "Missing canonical URL."
            }
        )


    # Robots

    if robots:

        seo_score += 2

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Robots meta tag is missing."
            }
        )


    # Open Graph

    if og_title:

        seo_score += 2

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Missing og:title."
            }
        )


    if og_description:

        seo_score += 2

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Missing og:description."
            }
        )


    if og_url:

        seo_score += 2

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Missing og:url."
            }
        )


    if tool_name:

        seo_score += 1

    else:

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": "Missing Nisulka tool:name metadata."
            }
        )


    if tool_category:

        seo_score += 1

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": "Missing tool:category metadata."
            }
        )


    result["categories"]["seo"] = min(
        seo_score,
        30
    )


    # =========================================================
    # CONTENT — 25 POINTS
    # =========================================================

    content_score = 0


    visible_text = clean_text(
        " ".join(
            parser.text_chunks
        )
    )


    words = word_count(
        visible_text
    )


    result["stats"]["wordCount"] = words


    # H1

    h1s = [
        heading
        for heading in parser.headings
        if heading["tag"] == "h1"
    ]


    if len(h1s) == 1:

        content_score += 4

    elif len(h1s) == 0:

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": "Missing H1 heading."
            }
        )

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": "Multiple H1 headings found."
            }
        )


    # Introduction

    if words >= 250:

        content_score += 5

    elif words >= 150:

        content_score += 3

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": "Visible content is relatively short."
            }
        )

    else:

        content_score += 1

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": "Page has very little visible text content."
            }
        )


    # How-to

    if has_how_to_section(
        html
    ):

        content_score += 4

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": "Missing useful 'How to use' or step-by-step section."
            }
        )


    # Use cases

    if has_use_cases(
        html
    ):

        content_score += 3

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Consider adding practical use cases."
            }
        )


    # Privacy

    if has_privacy_section(
        html
    ):

        content_score += 3

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Consider explaining privacy/file-processing behavior."
            }
        )


    # Limitations

    if has_limitations(
        html
    ):

        content_score += 2

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Consider documenting tool limitations."
            }
        )


    # FAQ

    if has_faq(
        html
    ):

        content_score += 2

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": "Missing FAQ section."
            }
        )


    # Related tools

    if has_related_tools(
        html
    ):

        content_score += 2

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Consider adding related tools/internal links."
            }
        )


    result["categories"]["content"] = min(
        content_score,
        25
    )


    # =========================================================
    # TECHNICAL SEO — 20 POINTS
    # =========================================================

    technical_score = 0


    # Viewport

    if has_viewport(
        parser
    ):

        technical_score += 3

    else:

        result["issues"].append(
            {
                "priority": "HIGH",
                "message": "Missing mobile viewport metadata."
            }
        )


    # Structured data

    if has_structured_data(
        html
    ):

        technical_score += 4

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": "Missing JSON-LD structured data."
            }
        )


    # Breadcrumb

    if re.search(
        r"breadcrumb",
        html,
        flags=re.IGNORECASE
    ):

        technical_score += 3

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Consider adding breadcrumb navigation."
            }
        )


    # Internal links

    internal_links = count_internal_links(
        parser
    )


    result["stats"]["internalLinks"] = (
        internal_links
    )


    if internal_links >= 3:

        technical_score += 4

    elif internal_links >= 1:

        technical_score += 2

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "Consider adding more useful internal links."
            }
        )

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": "No internal links detected."
            }
        )


    # Canonical validity

    if canonical:

        parsed = urlparse(
            canonical
        )


        if parsed.scheme in [
            "http",
            "https"
        ] and parsed.netloc:

            technical_score += 3

        else:

            result["issues"].append(
                {
                    "priority": "MEDIUM",
                    "message": "Canonical URL does not appear to be absolute."
                }
            )


    # HTML language

    if re.search(
        r'<html[^>]+lang=["\'][^"\']+["\']',
        html,
        flags=re.IGNORECASE
    ):

        technical_score += 3

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": "HTML lang attribute is missing."
            }
        )


    result["categories"]["technical"] = min(
        technical_score,
        20
    )


    # =========================================================
    # PERFORMANCE — 15 POINTS
    # =========================================================

    performance_score = 15


    # External scripts

    external_scripts = len(
        parser.external_scripts
    )


    result["stats"]["externalScripts"] = (
        external_scripts
    )


    if external_scripts > 8:

        performance_score -= 4

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": (
                    f"Many external scripts detected ({external_scripts}). "
                    "Review whether all are necessary."
                )
            }
        )

    elif external_scripts > 4:

        performance_score -= 2

        result["issues"].append(
            {
                "priority": "LOW",
                "message": (
                    f"Several external scripts detected ({external_scripts})."
                )
            }
        )


    # External styles

    external_styles = len(
        parser.external_styles
    )


    result["stats"]["externalStyles"] = (
        external_styles
    )


    if external_styles > 5:

        performance_score -= 2

        result["issues"].append(
            {
                "priority": "LOW",
                "message": (
                    f"Several external stylesheets detected ({external_styles})."
                )
            }
        )


    # Images

    image_count = len(
        parser.images
    )


    result["stats"]["images"] = image_count


    images_without_alt = 0


    for image in parser.images:

        if "alt" not in image:

            images_without_alt += 1


    result["stats"]["imagesWithoutAlt"] = (
        images_without_alt
    )


    if images_without_alt:

        performance_score -= 1


        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": (
                    f"{images_without_alt} image(s) missing alt attributes."
                )
            }
        )


    # Inline styles

    inline_style_count = len(
        re.findall(
            r"\sstyle\s*=",
            html,
            flags=re.IGNORECASE
        )
    )


    result["stats"]["inlineStyles"] = (
        inline_style_count
    )


    if inline_style_count > 20:

        performance_score -= 2

        result["issues"].append(
            {
                "priority": "LOW",
                "message": (
                    "Large number of inline style attributes detected."
                )
            }
        )


    # Inline scripts

    inline_script_blocks = len(
        re.findall(
            r"<script\b(?![^>]*\bsrc=)",
            html,
            flags=re.IGNORECASE
        )
    )


    result["stats"]["inlineScriptBlocks"] = (
        inline_script_blocks
    )


    if inline_script_blocks > 5:

        performance_score -= 1

        result["issues"].append(
            {
                "priority": "LOW",
                "message": (
                    "Several inline script blocks detected."
                )
            }
        )


    performance_score = max(
        0,
        performance_score
    )


    result["categories"]["performance"] = min(
        performance_score,
        15
    )


    # =========================================================
    # ACCESSIBILITY — 10 POINTS
    # =========================================================

    accessibility_score = 0


    # Images alt

    if image_count == 0:

        accessibility_score += 2

    elif images_without_alt == 0:

        accessibility_score += 2

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": (
                    "Some images do not have alt attributes."
                )
            }
        )


    # Form labels

    unlabeled_inputs = 0


    for field in parser.inputs:

        attrs = field["attrs"]

        field_type = (
            attrs
            .get(
                "type",
                ""
            )
            .lower()
        )


        if field_type == "hidden":

            continue


        has_label_reference = (
            "aria-label" in attrs
            or
            "aria-labelledby" in attrs
            or
            "id" in attrs
        )


        if not has_label_reference:

            unlabeled_inputs += 1


    if unlabeled_inputs == 0:

        accessibility_score += 3

    else:

        result["issues"].append(
            {
                "priority": "MEDIUM",
                "message": (
                    f"{unlabeled_inputs} form field(s) may lack accessible labels."
                )
            }
        )


    # Buttons

    unlabeled_buttons = 0


    for button in parser.buttons:

        if not (
            button.get("aria-label")
            or
            button.get("title")
        ):

            unlabeled_buttons += 1


    if unlabeled_buttons == 0:

        accessibility_score += 2

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": (
                    f"{unlabeled_buttons} button(s) may need accessible names."
                )
            }
        )


    # Heading hierarchy

    heading_levels = [

        int(
            heading["tag"][1]
        )

        for heading in parser.headings

    ]


    heading_problem = False


    for index in range(
        1,
        len(heading_levels)
    ):

        previous = heading_levels[
            index - 1
        ]

        current = heading_levels[
            index
        ]


        if current > previous + 1:

            heading_problem = True

            break


    if not heading_problem:

        accessibility_score += 3

    else:

        result["issues"].append(
            {
                "priority": "LOW",
                "message": (
                    "Heading hierarchy skips one or more levels."
                )
            }
        )


    result["categories"]["accessibility"] = min(
        accessibility_score,
        10
    )


    # =========================================================
    # FINAL SCORE
    # =========================================================

    total_score = sum(
        result["categories"].values()
    )


    result["score"] = total_score


    # ---------------------------------------------------------
    # Grade
    # ---------------------------------------------------------

    if total_score >= 95:

        grade = "Excellent"

    elif total_score >= 90:

        grade = "Very Good"

    elif total_score >= 80:

        grade = "Good"

    elif total_score >= 70:

        grade = "Needs Improvement"

    elif total_score >= 60:

        grade = "Weak"

    else:

        grade = "Critical"


    result["grade"] = grade


    # ---------------------------------------------------------
    # Tool metadata
    # ---------------------------------------------------------

    result["checks"] = {

        "toolName": bool(tool_name),

        "toolDescription": bool(
            tool_description
        ),

        "toolCategory": bool(
            tool_category
        ),

        "toolKeywords": bool(
            tool_keywords
        ),

        "toolStatus": status or "active",

        "title": bool(title),

        "metaDescription": bool(
            meta_description
        ),

        "canonical": bool(
            canonical
        ),

        "robots": bool(
            robots
        ),

        "ogTitle": bool(
            og_title
        ),

        "ogDescription": bool(
            og_description
        ),

        "ogUrl": bool(
            og_url
        ),

        "structuredData": has_structured_data(
            html
        ),

        "viewport": has_viewport(
            parser
        ),

        "faq": has_faq(
            html
        ),

        "howTo": has_how_to_section(
            html
        ),

        "privacy": has_privacy_section(
            html
        ),

        "useCases": has_use_cases(
            html
        ),

        "limitations": has_limitations(
            html
        ),

        "relatedTools": has_related_tools(
            html
        ),

        "logo": os.path.isfile(
            logo_file
        )

    }


    return result


# ============================================================
# GRADE EMOJI
# ============================================================

def grade_symbol(
    score
):

    if score >= 90:

        return "🟢"

    if score >= 80:

        return "🟡"

    if score >= 70:

        return "🟠"

    return "🔴"


# ============================================================
# MARKDOWN SUMMARY
# ============================================================

def generate_summary(
    results,
    generated_at
):

    total_tools = len(
        results
    )


    if total_tools == 0:

        return f"""# Nisulka Tools SEO Audit

Generated: {generated_at}

No tools were found.
"""


    average_score = round(
        sum(
            result["score"]
            for result in results
        )
        /
        total_tools,
        1
    )


    excellent = sum(
        1
        for result in results
        if result["score"] >= 95
    )


    very_good = sum(
        1
        for result in results
        if 90 <= result["score"] < 95
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
        "# Nisulka Tools SEO & Quality Audit"
    )


    lines.append("")


    lines.append(
        f"Generated: `{generated_at}`"
    )


    lines.append("")


    lines.append(
        f"## Overall Score: {average_score}/100"
    )


    lines.append("")


    lines.append(
        f"**Total tools:** {total_tools}"
    )


    lines.append("")


    lines.append(
        f"- 🟢 Excellent: {excellent}"
    )


    lines.append(
        f"- 🟢 Very Good: {very_good}"
    )


    lines.append(
        f"- 🟡 Good: {good}"
    )


    lines.append(
        f"- 🔴 Needs improvement: {needs_work}"
    )


    lines.append("")


    # ---------------------------------------------------------
    # Tool table
    # ---------------------------------------------------------

    lines.append(
        "## Tool Scores"
    )


    lines.append("")


    lines.append(
        "| Tool | Score | Grade | SEO | Content | Technical | Performance | Accessibility |"
    )


    lines.append(
        "|---|---:|---|---:|---:|---:|---:|---:|"
    )


    sorted_results = sorted(
        results,
        key=lambda item: item["score"]
    )


    for result in sorted_results:

        categories = result[
            "categories"
        ]


        symbol = grade_symbol(
            result["score"]
        )


        lines.append(

            "| "
            + result["slug"]
            + " | "
            + f"{symbol} {result['score']}/100"
            + " | "
            + result["grade"]
            + " | "
            + f"{categories['seo']}/30"
            + " | "
            + f"{categories['content']}/25"
            + " | "
            + f"{categories['technical']}/20"
            + " | "
            + f"{categories['performance']}/15"
            + " | "
            + f"{categories['accessibility']}/10"
            + " |"

        )


    lines.append("")


    # ---------------------------------------------------------
    # Priority improvements
    # ---------------------------------------------------------

    lines.append(
        "## Priority Improvements"
    )


    lines.append("")


    priority_order = [
        "HIGH",
        "MEDIUM",
        "LOW"
    ]


    found_issue = False


    for priority in priority_order:

        issues = []


        for result in results:

            for issue in result["issues"]:

                if issue["priority"] == priority:

                    issues.append(
                        (
                            result["slug"],
                            issue["message"]
                        )
                    )


        if not issues:

            continue


        found_issue = True


        heading = {
            "HIGH": "### 🔴 High Priority",
            "MEDIUM": "### 🟠 Medium Priority",
            "LOW": "### 🟡 Low Priority"
        }[priority]


        lines.append(
            heading
        )


        lines.append("")


        for slug, message in issues:

            lines.append(
                f"- **{slug}** — {message}"
            )


        lines.append("")


    if not found_issue:

        lines.append(
            "No issues detected."
        )


        lines.append("")


    # ---------------------------------------------------------
    # Lowest scoring tools
    # ---------------------------------------------------------

    lines.append(
        "## Tools Needing the Most Attention"
    )


    lines.append("")


    for result in sorted_results[:5]:

        lines.append(
            f"- **{result['slug']}** — "
            f"{result['score']}/100 "
            f"({result['grade']})"
        )


    lines.append("")


    # ---------------------------------------------------------
    # Important note
    # ---------------------------------------------------------

    lines.append(
        "## Important"
    )


    lines.append("")


    lines.append(
        "This score is a technical/content quality "
        "audit created by Nisulka Tools. It is **not** "
        "an official Google ranking score and does not "
        "guarantee Google Search rankings or AdSense approval."
    )


    lines.append("")


    return "\n".join(
        lines
    )


# ============================================================
# CSV REPORT
# ============================================================

def write_csv(
    results,
    output_file
):

    fields = [

        "slug",

        "score",

        "grade",

        "seo",

        "content",

        "technical",

        "performance",

        "accessibility",

        "word_count",

        "internal_links",

        "external_scripts",

        "images",

        "images_without_alt",

        "high_issues",

        "medium_issues",

        "low_issues"

    ]


    with open(
        output_file,
        "w",
        encoding="utf-8",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=fields
        )


        writer.writeheader()


        for result in results:

            categories = result[
                "categories"
            ]


            issues = result[
                "issues"
            ]


            writer.writerow({

                "slug":
                    result["slug"],

                "score":
                    result["score"],

                "grade":
                    result["grade"],

                "seo":
                    categories["seo"],

                "content":
                    categories["content"],

                "technical":
                    categories["technical"],

                "performance":
                    categories["performance"],

                "accessibility":
                    categories["accessibility"],

                "word_count":
                    result["stats"].get(
                        "wordCount",
                        0
                    ),

                "internal_links":
                    result["stats"].get(
                        "internalLinks",
                        0
                    ),

                "external_scripts":
                    result["stats"].get(
                        "externalScripts",
                        0
                    ),

                "images":
                    result["stats"].get(
                        "images",
                        0
                    ),

                "images_without_alt":
                    result["stats"].get(
                        "imagesWithoutAlt",
                        0
                    ),

                "high_issues":
                    sum(
                        1
                        for issue in issues
                        if issue["priority"] == "HIGH"
                    ),

                "medium_issues":
                    sum(
                        1
                        for issue in issues
                        if issue["priority"] == "MEDIUM"
                    ),

                "low_issues":
                    sum(
                        1
                        for issue in issues
                        if issue["priority"] == "LOW"
                    )

            })


# ============================================================
# MAIN
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "Audit Nisulka Tools for SEO "
            "and content quality."
        )
    )


    parser.add_argument(
        "--tools-dir",
        default=DEFAULT_TOOLS_DIR
    )


    parser.add_argument(
        "--output-dir",
        default=DEFAULT_OUTPUT_DIR
    )


    args = parser.parse_args()


    tools_dir = args.tools_dir

    output_dir = args.output_dir


    os.makedirs(
        output_dir,
        exist_ok=True
    )


    generated_at = datetime.now(
        timezone.utc
    ).isoformat()


    results = []


    # =========================================================
    # Find tools
    # =========================================================

    if not os.path.isdir(
        tools_dir
    ):

        print(
            f"ERROR: {tools_dir} directory does not exist."
        )

        sys.exit(1)


    for slug in sorted(
        os.listdir(
            tools_dir
        )
    ):

        tool_dir = os.path.join(
            tools_dir,
            slug
        )


        if not os.path.isdir(
            tool_dir
        ):

            continue


        index_file = os.path.join(
            tool_dir,
            "index.html"
        )


        if not os.path.isfile(
            index_file
        ):

            print(
                f"Skipping {slug}: index.html missing"
            )

            continue


        print(
            f"Auditing: {slug}"
        )


        result = audit_tool(
            tool_dir,
            slug
        )


        results.append(
            result
        )


    # =========================================================
    # Overall statistics
    # =========================================================

    total_tools = len(
        results
    )


    average_score = (

        round(
            sum(
                result["score"]
                for result in results
            )
            /
            total_tools,
            1
        )

        if total_tools

        else 0

    )


    overall = {

        "generatedAt":
            generated_at,

        "totalTools":
            total_tools,

        "averageScore":
            average_score,

        "results":
            results

    }


    # =========================================================
    # Write JSON
    # =========================================================

    json_file = os.path.join(
        output_dir,
        "report.json"
    )


    with open(
        json_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            overall,
            f,
            ensure_ascii=False,
            indent=2
        )


        f.write("\n")


    # =========================================================
    # Write Markdown
    # =========================================================

    summary = generate_summary(
        results,
        generated_at
    )


    summary_file = os.path.join(
        output_dir,
        "summary.md"
    )


    with open(
        summary_file,
        "w",
        encoding="utf-8"
    ) as f:

        f.write(
            summary
        )


    # =========================================================
    # Write CSV
    # =========================================================

    csv_file = os.path.join(
        output_dir,
        "tools.csv"
    )


    write_csv(
        results,
        csv_file
    )


    # =========================================================
    # Console output
    # =========================================================

    print()
    print(
        "=============================================="
    )

    print(
        "NISULKA TOOLS SEO AUDIT"
    )

    print(
        "=============================================="
    )

    print(
        f"Tools audited: {total_tools}"
    )

    print(
        f"Average score: {average_score}/100"
    )

    print()


    for result in sorted(
        results,
        key=lambda item: item["score"]
    ):

        print(
            f"{result['slug']}: "
            f"{result['score']}/100 "
            f"({result['grade']})"
        )


    print()
    print(
        f"JSON report: {json_file}"
    )

    print(
        f"Markdown report: {summary_file}"
    )

    print(
        f"CSV report: {csv_file}"
    )

    print(
        "=============================================="
    )


    # =========================================================
    # Exit code
    #
    # We intentionally DO NOT fail the workflow merely
    # because a page has a low SEO score.
    #
    # This lets you inspect and improve gradually.
    # =========================================================

    sys.exit(0)


if __name__ == "__main__":

    main()
