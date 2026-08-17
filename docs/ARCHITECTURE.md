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
10. Avoid secrets and unsafe execution.

## Automation pipeline

```text
Commit / Pull Request
        ↓
Tool Health Validator
        ↓
SEO Audit
        ↓
Registry / Category Generation
        ↓
GitHub Actions Summary + Artifacts
        ↓
Deploy
```

## Design rule

Do not solve the same infrastructure problem separately inside every tool. Put reusable behavior in shared assets or automation.

## Future infrastructure

Planned modules can be added without changing the tool contract:

- browser smoke tests
- broken-link scanner
- performance budget checks
- accessibility checks
- automated sitemap generation
- structured-data validation
- tool usage analytics
- AI-assisted tool generation
- release/version reporting
