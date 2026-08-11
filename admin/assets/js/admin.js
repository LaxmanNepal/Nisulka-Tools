"use strict";

/*
 * Nisulka Tools Admin Dashboard
 *
 * Data source:
 * ../data/tools.json
 */

const TOOLS_DATA_URL = "../data/tools.json";

let tools = [];

const elements = {
    totalTools: document.getElementById("total-tools"),
    activeTools: document.getElementById("active-tools"),
    featuredTools: document.getElementById("featured-tools"),
    averageSeo: document.getElementById("average-seo"),

    toolsTable: document.getElementById("tools-table"),
    toolSearch: document.getElementById("tool-search"),
    categoryFilter: document.getElementById("category-filter"),

    lastUpdated: document.getElementById("last-updated")
};


document.addEventListener(
    "DOMContentLoaded",
    initializeAdmin
);


async function initializeAdmin() {

    try {

        await loadTools();

        updateStatistics();

        populateCategoryFilter();

        renderTools();

        setupSearch();

        setupCategoryFilter();

        updateLastUpdated();

    } catch (error) {

        console.error(
            "Nisulka Admin initialization failed:",
            error
        );

        showLoadError();

    }

}


/* =========================================
   LOAD TOOLS
   ========================================= */

async function loadTools() {

    const response =
        await fetch(
            `${TOOLS_DATA_URL}?v=${Date.now()}`
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

    tools = data.filter(tool => {

        return (
            tool &&
            tool.status !== "hidden"
        );

    });

}


/* =========================================
   STATISTICS
   ========================================= */

function updateStatistics() {

    if (elements.totalTools) {

        elements.totalTools.textContent =
            tools.length;

    }


    const activeCount =
        tools.filter(
            tool =>
                !tool.status ||
                tool.status === "active"
        ).length;


    if (elements.activeTools) {

        elements.activeTools.textContent =
            activeCount;

    }


    const featuredCount =
        tools.filter(
            tool =>
                tool.featured === true
        ).length;


    if (elements.featuredTools) {

        elements.featuredTools.textContent =
            featuredCount;

    }


    /*
     * SEO scores will be supplied later
     * by data/seo-audit.json.
     *
     * Do not invent a score here.
     */

    if (elements.averageSeo) {

        elements.averageSeo.textContent =
            "Not audited";

    }

}


/* =========================================
   CATEGORY FILTER
   ========================================= */

function populateCategoryFilter() {

    if (!elements.categoryFilter) {
        return;
    }

    const categories = [
        ...new Set(
            tools
                .map(tool => tool.category)
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            a.localeCompare(b)
    );


    elements.categoryFilter.innerHTML = `
        <option value="all">
            All categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category;

        option.textContent =
            category;

        elements.categoryFilter.appendChild(
            option
        );

    });

}


/* =========================================
   SEARCH
   ========================================= */

function setupSearch() {

    if (!elements.toolSearch) {
        return;
    }

    elements.toolSearch.addEventListener(
        "input",
        renderTools
    );

}


function setupCategoryFilter() {

    if (!elements.categoryFilter) {
        return;
    }

    elements.categoryFilter.addEventListener(
        "change",
        renderTools
    );

}


/* =========================================
   FILTER
   ========================================= */

function getVisibleTools() {

    const query =
        elements.toolSearch
            ? elements.toolSearch.value
                .trim()
                .toLowerCase()
            : "";


    const category =
        elements.categoryFilter
            ? elements.categoryFilter.value
            : "all";


    return tools.filter(tool => {

        const searchableText = [

            tool.name,
            tool.description,
            tool.category,
            tool.slug,

            ...(Array.isArray(tool.keywords)
                ? tool.keywords
                : [])

        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            !query ||
            searchableText.includes(query);


        const matchesCategory =
            category === "all" ||
            tool.category === category;


        return (
            matchesSearch &&
            matchesCategory
        );

    });

}


/* =========================================
   RENDER TOOLS
   ========================================= */

function renderTools() {

    if (!elements.toolsTable) {
        return;
    }


    const visibleTools =
        getVisibleTools();


    if (visibleTools.length === 0) {

        elements.toolsTable.innerHTML = `

            <div class="admin-empty">

                <strong>
                    No tools found
                </strong>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    elements.toolsTable.innerHTML =
        visibleTools
            .map(createToolRow)
            .join("");

}


/* =========================================
   TOOL ROW
   ========================================= */

function createToolRow(tool) {

    const name =
        escapeHTML(
            tool.name ||
            "Unnamed Tool"
        );


    const description =
        escapeHTML(
            tool.description ||
            "No description"
        );


    const category =
        escapeHTML(
            tool.category ||
            "Other Tools"
        );


    const slug =
        escapeHTML(
            tool.slug ||
            ""
        );


    const url =
        escapeAttribute(
            tool.url ||
            "#"
        );


    const logo =
        tool.logo
            ? escapeAttribute(tool.logo)
            : "";


    const status =
        tool.status === "active" ||
        !tool.status
            ? "Active"
            : tool.status;


    const featured =
        tool.featured === true
            ? "Yes"
            : "No";


    const logoHTML = logo

        ? `
            <img
                src="${logo}"
                alt=""
                class="admin-tool-logo"
                loading="lazy"
                onerror="this.style.display='none'"
            >
        `

        : `
            <div class="admin-tool-logo-fallback">
                N
            </div>
        `;


    return `

        <article class="admin-tool-row">

            <div class="admin-tool-main">

                ${logoHTML}

                <div class="admin-tool-info">

                    <a
                        href="${url}"
                        target="_blank"
                        rel="noopener"
                        class="admin-tool-name"
                    >
                        ${name}
                    </a>

                    <p>
                        ${description}
                    </p>

                    <span class="admin-tool-slug">
                        ${slug}
                    </span>

                </div>

            </div>


            <div class="admin-tool-meta">

                <span>
                    ${category}
                </span>

                <span>
                    ${status}
                </span>

                <span>
                    Featured:
                    ${featured}
                </span>

            </div>


            <div class="admin-tool-seo">

                <strong>
                    —
                </strong>

                <span>
                    Not audited
                </span>

            </div>

        </article>

    `;

}


/* =========================================
   LAST UPDATED
   ========================================= */

function updateLastUpdated() {

    if (!elements.lastUpdated) {
        return;
    }

    const now =
        new Date();


    elements.lastUpdated.textContent =
        `Loaded ${now.toLocaleString()}`;

}


/* =========================================
   ERROR
   ========================================= */

function showLoadError() {

    if (elements.toolsTable) {

        elements.toolsTable.innerHTML = `

            <div class="admin-empty admin-error">

                <strong>
                    Unable to load tools
                </strong>

                <p>
                    Check that data/tools.json
                    exists and is valid.
                </p>

            </div>

        `;

    }

}


/* =========================================
   SECURITY HELPERS
   ========================================= */

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
