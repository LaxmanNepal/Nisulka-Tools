"use strict";

/*
 * =========================================================
 * NISULKA TOOLS HOMEPAGE
 * =========================================================
 *
 * Homepage data source:
 *
 * data/tools.json
 *
 * The homepage automatically discovers:
 *
 * - tools
 * - categories
 * - featured tools
 * - descriptions
 * - logos
 * - keywords
 * - URLs
 *
 * No "icon" property is required.
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
    document.getElementById("tool-search");

const categoryList =
    document.getElementById("category-list");

const featuredToolsContainer =
    document.getElementById("featured-tools");

const allToolsContainer =
    document.getElementById("all-tools");

const toolCount =
    document.getElementById("tool-count");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeHomepage
);


async function initializeHomepage() {

    showLoadingState();

    try {

        await loadTools();

        setupSearch();

        renderCategories();

        renderFeaturedTools();

        renderAllTools();

        setupFAQ();

    } catch (error) {

        console.error(
            "Nisulka Tools homepage error:",
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
   SEARCH
   ========================================================= */

function setupSearch() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        event => {

            searchQuery =
                event.target.value
                    .trim()
                    .toLowerCase();


            renderFeaturedTools();

            renderAllTools();

        }
    );


    searchInput.addEventListener(
        "search",
        event => {

            searchQuery =
                event.target.value
                    .trim()
                    .toLowerCase();


            renderFeaturedTools();

            renderAllTools();

        }
    );


    const params =
        new URLSearchParams(
            window.location.search
        );


    const query =
        params.get("q");


    if (query) {

        searchInput.value =
            query;

        searchQuery =
            query
                .trim()
                .toLowerCase();

    }

}


/* =========================================================
   KEYBOARD SEARCH SHORTCUT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "/" &&
            !isTypingTarget(event.target)
        ) {

            event.preventDefault();

            searchInput?.focus();

        }

        if (
            event.key === "Escape" &&
            document.activeElement === searchInput
        ) {

            searchInput.value = "";

            searchQuery = "";

            renderFeaturedTools();

            renderAllTools();

            searchInput.blur();

        }

    }
);


function isTypingTarget(element) {

    if (!element) {
        return false;
    }


    const tag =
        element.tagName?.toLowerCase();


    return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        element.isContentEditable
    );

}


/* =========================================================
   FILTER
   ========================================================= */

function getFilteredTools() {

    return allTools.filter(
        tool => {

            const categoryMatch =
                activeCategory === "All" ||
                tool.category === activeCategory;


            if (!categoryMatch) {
                return false;
            }


            if (!searchQuery) {
                return true;
            }


            const searchableText = [

                tool.name || "",

                tool.description || "",

                tool.category || "",

                ...(Array.isArray(tool.keywords)
                    ? tool.keywords
                    : [])

            ]
                .join(" ")
                .toLowerCase();


            return searchableText.includes(
                searchQuery
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


    const categories = [

        "All",

        ...new Set(

            allTools

                .map(
                    tool =>
                        tool.category?.trim()
                )

                .filter(Boolean)

        )

    ];


    categoryList.innerHTML = "";


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


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

                    renderCategories();

                    renderFeaturedTools();

                    renderAllTools();

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


    const filtered =
        getFilteredTools();


    const featured =
        filtered.filter(
            tool =>
                tool.featured === true
        );


    if (
        featured.length === 0
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
        featured
            .slice(0, 8)
            .map(createToolCard)
            .join("");

}


/* =========================================================
   ALL TOOLS
   ========================================================= */

function renderAllTools() {

    if (!allToolsContainer) {
        return;
    }


    const filtered =
        getFilteredTools();


    if (
        filtered.length === 0
    ) {

        showNoResults();

        updateToolCount(0);

        return;

    }


    allToolsContainer.innerHTML =
        filtered
            .map(createToolCard)
            .join("");


    updateToolCount(
        filtered.length
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
            tool.description ||
            "Useful online tool."
        );


    const url =
        safeURL(
            tool.url ||
            "#"
        );


    const logo =
        safeURL(
            tool.logo ||
            ""
        );


    const logoHTML =
        logo

            ? `
                <img
                    class="tool-card-logo"
                    src="${logo}"
                    alt="${name} logo"
                    loading="lazy"
                    width="82"
                    height="82"
                    onerror="this.style.display='none'; this.nextElementSibling.hidden=false;"
                >

                <span
                    class="tool-card-logo-fallback"
                    aria-hidden="true"
                    hidden
                >
                    ◇
                </span>
            `

            : `
                <span
                    class="tool-card-logo-fallback"
                    aria-hidden="true"
                >
                    ◇
                </span>
            `;


    return `

        <article class="tool-card">

            <a
                class="tool-card-link"
                href="${url}"
                aria-label="Open ${name}"
            >

                <div class="tool-card-icon-wrapper">

                    ${logoHTML}

                </div>


                <h3 class="tool-card-title">
                    ${name}
                </h3>


                <p class="tool-card-description">
                    ${description}
                </p>

            </a>

        </article>

    `;

}


/* =========================================================
   SAFE URL
   ========================================================= */

function safeURL(value) {

    const stringValue =
        String(value || "")
            .trim();


    if (!stringValue) {
        return "#";
    }


    /*
     * Allow relative URLs used by Nisulka.
     */

    if (
        stringValue.startsWith("/") ||
        stringValue.startsWith("./") ||
        stringValue.startsWith("../")
    ) {

        return escapeAttribute(
            stringValue
        );

    }


    try {

        const url =
            new URL(
                stringValue,
                window.location.origin
            );


        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {

            return escapeAttribute(
                url.href
            );

        }

    } catch {
        return "#";
    }


    return "#";

}


/* =========================================================
   TOOL COUNT
   ========================================================= */

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


/* =========================================================
   NO RESULTS
   ========================================================= */

function showNoResults() {

    if (!allToolsContainer) {
        return;
    }


    allToolsContainer.innerHTML = `

        <div class="tools-empty">

            <h3>
                No tools found
            </h3>

            <p>
                Try another search or browse a different category.
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

        searchInput.value = "";

    }


    searchQuery = "";

    activeCategory = "All";

    renderCategories();

    renderFeaturedTools();

    renderAllTools();

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoadingState() {

    const skeletons =
        Array.from(
            { length: 4 },
            () =>
                `<div class="tool-skeleton"></div>`
        )
        .join("");


    if (featuredToolsContainer) {

        featuredToolsContainer.innerHTML =
            skeletons;

    }


    if (allToolsContainer) {

        allToolsContainer.innerHTML =
            skeletons;

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showErrorState() {

    if (featuredToolsContainer) {

        featuredToolsContainer.innerHTML =
            "";

    }


    if (allToolsContainer) {

        allToolsContainer.innerHTML = `

            <div class="tools-empty">

                <h3>
                    Tools couldn't be loaded
                </h3>

                <p>
                    Something went wrong while loading the tool collection.
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="location.reload()"
                >
                    Try again
                </button>

            </div>

        `;

    }

}


/* =========================================================
   FAQ
   ========================================================= */

function setupFAQ() {

    const questions =
        document.querySelectorAll(
            ".tool-faq-question"
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

        }
    );

}


/* =========================================================
   SECURITY HELPERS
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

    return escapeHTML(value);

}
