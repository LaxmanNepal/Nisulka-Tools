# Nisulka Tools Architecture

Nisulka Tools is designed as a static, automation-first tool platform. V2 keeps the existing UI and shared design system intact while making the filesystem, registry, categories and generated routes deterministic.

## Core layers

```text
Nisulka Tools
├── UI layer
│   ├── shared header/footer
│   ├── shared CSS design system
│   └── reusable components
├── Tool layer
│   └── tools/<tool-path>/index.html
├── Registry layer
│   ├── data/tools.json
│   └── data/categories.json
├── Category layer
│   └── categories/<category-slug>/index.html
├── Automation layer
│   └── .github/workflows/
├── Quality layer
│   ├── scripts/validate_tools.py
│   ├── scripts/architecture-audit.py
│   └── seo/
├── Browser QA layer
│   └── tests/e2e/site.spec.mjs
├── Admin layer
│   └── admin/
└── Edge/backend layer
    └── worker/
```

## V2 source of truth

`data/tools.json` is the source of truth for discoverable tools. Every non-hidden registry entry must map to `tools/<path>/index.html` and, when a logo is declared, to a real local asset.

`data/categories.json` is derived metadata and must stay exactly synchronized with the tool registry:

- every registry `categorySlug` has one category entry
- every category lists the exact tool slugs belonging to it
- `toolCount` equals the number of listed tools
- category URLs use `/categories/<slug>/`

Filesystem-only tool folders are never silently deleted. The V2 audit reports them as orphans so legacy, experimental or intentionally unlisted tools can be reviewed explicitly.

## Tool contract

A tool is not complete because its HTML exists. A production-ready tool must:

1. Follow the shared architecture.
2. Work on mobile and desktop.
3. Have real functionality.
4. Handle invalid input and failures.
5. Include SEO metadata.
6. Include useful explanatory content.
7. Use the shared header and footer.
8. Be registered in `data/tools.json` when it is discoverable.
9. Pass automated architecture validation.
10. Pass browser smoke tests.
11. Avoid secrets and unsafe execution.

## Category route contract

Generated category pages use directory indexes rather than mixed `.html` routes:

```text
/categories/
├── index.html
├── ai-tools/index.html
├── analytics/index.html
├── audio-tools/index.html
└── ...
```

The category generator writes these pages from the registry. It does not create a second `.html` route for the same category.

## V2 audit pipeline

```text
Commit / Pull Request
        ↓
Registry validation
        ↓
V2 architecture audit
  ├─ tool ↔ registry mapping
  ├─ category ↔ registry mapping
  ├─ local asset/link integrity
  ├─ duplicate/near-duplicate detection
  ├─ filesystem/orphan mapping
  └─ repository asset inventory
        ↓
Browser E2E Smoke Tests
        ↓
SEO Audit
        ↓
Category generation
        ↓
GitHub Actions Summary + Artifacts
        ↓
Deploy
```

The architecture audit is read-only with respect to the product UI. It produces `reports/architecture-audit.json` and `reports/architecture-audit.md` as CI artifacts and never deletes or rewrites tools.

## Browser QA

The Playwright smoke suite starts a local static server and opens the homepage plus every tool containing `tools/{slug}/index.html`.

It checks:

- page navigation succeeds
- title exists
- one visible H1 exists
- shared header mount exists and actually mounts content
- shared footer mount exists and actually mounts content
- no horizontal overflow at the test viewport
- no uncaught page errors
- no failed local resource requests

The suite is intentionally a smoke test, not a replacement for tool-specific functional tests. Tool-specific interactions should be added when a tool has meaningful inputs, uploads, downloads, or stateful behavior.

## Design rule

Do not solve the same infrastructure problem separately inside every tool. Put reusable behavior in shared assets or automation.

## Future infrastructure

Planned modules can be added without changing the tool contract:

- tool-specific functional browser tests
- performance budget checks
- accessibility checks
- structured-data validation
- tool usage analytics
- AI-assisted tool generation
- release/version reporting
