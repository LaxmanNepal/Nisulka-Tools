"use strict";

const TOOLS_DATA_URL = "data/tools.json";
const TOOLS_DATA_FALLBACK_URLS = ["./data/tools.json", "/Nisulka-Tools/data/tools.json"];
const TOOLS_DATA_VERSION = "20260905";
const PAGE_SIZE = 18;

let allTools = [];
let activeCategory = "All";
let searchQuery = "";
let visibleLimit = PAGE_SIZE;

const searchInput = document.getElementById("tool-search");
const categoryList = document.getElementById("category-list");
const allToolsContainer = document.getElementById("all-tools");
const toolCount = document.getElementById("tool-count");
const loadMoreButton = document.getElementById("load-more-tools");

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
    showErrorState(error);
  }
}

async function fetchToolsJSON(url) {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}v=${TOOLS_DATA_VERSION}`, {
    cache: "no-store",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw Error(`Unable to load ${url}: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw Error(`${url} must contain an array.`);
  return data;
}

async function loadTools() {
  const urls = [TOOLS_DATA_URL, ...TOOLS_DATA_FALLBACK_URLS];
  let lastError = null;

  for (const url of urls) {
    try {
      const data = await fetchToolsJSON(url);
      const normalized = data
        .filter(tool => tool && tool.status !== "hidden")
        .map(normalizeTool)
        .filter(tool => tool.name && tool.slug && tool.url)
        .sort((a, b) => {
          const featuredA = Boolean(a.featured);
          const featuredB = Boolean(b.featured);
          return featuredA !== featuredB
            ? Number(featuredB) - Number(featuredA)
            : a.name.localeCompare(b.name);
        });

      if (!normalized.length) throw Error("tools.json contains no valid active tools.");

      allTools = normalized;
      window.NisulkaTools = window.NisulkaTools || {};
      window.NisulkaTools.tools = allTools;
      window.dispatchEvent(new CustomEvent("nisulka:tools-ready", { detail: { tools: allTools } }));
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Nisulka Tools: failed to load ${url}`, error);
    }
  }

  throw lastError || Error("Unable to load tool collection.");
}

function normalizeTool(tool) {
  const category = String(tool.category || "").trim();
  return {
    ...tool,
    category: normalizeCategory(category && category !== "Other Tools" ? category : inferCategory(tool))
  };
}

function normalizeCategory(category) {
  const key = String(category || "").trim().toLowerCase();
  const map = {
    "ai tools": "AI Tools",
    "image tools": "Image Tools",
    "audio tools": "Audio Tools",
    "youtube tools": "YouTube Tools",
    "nepali tools": "Nepali Tools",
    "text tools": "Text Tools",
    "pdf tools": "PDF Tools",
    "developer tools": "Developer Tools",
    "calculator tools": "Calculator Tools",
    "finance tools": "Finance Tools",
    "social media tools": "Social Media Tools",
    "analytics": "YouTube Tools",
    "other tools": "Other Tools"
  };
  return map[key] || category || "Other Tools";
}

function inferCategory(tool) {
  const haystack = [
    tool.name,
    tool.shortDescription,
    tool.description,
    tool.slug,
    ...(Array.isArray(tool.keywords) ? tool.keywords : [])
  ].join(" ").toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.words.some(word => haystack.includes(word))) return rule.name;
  }
  return "Other Tools";
}

function setupSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    visibleLimit = PAGE_SIZE;
    renderCategories();
    renderTools();
  });

  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && searchQuery) {
      event.preventDefault();
      location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
    }

    if (event.key === "Escape") {
      clearFilters();
    }
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "/" && !isTypingTarget(event.target)) {
    event.preventDefault();
    searchInput?.focus();
  }
});

function isTypingTarget(element) {
  const tag = element?.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || element?.isContentEditable;
}

function getSearchFilteredTools() {
  if (!searchQuery) return [...allTools];

  return allTools.filter(tool => [
    tool.name,
    tool.shortDescription,
    tool.description,
    tool.category,
    tool.slug,
    ...(Array.isArray(tool.keywords) ? tool.keywords : [])
  ].join(" ").toLowerCase().includes(searchQuery));
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

  const filtered = getSearchFilteredTools();
  categoryList.innerHTML = [
    `<button type="button" class="category-button ${activeCategory === "All" ? "is-active" : ""}" data-category="All" aria-pressed="${activeCategory === "All"}">All Tools <span class="category-count">${filtered.length}</span></button>`,
    ...getCategories().map(([category, total]) => {
      const count = searchQuery ? filtered.filter(tool => tool.category === category).length : total;
      return `<button type="button" class="category-button ${activeCategory === category ? "is-active" : ""}" data-category="${escapeAttribute(category)}" aria-pressed="${activeCategory === category}">${escapeHTML(category)} <span class="category-count">${count}</span></button>`;
    })
  ].join("");

  categoryList.querySelectorAll(".category-button").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "All";
      visibleLimit = PAGE_SIZE;
      renderCategories();
      renderTools();
      document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderTools() {
  if (!allToolsContainer) return;

  const matches = getVisibleTools();
  const visible = matches.slice(0, visibleLimit);
  updateToolCount(matches.length);

  if (!matches.length) {
    showNoResults();
    updateLoadMore(0, 0);
    return;
  }

  allToolsContainer.innerHTML = visible.map(createToolCard).join("");
  updateLoadMore(visible.length, matches.length);
}

function createToolCard(tool) {
  const name = escapeHTML(tool.name || "Unnamed Tool");
  const url = safeURL(tool.url || "#");
  const logo = safeURL(tool.logo || "");
  const id = String(tool.slug || "");
  const image = logo
    ? `<img class="tool-card-logo" src="${logo}" alt="" loading="lazy" decoding="async" width="128" height="128" onerror="this.onerror=null;this.remove();">`
    : `<span class="tool-card-logo-fallback" aria-hidden="true">✦</span>`;

  return `<article class="tool-card"><a class="tool-card-link" href="${url}" data-tool-slug="${escapeAttribute(id)}" aria-label="Open ${name}"><div class="tool-card-icon-wrapper">${image}</div><h4 class="tool-card-title">${name}</h4></a><button class="tool-favorite-button" type="button" data-favorite-tool="${escapeAttribute(id)}" aria-label="Add to favorites" aria-pressed="false">☆</button></article>`;
}

function updateLoadMore(visible, total) {
  if (!loadMoreButton) return;
  const remaining = Math.max(0, total - visible);
  loadMoreButton.hidden = remaining === 0;
  loadMoreButton.textContent = remaining ? `Load more tools (${Math.min(PAGE_SIZE, remaining)})` : "";
  loadMoreButton.setAttribute("aria-label", remaining ? `Load ${Math.min(PAGE_SIZE, remaining)} more tools` : "Load more tools");
}

function clearFilters() {
  if (searchInput) searchInput.value = "";
  searchQuery = "";
  activeCategory = "All";
  visibleLimit = PAGE_SIZE;
  renderCategories();
  renderTools();
}

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    visibleLimit += PAGE_SIZE;
    renderTools();
  });
}

function updateToolCount(count) {
  if (toolCount) toolCount.textContent = `${count} ${count === 1 ? "tool" : "tools"}`;
}

function showNoResults() {
  allToolsContainer.innerHTML = `<div class="tools-empty"><h3>No tools found</h3><p>Try another search or choose a different category.</p><button type="button" class="btn btn-primary" id="clear-search">Clear filters</button></div>`;
  document.getElementById("clear-search")?.addEventListener("click", clearFilters);
}

function showLoadingState() {
  if (allToolsContainer) allToolsContainer.innerHTML = Array.from({ length: 10 }, () => `<div class="tool-skeleton"></div>`).join("");
}

function showErrorState(error) {
  console.warn("Catalog failed after fallback URLs", error);
  if (allToolsContainer) {
    allToolsContainer.innerHTML = `<div class="tools-empty"><h3>Tools couldn't be loaded</h3><p>We couldn't load the tool collection. Please try again.</p><button type="button" class="btn btn-primary" onclick="location.reload()">Try again</button></div>`;
  }
  if (toolCount) toolCount.textContent = "Unavailable";
  if (loadMoreButton) loadMoreButton.hidden = true;
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

function safeURL(value) {
  const valueString = String(value || "").trim();
  if (!valueString) return "";
  if (/^\.{0,2}\//.test(valueString)) return escapeAttribute(valueString);

  try {
    const url = new URL(valueString, location.origin);
    return ["http:", "https:"].includes(url.protocol) ? escapeAttribute(url.href) : "";
  } catch (_) {
    return "";
  }
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
