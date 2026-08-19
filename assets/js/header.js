(function () {
    "use strict";

    const SEARCH_PAGE = "/Nisulka-Tools/search.html";

    const headerHTML = `
        <header class="site-header" id="site-header">
            <div class="container header-inner">
                <a href="/Nisulka-Tools/" class="site-logo" aria-label="Nisulka Tools home">
                    <span class="site-logo-mark" aria-hidden="true">N</span>
                    <span class="site-logo-text">Nisulka Tools</span>
                </a>

                <nav class="site-nav" id="site-nav" aria-label="Main navigation">
                    <a href="/Nisulka-Tools/" class="nav-link">Home</a>
                    <a href="/Nisulka-Tools/#tools" class="nav-link">All Tools</a>
                    <a href="/Nisulka-Tools/#categories" class="nav-link">Categories</a>
                    <a href="/Nisulka-Tools/#about" class="nav-link">About</a>
                </nav>

                <div class="header-actions">
                    <form class="header-search" id="header-search-form" role="search">
                        <button type="button" class="header-search-trigger" id="header-search-trigger" aria-label="Open search">
                            <span class="header-search-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="7"></circle>
                                    <path d="m20 20-4-4"></path>
                                </svg>
                            </span>
                        </button>
                        <input id="header-search-input" type="search" placeholder="Search..." aria-label="Search tools" autocomplete="off" spellcheck="false">
                    </form>

                    <button type="button" class="header-icon-button" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
                        <span id="theme-icon" aria-hidden="true">☾</span>
                    </button>

                    <button type="button" class="mobile-menu-button" id="mobile-menu-button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </header>
    `;

    function initializeHeader() {
        const mount = document.getElementById("site-header-mount");
        if (!mount) return;
        mount.innerHTML = headerHTML;
        initializeTheme();
        initializeMobileMenu();
        initializeActiveNavigation();
        initializeHeaderSearch();
    }

    function initializeHeaderSearch() {
        const form = document.getElementById("header-search-form");
        const input = document.getElementById("header-search-input");
        const trigger = document.getElementById("header-search-trigger");
        if (!form || !input || !trigger) return;

        const currentQuery = new URLSearchParams(window.location.search).get("q");
        if (currentQuery) input.value = currentQuery;

        function openMobileSearch() {
            form.classList.add("is-expanded");
            trigger.setAttribute("aria-label", "Close search");
            window.requestAnimationFrame(() => input.focus());
        }

        function closeMobileSearch() {
            if (window.innerWidth <= 767 && !input.value.trim()) {
                form.classList.remove("is-expanded");
                trigger.setAttribute("aria-label", "Open search");
            }
        }

        trigger.addEventListener("click", function (event) {
            event.preventDefault();
            if (window.innerWidth <= 767 && !form.classList.contains("is-expanded")) {
                openMobileSearch();
            } else {
                input.focus();
            }
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            navigateToSearch(input.value);
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                navigateToSearch(input.value);
            }
            if (event.key === "Escape") {
                input.value = "";
                input.blur();
                closeMobileSearch();
            }
        });

        input.addEventListener("focus", function () {
            form.classList.add("is-focused");
            if (window.innerWidth <= 767) form.classList.add("is-expanded");
        });

        input.addEventListener("blur", function () {
            form.classList.remove("is-focused");
            window.setTimeout(closeMobileSearch, 120);
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 767) {
                form.classList.remove("is-expanded");
            }
        });
    }

    function navigateToSearch(query) {
        const cleanQuery = String(query || "").trim();
        const url = cleanQuery ? `${SEARCH_PAGE}?q=${encodeURIComponent(cleanQuery)}` : SEARCH_PAGE;
        window.location.href = url;
    }

    function initializeTheme() {
        const themeToggle = document.getElementById("theme-toggle");
        const themeIcon = document.getElementById("theme-icon");
        if (!themeToggle || !themeIcon) return;
        const savedTheme = localStorage.getItem("nisulka-theme");
        const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(savedTheme || (systemDark ? "dark" : "light"));
        themeToggle.addEventListener("click", function () {
            const current = document.documentElement.getAttribute("data-theme");
            setTheme(current === "dark" ? "light" : "dark");
        });
        function setTheme(theme) {
            if (theme === "dark") {
                document.documentElement.setAttribute("data-theme", "dark");
                themeIcon.textContent = "☀";
                themeToggle.setAttribute("aria-label", "Switch to light mode");
            } else {
                document.documentElement.removeAttribute("data-theme");
                themeIcon.textContent = "☾";
                themeToggle.setAttribute("aria-label", "Switch to dark mode");
            }
            localStorage.setItem("nisulka-theme", theme);
        }
    }

    function initializeMobileMenu() {
        const button = document.getElementById("mobile-menu-button");
        const nav = document.getElementById("site-nav");
        if (!button || !nav) return;
        button.addEventListener("click", function () {
            const isOpen = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!isOpen));
            nav.classList.toggle("is-open", !isOpen);
            document.body.classList.toggle("menu-open", !isOpen);
        });
        nav.querySelectorAll("a").forEach(link => link.addEventListener("click", function () {
            button.setAttribute("aria-expanded", "false");
            nav.classList.remove("is-open");
            document.body.classList.remove("menu-open");
        }));
    }

    function initializeActiveNavigation() {
        const currentPath = window.location.pathname;
        document.querySelectorAll(".site-nav .nav-link").forEach(link => {
            const href = link.getAttribute("href");
            if (!href) return;
            const linkURL = new URL(href, window.location.origin);
            if (currentPath === linkURL.pathname) link.classList.add("active");
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeHeader);
    else initializeHeader();
})();
