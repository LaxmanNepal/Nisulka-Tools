"use strict";

const TOOLS_DATA_URL = "data/tools.json";

let allTools = [];
let activeCategory = "All";
let searchQuery = "";

const searchInput = document.getElementById("tool-search");
const categoryList = document.getElementById("category-list");
const allToolsContainer = document.getElementById("all-tools");
const toolCount = document.getElementById("tool-count");

const CATEGORY_RULES = [
    { name: "Image Tools", words: ["image", "png", "jpg", "jpeg", "webp", "gif", "photo", "background", "watermark"] },
    { name: "PDF Tools", words: ["pdf"] },
    { name: "YouTube Tools", words: ["youtube", "youtube channel", "thumbnail", "video analytics", "channel analysis"] },
    { name: "Nepali Tools", words: ["nepali", "nepal", "nepali date", "nepali calendar", "nepali unicode", "romanized nepali"] },
    { name: "Text Tools", words: ["text", "handwriting", "word", "case converter", "text converter"] },
    { name: "Converter Tools", words: ["converter", "conversion", "convert"] },
    { name: "Developer Tools", words: ["json", "html", "css", "javascript", "developer", "code", "base64", "url encoder"] },
    { name: "Calculator Tools", words: ["calculator", "calculate", "percentage", "age calculator"] },
    { name: "Finance Tools", words: ["currency", "finance", "loan", "interest", "nepse", "gold price"] },
    { name: "Social Media Tools", words: ["instagram", "facebook", "tiktok", "social media"] }
];

document.addEventListener("DOMContentLoaded", initializeHomepage);

async function initializeHomepage() {
    showLoadingState();

    try {
        await loadTools();
        setupSearch();
        renderCategories();
        renderCategorySections();
        setupFAQ();
    } catch (error) {
        console.error("Nisulka Tools homepage error:", error);
        showErrorState();
    }
}

async function loadTools() {
    const response = await fetch(`${TOOLS_DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load tools.json: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("tools.json must contain an array.");

    allTools = data.filter(tool => tool && tool.status !== "hidden").map(normalizeTool);
}

function normalizeTool(tool) {
    const suppliedCategory = String(tool.category || "").trim();
    return {
        ...tool,
        category: suppliedCategory && suppliedCategory !== "Other Tools" ? suppliedCategory : inferCategory(tool)
    };
}

function inferCategory(tool) {
    const text = [tool.name || "", tool.description || "", tool.slug || "", ...(Array.isArray(tool.keywords) ? tool.keywords : [])].join(" ").toLowerCase();
    for (const rule of CATEGORY_RULES) {
        if (rule.words.some(word => text.includes(word))) return rule.name;
    }
    return "Other Tools";
}

function setupSearch() {
    if (!searchInput) return;

    const update = event => {
        searchQuery = event.target.value.trim().toLowerCase();
        renderCategories();
        renderCategorySections();
    };

    searchInput.addEventListener("input", update);
    searchInput.addEventListener("search", update);

    const query = new URLSearchParams(window.location.search).get("q");
    if (query) {
        searchInput.value = query;
        searchQuery = query.trim().toLowerCase();
    }
}

document.addEventListener("keydown", event => {
    if (event.key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault();
        searchInput?.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput) {
        clearFilters();
        searchInput.blur();
    }
});

function isTypingTarget(element) {
    if (!element) return false;
    const tag = element.tagName?.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || element.isContentEditable;
}

function getSearchFilteredTools() {
    return allTools.filter(tool => {
        if (!searchQuery) return true;
        const searchableText = [tool.name || "", tool.description || "", tool.category || "", tool.slug || "", ...(Array.isArray(tool.keywords) ? tool.keywords : [])].join(" ").toLowerCase();
        return searchableText.includes(searchQuery);
    });
}

function getVisibleTools() {
    return getSearchFilteredTools().filter(tool => activeCategory === "All" || tool.category === activeCategory);
}

function getCategories() {
    const counts = new Map();
    allTools.forEach(tool => {
        const category = tool.category || "Other Tools";
        counts.set(category, (counts.get(category) || 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => {
        if (a[0] === "Other Tools") return 1;
        if (b[0] === "Other Tools") return -1;
        return a[0].localeCompare(b[0]);
    });
}

function renderCategories() {
    if (!categoryList) return;

    const categories = getCategories();
    const filtered = getSearchFilteredTools();

    categoryList.innerHTML = `
        <button type="button" class="category-button ${activeCategory === "All" ? "is-active" : ""}" data-category="All" aria-pressed="${activeCategory === "All"}">
            All Tools <span class="category-count">${filtered.length}</span>
        </button>
        ${categories.map(([category, count]) => {
            const visibleCount = searchQuery ? filtered.filter(tool => tool.category === category).length : count;
            return `
                <button type="button" class="category-button ${activeCategory === category ? "is-active" : ""}" data-category="${escapeAttribute(category)}" aria-pressed="${activeCategory === category}">
                    ${escapeHTML(category)} <span class="category-count">${visibleCount}</span>
                </button>
            `;
        }).join("")}
    `;

    categoryList.querySelectorAll(".category-button").forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category || "All";
            renderCategories();
            renderCategorySections();
        });
    });
}

function renderCategorySections() {
    if (!allToolsContainer) return;

    const filtered = getVisibleTools();
    if (!filtered.length) {
        showNoResults();
        updateToolCount(0);
        return;
    }

    const groups = new Map();
    filtered.forEach(tool => {
        const category = tool.category || "Other Tools";
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(tool);
    });

    const orderedGroups = [...groups.entries()].sort((a, b) => {
        if (a[0] === "Other Tools") return 1;
        if (b[0] === "Other Tools") return -1;
        return a[0].localeCompare(b[0]);
    });

    allToolsContainer.innerHTML = orderedGroups.map(([category, tools]) => {
        const visibleTools = activeCategory === "All" ? tools.slice(0, 4) : tools;
        const remaining = tools.length - visibleTools.length;

        return `
            <section class="home-category-block" data-category-section="${escapeAttribute(category)}">
                <div class="home-category-heading">
                    <div>
                        <span class="section-label">CATEGORY</span>
                        <h3>${escapeHTML(category)}</h3>
                        <p>${tools.length} ${tools.length === 1 ? "tool" : "tools"}</p>
                    </div>
                    <button type="button" class="category-view-all" data-view-category="${escapeAttribute(category)}">
                        View all <span aria-hidden="true">→</span>
                    </button>
                </div>
                <div class="tools-grid">
                    ${visibleTools.map(createToolCard).join("")}
                </div>
                ${remaining > 0 ? `<div class="category-more">+${remaining} more</div>` : ""}
            </section>
        `;
    }).join("");

    allToolsContainer.querySelectorAll("[data-view-category]").forEach(button => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.viewCategory || "All";
            renderCategories();
            renderCategorySections();
            document.getElementById("all-tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    updateToolCount(filtered.length);
}

function createToolCard(tool) {
    const name = escapeHTML(tool.name || "Unnamed Tool");
    const url = safeURL(tool.url || "#");
    const logo = safeURL(tool.logo || "");

    const logoHTML = logo
        ? `<img class="tool-card-logo" src="${logo}" alt="${name} logo" loading="lazy" width="88" height="88" onerror="this.style.display='none';this.nextElementSibling.hidden=false;">
           <span class="tool-card-logo-fallback" aria-hidden="true" hidden>◇</span>`
        : `<span class="tool-card-logo-fallback" aria-hidden="true">◇</span>`;

    return `
        <article class="tool-card">
            <a class="tool-card-link" href="${url}" aria-label="Open ${name}">
                <div class="tool-card-icon-wrapper">${logoHTML}</div>
                <h4 class="tool-card-title">${name}</h4>
            </a>
        </article>
    `;
}

function safeURL(value) {
    const stringValue = String(value || "").trim();
    if (!stringValue) return "#";
    if (stringValue.startsWith("/") || stringValue.startsWith("./") || stringValue.startsWith("../")) return escapeAttribute(stringValue);

    try {
        const url = new URL(stringValue, window.location.origin);
        if (url.protocol === "http:" || url.protocol === "https:") return escapeAttribute(url.href);
    } catch (_) {}
    return "#";
}

function updateToolCount(count) {
    if (toolCount) toolCount.textContent = `${count} ${count === 1 ? "tool" : "tools"}`;
}

function showNoResults() {
    if (!allToolsContainer) return;

    allToolsContainer.innerHTML = `
        <div class="tools-empty">
            <h3>No tools found</h3>
            <p>Try another search or choose a different category.</p>
            <button type="button" class="btn btn-primary" id="clear-search">Clear filters</button>
        </div>
    `;

    document.getElementById("clear-search")?.addEventListener("click", clearFilters);
}

function clearFilters() {
    if (searchInput) searchInput.value = "";
    searchQuery = "";
    activeCategory = "All";
    renderCategories();
    renderCategorySections();
}

function showLoadingState() {
    const skeletons = Array.from({ length: 4 }, () => `<div class="tool-skeleton"></div>`).join("");
    if (allToolsContainer) allToolsContainer.innerHTML = skeletons;
}

function showErrorState() {
    if (!allToolsContainer) return;
    allToolsContainer.innerHTML = `
        <div class="tools-empty">
            <h3>Tools couldn't be loaded</h3>
            <p>Something went wrong while loading the tool collection.</p>
            <button type="button" class="btn btn-primary" onclick="location.reload()">Try again</button>
        </div>
    `;
}

function setupFAQ() {
    document.querySelectorAll(".tool-faq-question").forEach(question => {
        question.addEventListener("click", () => {
            const expanded = question.getAttribute("aria-expanded") === "true";
            question.setAttribute("aria-expanded", expanded ? "false" : "true");
            const answer = question.closest(".tool-faq-item")?.querySelector(".tool-faq-answer");
            if (answer) answer.hidden = expanded;
        });
    });
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}
