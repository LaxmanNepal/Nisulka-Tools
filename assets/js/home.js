"use strict";

/*
 * =========================================================
 * NISULKA TOOLS HOMEPAGE
 * =========================================================
 *
 * Data source:
 *
 *     data/tools.json
 *
 * Generated automatically by GitHub Actions.
 *
 * Tool logos:
 *
 *     /Nisulka-Tools/tools/{slug}/logo.jpg
 *
 * The "icon" property is NOT required.
 *
 * =========================================================
 */


const TOOLS_DATA_URL = "data/tools.json";


let allTools = [];

let activeCategory = "All";

let searchQuery = "";


/* =========================================================
   DOM
   ========================================================= */

const searchInput =
    document.getElementById(
        "tool-search"
    );


const categoryList =
    document.getElementById(
        "category-list"
    );


const featuredToolsContainer =
    document.getElementById(
        "featured-tools"
    );


const allToolsContainer =
    document.getElementById(
        "all-tools"
    );


const toolCount =
    document.getElementById(
        "tool-count"
    );


const searchStatus =
    document.getElementById(
        "hero-search-status"
    );


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeHomepage
);


async function initializeHomepage() {

    try {

        showLoadingState();

        await loadTools();

        readURLSearch();

        setupSearch();

        renderCategories();

        renderFeaturedTools();

        renderAllTools();

        setupFAQ();

        setupKeyboardSearch();

    } catch (error) {

        console.error(
            "Nisulka Tools initialization failed:",
            error
        );

        showErrorState();

    }

}


/* =========================================================
   LOAD TOOLS
   ========================================================= */

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
            `Unable to load tools.json: ${response.status}`
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
        data.filter(
            tool =>
                tool &&
                tool.status !== "hidden"
        );

}


/* =========================================================
   URL SEARCH
   ========================================================= */

function readURLSearch() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const query =
        params.get("q");


    if (!query) {

        return;

    }


    searchQuery =
        query
            .trim()
            .toLowerCase();


    if (searchInput) {

        searchInput.value =
            query;

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

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


    if (searchQuery) {

        updateSearchURL();

    }

}


function handleSearch(event) {

    searchQuery =
        event.target.value
            .trim()
            .toLowerCase();


    activeCategory =
        "All";


    updateSearchURL();

    renderCategories();

    renderFeaturedTools();

    renderAllTools();

    updateSearchStatus();

}


function updateSearchURL() {

    const url =
        new URL(
            window.location.href
        );


    if (searchQuery) {

        url.searchParams.set(
            "q",
            searchQuery
        );

    } else {

        url.searchParams.delete(
            "q"
        );

    }


    window.history.replaceState(
        {},
        "",
        url
    );

}


/* =========================================================
   KEYBOARD SEARCH
   ========================================================= */

function setupKeyboardSearch() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "/" &&
                document.activeElement !== searchInput &&
                !isTypingElement(
                    document.activeElement
                )
            ) {

                event.preventDefault();

                searchInput?.focus();

            }

        }
    );

}


function isTypingElement(element) {

    if (!element) {

        return false;

    }


    const tag =
        element.tagName?.toLowerCase();


    return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select"
    );

}


/* =========================================================
   FILTERING
   ========================================================= */

function getFilteredTools() {

    return allTools.filter(
        tool => {

            const matchesCategory =
                activeCategory === "All" ||
                tool.category === activeCategory;


            if (!searchQuery) {

                return matchesCategory;

            }


            const keywords =
                Array.isArray(
                    tool.keywords
                )
                    ? tool.keywords
                    : [];


            const searchableText = [

                tool.name,

                tool.description,

                tool.category,

                tool.slug,

                ...keywords

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            return (
                matchesCategory &&
                searchableText.includes(
                    searchQuery
                )
            );

        }
    );

}


/* =========================================================
   CATEGORIES
   ========================================================= */

function renderCategories() {

    if (!categoryList) {

        return;

    }


    const categorySet =
        new Set();


    allTools.forEach(
        tool => {

            if (tool.category) {

                categorySet.add(
                    tool.category
                );

            }

        }
    );


    const categories = [

        "All",

        ...Array.from(
            categorySet
        ).sort(
            (a, b) =>
                a.localeCompare(b)
        )

    ];


    categoryList.innerHTML = "";


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "category-button";


            button.textContent =
                category;


            const active =
                category ===
                activeCategory;


            if (active) {

                button.classList.add(
                    "is-active"
                );

            }


            button.setAttribute(
                "aria-pressed",
                active
                    ? "true"
                    : "false"
            );


            button.addEventListener(
                "click",
                () => {

                    activeCategory =
                        category;


                    renderCategories();

                    renderFeaturedTools();

                    renderAllTools();

                    updateSearchStatus();

                }
            );


            categoryList.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   FEATURED
   ========================================================= */

function renderFeaturedTools() {

    if (!featuredToolsContainer) {

        return;

    }


    const section =
        document.getElementById(
            "popular"
        );


    const filteredTools =
        getFilteredTools();


    const featuredTools =
        filteredTools.filter(
            tool =>
                tool.featured === true
        );


    if (
        featuredTools.length === 0
    ) {

        featuredToolsContainer.innerHTML =
            "";


        if (section) {

            section.hidden =
                true;

        }


        return;

    }


    if (section) {

        section.hidden =
            false;

    }


    featuredToolsContainer.innerHTML =
        featuredTools
            .slice(0, 8)
            .map(
                createToolCard
            )
            .join("");

}


/* =========================================================
   ALL TOOLS
   ========================================================= */

function renderAllTools() {

    if (!allToolsContainer) {

        return;

    }


    const filteredTools =
        getFilteredTools();


    if (
        filteredTools.length === 0
    ) {

        showNoResults();

        updateToolCount(0);

        return;

    }


    allToolsContainer.innerHTML =
        filteredTools
            .map(
                createToolCard
            )
            .join("");


    updateToolCount(
        filteredTools.length
    );

}


/* =========================================================
   TOOL CARD
   ========================================================= */

function createToolCard(tool) {

    const name =
        escapeHTML(
            tool.name ||
            "Unnamed Tool"
        );


    const description =
        escapeHTML(
            createShortDescription(
                tool.description
            )
        );


    const slug =
        escapeAttribute(
            tool.slug ||
            ""
        );


    const url =
        escapeAttribute(
            tool.url ||
            `tools/${slug}/`
        );


    const logo =
        tool.logo
            ? escapeAttribute(
                tool.logo
            )
            : "";


    const fallbackLetter =
        escapeHTML(
            (
                tool.name ||
                "T"
            )
                .trim()
                .charAt(0)
                .toUpperCase()
        );


    const logoHTML =
        logo

            ? `

                <img
                    class="home-tool-logo"
                    src="${logo}"
                    alt="${name} logo"
                    loading="lazy"
                    width="240"
                    height="210"
                    onerror="handleToolLogoError(this)"
                >

                <div
                    class="home-tool-logo-fallback"
                    aria-hidden="true"
                    hidden
                >
                    ${fallbackLetter}
                </div>

            `

            : `

                <div
                    class="home-tool-logo-fallback"
                    aria-hidden="true"
                >
                    ${fallbackLetter}
                </div>

            `;


    return `

        <article
            class="home-tool-card"
        >

            <a
                class="home-tool-card-link"
                href="${url}"
                aria-label="Open ${name}"
            >


                <div
                    class="home-tool-logo-area"
                >

                    ${logoHTML}

                </div>


                <div
                    class="home-tool-content"
                >

                    <h3
                        class="home-tool-name"
                        title="${name}"
                    >
                        ${name}
                    </h3>


                    <p
                        class="home-tool-description"
                    >
                        ${description}
                    </p>

                </div>


            </a>

        </article>

    `;

}


/* =========================================================
   LOGO ERROR
   ========================================================= */

window.handleToolLogoError =
    function(image) {

        if (!image) {

            return;

        }


        image.hidden =
            true;


        const fallback =
            image.parentElement
                ?.querySelector(
                    ".home-tool-logo-fallback"
                );


        if (fallback) {

            fallback.hidden =
                false;

        }

    };


/* =========================================================
   DESCRIPTION
   ========================================================= */

function createShortDescription(
    description
) {

    if (!description) {

        return "Useful online tool.";

    }


    const clean =
        String(description)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        clean.length <= 105
    ) {

        return clean;

    }


    return (
        clean
            .substring(
                0,
                102
            )
            .trimEnd() +
        "..."
    );

}


/* =========================================================
   TOOL COUNT
   ========================================================= */

function updateToolCount(
    count
) {

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


/* =========================================================
   SEARCH STATUS
   ========================================================= */

function updateSearchStatus() {

    if (!searchStatus) {

        return;

    }


    if (!searchQuery) {

        searchStatus.textContent =
            "";

        return;

    }


    const count =
        getFilteredTools()
            .length;


    searchStatus.textContent =
        `${count} ${
            count === 1
                ? "tool"
                : "tools"
        } found for "${searchQuery}"`;

}


/* =========================================================
   NO RESULTS
   ========================================================= */

function showNoResults() {

    if (!allToolsContainer) {

        return;

    }


    allToolsContainer.innerHTML = `

        <div
            class="home-tools-empty"
        >

            <div
                class="home-tools-empty-icon"
                aria-hidden="true"
            >
                🔎
            </div>


            <h3>
                No tools found
            </h3>


            <p>
                Try another search term
                or choose a different category.
            </p>


            <br>


            <button
                type="button"
                class="btn btn-primary"
                id="clear-search"
            >
                Clear search
            </button>

        </div>

    `;


    document
        .getElementById(
            "clear-search"
        )
        ?.addEventListener(
            "click",
            clearSearch
        );

}


/* =========================================================
   CLEAR SEARCH
   ========================================================= */

function clearSearch() {

    if (searchInput) {

        searchInput.value =
            "";

    }


    searchQuery =
        "";


    activeCategory =
        "All";


    updateSearchURL();

    renderCategories();

    renderFeaturedTools();

    renderAllTools();

    updateSearchStatus();

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoadingState() {

    const loading = `

        <div
            class="home-tools-loading"
        >
            Loading tools...
        </div>

    `;


    if (featuredToolsContainer) {

        featuredToolsContainer.innerHTML =
            loading;

    }


    if (allToolsContainer) {

        allToolsContainer.innerHTML =
            loading;

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showErrorState() {

    const popular =
        document.getElementById(
            "popular"
        );


    if (popular) {

        popular.hidden =
            true;

    }


    if (!allToolsContainer) {

        return;

    }


    allToolsContainer.innerHTML = `

        <div
            class="home-tools-empty"
        >

            <div
                class="home-tools-empty-icon"
                aria-hidden="true"
            >
                ⚠️
            </div>


            <h3>
                Tools couldn't be loaded
            </h3>


            <p>
                The tools data could not be loaded.
                Please refresh the page and try again.
            </p>


            <br>


            <button
                type="button"
                class="btn btn-primary"
                id="retry-tools"
            >
                Try again
            </button>

        </div>

    `;


    document
        .getElementById(
            "retry-tools"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );

}


/* =========================================================
   FAQ
   ========================================================= */

function setupFAQ() {

    const questions =
        document.querySelectorAll(
            ".home-faq-question"
        );


    questions.forEach(
        question => {

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
                                ".home-faq-item"
                            )
                            ?.querySelector(
                                ".home-faq-answer"
                            );


                    if (answer) {

                        answer.hidden =
                            expanded;

                    }

                }
            );

        }
    );

}


/* =========================================================
   SECURITY
   ========================================================= */

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

    return escapeHTML(
        value
    );

}
