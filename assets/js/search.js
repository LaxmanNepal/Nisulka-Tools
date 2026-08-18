"use strict";

const DATA_URL = "data/tools.json";
const input = document.getElementById("search-page-input");
const results = document.getElementById("search-results");
const meta = document.getElementById("search-results-meta");

let tools = [];

const escapeHTML = value => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

function safeURL(value) {
  const raw = String(value || "").trim();
  if (!raw) return "#";
  if (raw.startsWith("/") || raw.startsWith("./") || raw.startsWith("../")) return raw;
  try {
    const url = new URL(raw, location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch { return "#"; }
}

function render(query = "") {
  const q = query.trim().toLowerCase();
  const visible = q
    ? tools.filter(tool => [tool.name, tool.description, tool.category, tool.slug, ...(Array.isArray(tool.keywords) ? tool.keywords : [])].join(" ").toLowerCase().includes(q))
    : tools;

  meta.textContent = q ? `${visible.length} ${visible.length === 1 ? "tool" : "tools"} found for “${query.trim()}”` : `${visible.length} ${visible.length === 1 ? "tool" : "tools"} available`;

  if (!visible.length) {
    results.innerHTML = `<div class="search-empty"><h3>No tools found</h3><p>Try a different keyword, tool name, or category.</p></div>`;
    return;
  }

  results.innerHTML = visible.map(tool => {
    const name = escapeHTML(tool.name || "Unnamed Tool");
    const url = escapeHTML(safeURL(tool.url));
    const logo = escapeHTML(safeURL(tool.logo));
    return `<article class="search-result-card"><a href="${url}" aria-label="Open ${name}"><img class="search-result-logo" src="${logo}" alt="${name} logo" loading="lazy" onerror="this.style.visibility='hidden'"><h2 class="search-result-title">${name}</h2></a></article>`;
  }).join("");
}

async function init() {
  try {
    const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    tools = Array.isArray(data) ? data.filter(tool => tool && tool.status !== "hidden") : [];

    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    input.value = query;
    render(query);

    input.addEventListener("input", () => {
      const value = input.value;
      const url = new URL(location.href);
      if (value.trim()) url.searchParams.set("q", value.trim());
      else url.searchParams.delete("q");
      history.replaceState(null, "", url);
      render(value);
    });
  } catch (error) {
    console.error("Search error:", error);
    meta.textContent = "";
    results.innerHTML = `<div class="search-empty"><h3>Unable to load tools</h3><p>Please refresh the page and try again.</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
