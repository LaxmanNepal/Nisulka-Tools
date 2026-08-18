============================================================
ABSOLUTE RULE — HEADER AND FOOTER
============================================================

THE NISULKA HEADER AND FOOTER ARE LOCKED.

DO NOT redesign them.

DO NOT recreate them.

DO NOT rewrite them.

DO NOT copy their HTML and create a new version.

DO NOT change their colors.

DO NOT change their typography.

DO NOT change their spacing.

DO NOT change their navigation.

DO NOT change their buttons.

DO NOT change their responsive behavior.

DO NOT create a "similar" header.

DO NOT create a "similar" footer.

The existing Nisulka repository header and footer are the ONLY
source of truth.

============================================================
OFFICIAL NISULKA HEADER
============================================================

Use the exact production header from:

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/js/header.js

Mount it using:

<div id="site-header-mount"></div>

Load it using:

<script
    src="https://apps.laxmannepal.com.np/Nisulka-Tools/assets/js/header.js"
></script>

The header JavaScript is responsible for creating the official
Nisulka header.

DO NOT create another header.

============================================================
OFFICIAL NISULKA FOOTER
============================================================

Use the exact production footer from:

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/js/footer.js

Mount it using:

<div id="site-footer-mount"></div>

Load it using:

<script
    src="https://apps.laxmannepal.com.np/Nisulka-Tools/assets/js/footer.js"
></script>

The footer JavaScript is responsible for creating the official
Nisulka footer.

DO NOT create another footer.

============================================================
HEADER / FOOTER CSS
============================================================

Use the official Nisulka CSS.

Header:

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/css/header.css

Footer:

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/css/footer.css

Global styles:

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/css/variables.css

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/css/global.css

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/css/components.css

Tool styles:

https://apps.laxmannepal.com.np/Nisulka-Tools/assets/css/tool.css

Load them directly.

DO NOT recreate these styles.

DO NOT override header/footer styles from the tool-specific CSS.

============================================================
HEADER / FOOTER PROTECTION
============================================================

Your tool-specific CSS MUST NOT target:

header

footer

.site-header

.site-footer

#site-header-mount

#site-footer-mount

or any other header/footer selectors.

Do not write rules such as:

header {
    ...
}

footer {
    ...
}

.site-header {
    ...
}

.site-footer {
    ...
}

unless you are specifically fixing a documented integration issue
and the change is absolutely required.

In normal circumstances:

LEAVE THEM COMPLETELY ALONE.

============================================================
WHAT YOU ARE ALLOWED TO DESIGN
============================================================

You are responsible ONLY for:

1. Breadcrumb
2. Tool title
3. Tool description
4. Tool workspace
5. Tool controls
6. Inputs
7. Buttons inside the tool
8. Preview
9. Result area
10. Loading states
11. Error states
12. Success states
13. Tool-specific content
14. FAQ
15. SEO
16. Accessibility
17. Responsive behavior of the TOOL AREA

The header and footer are NOT part of your redesign.

============================================================
PAGE STRUCTURE
============================================================

The final page should conceptually be:

┌─────────────────────────────────────────┐
│                                         │
│       EXACT NISULKA HEADER              │
│       LOADED FROM REPOSITORY            │
│                                         │
└─────────────────────────────────────────┘

                 ↓

        Breadcrumb

                 ↓

        Tool Title
        Description

                 ↓

┌─────────────────────────────────────────┐
│                                         │
│          TOOL-SPECIFIC UI               │
│                                         │
│     Designed by you                     │
│     Based on original tool              │
│     Compatible with Nisulka             │
│                                         │
└─────────────────────────────────────────┘

                 ↓

        Useful Content

                 ↓

        FAQ

                 ↓

┌─────────────────────────────────────────┐
│                                         │
│       EXACT NISULKA FOOTER              │
│       LOADED FROM REPOSITORY            │
│                                         │
└─────────────────────────────────────────┘

============================================================
IMPORTANT
============================================================

The header and footer must look EXACTLY like they do on the
current Nisulka Tools website.

If your generated page looks different from:

https://apps.laxmannepal.com.np/Nisulka-Tools/

DO NOT redesign the header/footer to compensate.

Instead, fix the integration so the exact official components
are being loaded correctly.

============================================================






















FINAL RESPONSIBILITY SPLIT

NISULKA REPOSITORY
        │
        ├── Header → LOCKED
        ├── Footer → LOCKED
        ├── Global CSS → USE
        ├── Global Components → USE
        └── Brand System → FOLLOW
                │
                ▼
          YOUR JOB
                │
                ├── Analyze original tool
                ├── Preserve functionality
                ├── Improve UX
                ├── Improve tool UI
                ├── Make buttons consistent
                ├── Make inputs consistent
                ├── Make responsive
                ├── Improve accessibility
                ├── Improve SEO
                ├── Improve performance
                └── Fix bugs
