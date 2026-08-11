/* =========================================================
   NISULKA TOOLS — HOMEPAGE LOGIC
   ========================================================= */

(function () {
    "use strict";

    let siteData = null;

    let allTools = [];

    let activeCategory = "all";

    let searchTerm = "";

    const components =
        window.NisulkaComponents;


    /* =========================
       DOM
       ========================= */

    const elements = {};

    function cacheElements() {

        elements.search =
            document.getElementById(
                "tool-search"
            );

        elements.categories =
            document.getElementById(
                "category-list"
            );

        elements.featured =
            document.getElementById(
                "featured-tools"
            );

        elements.allTools =
            document.getElementById(
                "all-tools"
            );

        elements.toolCount =
            document.getElementById(
                "tool-count"
            );
    }


    /* =========================
       Load Data
       ========================= */

    async function loadTools() {

        showLoading();

        try {

            const response =
                await fetch(
                    "data/tools.json",
                    {
                        cache: "no-cache"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to load tools.json"
                );
            }

            siteData =
                await response.json();

            allTools =
                Array.isArray(siteData.tools)
                    ? siteData.tools
                    : [];

            renderCategories();

            renderFeaturedTools();

            renderTools();

        } catch (error) {

            console.error(
                "Nisulka Tools:",
                error
            );

            showLoadError();
        }
    }


    /* =========================
       Category Map
       ========================= */

    function getCategoryMap() {

        const map = {};

        const categories =
            Array.isArray(siteData?.categories)
                ? siteData.categories
                : [];

        categories.forEach(
            function (category) {
                map[category.id] =
                    category;
            }
        );

        return map;
    }


    /* =========================
       Render Categories
       ========================= */

    function renderCategories() {

        if (!elements.categories) {
            return;
        }

        const categories =
            Array.isArray(siteData?.categories)
                ? siteData.categories
                : [];

        let html = `
            <button
                type="button"
                class="category-button active"
                data-category="all"
            >
                All Tools
            </button>
        `;

        categories.forEach(
            function (category) {

                html +=
                    components.createCategoryButton(
                        category,
                        false
                    );
            }
        );

        elements.categories.innerHTML =
            html;

        bindCategoryButtons();
    }


    /* =========================
       Category Buttons
       ========================= */

    function bindCategoryButtons() {

        const buttons =
            elements.categories.querySelectorAll(
                ".category-button"
            );

        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        activeCategory =
                            button.dataset.category;

                        buttons.forEach(
                            function (item) {
                                item.classList.remove(
                                    "active"
                                );
                            }
                        );

                        button.classList.add(
                            "active"
                        );

                        renderTools();

                        document
                            .getElementById("tools")
                            ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });
                    }
                );
            }
        );
    }


    /* =========================
       Featured Tools
       ========================= */

    function renderFeaturedTools() {

        if (!elements.featured) {
            return;
        }

        const categoryMap =
            getCategoryMap();

        const featured =
            allTools.filter(
                function (tool) {
                    return tool.featured === true;
                }
            );

        if (!featured.length) {

            elements.featured.innerHTML =
                components.createEmptyState(
                    "No featured tools yet",
                    "New tools will appear here soon."
                );

            return;
        }

        elements.featured.innerHTML =
            featured
                .map(
                    function (tool) {
                        return components.createToolCard(
                            tool,
                            categoryMap
                        );
                    }
                )
                .join("");
    }


    /* =========================
       Filter Tools
       ========================= */

    function getFilteredTools() {

        const normalizedSearch =
            searchTerm
                .trim()
                .toLowerCase();

        return allTools.filter(
            function (tool) {

                const categoryMatches =
                    activeCategory === "all" ||
                    tool.category ===
                        activeCategory;

                if (!categoryMatches) {
                    return false;
                }

                if (!normalizedSearch) {
                    return true;
                }

                const searchableText = [
                    tool.name,
                    tool.shortDescription,
                    tool.category,
                    ...(Array.isArray(tool.keywords)
                        ? tool.keywords
                        : [])
                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(
                    normalizedSearch
                );
            }
        );
    }


    /* =========================
       Render All Tools
       ========================= */

    function renderTools() {

        if (!elements.allTools) {
            return;
        }

        const filtered =
            getFilteredTools();

        const categoryMap =
            getCategoryMap();

        if (elements.toolCount) {

            elements.toolCount.innerHTML =
                components.createToolCount(
                    filtered.length
                );
        }

        if (!filtered.length) {

            elements.allTools.innerHTML =
                components.createEmptyState(
                    "No tools found",
                    "Try another search term or choose a different category."
                );

            return;
        }

        elements.allTools.innerHTML =
            filtered
                .map(
                    function (tool) {
                        return components.createToolCard(
                            tool,
                            categoryMap
                        );
                    }
                )
                .join("");
    }


    /* =========================
       Search
       ========================= */

    function initializeSearch() {

        if (!elements.search) {
            return;
        }

        elements.search.addEventListener(
            "input",
            function () {

                searchTerm =
                    elements.search.value;

                activeCategory = "all";

                updateActiveCategory();

                renderTools();
            }
        );
    }


    /* =========================
       Active Category UI
       ========================= */

    function updateActiveCategory() {

        if (!elements.categories) {
            return;
        }

        const buttons =
            elements.categories.querySelectorAll(
                ".category-button"
            );

        buttons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                        activeCategory
                );
            }
        );
    }


    /* =========================
       FAQ
       ========================= */

    function initializeFAQ() {

        const questions =
            document.querySelectorAll(
                ".tool-faq-question"
            );

        questions.forEach(
            function (question) {

                question.addEventListener(
                    "click",
                    function () {

                        const expanded =
                            question.getAttribute(
                                "aria-expanded"
                            ) === "true";

                        const answer =
                            question
                                .closest(
                                    ".tool-faq-item"
                                )
                                ?.querySelector(
                                    ".tool-faq-answer"
                                );

                        question.setAttribute(
                            "aria-expanded",
                            String(!expanded)
                        );

                        if (answer) {
                            answer.hidden =
                                expanded;
                        }

                        const icon =
                            question.querySelector(
                                "span"
                            );

                        if (icon) {
                            icon.textContent =
                                expanded
                                    ? "+"
                                    : "−";
                        }
                    }
                );
            }
        );
    }


    /* =========================
       Loading
       ========================= */

    function showLoading() {

        if (elements.featured) {

            elements.featured.innerHTML =
                components.createLoadingCards(
                    3
                );
        }

        if (elements.allTools) {

            elements.allTools.innerHTML =
                components.createLoadingCards(
                    6
                );
        }
    }


    /* =========================
       Load Error
       ========================= */

    function showLoadError() {

        const errorHTML =
            components.createEmptyState(
                "Unable to load tools",
                "Please refresh the page and try again."
            );

        if (elements.featured) {
            elements.featured.innerHTML =
                errorHTML;
        }

        if (elements.allTools) {
            elements.allTools.innerHTML =
                errorHTML;
        }
    }


    /* =========================
       Initialize
       ========================= */

    function initialize() {

        cacheElements();

        initializeSearch();

        initializeFAQ();

        loadTools();
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }

})();
