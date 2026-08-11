NISULKA TOOLS — MASTER AI DEVELOPMENT PROMPT

You are developing a new tool inside Nisulka Tools, a free online web-tools platform.

Your job is to implement the requested tool inside the existing Nisulka Tools repository without breaking, redesigning, duplicating, or replacing the existing platform architecture.

---

1. PROJECT IDENTITY

Platform name:

Nisulka Tools

Main project:

Nisulka Tools — Free Online Tools

Repository structure uses:

Nisulka-Tools/

The website is hosted under:

https://apps.laxmannepal.com.np/Nisulka-Tools/

Every tool must live under:

https://apps.laxmannepal.com.np/Nisulka-Tools/tools/TOOL-SLUG/

Example:

https://apps.laxmannepal.com.np/Nisulka-Tools/tools/text-to-handwriting/

---

2. CORE RULE

DO NOT redesign Nisulka Tools.

The existing Nisulka Tools interface is the source of truth.

Before creating or modifying a tool:

1. Inspect the existing repository.
2. Inspect the homepage.
3. Inspect the shared header.
4. Inspect the shared footer.
5. Inspect the global CSS.
6. Inspect the design variables.
7. Inspect existing tool pages.
8. Inspect shared JavaScript.
9. Follow the existing architecture.

Do NOT invent a completely new design.

Do NOT create a second header.

Do NOT create a second footer.

Do NOT create unrelated colors.

Do NOT create a different typography system.

Do NOT create a different button system.

Do NOT create a different card system.

Do NOT create a different navigation system.

The new tool must look like it is part of the same Nisulka Tools product.

---

3. EXISTING SHARED UI IS SACRED

Reuse the existing:

Header
Footer
Navigation
Logo
Typography
Colors
CSS variables
Buttons
Inputs
Cards
Containers
Spacing
Responsive breakpoints
Badges
Alerts
Breadcrumbs
Tool panels
Result panels
Modal styles
Toast styles
Loading states
Error states

If an existing reusable component already performs a function, use it.

Do not duplicate it.

If a reusable component is missing and the component would clearly be useful for future tools, create it in the shared component system instead of creating a one-off implementation.

---

4. TOOL DIRECTORY

Every new tool must use:

tools/
└── TOOL-SLUG/
    ├── index.html
    ├── script.js
    └── [additional assets only when necessary]

Use lowercase kebab-case for the URL slug.

Examples:

image-compressor
mp4-to-mp3
jpg-to-png
pdf-merger
word-counter
qr-code-generator
text-to-handwriting
image-resizer
json-formatter

Never use spaces.

Never use uppercase letters in the URL slug.

---

5. BEFORE WRITING CODE

First inspect the repository and determine:

Existing folder structure
Existing shared CSS
Existing shared JS
Existing header implementation
Existing footer implementation
Existing tool page pattern
Existing homepage/tool registry
Existing SEO implementation
Existing components
Existing naming conventions
Existing asset paths

Do not assume the paths.

Use the actual repository structure.

If something already exists, reuse it.

---

6. TOOL IMPLEMENTATION PRINCIPLE

The tool itself should be the only major difference between tool pages.

For example:

Image Compressor

The functionality is:

Upload image
Preview image
Show original size
Compress
Show compressed size
Show percentage saved
Download

MP4 to MP3

The functionality is:

Upload MP4
Read video
Extract audio
Convert
Show progress
Download MP3

Word Counter

The functionality is:

Input text
Count words
Count characters
Count sentences
Count paragraphs
Reading time

Everything surrounding that functionality should still look like Nisulka Tools.

---

7. UI REQUIREMENTS

Every tool must have:

A. Breadcrumb

Example:

Home / Image Tools / Image Compressor

Use the existing breadcrumb component/style.

---

B. Tool title

Use a clear H1.

Example:

Image Compressor

---

C. Short description

Immediately explain what the tool does.

Example:

Compress JPG, PNG and WebP images online for free while reducing file size.

Avoid meaningless marketing text.

---

D. Main tool interface

The actual functionality must be the visual focus.

Do not bury the tool under paragraphs of text.

---

E. Result area

Results should be clearly visible.

Examples:

Original:
2.4 MB

Compressed:
684 KB

Saved:
71.5%

Use existing result/card components where possible.

---

F. Primary action

The main action must be visually obvious.

Examples:

Compress Image
Convert to MP3
Generate QR Code
Download PNG
Merge PDFs

---

G. Secondary actions

Examples:

Clear
Reset
Remove File
Copy
Download Again
Try Another File

Use existing button styles.

---

8. MOBILE-FIRST REQUIREMENT

Every tool must work properly on:

320px
375px
390px
414px
768px
1024px
1440px+

Do not design desktop first and hope mobile works.

Mobile must be intentionally designed.

Avoid:

Horizontal scrolling
Overflowing tables
Tiny buttons
Tiny text
Controls too close together
Fixed-width tool panels
Desktop-only drag/drop
Hover-only functionality

Touch targets should be comfortably usable.

---

9. DESKTOP REQUIREMENT

On larger screens:

Use the existing Nisulka Tools container width.

Do not make tool content unnecessarily wide.

Prefer:

Readable content width
Clear hierarchy
Balanced whitespace
Logical grouping

If the tool benefits from a two-column layout, use one.

Example:

LEFT:
Upload / Settings

RIGHT:
Preview / Results

On mobile:

Upload
↓
Settings
↓
Preview
↓
Result

---

10. ACCESSIBILITY

Every tool must include reasonable accessibility.

Use:

<label>

for form controls.

Use meaningful:

aria-label
aria-describedby
aria-expanded
aria-live

where appropriate.

Buttons must be actual:

<button>

elements.

Do not use clickable "<div>" elements when a button is appropriate.

Images need meaningful "alt" text when they convey information.

Keyboard navigation must work.

Do not rely only on color to communicate state.

---

11. PERFORMANCE

The tool should be lightweight.

Avoid unnecessary:

Libraries
Frameworks
Dependencies
Large JavaScript packages
Large CSS frameworks
External APIs
Backend services

Prefer:

HTML
CSS
Vanilla JavaScript
Browser APIs

when possible.

If a library is genuinely required, explain why before adding it.

---

12. CLIENT-SIDE PROCESSING

Whenever possible, process user data locally in the browser.

Examples:

Image compression
Image resizing
Image conversion
Text processing
QR generation
JSON formatting
CSV processing
Audio/video processing when browser-compatible

Do not upload user files to a server unless the tool genuinely requires server-side processing.

If processing is local, clearly communicate this to users.

Example:

Your files are processed locally in your browser.

Do not make exaggerated privacy claims.

---

13. FILE HANDLING

For tools that accept files:

Support:

Drag and drop
File picker

when appropriate.

Always provide:

Accepted formats
Maximum reasonable file size
Current filename
File size
Remove/clear option
Processing state
Success state
Error state
Download result

Validate files before processing.

Never allow an invalid file to silently fail.

---

14. LOADING STATES

Long-running operations must have visible progress.

Never leave users wondering whether something is happening.

Use states such as:

Processing...
Compressing...
Converting...
Generating...
Almost done...

For measurable operations, show progress percentage when possible.

For indeterminate operations, use a spinner/progress indicator.

---

15. ERROR HANDLING

Errors must be human-readable.

Bad:

Error: DOMException 0x80004005

Good:

We couldn't process this file.
Please make sure it is a valid JPG, PNG or WebP image.

Errors should explain:

What happened
Why it happened when known
What the user should do next

Do not expose unnecessary technical errors to normal users.

Log technical details to the console only when useful for debugging.

---

16. DOWNLOADS

Generated files should have:

Meaningful filename
Correct extension
Correct MIME type

Examples:

nisulka-compressed-image.jpg
nisulka-converted-audio.mp3
nisulka-resized-image.png
nisulka-generated-qr.png

Do not use:

download123
output
file
result
blob

unless technically unavoidable.

---

17. SEO

Every tool must be independently SEO-friendly.

Every tool page must have:

<title>
<meta name="description">
<meta name="robots">
<link rel="canonical">

Use a unique title and description for each tool.

Do not keyword-stuff.

---

18. SEO TITLE

Use this general structure:

[Tool Name] — Free Online [Tool Function] | Nisulka Tools

Example:

Image Compressor — Free Online Image Compression | Nisulka Tools

Keep titles natural.

---

19. META DESCRIPTION

Describe:

What the tool does
Important supported formats/features
Free availability

Example:

Compress JPG, PNG and WebP images online for free. Reduce image file size while keeping good quality with Nisulka Tools.

Do not write fake claims.

---

20. CANONICAL URL

Every tool must have its exact canonical URL.

Example:

<link
    rel="canonical"
    href="https://apps.laxmannepal.com.np/Nisulka-Tools/tools/image-compressor/"
>

Do not accidentally point every tool to the homepage.

---

21. STRUCTURED DATA

Use appropriate Schema.org structured data where genuinely relevant.

For a software utility, use:

SoftwareApplication

For FAQs, use FAQ structured data only when the visible page actually contains those FAQs and the markup complies with current search-engine requirements.

Do not add fake structured data.

---

22. SEO CONTENT

Every useful tool page should contain unique supporting content.

Recommended structure:

H1 — Tool Name

Tool interface

Ad placement

H2 — About [Tool]

H2 — How to use [Tool]

H2 — Features

H2 — Supported formats / limitations
(if applicable)

H2 — Privacy
(if applicable)

H2 — Frequently Asked Questions

Do not generate thousands of words of useless SEO content.

Content must help the user.

---

23. HOMEPAGE REGISTRATION

Nisulka Tools has a central homepage/tool directory.

When adding a new tool:

1. Inspect the existing tool registry/data source.
2. Add the new tool there using the existing format.
3. Do not hard-code a separate tool card system.
4. Ensure the homepage can discover the tool.
5. Add:
   - Tool name
   - Description
   - Category
   - URL
   - Icon if the system supports icons
   - Search keywords/tags if supported

The homepage must automatically be able to display the new tool through its existing architecture.

---

24. SEARCH

The tool must be discoverable through the existing Nisulka Tools homepage search.

Add useful search keywords.

Example:

For:

Image Compressor

keywords may include:

compress
image compression
reduce image size
jpg compressor
png compressor
webp compressor
photo compressor

Do not spam irrelevant keywords.

---

25. CATEGORIES

Use the existing categories.

Possible categories include:

Image Tools
PDF Tools
Text Tools
Video Tools
Audio Tools
Developer Tools
Converters
Generators
Calculators
Utilities

Do not create a new category unless genuinely necessary.

---

26. ADSENSE-FRIENDLY DESIGN

Nisulka Tools is intended to be monetized with Google AdSense.

Therefore:

Do not design the site around advertisements.

The tool must remain the primary purpose.

Use clear separation between:

Tool
Content
Advertisement

Do not:

Place ads directly over buttons
Create accidental ad-click layouts
Use misleading labels
Create fake download buttons
Create fake system alerts
Create excessive ad blocks
Hide content behind ads

Ads must never interfere with tool functionality.

Leave reasonable locations for future AdSense units.

Example:

Tool
↓
Advertisement
↓
Helpful content
↓
Advertisement
↓
FAQ

Do not insert actual AdSense code unless explicitly requested.

---

27. CONTENT QUALITY

Nisulka Tools should not become a collection of thin pages.

Each tool needs genuine functionality.

A page should not exist merely to rank for a keyword.

Avoid:

Fake tools
Buttons that do nothing
Copied descriptions
Keyword stuffing
AI-generated filler paragraphs
Repeated FAQ content

Every tool must solve a real problem.

---

28. PRIVACY

If the tool processes files locally:

Say:

Files are processed locally in your browser.

If the tool sends data to an API:

Clearly state:

Your data is sent to [service] for processing.

Never falsely claim:

100% private
Never stored
Completely secure
No one can access your files

unless technically verifiable.

---

29. NO UNNECESSARY BACKEND

Do not introduce:

Node.js server
PHP
Python backend
Database
Cloud storage
API
Authentication

unless the requested tool actually requires it.

For a client-side tool, keep it client-side.

---

30. NO FRAMEWORK BY DEFAULT

Do not convert the project to:

React
Next.js
Vue
Angular
Svelte
Astro

unless the existing repository already uses it or the project owner explicitly requests it.

Nisulka Tools is designed to support lightweight standalone HTML/CSS/JS tools.

---

31. BROWSER COMPATIBILITY

Use modern browser APIs but provide graceful failure where practical.

Test conceptually for:

Chrome
Edge
Firefox
Safari
Android Chrome
iPhone Safari

If a browser limitation exists, communicate it clearly.

---

32. SECURITY

Never trust user input.

Avoid unsafe:

innerHTML
eval()
Function()

unless there is a legitimate and carefully sanitized reason.

Prefer:

textContent
createElement()

and proper validation.

For uploaded files:

Validate MIME type
Validate extension
Validate size
Handle malformed files

Do not execute uploaded content.

---

33. LOCAL STORAGE

Use localStorage only when genuinely useful.

Examples:

User preferences
Theme
Last selected settings

Do not store sensitive user content unnecessarily.

---

34. TOOL RESET

Every tool should provide an obvious way to reset/clear the current operation.

Examples:

Clear
Reset
Remove
Start Over

---

35. EMPTY STATES

Before the user has provided input, show a useful empty state.

Example:

Upload an image to begin

or:

Enter text to see your result

Do not show broken panels or blank areas.

---

36. SUCCESS STATES

After successful processing:

Show:

Success
Result
Important statistics
Download action
Start again action

Example:

Compression complete

Original: 2.4 MB
Compressed: 680 KB
Saved: 71.7%

Download Image
Compress Another

---

37. TOOL LIMITATIONS

If the browser cannot reliably perform something:

Do not pretend it works.

Explain the limitation.

If necessary, recommend a client-side compatible approach.

The priority is:

Correctness > Feature count

---

38. CODE QUALITY

Write clean, readable code.

Use:

Meaningful variable names
Small functions
Comments for complex logic
Clear event handling
No unnecessary duplication

Avoid:

Massive functions
Random global variables
Inline JavaScript everywhere
Repeated code
Unused libraries
Unused variables
Dead code

---

39. FILE STRUCTURE

Prefer:

tools/
└── tool-name/
    ├── index.html
    └── script.js

Only add additional files when necessary.

Example:

tools/
└── pdf-merger/
    ├── index.html
    ├── script.js
    └── worker.js

if a Web Worker is genuinely required.

---

40. SHARED ASSETS

Never copy:

header.css
footer.css
global.css
variables.css

into every tool directory.

Reference the existing shared files.

Use correct relative paths based on the actual repository structure.

---

41. HEADER AND FOOTER

Every tool must use the existing Nisulka Tools header and footer.

Do not recreate them manually.

If the repository uses:

<div id="site-header-mount"></div>

and:

<div id="site-footer-mount"></div>

follow that system.

If the repository uses another mechanism, follow the existing mechanism.

The existing repository is always the authority.

---

42. TOOL PAGE WIDTH

Use the existing container system.

Do not create random widths like:

width: 97vw;
max-width: 1700px;

unless the existing design system uses them.

---

43. ICONS

If Nisulka Tools already has an icon system, use it.

Do not introduce another icon library unnecessarily.

Do not use emojis as a replacement for a professional icon system unless the existing UI intentionally uses them.

---

44. RESPONSIVE TABLES

If the tool produces tables:

On mobile, make them:

Horizontally scrollable
or
Stacked responsively

Never allow the entire webpage to horizontally overflow.

---

45. DRAG AND DROP

For file tools:

Support drag-and-drop where useful.

But never make drag-and-drop the only method.

Always provide:

Choose File

or equivalent.

Mobile users generally cannot use desktop drag-and-drop.

---

46. FILE SIZE DISPLAY

Use human-readable sizes.

Examples:

12 KB
1.4 MB
2.8 GB

Do not display:

1458237 bytes

to normal users unless the tool specifically requires it.

---

47. PROCESSING LARGE FILES

Avoid freezing the browser.

If appropriate:

Use Web Workers
Process chunks
Show progress
Release object URLs
Clear memory after completion

Especially important for:

Video
Audio
Large images
PDF
ZIP

---

48. OBJECT URL CLEANUP

Whenever using:

URL.createObjectURL()

remember to eventually call:

URL.revokeObjectURL()

when the URL is no longer required.

---

49. NO TRACKING OF USER CONTENT

Do not add analytics around the actual content users enter/upload unless explicitly requested.

Never send user text/files to an external analytics platform.

---

50. TOOL-SPECIFIC PROMPT

When I give you a new tool request, interpret it as:

BUILD THIS TOOL:

[USER'S TOOL DESCRIPTION]

You must implement the tool according to every rule in this master prompt.

---

51. BEFORE IMPLEMENTATION

Before writing code, identify:

Tool name
Tool slug
Category
Main user problem
Inputs
Outputs
Supported formats
Processing method
Client-side/backend requirement
Required browser APIs
SEO keywords
Potential limitations

Then inspect the existing repository.

---

52. DO NOT ASK UNNECESSARY QUESTIONS

If the requested tool is sufficiently clear:

Implement it.

Do not ask unnecessary questions such as:

What color should I use?
What button style should I use?
What font should I use?
Should I make it responsive?

Those decisions already belong to the Nisulka Tools design system.

Only ask if a missing requirement materially affects functionality.

---

53. WHEN A LIBRARY IS REQUIRED

If the requested functionality genuinely requires a third-party library:

First determine whether the repository already has an appropriate library.

If not, use the smallest practical option.

Explain:

Why the library is required
What it does
Whether it works client-side
Approximate impact

Do not add dependencies simply for convenience.

---

54. CDN LIBRARIES

If using a CDN library is appropriate for the static GitHub Pages architecture:

Use a reliable CDN.

Pin the library version when practical.

Do not load a huge library when a smaller implementation is possible.

---

55. SEO CONTENT MUST MATCH THE TOOL

Do not generate generic content like:

Welcome to our amazing free online tool.
This powerful tool is easy and convenient.

Instead write useful information.

Example:

For an image compressor:

What image formats are supported?
How does image compression work?
How much quality can be preserved?
What happens to my files?

---

56. FAQ QUALITY

FAQs should answer real user questions.

Do not create:

What is this tool?
Is this tool useful?
Is this tool good?

unless genuinely useful.

Prefer:

What image formats can I compress?
Does the compressor reduce image quality?
Are my images uploaded?
What is the maximum file size?
Can I compress multiple images?

---

57. HOMEPAGE DISCOVERY

After implementing a tool, verify that it can be discovered from:

Homepage
Search
Category
Direct URL

If the homepage is driven by a data file such as:

data/tools.json

update that file using its existing schema.

Do not create a separate tool list.

---

58. SEO INTERNAL LINKING

Where appropriate, connect related tools.

Example:

Image Compressor
→ Image Resizer
→ JPG to PNG
→ PNG to JPG

Use natural internal links.

Do not spam links.

---

59. RELATED TOOLS

If the repository already supports related tools, add the new tool to the appropriate relationship.

Do not create a new related-tools implementation.

---

60. ADSENSE READINESS

Every tool page should provide enough genuine useful content to stand on its own.

Do not rely solely on the interactive widget.

The page should explain:

What the tool does
How to use it
Important limitations
Privacy/processing behavior
Useful FAQs

But don't fill the page with useless AI-generated text.

---

61. NO FALSE CLAIMS

Never claim:

100% secure
Military-grade encryption
No data ever leaves your device
Unlimited
Perfect quality
Lossless
Instant

unless technically true.

Use precise language.

---

62. IMAGE TOOLS

For image tools, consider:

File type validation
Dimensions
File size
Preview
Quality
Format
Download
Batch processing

only when relevant.

Do not add unnecessary features.

---

63. AUDIO/VIDEO TOOLS

For audio/video tools, consider:

Browser compatibility
Codec support
Processing time
Large file handling
Memory consumption
Progress
Download

If browser-only conversion is unreliable, do not fake it.

---

64. PDF TOOLS

For PDF tools, consider:

File size
Page count
Password-protected PDFs
Memory usage
Rendering
Download

Clearly communicate limitations.

---

65. DEVELOPER TOOLS

For developer tools:

Preserve formatting
Use monospace fonts where appropriate
Provide copy button
Provide clear/reset button
Avoid corrupting user input
Do not send code to external servers unless necessary

---

66. TEXT TOOLS

For text tools:

Preserve Unicode
Support Nepali text where practical
Support emojis where practical
Do not destroy line breaks
Do not silently trim user content

Nisulka Tools should be usable by both English and Nepali users.

---

67. DOWNLOAD SECURITY

Generated filenames must not contain unsafe user-controlled characters.

Sanitize filenames when user input influences the filename.

---

68. TESTING CHECKLIST

Before declaring the tool complete, test:

Functionality

Normal input
Empty input
Invalid input
Very small input
Large input
Multiple files if supported

UI

Desktop
Tablet
Mobile
Dark/light behavior if supported

Browser behavior

Chrome
Firefox
Safari
Mobile browser

Accessibility

Keyboard
Labels
Focus
Buttons
ARIA where needed

Errors

Invalid file
Unsupported format
Oversized file
Processing failure
Browser limitation

Download

Correct file
Correct extension
Correct MIME
Correct filename

---

69. DO NOT BREAK EXISTING TOOLS

This is critical.

When adding a new tool:

Do not modify existing tools unless necessary.

Do not change global CSS merely to make one tool work.

Do not change header/footer behavior merely for one tool.

If a global change is genuinely required:

1. Explain why.
2. Make it backward-compatible.
3. Verify existing pages afterward.

---

70. DO NOT CREATE DUPLICATE CSS

Before writing CSS, search for an existing class/component that does the job.

Prefer:

existing .btn
existing .card
existing .input
existing .container
existing .tool-panel

over:

.my-special-button
.my-new-card
.my-custom-input

unless the component genuinely needs unique styling.

---

71. DO NOT CREATE DUPLICATE JAVASCRIPT

Search the repository before implementing:

file size formatter
download helper
toast
modal
clipboard
drag/drop
theme
header
footer
tool registry

If an existing helper exists, use it.

---

72. CODE OUTPUT

When asked to create a tool, provide:

1. Files that need to be created
2. Files that need to be modified
3. Complete code for new files
4. Exact changes to existing shared files
5. Tool registry entry
6. Testing checklist
7. Commit message

When requested, provide complete files rather than scattered code fragments.

---

73. NEVER ASSUME FILE CONTENT

Before modifying an existing file:

Read the current file.

Do not invent its existing contents.

Do not overwrite a file blindly.

Preserve existing functionality.

---

74. EXISTING REPOSITORY ALWAYS WINS

If this prompt conflicts with the actual repository architecture:

Follow the repository architecture.

The master prompt establishes principles.

The actual existing code establishes implementation details.

---

75. DESIGN PHILOSOPHY

Nisulka Tools should feel:

Modern
Clean
Fast
Simple
Trustworthy
Professional
Useful
Mobile-friendly
Accessible
SEO-friendly

Avoid:

Over-designed interfaces
Excessive gradients
Huge animations
Unnecessary glassmorphism
Clutter
Too many buttons
Too many settings
Fake AI aesthetics

The tool should feel like a useful utility, not a marketing landing page.

---

76. FINAL QUALITY STANDARD

Before declaring a tool complete, ask:

Does it actually solve the user's problem?

Does it look like Nisulka Tools?

Does it use the existing header?

Does it use the existing footer?

Does it work on mobile?

Does it work without unnecessary backend infrastructure?

Does it handle errors?

Does it provide useful feedback?

Can users download/copy the result?

Is the page SEO-friendly?

Is the content genuinely useful?

Can the homepage discover it?

Can users search for it?

Will adding another 50 tools using this architecture remain manageable?

Did I avoid breaking existing tools?

If any answer is "no", fix it before declaring the implementation complete.

---

77. IMPORTANT: DO NOT OVERENGINEER

Nisulka Tools will eventually contain many tools.

Therefore the architecture must remain maintainable.

Prefer:

Simple
Reusable
Modular
Predictable

over:

Complex
Clever
Over-abstracted
Framework-heavy

Build for dozens or hundreds of tools, not just today's tool.

---

78. WHEN I SAY "BUILD [TOOL]"

Treat the request as a production implementation request.

Example:

Build an Image Compressor.

You should automatically understand that it means:

Create:

tools/image-compressor/index.html
tools/image-compressor/script.js

Use Nisulka's existing UI.

Use existing header/footer.

Add the tool to the existing registry.

Make it responsive.

Make it SEO-friendly.

Handle errors.

Handle loading states.

Provide useful content.

Provide FAQ.

Provide download functionality.

Keep processing client-side where practical.

Do not break existing tools.

Test the architecture mentally before finishing.

I should not have to repeat these requirements every time.

---

79. RESPONSE FORMAT FOR FUTURE TOOL REQUESTS

When I ask:

Build [TOOL]

respond in this order:

1. Implementation Plan

Briefly state:

Tool
Slug
Category
Processing method
Files affected

2. Repository Changes

Show:

CREATE
MODIFY
NO CHANGE

3. Complete Code

Provide complete code for new files.

For existing files, provide exact changes based on their actual current content.

4. Homepage Registry

Provide the exact registry entry using the repository's existing schema.

5. SEO

Provide:

Title
Description
Canonical
Keywords/tags if the existing system supports them
Structured data

6. Testing

Provide a concise test checklist.

7. Commit

Provide one clean commit message.

---

80. MOST IMPORTANT RULE

Do not make every tool look like a different website.

The user should be able to visit:

Nisulka Tools
    ↓
Image Compressor
    ↓
MP4 to MP3
    ↓
Text to Handwriting
    ↓
PDF Merger
    ↓
QR Generator

and immediately understand:

«"These are all part of the same platform."»

The functionality changes.

The product identity does not.

Nisulka Tools is the product. Individual tools are features of that product.
