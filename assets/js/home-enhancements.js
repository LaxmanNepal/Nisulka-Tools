(function () {
    "use strict";

    const DATA_URL = "data/tools.json";
    const RECENT_KEY = "nisulka-recent-tools";
    const MAX_RECENT = 6;

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
            if (!response.ok) return;
            const tools = await response.json();
            if (!Array.isArray(tools)) return;
            renderFeatured(tools.filter(t => t && t.status !== "hidden"));
            renderRecent(tools.filter(t => t && t.status !== "hidden"));
            bindRecentTracking();
        } catch (error) {
            console.warn("Homepage enhancements unavailable:", error);
        }
    });

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
        const ids = readRecent();
        const recent = ids.map(id => tools.find(t => String(t.slug) === id)).filter(Boolean).slice(0, MAX_RECENT);
        if (!recent.length) {
            section.hidden = true;
            return;
        }
        section.hidden = false;
        mount.innerHTML = recent.map(tool => createCard(tool, "recent-card")).join("");
    }

    function bindRecentTracking() {
        document.addEventListener("click", function (event) {
            const link = event.target.closest("a[data-tool-slug]");
            if (!link) return;
            const slug = link.dataset.toolSlug;
            if (!slug) return;
            let ids = readRecent().filter(id => id !== slug);
            ids.unshift(slug);
            localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
        });
    }

    function readRecent() {
        try {
            const value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
            return Array.isArray(value) ? value.map(String) : [];
        } catch (_) {
            return [];
        }
    }

    function createCard(tool, extraClass) {
        const name = escapeHTML(tool.name || "Tool");
        const description = escapeHTML(tool.description || "Free online tool.");
        const category = escapeHTML(tool.category || "Tools");
        const url = safeURL(tool.url || "#");
        const logo = safeURL(tool.logo || "");
        const image = logo ? `<img class="enhanced-tool-logo" src="${logo}" alt="" loading="lazy" width="128" height="128" onerror="this.onerror=null;this.remove();">` : "";
        return `<article class="enhanced-tool-card ${extraClass}"><a href="${url}" class="enhanced-tool-link" data-tool-slug="${escapeAttribute(String(tool.slug || ""))}" aria-label="Open ${name}"><div class="enhanced-tool-logo-wrap">${image}</div><div class="enhanced-tool-copy"><span class="enhanced-tool-category">${category}</span><h3>${name}</h3><p>${description}</p></div><span class="enhanced-tool-arrow" aria-hidden="true">↗</span></a></article>`;
    }

    function safeURL(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";
        if (/^(\/|\.\/|\.\.\/)/.test(raw)) return escapeAttribute(raw);
        try {
            const url = new URL(raw, location.origin);
            return ["http:", "https:"].includes(url.protocol) ? escapeAttribute(url.href) : "";
        } catch (_) { return ""; }
    }

    function escapeHTML(value) { return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }
    function escapeAttribute(value) { return escapeHTML(value); }
})();
