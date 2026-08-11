import os
import re
import json
from html.parser import HTMLParser
from urllib.parse import urlparse


TOOLS_DIR = "tools"
OUTPUT_FILE = "data/seo-audit.json"

SITE_URL = "https://apps.laxmannepal.com.np/Nisulka-Tools"


# ============================================================
# HTML PARSER
# ============================================================

class SEOParser(HTMLParser):

    def __init__(self):
        super().__init__()

        self.title = ""
        self.meta = {}

        self.h1 = []
        self.h2 = []
        self.h3 = []

        self.images = []
        self.links = []

        self.body_text = []

        self.schema_blocks = []

        self.current_tag = None
        self.current_attrs = {}

        self.in_title = False
        self.in_script = False
        self.current_script = ""

    def handle_starttag(self, tag, attrs):

        attrs_dict = dict(attrs)

        self.current_tag = tag
        self.current_attrs = attrs_dict

        if tag == "title":
            self.in_title = True

        elif tag == "script":

            script_type = attrs_dict.get(
                "type",
                ""
            ).lower()

            if script_type == "application/ld+json":

                self.in_script = True
                self.current_script = ""

        elif tag == "img":

            self.images.append(
                {
                    "src": attrs_dict.get("src", ""),
                    "alt": attrs_dict.get("alt"),
                    "loading": attrs_dict.get("loading")
                }
            )

        elif tag == "a":

            self.links.append(
                attrs_dict.get("href", "")
            )

    def handle_endtag(self, tag):

        if tag == "title":
            self.in_title = False

        elif tag == "script" and self.in_script:

            self.schema_blocks.append(
                self.current_script.strip()
            )

            self.current_script = ""
            self.in_script = False

        self.current_tag = None

    def handle_data(self, data):

        clean = data.strip()

        if not clean:
            return

        if self.in_title:

            self.title += " " + clean

        elif self.in_script:

            self.current_script += data

        elif self.current_tag in [
            "h1",
            "h2",
            "h3"
        ]:

            if self.current_tag == "h1":
                self.h1.append(clean)

            elif self.current_tag == "h2":
                self.h2.append(clean)

            elif self.current_tag == "h3":
                self.h3.append(clean)

        else:

            self.body_text.append(clean)


# ============================================================
# META EXTRACTION
# ============================================================

def extract_meta(html):

    metadata = {}

    patterns = re.findall(
        r"<meta\s+([^>]+)>",
        html,
        re.IGNORECASE
    )

    for attributes in patterns:

        name_match = re.search(
            r'name=["\']([^"\']+)["\']',
            attributes,
            re.IGNORECASE
        )

        property_match = re.search(
            r'property=["\']([^"\']+)["\']',
            attributes,
            re.IGNORECASE
        )

        content_match = re.search(
            r'content=["\'](.*?)["\']',
            attributes,
            re.IGNORECASE | re.DOTALL
        )

        if not content_match:
            continue

        content = content_match.group(1).strip()

        if name_match:

            metadata[
                name_match.group(1).lower()
            ] = content

        if property_match:

            metadata[
                property_match.group(1).lower()
            ] = content

    return metadata


# ============================================================
# TOOL META
# ============================================================

def extract_tool_meta(html):

    metadata = {}

    patterns = re.findall(
        r"<meta\s+([^>]+)>",
        html,
        re.IGNORECASE
    )

    for attributes in patterns:

        name_match = re.search(
            r'name=["\']([^"\']+)["\']',
            attributes,
            re.IGNORECASE
        )

        content_match = re.search(
            r'content=["\'](.*?)["\']',
            attributes,
            re.IGNORECASE | re.DOTALL
        )

        if not name_match or not content_match:
            continue

        name = name_match.group(1).lower()

        if name.startswith("tool:"):

            metadata[
                name.replace("tool:", "")
            ] = content_match.group(1).strip()

    return metadata


# ============================================================
# URL HELPERS
# ============================================================

def is_internal_link(href):

    if not href:
        return False

    if href.startswith("#"):
        return True

    if href.startswith("/"):
        return True

    parsed = urlparse(href)

    if not parsed.netloc:
        return True

    return (
        parsed.netloc
        == urlparse(SITE_URL).netloc
    )


# ============================================================
# ISSUE CREATOR
# ============================================================

def issue(
    severity,
    category,
    message,
    points
):

    return {
        "severity": severity,
        "category": category,
        "message": message,
        "points": points
    }


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

    if not os.path.isfile(index_file):

        return None

    with open(
        index_file,
        "r",
        encoding="utf-8"
    ) as file:

        html = file.read()


    parser = SEOParser()

    try:

        parser.feed(html)

    except Exception as error:

        return {
            "slug": slug,
            "score": 0,
            "grade": "F",
            "error": str(error),
            "issues": [
                issue(
                    "critical",
                    "html",
                    "Unable to parse HTML correctly.",
                    100
                )
            ]
        }


    meta = extract_meta(html)

    tool_meta = extract_tool_meta(html)

    issues = []

    score = 100


    # ========================================================
    # TITLE
    # ========================================================

    title = parser.title.strip()

    if not title:

        issues.append(
            issue(
                "critical",
                "title",
                "Missing HTML title.",
                15
            )
        )

        score -= 15

    else:

        title_length = len(title)

        if title_length < 30:

            issues.append(
                issue(
                    "medium",
                    "title",
                    "Title is shorter than 30 characters.",
                    5
                )
            )

            score -= 5

        elif title_length > 65:

            issues.append(
                issue(
                    "medium",
                    "title",
                    "Title is longer than approximately 65 characters.",
                    4
                )
            )

            score -= 4


    # ========================================================
    # META DESCRIPTION
    # ========================================================

    description = meta.get(
        "description",
        ""
    )

    if not description:

        issues.append(
            issue(
                "critical",
                "metadata",
                "Missing meta description.",
                12
            )
        )

        score -= 12

    else:

        description_length =
            len(description)

        if description_length < 100:

            issues.append(
                issue(
                    "medium",
                    "metadata",
                    "Meta description is quite short.",
                    4
                )
            )

            score -= 4

        elif description_length > 170:

            issues.append(
                issue(
                    "medium",
                    "metadata",
                    "Meta description may be too long.",
                    3
                )
            )

            score -= 3


    # ========================================================
    # H1
    # ========================================================

    h1_count = len(parser.h1)

    if h1_count == 0:

        issues.append(
            issue(
                "critical",
                "content",
                "Missing H1 heading.",
                10
            )
        )

        score -= 10

    elif h1_count > 1:

        issues.append(
            issue(
                "medium",
                "content",
                f"Found {h1_count} H1 headings. Prefer one primary H1.",
                4
            )
        )

        score -= 4


    # ========================================================
    # H2
    # ========================================================

    if len(parser.h2) == 0:

        issues.append(
            issue(
                "low",
                "content",
                "No H2 headings found.",
                3
            )
        )

        score -= 3


    # ========================================================
    # CANONICAL
    # ========================================================

    canonical_match = re.search(
        r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']',
        html,
        re.IGNORECASE
    )

    if not canonical_match:

        issues.append(
            issue(
                "high",
                "technical",
                "Missing canonical URL.",
                8
            )
        )

        score -= 8


    # ========================================================
    # ROBOTS
    # ========================================================

    robots = meta.get(
        "robots",
        ""
    ).lower()

    if not robots:

        issues.append(
            issue(
                "low",
                "technical",
                "Robots meta tag is missing.",
                2
            )
        )

        score -= 2

    elif "noindex" in robots:

        issues.append(
            issue(
                "critical",
                "indexing",
                "Page contains noindex.",
                15
            )
        )

        score -= 15


    # ========================================================
    # VIEWPORT
    # ========================================================

    viewport = meta.get(
        "viewport",
        ""
    )

    if not viewport:

        issues.append(
            issue(
                "high",
                "mobile",
                "Missing mobile viewport meta tag.",
                6
            )
        )

        score -= 6


    # ========================================================
    # OPEN GRAPH
    # ========================================================

    og_title = meta.get(
        "og:title"
    )

    og_description = meta.get(
        "og:description"
    )

    og_url = meta.get(
        "og:url"
    )

    missing_og = []

    if not og_title:
        missing_og.append("og:title")

    if not og_description:
        missing_og.append("og:description")

    if not og_url:
        missing_og.append("og:url")


    if missing_og:

        issues.append(
            issue(
                "low",
                "social",
                "Missing Open Graph fields: "
                + ", ".join(missing_og),
                3
            )
        )

        score -= 3


    # ========================================================
    # STRUCTURED DATA
    # ========================================================

    valid_schema = False

    for schema in parser.schema_blocks:

        try:

            parsed =
                json.loads(schema)

            if isinstance(parsed, dict):

                if (
                    "@context" in parsed
                    and "@type" in parsed
                ):

                    valid_schema = True

        except Exception:

            pass


    if not valid_schema:

        issues.append(
            issue(
                "high",
                "structured-data",
                "No valid JSON-LD structured data detected.",
                7
            )
        )

        score -= 7


    # ========================================================
    # IMAGES
    # ========================================================

    images_without_alt = 0

    for image in parser.images:

        alt = image.get("alt")

        if alt is None:

            images_without_alt += 1


    if images_without_alt:

        issues.append(
            issue(
                "medium",
                "images",
                f"{images_without_alt} image(s) are missing alt attributes.",
                3
            )
        )

        score -= 3


    # ========================================================
    # CONTENT
    # ========================================================

    text_content = " ".join(
        parser.body_text
    )

    word_count = len(
        re.findall(
            r"\b[\w'-]+\b",
            text_content
        )
    )


    if word_count < 250:

        issues.append(
            issue(
                "high",
                "content",
                f"Page contains approximately {word_count} words of visible text. Consider adding useful explanatory content.",
                8
            )
        )

        score -= 8

    elif word_count < 500:

        issues.append(
            issue(
                "medium",
                "content",
                f"Page contains approximately {word_count} words. More useful supporting content may improve topical coverage.",
                4
            )
        )

        score -= 4


    # ========================================================
    # FAQ
    # ========================================================

    faq_detected = bool(
        re.search(
            r"frequently asked|faq",
            html,
            re.IGNORECASE
        )
    )


    if not faq_detected:

        issues.append(
            issue(
                "low",
                "content",
                "No FAQ section detected.",
                2
            )
        )

        score -= 2


    # ========================================================
    # BREADCRUMB
    # ========================================================

    breadcrumb_detected = bool(
        re.search(
            r"breadcrumb",
            html,
            re.IGNORECASE
        )
    )


    if not breadcrumb_detected:

        issues.append(
            issue(
                "low",
                "navigation",
                "No breadcrumb navigation detected.",
                2
            )
        )

        score -= 2


    # ========================================================
    # INTERNAL LINKS
    # ========================================================

    internal_links = [

        href

        for href in parser.links

        if is_internal_link(href)

    ]


    if len(internal_links) < 2:

        issues.append(
            issue(
                "medium",
                "internal-links",
                "Very few internal links detected.",
                3
            )
        )

        score -= 3


    # ========================================================
    # TOOL METADATA
    # ========================================================

    tool_name = tool_meta.get(
        "name"
    )

    tool_description = tool_meta.get(
        "description"
    )

    tool_category = tool_meta.get(
        "category"
    )


    if not tool_name:

        issues.append(
            issue(
                "medium",
                "tool-metadata",
                "Missing tool:name metadata.",
                2
            )
        )

        score -= 2


    if not tool_description:

        issues.append(
            issue(
                "medium",
                "tool-metadata",
                "Missing tool:description metadata.",
                2
            )
        )

        score -= 2


    if not tool_category:

        issues.append(
            issue(
                "low",
                "tool-metadata",
                "Missing tool:category metadata.",
                1
            )
        )

        score -= 1


    # ========================================================
    # HTTPS
    # ========================================================

    if SITE_URL.startswith("https://"):

        pass

    else:

        issues.append(
            issue(
                "critical",
                "security",
                "Site URL is not configured with HTTPS.",
                10
            )
        )

        score -= 10


    # ========================================================
    # SCORE
    # ========================================================

    score = max(
        0,
        min(
            100,
            score
        )
    )


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


    critical_count = len(
        [
            item
            for item in issues
            if item["severity"] == "critical"
        ]
    )

    high_count = len(
        [
            item
            for item in issues
            if item["severity"] == "high"
        ]
    )


    return {

        "name":
            tool_name
            or slug.replace(
                "-",
                " "
            ).title(),

        "slug":
            slug,

        "url":
            f"/Nisulka-Tools/tools/{slug}/",

        "score":
            score,

        "grade":
            grade,

        "statistics": {

            "titleLength":
                len(title),

            "descriptionLength":
                len(description),

            "h1Count":
                h1_count,

            "h2Count":
                len(parser.h2),

            "h3Count":
                len(parser.h3),

            "wordCount":
                word_count,

            "imageCount":
                len(parser.images),

            "imagesWithoutAlt":
                images_without_alt,

            "internalLinks":
                len(internal_links),

            "faqDetected":
                faq_detected,

            "breadcrumbDetected":
                breadcrumb_detected,

            "schemaDetected":
                valid_schema

        },

        "metadata": {

            "title":
                title,

            "description":
                description,

            "canonical":
                canonical_match.group(1)
                if canonical_match
                else "",

            "robots":
                robots,

            "ogTitle":
                og_title or "",

            "ogDescription":
                og_description or "",

            "ogUrl":
                og_url or ""

        },

        "issues":
            issues,

        "issueSummary": {

            "critical":
                critical_count,

            "high":
                high_count,

            "total":
                len(issues)

        }

    }


# ============================================================
# MAIN
           
