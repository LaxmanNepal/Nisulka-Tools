# Nisulka Tools Architecture

Nisulka Tools is designed as a static, automation-first tool platform.

## Core layers

```text
Nisulka Tools
├── UI layer
│   ├── shared header/footer
│   ├── shared CSS design system
│   └── reusable components
├── Tool layer
│   └── tools/{tool-slug}/index.html
├── Registry layer
│   └── data/tools.json
├── Automation layer
│   └── .github/workflows/
├── Quality layer
│   ├── scripts/validate_tools.py
│   └── seo/
├── Browser QA layer
│   └── tests/e2e/site.spec.mjs
├── Admin layer
│   └── admin/
└── Edge/backend layer
    └── worker/
```

## Tool contract

A tool is not complete because its HTML exists. A production-ready tool must:

1. Follow the shared architecture.
2. Work on mobile and desktop.
3. Have real functionality.
4. Handle invalid input and failures.
5. Include SEO metadata.
6. Include useful explanatory content.
7. Use the shared header and footer.
8. Be registered in `data/tools.json`.
9. Pass automated architecture validation.
10. Pass browser smoke tests.
11. Avoid secrets and unsafe execution.

## Automation pipeline

```text
Commit / Pull Request
        ↓
Tool Health Validator
        ↓
Browser E2E Smoke Tests
        ↓
SEO Audit
        ↓
Registry / Category Generation
        ↓
GitHub Actions Summary + Artifacts
        ↓
Deploy
```

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
- broken-link scanner
- performance budget checks
- accessibility checks
- automated sitemap generation
- structured-data validation
- tool usage analytics
- AI-assisted tool generation
- release/version reporting
