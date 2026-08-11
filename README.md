# Nisulka Tools

A collection of free, fast, mobile-friendly and privacy-focused online tools built by **Laxman Nepal**.

Nisulka Tools provides simple browser-based utilities for everyday tasks such as text conversion, image compression, media conversion, file processing and more.

🌐 **Website:**  
https://apps.laxmannepal.com.np/Nisulka-Tools/

---

## About

Nisulka Tools is designed as a growing collection of independent web tools.

Each tool should:

- Be easy to understand
- Load quickly
- Work on mobile, tablet and desktop
- Use a consistent Nisulka Tools interface
- Process files locally whenever technically possible
- Avoid unnecessary server-side processing
- Be SEO-friendly
- Be accessible
- Be useful as a standalone tool
- Follow the same header and footer
- Follow the same design system

The goal is to build a large collection of useful tools under one website instead of creating a separate website or repository for every tool.

---

# Website Structure

The main website is hosted through GitHub Pages and uses the following structure:

```text
Nisulka-Tools/
│
├── index.html
│
├── README.md
├── LICENSE
│
├── robots.txt
├── sitemap.xml
│
├── data/
│   └── tools.json
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
│   ├── js/
│   │   ├── header.js
│   │   ├── footer.js
│   │   ├── components.js
│   │   └── home.js
│   │
│   └── images/
│
├── tools/
│   │
│   ├── text-to-handwriting/
│   │   ├── index.html
│   │   └── script.js
│   │
│   ├── image-compressor/
│   │   ├── index.html
│   │   └── script.js
│   │
│   ├── mp4-to-mp3/
│   │   ├── index.html
│   │   └── script.js
│   │
│   └── ...
│
└── docs/
    └── ...
