# Nisulka Tools — AI Tool Development Specification

## 1. Project

Project name:

Nisulka Tools

Website:

https://apps.laxmannepal.com.np/Nisulka-Tools/

Purpose:

Nisulka Tools is a collection of free, useful, mobile-friendly
online utilities for everyday users.

Each tool must provide genuine functionality and useful information.

---

# 2. URL Structure

Every tool must use:

/Nisulka-Tools/tools/{tool-slug}/

Example:

/Nisulka-Tools/tools/image-compressor/

The tool entry file must be:

/tools/{tool-slug}/index.html

Do not create a separate repository for each tool.

---

# 3. Existing Shared Architecture

The project already contains shared resources.

Use them instead of recreating the UI.

Shared CSS:

assets/css/variables.css
assets/css/global.css
assets/css/components.css
assets/css/header.css
assets/css/footer.css
assets/css/tool.css

Shared JavaScript:

assets/js/header.js
assets/js/footer.js
assets/js/components.js

Tool pages must use these shared files.

Do not create a new global header.

Do not create a new global footer.

Do not redefine the entire site's design system.

---

# 4. Header

Every tool page must use:

<div id="site-header-mount"></div>

and load:

<script src="../../assets/js/header.js"></script>

The header must remain identical to the rest of Nisulka Tools.

Do not modify header markup inside an individual tool.

---

# 5. Footer

Every tool page must use:

<div id="site-footer-mount"></div>

and load:

<script src="../../assets/js/footer.js"></script>

The footer must remain identical to the rest of Nisulka Tools.

Do not manually recreate the footer.

---

# 6. Design System

Use the existing CSS variables.

Do not invent random colors.

Do not introduce a different visual theme.

Use:

var(--brand-primary)
var(--brand-primary-light)
var(--text-primary)
var(--text-secondary)
var(--text-muted)
var(--bg-surface)
var(--bg-surface-secondary)
var(--border-color)
var(--radius-sm)
var(--radius-md)
var(--radius-lg)
var(--radius-xl)
var(--radius-full)
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)

Typography must remain consistent with the project.

Primary font:

Poppins

---

# 7. Tool Page Structure

Every tool should generally follow:

Header

Breadcrumb

Tool Hero

Tool Workspace

Tool Result / Preview

Advertisement area

Tool explanation

How to use

Features

Limitations when applicable

Privacy information

FAQ

Related tools

Footer

The exact tool interface may differ depending on functionality.

---

# 8. Tool Hero

Every tool must have:

- category
- clear H1
- useful description

Example:

Text Tools

Text to Handwriting Converter

Convert typed text into a handwritten-style document
directly in your browser.

The H1 must clearly describe the tool.

Do not use vague titles such as:

"Awesome Tool"

"Ultimate Tool"

"AI Magic"

---

# 9. Breadcrumb

Every tool page must contain a breadcrumb.

Example:

Home / Image Tools / Image Compressor

The Home link must point to:

../../

The category link should point to:

../../#categories

---

# 10. Tool Interface

The actual tool must be the primary focus of the page.

Users should be able to understand:

1. What the tool does
2. What input is required
3. What controls are available
4. What output will be generated
5. How to download or use the result

Avoid unnecessary UI.

Do not add fake buttons.

Every visible button must perform a real action.

---

# 11. Mobile First

Every tool must work properly on:

- mobile phones
- tablets
- laptops
- desktop computers

Never assume a desktop screen.

Controls must remain usable with touch.

Buttons should have comfortable touch targets.

Do not create horizontal scrolling unless the tool genuinely requires it.

---

# 12. Browser Processing

Whenever technically practical, process user files locally in the browser.

Examples:

Image compression:
Canvas API

Image conversion:
Canvas API

Text processing:
JavaScript

Audio/video processing:
Web APIs or appropriate client-side libraries

Do not upload private user files to a server unless the tool genuinely requires server processing.

If a file is processed locally, clearly explain this to users.

---

# 13. Privacy

Do not claim:

"Your files are never uploaded"

unless the implementation actually guarantees that.

Use accurate wording such as:

"This tool processes your file locally in your browser."

Only make privacy claims that are technically true.

---

# 14. SEO

Every tool must have:

<title>

<meta name="description">

<meta name="robots" content="index, follow">

<link rel="canonical">

Open Graph metadata

Structured data where appropriate

One clear H1.

Use semantic HTML.

Do not keyword stuff.

Do not hide keywords.

Do not create meaningless SEO paragraphs.

---

# 15. Content Requirements

Every tool should contain useful original explanatory content.

At minimum:

## About the Tool

Explain:

- what it does
- who it is useful for
- what problem it solves

## How to Use

Give clear numbered instructions.

## Features

Explain genuine capabilities.

## Limitations

Explain important limitations when applicable.

## Privacy

Explain how processing works.

## FAQ

Provide useful questions users may actually ask.

Content must match the real functionality.

Do not generate fictional capabilities.

---

# 16. AdSense Considerations

Nisulka Tools should prioritize:

- useful functionality
- original explanatory content
- clear navigation
- responsive design
- privacy information
- terms
- disclaimer
- contact information
- accessible UI
- good user experience

Do not create pages that exist only to display advertisements.

Do not place advertisements directly beside buttons in a way that can cause accidental clicks.

Do not label normal UI controls as advertisements.

Advertisement containers must be clearly separated from tool controls.

---

# 17. Accessibility

Use:

- semantic HTML
- proper labels
- accessible buttons
- keyboard navigation
- visible focus states
- meaningful alt text
- aria attributes where necessary

Do not use icons alone when the meaning is unclear.

---

# 18. Performance

Prefer:

- vanilla JavaScript
- CSS
- browser APIs

Avoid unnecessary frameworks.

Avoid loading large libraries when a browser API can perform the same task.

Images must be optimized.

Do not load resources that the tool does not need.

---

# 19. Security

Never insert untrusted user input using:

innerHTML

unless the input has been safely escaped.

Prefer:

textContent

for user-generated text.

Do not use:

eval()

Do not execute user-provided JavaScript.

Validate file types.

Validate file sizes when applicable.

Handle errors gracefully.

---

# 20. Error Handling

Every tool must handle:

- missing input
- invalid input
- unsupported file types
- oversized files
- browser limitations
- processing failures

Do not leave users with a broken interface.

Display clear human-readable error messages.

---

# 21. Buttons

Buttons must clearly describe their action.

Good:

Compress Image

Convert to MP3

Download PNG

Generate Handwriting

Clear

Bad:

Go

Magic

Do It

Process

---

# 22. Loading States

If an operation takes noticeable time, show a loading state.

Example:

Processing...

Compressing image...

Generating preview...

Do not allow duplicate processing when an operation is already running.

---

# 23. Download Behavior

Downloaded files should have sensible filenames.

Examples:

compressed-image.jpg

converted-audio.mp3

handwritten-text.png

qr-code.png

Do not use:

download123456.tmp

file1

output

---

# 24. No Fake AI

Do not call a feature "AI" unless it actually uses AI.

Do not add:

"AI Powered"

"Advanced AI"

"Smart AI"

just for marketing.

---

# 25. No External Backend Unless Required

Prefer client-side processing.

If external APIs are required:

- explain the requirement
- handle API errors
- never expose private API keys in frontend code

Never place secret API keys inside HTML or JavaScript.

---

# 26. Related Tools

Where appropriate, provide links to other relevant Nisulka Tools.

Example:

Image Compressor

Related:

Image Resizer

Image Converter

JPG to PNG

PNG to WebP

Links must point to actual existing tools.

Never create links to nonexistent tools.

---

# 27. Code Organization

Simple tools may use:

index.html

with inline tool-specific JavaScript.

For larger tools use:

index.html

style.css

script.js

Additional assets only when necessary.

Do not duplicate global CSS.

Do not duplicate header/footer code.

---

# 28. Existing Tool Registry

After creating a new tool, add it to:

data/tools.json

Include:

id

name

shortDescription

category

icon

url

popular

featured

keywords

Example:

{
  "id": "image-compressor",
  "name": "Image Compressor",
  "shortDescription": "Compress JPG, PNG and WebP images while reducing file size.",
  "category": "image",
  "icon": "🖼️",
  "url": "/Nisulka-Tools/tools/image-compressor/",
  "popular": true,
  "featured": true,
  "keywords": [
    "image compressor",
    "compress image",
    "jpg compressor",
    "png compressor"
  ]
}

---

# 29. Before Delivering a Tool

Verify:

[ ] Tool works

[ ] Header works

[ ] Footer works

[ ] Mobile layout works

[ ] Desktop layout works

[ ] Search/navigation links work

[ ] Breadcrumb works

[ ] All buttons work

[ ] Download works

[ ] Errors are handled

[ ] SEO metadata exists

[ ] Canonical URL is correct

[ ] H1 exists

[ ] Tool explanation exists

[ ] How-to section exists

[ ] FAQ exists

[ ] Privacy statement is accurate

[ ] No fake functionality

[ ] No fake AI claims

[ ] No secret API keys exposed

[ ] Tool added to data/tools.json

[ ] No unnecessary dependencies

---

# 30. AI Instruction

When asked to create a new Nisulka Tools tool:

DO NOT create a new design system.

DO NOT create a new header.

DO NOT create a new footer.

DO NOT create a separate repository.

DO NOT change the site's global appearance.

DO NOT remove existing navigation.

DO NOT invent functionality.

DO NOT use fake AI claims.

Instead:

1. Follow this specification.
2. Use the existing shared CSS.
3. Use the existing shared header.
4. Use the existing shared footer.
5. Create the tool inside /tools/{tool-slug}/.
6. Make it mobile-first.
7. Make the functionality actually work.
8. Add proper SEO metadata.
9. Add useful explanatory content.
10. Add FAQ.
11. Add the tool to data/tools.json.
12. Return a list of files created or modified.
