"use strict";

/*
 * ============================================================
 * NISULKA TOOLS — HOMEPAGE
 * ============================================================
 *
 * Loads tools from:
 *
 *     data/tools.json
 *
 * The JSON file is automatically generated
 * by GitHub Actions from the /tools/ directory.
 *
 * Tool card design:
 *
 *     LARGE LOGO
 *     TOOL NAME
 *     DESCRIPTION
 *
 * No category, arrow or unnecessary metadata
 * is displayed inside the tool card.
 * ============================================================
 */


/* ============================================================
   CONFIGURATION
   ============================================================ */

const TOOLS_DATA_URL = "data/tools.json";


/* ============================================================
   APPLICATION STATE
   ============================================================ */

let allTools = [];

let activeCategory = "All";

let searchQuery = "";


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const searchInput =
    document.getElementById("tool-search");


const categoryList =
    document.getElementById("category-list");


const featuredToolsContainer =
    document.getElementById("featured-tools");


const allToolsContainer =
    document.getElementById("all-tools");


const toolCount =
    document.getElementById("tool-count");


/* ============================================================
   INITIALIZE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeHomepage();

    }
);


async function initializeHomepage() {

    try {

        showLoadingState();

        await loadTools();

        setupSearch();

        renderCategories();

        renderFeaturedTools();

        renderAllTools();

        setupFAQ();

    } catch (error) {

        console.error(
            "Failed to initialize Nisulka Tools:",
            error
        );

        showErrorState();

    }

}


/* ============================================================
   LOAD TOOLS
   ============================================================ */

async function loadTools() {

    const response =
        await fetch(
            `${TOOLS_DATA_URL}?v=${Date.now()}`,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load tools.json (${response.status})`
        );

    }


    const data =
        await response.json();


    if (!Array.isArray(data)) {

        throw new Error(
            "tools.json must contain an array."
        );

    }


    allTools =
        data.filter(tool => {

            return (
                tool &&
                tool.status !== "hidden"
            );

        });

}


/* ============================================================
   SEARCH
   ============================================================ */

function setupSearch() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        handleSearch
    );


    searchInput.addEventListener(
        "search",
        handleSearch
    );


    /*
     * Support:
     *
     * ?q=text-to-handwriting
     */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const query =
        params.get("q");


    if (query) {

        searchInput.value = query;

        searchQuery =
            query
                .trim()
                .toLowerCase();


        /*
         * Automatically scroll to
         * tools when a search query
         * is provided in the URL.
         */

        setTimeout(() => {

            const toolsSection =
                document.getElementById("tools");


            if (toolsSection) {

                toolsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }, 300);

    }

}


function handleSearch(event) {

    searchQuery =
        event.target.value
            .trim()
            .toLowerCase();


    /*
     * Search overrides category.
     */

    activeCategory = "All";


    renderCategories();

    renderFeaturedTools();

    renderAllTools();

}


/* ============================================================
   FILTER TOOLS
   ============================================================ */

function getFilteredTools() {

    return allTools.filter(tool => {


        /*
         * Category filter
         */

        const matchesCategory =
            activeCategory === "All" ||
            tool.category === activeCategory;


        if (!matchesCategory) {

            return false;

        }


        /*
         * If there is no search,
         * category filtering is enough.
         */

        if (!searchQuery) {

            return true;

        }


        /*
         * Build searchable content.
         */

        const searchableText = [

            tool.name || "",

            tool.description || "",

            tool.category || "",

            Array.isArray(tool.keywords)
                ? tool.keywords.join(" ")
                : "",

            tool.slug || ""

        ]
            .join(" ")
            .toLowerCase();


        return searchableText.includes(
            searchQuery
        );

    });

}


/* ============================================================
   CATEGORIES
   ============================================================ */

function renderCategories() {

    if (!categoryList) {
        return;
    }


    const categories = [

        "All",

        ...new Set(

            allTools

                .map(tool => tool.category)

                .filter(Boolean)

        )

    ];


    categoryList.innerHTML = "";


    categories.forEach(category => {

        const button =
            document.createElement("button");


        button.type = "button";


        button.className =
            "category-button";


        if (
            category === activeCategory
        ) {

            button.classList.add(
                "is-active"
            );

        }


        button.textContent =
            category;


        button.setAttribute(
            "aria-pressed",
            category === activeCategory
                ? "true"
                : "false"
        );


        button.addEventListener(
            "click",
            () => {

                activeCategory =
                    category;


                /*
                 * Selecting a category
                 * clears the search.
                 */

                if (searchInput) {

                    searchInput.value = "";

                }


                searchQuery = "";


                renderCategories();

                renderFeaturedTools();

                renderAllTools();

            }
        );


        categoryList.appendChild(
            button
        );

    });

}


/* ============================================================
   FEATURED TOOLS
   ============================================================ */

function renderFeaturedTools() {

    if (!featuredToolsContainer) {
        return;
    }


    const filteredTools =
        getFilteredTools();


    const featuredTools =
        filteredTools.filter(
            tool => tool.featured === true
        );


    const section =
        document.getElementById(
            "popular"
        );


    /*
     * Hide featured section if
     * there are no matching featured tools.
     */

    if (
        featuredTools.length === 0
    ) {

        featuredToolsContainer.innerHTML =
            "";


        if (section) {

            section.hidden = true;

        }


        return;

    }


    if (section) {

        section.hidden = false;

    }


    featuredToolsContainer.innerHTML =
        featuredTools
            .slice(0, 6)
            .map(createToolCard)
            .join("");

}


/* ============================================================
   ALL TOOLS
   ============================================================ */

function renderAllTools() {

    if (!allToolsContainer) {
        return;
    }


    const filteredTools =
        getFilteredTools();


    allToolsContainer.innerHTML =
        "";


    if (
        filteredTools.length === 0
    ) {

        showNoResults();

        updateToolCount(0);

        return;

    }


    filteredTools.forEach(tool => {

        allToolsContainer.insertAdjacentHTML(
            "beforeend",
            createToolCard(tool)
        );

    });


    updateToolCount(
        filteredTools.length
    );

}


/* ============================================================
   TOOL CARD
   ============================================================
 *
 * Design:
 *
 *     ┌───────────────────────┐
 *     │                       │
 *     │       BIG LOGO        │
 *     │                       │
 *     │                       │
 *     │   Tool Name           │
 *     │   Description...      │
 *     │                       │
 *     └───────────────────────┘
 *
 * ============================================================
 */

function createToolCard(tool) {

    const name =
        escapeHTML(
            tool.name ||
            "Unnamed Tool"
        );


    const description =
        escapeHTML(
            tool.description ||
            "Useful online tool."
        );


    const icon =
        escapeHTML(
            tool.icon ||
            "🛠️"
        );


    const logo =
        tool.logo
            ? escapeAttribute(
                tool.logo
            )
            : "";


    const url =
        tool.url
            ? escapeAttribute(
                tool.url
            )
            : "#";


    /*
     * Logo
     *
     * Prefer logo.jpg.
     *
     * If logo is unavailable or
     * fails to load, use the icon.
     */

    const logoHTML = logo

        ? `

            <img
                class="tool-card-logo"
                src="${logo}"
                alt="${name}"
                loading="lazy"
                width="140"
                height="140"
                onerror="
                    this.hidden = true;
                    this.nextElementSibling.hidden = false;
                "
            >

            <span
                class="tool-card-icon"
                aria-hidden="true"
                hidden
            >
                ${icon}
            </span>

        `

        : `

            <span
                class="tool-card-icon"
                aria-hidden="true"
            >
                ${icon}
            </span>

        `;


    /*
     * Return complete card.
     */

    return `

        <article class="tool-card">

            <a
                class="tool-card-link"
                href="${url}"
                aria-label="Open ${name}"
            >

                <div
                    class="tool-card-icon-wrapper"
                >

                    ${logoHTML}

                </div>


                <div
                    class="tool-card-content"
                >

                    <h3
                        class="tool-card-title"
                    >
                        ${name}
                    </h3>


                    <p
                        class="tool-card-description"
                    >
                        ${description}
                    </p>

                </div>

            </a>

        </article>

    `;

}


/* ============================================================
   TOOL COUNT
   ============================================================ */

function updateToolCount(count) {

    if (!toolCount) {
        return;
    }


    toolCount.textContent =
        `${count} ${
            count === 1
                ? "tool"
                : "tools"
        }`;

}


/* ============================================================
   NO RESULTS
   ============================================================ */

function showNoResults() {

    if (!allToolsContainer) {
        return;
    }


    allToolsContainer.innerHTML = `

        <div class="tools-empty">

            <div
                class="tools-empty-icon"
                aria-hidden="true"
            >
                🔎
            </div>


            <h3>
                No tools found
            </h3>


            <p>
                Try a different search term
                or choose another category.
            </p>


            <button
                type="button"
                class="btn btn-primary"
                id="clear-search"
            >
                Clear search
            </button>

        </div>

    `;


    const clearButton =
        document.getElementById(
            "clear-search"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearSearch
        );

    }

}


/* ============================================================
   CLEAR SEARCH
   ============================================================ */

function clearSearch() {

    if (searchInput) {

        searchInput.value = "";

    }


    searchQuery = "";

    activeCategory = "All";


    renderCategories();

    renderFeaturedTools();

    renderAllTools();

}


/* ============================================================
   LOADING STATE
   ============================================================ */

function showLoadingState() {

    if (featuredToolsContainer) {

        featuredToolsContainer.innerHTML = `

            <div class="tools-loading">

                Loading tools...

            </div>

        `;

    }


    if (allToolsContainer) {

        allToolsContainer.innerHTML = `

            <div class="tools-loading">

                Loading tools...

            </div>

        `;

    }

}


/* ============================================================
   ERROR STATE
   ============================================================ */

function showErrorState() {

    if (featuredToolsContainer) {

        featuredToolsContainer.innerHTML =
            "";

    }


    if (allToolsContainer) {

        allToolsContainer.innerHTML = `

            <div class="tools-empty">

                <div
                    class="tools-empty-icon"
                    aria-hidden="true"
                >
                    ⚠️
                </div>


                <h3>
                    Tools couldn't be loaded
                </h3>


                <p>
                    Please refresh the page
                    and try again.
                </p>


                <button
                    type="button"
                    class="btn btn-primary"
                    id="retry-tools"
                >
                    Try again
                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retry-tools"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                () => {

                    window.location.reload();

                }
            );

        }

    }


    updateToolCount(0);

}


/* ============================================================
   FAQ
   ============================================================ */

function setupFAQ() {

    const questions =
        document.querySelectorAll(
            ".tool-faq-question"
        );


    questions.forEach(question => {

        question.addEventListener(
            "click",
            () => {

                const expanded =
                    question.getAttribute(
                        "aria-expanded"
                    ) === "true";


                question.setAttribute(
                    "aria-expanded",
                    expanded
                        ? "false"
                        : "true"
                );


                const answer =
                    question
                        .closest(
                            ".tool-faq-item"
                        )
                        ?.querySelector(
                            ".tool-faq-answer"
                        );


                if (answer) {

                    answer.hidden =
                        expanded;

                }

            }
        );

    });

}


/* ============================================================
   SECURITY HELPERS
   ============================================================ */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
