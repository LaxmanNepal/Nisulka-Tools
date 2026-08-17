You are migrating an existing standalone HTML/CSS/JavaScript web tool into my existing Nisulka Tools repository.

IMPORTANT:
Do NOT redesign the tool's core functionality unless necessary.
Do NOT remove working JavaScript features.
Do NOT change the tool's actual purpose.
Your job is to make the existing tool fully compatible with the Nisulka Tools architecture, design system, SEO system, and automatic tool-data generator.

==================================================
PROJECT
==================================================

Repository:
Nisulka Tools

Base URL:
https://apps.laxmannepal.com.np/Nisulka-Tools/

Repository structure:

/
├── index.html
├── data/
│   ├── tools.json
│   └── seo-audit.json
│
├── assets/
│   ├── css/
│   │   ├── variables.css
│   │   ├── global.css
│   │   ├── components.css
│   │   ├── header.css
│   │   ├── footer.css
│   │   └── tool.css
│   │
│   └── js/
│       ├── header.js
│       ├── footer.js
│       ├── components.js
│       └── home.js
│
├── tools/
│   ├── text-to-handwriting/
│   │   ├── index.html
│   │   └── logo.jpg
│   │
│   └── other-tools/
│       ├── index.html
│       └── logo.jpg
│
├── categories/
│   └── automatically generated category pages
│
└── seo/
    └── seo_auditor.py

==================================================
EXISTING NISULKA DESIGN SYSTEM
==================================================

The tool MUST use the existing global Nisulka CSS.

From the tool directory, CSS paths must be:

../../assets/css/variables.css
../../assets/css/global.css
../../assets/css/components.css
../../assets/css/header.css
../../assets/css/footer.css
../../assets/css/tool.css

Do NOT create duplicate versions of these files.

Do NOT copy the global CSS into the tool.

Use existing variables/classes whenever possible.

The visual style should be:

- clean
- modern
- minimal
- responsive
- professional
- white/light interface
- Poppins typography
- blue primary accent
- rounded cards
- clear spacing
- mobile friendly
- accessible
- fast

==================================================
TOOL DIRECTORY
==================================================

Create the tool here:

tools/TOOL-SLUG/

Required files:

tools/TOOL-SLUG/index.html
tools/TOOL-SLUG/logo.jpg

If the existing tool has separate CSS or JS files, organize them cleanly inside:

tools/TOOL-SLUG/

For example:

tools/TOOL-SLUG/
├── index.html
├── logo.jpg
├── tool.css
└── tool.js

Do NOT place tool-specific files inside the global assets directory unless they are genuinely shared by multiple tools.

==================================================
HEADER
==================================================

The tool MUST use the shared Nisulka header.

HTML:

<div id="site-header-mount"></div>

Load:

<script src="../../assets/js/header.js"></script>

Do NOT recreate the complete header manually.

Do NOT create a second header design.

==================================================
FOOTER
==================================================

The tool MUST use the shared Nisulka footer.

HTML:

<div id="site-footer-mount"></div>

Load:

<script src="../../assets/js/footer.js"></script>

Do NOT recreate the footer manually.

==================================================
PAGE STRUCTURE
==================================================

Use this general structure:

<body>

    <div id="site-header-mount"></div>

    <main class="tool-page">

        <div class="container">

            <!-- Breadcrumb -->

            <!-- Tool Hero -->

            <!-- Tool Workspace -->

            <!-- Ad placeholder if appropriate -->

            <!-- Information -->

            <!-- FAQ -->

        </div>

    </main>

    <div id="site-footer-mount"></div>

    <script src="../../assets/js/header.js"></script>
    <script src="../../assets/js/footer.js"></script>

    <!-- tool-specific JavaScript -->

</body>

==================================================
BREADCRUMB
==================================================

Add a breadcrumb near the top:

<nav
    class="breadcrumb"
    aria-label="Breadcrumb"
>

    <a href="../../">
        Home
    </a>

    <span aria-hidden="true">
        /
    </span>

    <span>
        CATEGORY NAME
    </span>

    <span aria-hidden="true">
        /
    </span>

    <span aria-current="page">
        TOOL NAME
    </span>

</nav>

Make the category link point to the appropriate generated category page.

Example:

../../categories/text-tools/

==================================================
TOOL HERO
==================================================

Create a clean hero section containing:

- small category badge
- H1
- short useful description

Example:

<section
    class="tool-hero"
    aria-labelledby="tool-title"
>

    <span class="badge badge-primary">
        Text Tool
    </span>

    <h1 id="tool-title">
        TOOL NAME
    </h1>

    <p>
        SHORT DESCRIPTION
    </p>

</section>

Do NOT put unnecessary promotional text in the hero.

==================================================
TOOL WORKSPACE
==================================================

The actual existing tool must remain functional.

Put the existing controls inside a clean:

<section class="tool-workspace">

    <div class="tool-panel">

        <div class="tool-panel-header">
            <h2 class="tool-panel-title">
                TOOL ACTION
            </h2>

            <p class="tool-panel-description">
                Short explanation.
            </p>
        </div>

        <div class="tool-panel-body">

            EXISTING TOOL UI

        </div>

    </div>

</section>

Use existing Nisulka classes where possible:

.tool-panel
.tool-panel-header
.tool-panel-title
.tool-panel-description
.tool-panel-body
.input
.btn
.btn-primary
.tool-label
.tool-help-text
.tool-grid
.card

Do not invent dozens of unnecessary CSS classes.

==================================================
JAVASCRIPT
==================================================

Preserve all existing JavaScript functionality.

Before modifying JavaScript:

1. Understand what every function does.
2. Identify DOM IDs/classes it depends on.
3. Preserve those IDs unless there is a strong reason to change them.
4. Make sure JavaScript loads after the required HTML exists.
5. Avoid global variable pollution.
6. Use strict mode.

Start tool-specific JS with:

"use strict";

Do NOT use inline JavaScript such as:

onclick="..."

Instead use:

addEventListener()

Do NOT use external frameworks unless the original tool already requires one.

Prefer vanilla JavaScript.

==================================================
FILE PROCESSING
==================================================

If the tool processes files:

- Prefer browser-side processing where technically possible.
- Do not upload files to a server unless the original functionality requires it.
- Clearly tell users when processing happens locally.
- Do not fake privacy claims.
- Do not claim "100% private" unless technically guaranteed.

Use a notice such as:

<div class="local-processing-notice">

    <span aria-hidden="true">🔒</span>

    <div>
        Files are processed locally in your browser
        whenever supported.
    </div>

</div>

==================================================
RESPONSIVE UI
==================================================

The tool MUST work on:

- mobile
- tablet
- desktop

Avoid fixed widths.

Use:

width: 100%;
max-width: ...;
margin-inline: auto;

Use CSS Grid/Flexbox.

At mobile widths:

- stack controls
- make buttons usable
- prevent horizontal scrolling
- keep inputs readable
- make tool workspace comfortable

==================================================
ACCESSIBILITY
==================================================

Every input must have a label.

Buttons must have meaningful text.

Images must have alt attributes.

Do not use:

<div onclick="...">

Use real:

<button>
<a>
<input>
<select>
<textarea>

Use aria attributes where appropriate.

==================================================
SEO
==================================================

Create complete SEO metadata.

Required:

<title>
<meta name="description">
<meta name="robots" content="index, follow">
<link rel="canonical">

Canonical format:

https://apps.laxmannepal.com.np/Nisulka-Tools/tools/TOOL-SLUG/

Add Open Graph:

<meta property="og:type" content="website">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">

Add:

<meta name="theme-color" content="#2563eb">

Do NOT keyword stuff.

==================================================
STRUCTURED DATA
==================================================

Add valid SoftwareApplication JSON-LD.

Example:

<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TOOL NAME",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "description": "TOOL DESCRIPTION",
    "url": "CANONICAL URL",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    }
}
</script>

Only add claims that are actually true.

==================================================
CONTENT / ADSENSE VALUE
==================================================

Do NOT make the page just a tool UI.

Add genuinely useful explanatory content below the tool.

Include:

1. What is this tool?
2. How to use it
3. Key features
4. Common use cases
5. Tips
6. Privacy / processing explanation when relevant
7. FAQ

Do NOT generate meaningless SEO filler.

Do NOT repeat the same sentence with keywords.

Content should help a real user understand and use the tool.

Aim for useful, original content rather than arbitrary word count.

==================================================
FAQ
==================================================

Add 3–6 useful FAQ questions.

Use the existing Nisulka FAQ structure if available.

Example:

<div class="tool-faq">

    <article class="tool-faq-item">

        <h3>

            <button
                type="button"
                class="tool-faq-question"
                aria-expanded="false"
            >

                Question?

                <span aria-hidden="true">
                    +
                </span>

            </button>

        </h3>

        <div
            class="tool-faq-answer"
            hidden
        >

            Answer.

        </div>

    </article>

</div>

The FAQ must work with JavaScript.

==================================================
TOOL METADATA FOR AUTOMATIC TOOLS.JSON
==================================================

IMPORTANT.

The repository's Generate Tools Data GitHub Action reads metadata from index.html.

Therefore ALWAYS include:

<meta
    name="tool:name"
    content="TOOL NAME"
>

<meta
    name="tool:description"
    content="SHORT TOOL DESCRIPTION"
>

<meta
    name="tool:category"
    content="CATEGORY NAME"
>

<meta
    name="tool:featured"
    content="false"
>

<meta
    name="tool:keywords"
    content="keyword1, keyword2, keyword3"
>

<meta
    name="tool:status"
    content="active"
>

DO NOT add:

<meta name="tool:icon">

The repository no longer uses the icon field.

==================================================
LOGO
==================================================

The tool requires:

tools/TOOL-SLUG/logo.jpg

If a logo does not exist, create a suitable 1:1 tool logo concept.

The logo should:

- represent the tool clearly
- work at small sizes
- have clean modern design
- match Nisulka Tools branding
- avoid unnecessary text

==================================================
IMPORTANT: URL PATHS
==================================================

Because the tool is inside:

tools/TOOL-SLUG/

Use:

../../assets/...

for shared assets.

Use:

../../

for homepage.

Do NOT accidentally use:

/assets/...

because the website is hosted under:

/Nisulka-Tools/

==================================================
CSS
==================================================

First inspect the existing tool CSS.

Remove:

- old website header styles
- old website footer styles
- obsolete global styles
- conflicting body styles
- unnecessary resets
- duplicate font imports
- obsolete navigation styles

Keep tool-specific styles.

Prefer existing Nisulka variables such as:

var(--text-primary)
var(--text-secondary)
var(--text-muted)
var(--bg-surface)
var(--bg-surface-secondary)
var(--border-color)
var(--radius-md)
var(--radius-lg)
var(--font-size-sm)
var(--font-size-base)

Do not hardcode an entirely separate design system.

==================================================
PERFORMANCE
==================================================

Keep the page lightweight.

Avoid unnecessary libraries.

Use lazy loading for non-critical images.

Do not load JavaScript libraries if vanilla JS can perform the same job.

Avoid blocking scripts where possible.

==================================================
FINAL VALIDATION
==================================================

After migration, verify:

1. index.html opens without errors.
2. Header appears.
3. Footer appears.
4. Breadcrumb works.
5. Tool functionality works.
6. All buttons work.
7. File uploads work if applicable.
8. Downloads work if applicable.
9. Mobile layout works.
10. No horizontal overflow.
11. No JavaScript console errors.
12. Canonical URL is correct.
13. Open Graph metadata exists.
14. SoftwareApplication schema exists.
15. tool:name exists.
16. tool:description exists.
17. tool:category exists.
18. tool:featured exists.
19. tool:keywords exists.
20. tool:status exists.
21. No tool:icon metadata is used.
22. logo.jpg exists.
23. Shared header.js is loaded.
24. Shared footer.js is loaded.
25. Shared Nisulka CSS is loaded.
26. All relative paths are correct.

==================================================
OUTPUT
==================================================

Return the migrated tool as:

tools/TOOL-SLUG/
├── index.html
├── logo.jpg
├── tool.css        (only if needed)
└── tool.js         (only if needed)

Also provide:

1. A short summary of what was changed.
2. Any functionality that could not be preserved.
3. Any dependencies the tool still requires.
4. The exact category assigned.
5. The exact slug.
6. The SEO title.
7. The meta description.

MOST IMPORTANT:

Do not merely wrap the old HTML in a new header.

Actually integrate the tool into the Nisulka Tools architecture.

The final result must look like it belongs to the same product as the existing "Text to Handwriting" tool while preserving the original tool's functionality.
