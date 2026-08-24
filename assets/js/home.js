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
    { name: "YouTube Tools", words: ["youtube", "thumbnail", "video analytics", "channel analysis"] },
    { name: "Nepali Tools", words: ["nepali", "nepal", "calendar", "unicode", "romanized nepali"] },
    { name: "Text Tools", words: ["text", "handwriting", "word", "case converter"] },
    { name: "Converter Tools", words: ["converter", "conversion", "convert"] },
    { name: "Developer Tools", words: ["json", "html", "css", "javascript", "developer", "code", "base64"] },
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
        renderTools();
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
    const category = String(tool.category || "").trim();
    return { ...tool, category: category && category !== "Other Tools" ? category : inferCategory(tool) };
}

function inferCategory(tool) {
    const text = [tool.name, tool.description, tool.slug, ...(Array.isArray(tool.keywords) ? tool.keywords : [])].join(" ").toLowerCase();
    for (const rule of CATEGORY_RULES) if (rule.words.some(word => text.includes(word))) return rule.name;
    return "Other Tools";
}

function setupSearch() {
    if (!searchInput) return;
    const navigate = () => {
        const query = searchInput.value.trim();
        window.location.href = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
    };
    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); navigate(); }
        if (event.key === "Escape") searchInput.value = "";
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault();
        window.location.href = "search.html";
    }
});

function isTypingTarget(element) {
    const tag = element?.tagName?.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || element?.isContentEditable;
}

function getSearchFilteredTools() {
    if (!searchQuery) return [...allTools];
    return allTools.filter(tool => [tool.name, tool.description, tool.category, tool.slug, ...(Array.isArray(tool.keywords) ? tool.keywords : [])].join(" ").toLowerCase().includes(searchQuery));
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
    return [...counts.entries()].sort((a, b) => a[0] === "Other Tools" ? 1 : b[0] === "Other Tools" ? -1 : a[0].localeCompare(b[0]));
}

function renderCategories() {
    if (!categoryList) return;
    const filtered = getSearchFilteredTools();
    categoryList.innerHTML = `<button type="button" class="category-button ${activeCategory === "All" ? "is-active" : ""}" data-category="All" aria-pressed="${activeCategory === "All"}">All Tools <span class="category-count">${filtered.length}</span></button>${getCategories().map(([category, total]) => { const count = searchQuery ? filtered.filter(tool => tool.category === category).length : total; return `<button type="button" class="category-button ${activeCategory === category ? "is-active" : ""}" data-category="${escapeAttribute(category)}" aria-pressed="${activeCategory === category}">${escapeHTML(category)} <span class="category-count">${count}</span></button>`; }).join("")}`;
    categoryList.querySelectorAll(".category-button").forEach(button => button.addEventListener("click", () => {
        activeCategory = button.dataset.category || "All";
        renderCategories();
        renderTools();
        document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
}

function renderTools() {
    if (!allToolsContainer) return;
    const tools = getVisibleTools();
    updateToolCount(tools.length);
    if (!tools.length) return showNoResults();
    allToolsContainer.innerHTML = tools.map(createToolCard).join("");
}

function createToolCard(tool) {
    const name = escapeHTML(tool.name || "Unnamed Tool");
    const url = safeURL(tool.url || "#");
    const logo = safeURL(tool.logo || "");
    const logoMarkup = logo ? `<img class="tool-card-logo" src="${logo}" alt="${name} logo" loading="lazy" width="128" height="128" onerror="this.onerror=null; this.remove();">` : "";
    return `<article class="tool-card"><a class="tool-card-link" href="${url}" data-tool-slug="${escapeAttribute(String(tool.slug || ""))}" aria-label="Open ${name}"><div class="tool-card-icon-wrapper">${logoMarkup}</div><h4 class="tool-card-title">${name}</h4></a></article>`;
}

function safeURL(value) {
    const valueString = String(value || "").trim();
    if (!valueString) return "";
    if (valueString.startsWith("/") || valueString.startsWith("./") || valueString.startsWith("../")) return escapeAttribute(valueString);
    try { const url = new URL(valueString, location.origin); return ["http:", "https:"].includes(url.protocol) ? escapeAttribute(url.href) : ""; } catch (_) { return ""; }
}

function updateToolCount(count) { if (toolCount) toolCount.textContent = `${count} ${count === 1 ? "tool" : "tools"}`; }

function showNoResults() {
    allToolsContainer.innerHTML = `<div class="tools-empty"><h3>No tools found</h3><p>Try another search or choose a different category.</p><button type="button" class="btn btn-primary" id="clear-search">Clear filters</button></div>`;
    document.getElementById("clear-search")?.addEventListener("click", clearFilters);
}

function clearFilters() {
    if (searchInput) searchInput.value = "";
    searchQuery = "";
    activeCategory = "All";
    renderCategories();
    renderTools();
}

function showLoadingState() { if (allToolsContainer) allToolsContainer.innerHTML = Array.from({ length: 10 }, () => `<div class="tool-skeleton"></div>`).join(""); }
function showErrorState() { if (allToolsContainer) allToolsContainer.innerHTML = `<div class="tools-empty"><h3>Tools couldn't be loaded</h3><p>Something went wrong while loading the tool collection.</p><button type="button" class="btn btn-primary" onclick="location.reload()">Try again</button></div>`; }

function setupFAQ() {
    document.querySelectorAll(".tool-faq-question").forEach(question => question.addEventListener("click", () => {
        const expanded = question.getAttribute("aria-expanded") === "true";
        question.setAttribute("aria-expanded", expanded ? "false" : "true");
        const answer = question.closest(".tool-faq-item")?.querySelector(".tool-faq-answer");
        if (answer) answer.hidden = expanded;
    }));
}

function escapeHTML(value) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }
function escapeAttribute(value) { return escapeHTML(value); }
