(function () {
    "use strict";

    const headerHTML = `
        <header class="site-header" id="site-header">
            <div class="container header-inner">

                <a
                    href="/Nisulka-Tools/"
                    class="site-logo"
                    aria-label="Nisulka Tools home"
                >
                    <span class="site-logo-mark" aria-hidden="true">
                        N
                    </span>

                    <span class="site-logo-text">
                        Nisulka Tools
                    </span>
                </a>

                <nav
                    class="site-nav"
                    id="site-nav"
                    aria-label="Main navigation"
                >
                    <a
                        href="/Nisulka-Tools/"
                        class="nav-link"
                    >
                        Home
                    </a>

                    <a
                        href="/Nisulka-Tools/#tools"
                        class="nav-link"
                    >
                        All Tools
                    </a>

                    <a
                        href="/Nisulka-Tools/#categories"
                        class="nav-link"
                    >
                        Categories
                    </a>

                    <a
                        href="/Nisulka-Tools/#about"
                        class="nav-link"
                    >
                        About
                    </a>
                </nav>

                <div class="header-actions">

                    <button
                        type="button"
                        class="header-icon-button"
                        id="theme-toggle"
                        aria-label="Toggle dark mode"
                        title="Toggle dark mode"
                    >
                        <span
                            id="theme-icon"
                            aria-hidden="true"
                        >
                            ☾
                        </span>
                    </button>

                    <button
                        type="button"
                        class="mobile-menu-button"
                        id="mobile-menu-button"
                        aria-label="Open menu"
                        aria-expanded="false"
                        aria-controls="site-nav"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                </div>

            </div>
        </header>
    `;

    function initializeHeader() {
        const mount = document.getElementById(
            "site-header-mount"
        );

        if (!mount) {
            console.warn(
                "Nisulka Tools: #site-header-mount not found."
            );

            return;
        }

        mount.innerHTML = headerHTML;

        initializeTheme();
        initializeMobileMenu();
        initializeActiveNavigation();
    }

    /* =========================
       Theme
       ========================= */

    function initializeTheme() {
        const themeToggle =
            document.getElementById("theme-toggle");

        const themeIcon =
            document.getElementById("theme-icon");

        if (!themeToggle || !themeIcon) {
            return;
        }

        const savedTheme =
            localStorage.getItem("nisulka-theme");

        const systemDark =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        const initialTheme =
            savedTheme ||
            (systemDark ? "dark" : "light");

        setTheme(initialTheme);

        themeToggle.addEventListener(
            "click",
            function () {
                const currentTheme =
                    document.documentElement
                        .getAttribute("data-theme");

                const nextTheme =
                    currentTheme === "dark"
                        ? "light"
                        : "dark";

                setTheme(nextTheme);
            }
        );

        function setTheme(theme) {
            if (theme === "dark") {
                document.documentElement
                    .setAttribute(
                        "data-theme",
                        "dark"
                    );

                themeIcon.textContent = "☀";
                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to light mode"
                );
            } else {
                document.documentElement
                    .removeAttribute("data-theme");

                themeIcon.textContent = "☾";
                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to dark mode"
                );
            }

            localStorage.setItem(
                "nisulka-theme",
                theme
            );
        }
    }

    /* =========================
       Mobile Menu
       ========================= */

    function initializeMobileMenu() {
        const button =
            document.getElementById(
                "mobile-menu-button"
            );

        const nav =
            document.getElementById("site-nav");

        if (!button || !nav) {
            return;
        }

        button.addEventListener(
            "click",
            function () {
                const isOpen =
                    button.getAttribute(
                        "aria-expanded"
                    ) === "true";

                button.setAttribute(
                    "aria-expanded",
                    String(!isOpen)
                );

                nav.classList.toggle(
                    "is-open",
                    !isOpen
                );

                document.body.classList.toggle(
                    "menu-open",
                    !isOpen
                );
            }
        );

        nav.querySelectorAll("a").forEach(
            function (link) {
                link.addEventListener(
                    "click",
                    function () {
                        button.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        nav.classList.remove(
                            "is-open"
                        );

                        document.body.classList.remove(
                            "menu-open"
                        );
                    }
                );
            }
        );
    }

    /* =========================
       Active Navigation
       ========================= */

    function initializeActiveNavigation() {
        const currentPath =
            window.location.pathname;

        const links =
            document.querySelectorAll(
                ".site-nav .nav-link"
            );

        links.forEach(function (link) {
            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }

            const linkURL =
                new URL(
                    href,
                    window.location.origin
                );

            if (
                currentPath ===
                linkURL.pathname
            ) {
                link.classList.add("active");
            }
        });
    }

    /* =========================
       Start
       ========================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeHeader
        );
    } else {
        initializeHeader();
    }
})();
