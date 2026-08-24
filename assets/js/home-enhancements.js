(function () {
  "use strict";

  const DATA_URL = "data/tools.json";
  const RECENT_KEY = "nisulka-recent-tools";
  const FAVORITES_KEY = "nisulka-favorite-tools";
  const MAX_RECENT = 6;

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    try {
      const response = await fetch(DATA_URL, { cache: "default" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const tools = Array.isArray(data) ? data.filter(t => t && t.status !== "hidden") : [];
      window.NisulkaTools = { tools };
      renderFeatured(tools);
      renderRecent(tools);
      renderFavorites(tools);
      bindToolTracking();
      bindFavoriteTracking();
    } catch (error) {
      console.warn("Homepage enhancements unavailable:", error);
    }
  }

  function renderFeatured(tools) {
    const mount = document.getElementById("featured-tools");
    if (!mount) return;
    const featured = tools.filter(t => t.featured).slice(0, 6);
    if (!featured.length) {
      mount.closest(".featured-section")?.remove();
      return;
    }
    mount.innerHTML = featured.map((tool, index) => createCard(tool, index === 0 ? "featured-main" : "")).join("");
  }

  function renderRecent(tools) {
    const section = document.getElementById("recent-tools-section");
    const mount = document.getElementById("recent-tools");
    if (!section || !mount) return;
    const recent = readList(RECENT_KEY).map(id => tools.find(t => String(t.slug) === id)).filter(Boolean).slice(0, MAX_RECENT);
    section.hidden = !recent.length;
    if (recent.length) mount.innerHTML = recent.map(tool => createCard(tool, "recent-card")).join("");
  }

  function renderFavorites(tools) {
    const section = document.getElementById("favorite-tools-section");
    const mount = document.getElementById("favorite-tools");
    if (!section || !mount) return;
    const favorites = readList(FAVORITES_KEY).map(id => tools.find(t => String(t.slug) === id)).filter(Boolean);
    section.hidden = !favorites.length;
    if (favorites.length) mount.innerHTML = favorites.map(tool => createCard(tool, "favorite-card")).join("");
  }

  function bindToolTracking() {
    document.addEventListener("click", event => {
      const link = event.target.closest("a[data-tool-slug]");
      if (!link) return;
      const slug = link.dataset.toolSlug;
      if (!slug) return;
      writeList(RECENT_KEY, [slug, ...readList(RECENT_KEY).filter(id => id !== slug)].slice(0, MAX_RECENT));
    });
  }

  function bindFavoriteTracking() {
    document.addEventListener("click", event => {
      const button = event.target.closest("[data-favorite-tool]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const slug = button.dataset.favoriteTool;
      if (!slug) return;
      const current = readList(FAVORITES_KEY);
      const next = current.includes(slug) ? current.filter(id => id !== slug) : [slug, ...current];
      writeList(FAVORITES_KEY, next);
      updateFavoriteButtons(slug, next.includes(slug));
      const tools = window.NisulkaTools?.tools || [];
      renderFavorites(tools);
    });
  }

  function updateFavoriteButtons(slug, active) {
    document.querySelectorAll(`[data-favorite-tool="${cssEscape(slug)}"]`).forEach(button => {
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", active ? "Remove from favorites" : "Add to favorites");
      button.textContent = active ? "★" : "☆";
    });
  }

  function createCard(tool, extraClass) {
    const name = escapeHTML(tool.name || "Tool");
    const description = escapeHTML(tool.description || "Free online tool.");
    const category = escapeHTML(tool.category || "Tools");
    const slug = String(tool.slug || "");
    const url = safeURL(tool.url || "#");
    const logo = safeURL(tool.logo || "");
    const image = logo ? `<img class="enhanced-tool-logo" src="${logo}" alt="" loading="lazy" width="128" height="128" onerror="this.onerror=null;this.remove();">` : "";
    const favorite = readList(FAVORITES_KEY).includes(slug);
    const favoriteButton = slug ? `<button class="tool-favorite-button" type="button" data-favorite-tool="${escapeAttribute(slug)}" aria-label="${favorite ? "Remove from favorites" : "Add to favorites"}" aria-pressed="${favorite}">${favorite ? "★" : "☆"}</button>` : "";
    return `<article class="enhanced-tool-card ${extraClass}"><a href="${url}" class="enhanced-tool-link" data-tool-slug="${escapeAttribute(slug)}" aria-label="Open ${name}"><div class="enhanced-tool-logo-wrap">${image}</div><div class="enhanced-tool-copy"><span class="enhanced-tool-category">${category}</span><h3>${name}</h3><p>${description}</p></div><span class="enhanced-tool-arrow" aria-hidden="true">↗</span>${favoriteButton}</a></article>`;
  }

  function readList(key) {
    try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value.map(String) : []; } catch (_) { return []; }
  }
  function writeList(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function safeURL(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(\/|\.\/|\.\.\/)/.test(raw)) return escapeAttribute(raw);
    try { const url = new URL(raw, location.origin); return ["http:", "https:"].includes(url.protocol) ? escapeAttribute(url.href) : ""; } catch (_) { return ""; }
  }
  function cssEscape(value) { return String(value).replace(/(["\\])/g, "\\$1"); }
  function escapeHTML(value) { return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
  function escapeAttribute(value) { return escapeHTML(value); }
})();
