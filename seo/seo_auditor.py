#!/usr/bin/env python3

import json
import os
import re
from html.parser import HTMLParser
from urllib.parse import urlparse


TOOLS_DIR = "tools"
OUTPUT_FILE = "data/seo-audit.json"


class SEOParser(HTMLParser):

    def __init__(self):
        super().__init__()

        self.title = ""
        self.description = ""
        self.h1 = []
        self.h2 = []
        self.images = 0
        self.images_without_alt = 0
        self.links = 0
        self.canonical = ""
        self.og_title = ""
        self.og_description = ""

        self.in_title = False
        self.in_h1 = False
        self.in_h2 = False

    def handle_starttag(self, tag, attrs):

        attrs = dict(attrs)

        tag = tag.lower()

        if tag == "title":
            self.in_title = True

        elif tag == "h1":
            self.in_h1 = True

        elif tag == "h2":
            self.in_h2 = True

        elif tag == "img":

            self.images += 1

            alt = attrs.get("alt")

            if not alt or not alt.strip():
                self.images_without_alt += 1

        elif tag == "a":
            self.links += 1

        elif tag == "link":

            rel = attrs.get("rel", "")

            if "canonical" in rel.lower():
                self.canonical = attrs.get("href", "")

        elif tag == "meta":

            name = (
                attrs.get("name")
                or attrs.get("property")
                or ""
            ).lower()

            content = attrs.get("content", "").strip()

            if name == "description":
                self.description = content

            elif name == "og:title":
                self.og_title = content

            elif name == "og:description":
                self.og_description = content

    def handle_endtag(self, tag):

        tag = tag.lower()

        if tag == "title":
            self.in_title = False

        elif tag == "h1":
            self.in_h1 = False

        elif tag == "h2":
            self.in_h2 = False

    def handle_data(self, data):

        text = data.strip()

        if not text:
            return

        if self.in_title:
            self.title += " " + text

        elif self.in_h1:
            self.h1.append(text)

        elif self.in_h2:
            self.h2.append(text)


def grade(score):

    if score >= 90:
        return "A+"

    if score >= 80:
        return "A"

    if score >= 70:
        return "B"

    if score >= 60:
        return "C"

    if score >= 50:
        return "D"

    return "F"


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

    try:

        with open(
            index_file,
            "r",
            encoding="utf-8"
        ) as f:

            html = f.read()

    except Exception as error:

        print(
            f"ERROR reading {index_file}: {error}"
        )

        return None

    parser = SEOParser()

    try:
        parser.feed(html)

    except Exception as error:

        print(
            f"ERROR parsing {index_file}: {error}"
        )

    title = parser.title.strip()

    description = parser.description.strip()

    h1_count = len(parser.h1)

    h2_count = len(parser.h2)

    word_count = len(
        re.findall(
            r"\b\w+\b",
            re.sub(r"<[^>]+>", " ", html)
        )
    )

    score = 0

    issues = []

    passed = []

    # --------------------------------
    # TITLE
    # --------------------------------

    if title:

        if 30 <= len(title) <= 65:

            score += 15

            passed.append(
                "Title length is good"
            )

        else:

            score += 8

            issues.append(
                f"Title length should ideally be 30-65 characters ({len(title)})"
            )

    else:

        issues.append(
            "Missing title"
        )

    # --------------------------------
    # DESCRIPTION
    # --------------------------------

    if description:

        if 120 <= len(description) <= 170:

            score += 15

            passed.append(
                "Meta description length is good"
            )

        else:

            score += 8

            issues.append(
                f"Meta description should ideally be 120-170 characters ({len(description)})"
            )

    else:

        issues.append(
            "Missing meta description"
        )

    # --------------------------------
    # H1
    # --------------------------------

    if h1_count == 1:

        score += 15

        passed.append(
            "Exactly one H1 found"
        )

    elif h1_count == 0:

        issues.append(
            "Missing H1"
        )

    else:

        score += 8

        issues.append(
            f"Multiple H1 headings found ({h1_count})"
        )

    # --------------------------------
    # H2
    # --------------------------------

    if h2_count >= 1:

        score += 10

        passed.append(
            "H2 headings found"
        )

    else:

        score += 5

        issues.append(
            "No H2 headings found"
        )

    # --------------------------------
    # CANONICAL
    # --------------------------------

    if parser.canonical:

        score += 10

        passed.append(
            "Canonical URL found"
        )

    else:

        issues.append(
            "Missing canonical URL"
        )

    # --------------------------------
    # OG TITLE
    # --------------------------------

    if parser.og_title:

        score += 5

        passed.append(
            "Open Graph title found"
        )

    else:

        issues.append(
            "Missing Open Graph title"
        )

    # --------------------------------
    # OG DESCRIPTION
    # --------------------------------

    if parser.og_description:

        score += 5

        passed.append(
            "Open Graph description found"
        )

    else:

        issues.append(
            "Missing Open Graph description"
        )

    # --------------------------------
    # IMAGES
    # --------------------------------

    if parser.images == 0:

        score += 10

        passed.append(
            "No images requiring alt text"
        )

    elif parser.images_without_alt == 0:

        score += 10

        passed.append(
            "All images have alt attributes"
        )

    else:

        score += 5

        issues.append(
            f"{parser.images_without_alt} image(s) missing alt text"
        )

    # --------------------------------
    # CONTENT
    # --------------------------------

    if word_count >= 300:

        score += 10

        passed.append(
            "Sufficient page content"
        )

    elif word_count >= 150:

        score += 6

        issues.append(
            f"Content is relatively short ({word_count} words)"
        )

    else:

        score += 2

        issues.append(
            f"Very little textual content ({word_count} words)"
        )

    # --------------------------------
    # FINAL
    # --------------------------------

    score = min(
        100,
        max(
            0,
            score
        )
    )

    return {

        "name": slug.replace(
            "-",
            " "
        ).title(),

        "slug": slug,

        "url":
            f"/Nisulka-Tools/tools/{slug}/",

        "score": score,

        "grade": grade(score),

        "title": title,

        "description": description,

        "wordCount": word_count,

        "h1Count": h1_count,

        "h2Count": h2_count,

        "images": parser.images,

        "imagesWithoutAlt":
            parser.images_without_alt,

        "canonical": parser.canonical,

        "openGraph": {

            "title":
                bool(parser.og_title),

            "description":
                bool(parser.og_description)

        },

        "passed": passed,

        "issues": issues,

        "issueSummary": {

            "total":
                len(issues),

            "critical": 0,

            "warning":
                len(issues)

        }

    }


def main():

    print("=" * 60)
    print("NISULKA TOOLS SEO AUDITOR")
    print("=" * 60)

    os.makedirs(
        "data",
        exist_ok=True
    )

    results = []

    if not os.path.isdir(TOOLS_DIR):

        print(
            f"ERROR: {TOOLS_DIR}/ directory does not exist."
        )

        # Still create JSON so workflow doesn't fail
        output = {

            "generatedAt": None,

            "totalTools": 0,

            "averageScore": 0,

            "tools": []

        }

        with open(
            OUTPUT_FILE,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                output,
                f,
                ensure_ascii=False,
                indent=2
            )

        return

    for slug in sorted(
        os.listdir(TOOLS_DIR)
    ):

        tool_dir = os.path.join(
            TOOLS_DIR,
            slug
        )

        if not os.path.isdir(tool_dir):
            continue

        result = audit_tool(slug)

        if result:

            results.append(result)

            print(
                f"{result['name']}: "
                f"{result['score']}/100 "
                f"{result['grade']}"
            )

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    for index, tool in enumerate(
        results,
        start=1
    ):

        tool["rank"] = index

    total = len(results)

    average = (
        round(
            sum(
                tool["score"]
                for tool in results
            ) / total,
            1
        )
        if total
        else 0
    )

    output = {

        "generatedAt":
            __import__("datetime")
            .datetime
            .now(
                __import__("datetime")
                .timezone.utc
            )
            .isoformat(),

        "totalTools":
            total,

        "averageScore":
            average,

        "tools":
            results

    }

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            output,
            f,
            ensure_ascii=False,
            indent=2
        )

        f.write("\n")

    print()
    print("=" * 60)
    print(
        f"Total tools: {total}"
    )
    print(
        f"Average score: {average}/100"
    )
    print(
        f"Created: {OUTPUT_FILE}"
    )
    print("=" * 60)


if __name__ == "__main__":
    main()
