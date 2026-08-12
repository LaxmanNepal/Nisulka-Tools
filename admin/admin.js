"use strict";

/*
 * =========================================================
 * NISULKA TOOLS ADMIN DASHBOARD
 * =========================================================
 *
 * Reads:
 *
 * ../data/seo-audit.json
 *
 * No authentication for now.
 *
 * =========================================================
 */


const SEO_DATA_URL =
    "../data/seo-audit.json";


let auditData = null;

let tools = [];

let selectedTool = null;


/* =========================================================
   DOM
   ========================================================= */

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const errorMessage =
    document.getElementById("error-message");

const dashboard =
    document.getElementById("dashboard");

const retryButton =
    document.getElementById("retry-button");

const lastAudit =
    document.getElementById("last-audit");

const overallScore =
    document.getElementById("overall-score");

const overallGrade =
    document.getElementById("overall-grade");

const overallScoreBar =
    document.getElementById(
        "overall-score-bar"
    );

const overallMessage =
    document.getElementById(
        "overall-message"
    );

const totalTools =
    document.getElementById("total-tools");

const excellentTools =
    document.getElementById(
        "excellent-tools"
    );

const warningTools =
    document.getElementById(
        "warning-tools"
    );

const searchInput =
    document.getElementById("tool-search");

const gradeFilter =
    document.getElementById("grade-filter");

const sortTools =
    document.getElementById("sort-tools");

const toolsTable =
    document.getElementById("tools-table");

const visibleCount =
    document.getElementById(
        "visible-count"
    );

const emptyResults =
    document.getElementById(
        "empty-results"
    );

const detailPanel =
    document.getElementById(
        "tool-detail"
    );

const detailName =
    document.getElementById(
        "detail-name"
    );

const detailDescription =
    document.getElementById(
        "detail-description"
    );

const detailScore =
    document.getElementById(
        "detail-score"
    );

const detailGrade =
    document.getElementById(
        "detail-grade"
    );

const detailIssues =
    document.getElementById(
        "detail-issues"
    );

const detailChecks =
    document.getElementById(
        "detail-checks"
    );

const closeDetail =
    document.getElementById(
        "close-detail"
    );


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    setupEvents();

    await loadAuditData();

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    searchInput?.addEventListener(
        "input",
        renderTools
    );


    gradeFilter?.addEventListener(
        "change",
        renderTools
    );


    sortTools?.addEventListener(
        "change",
        renderTools
    );


    retryButton?.addEventListener(
        "click",
        loadAuditData
    );


    closeDetail?.addEventListener(
        "click",
        closeToolDetail
    );

}


/* =========================================================
   LOAD DATA
   ========================================================= */

async function loadAuditData() {

    showLoading();


    try {

        const response =
            await fetch(
                `${SEO_DATA_URL}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        auditData =
            await response.json();


        if (
            !auditData ||
            typeof auditData !== "object"
        ) {

            throw new Error(
                "Invalid SEO audit data."
            );

        }


        tools =
            Array.isArray(
                auditData.tools
            )
                ? auditData.tools
                : [];


        normalizeTools();


        renderOverview();

        renderTools();

        renderLastAudit();


        showDashboard();

    } catch (error) {

        console.error(
            "Failed to load SEO audit:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   NORMALIZE DATA
   ========================================================= */

function normalizeTools() {

    tools =
        tools.map(
            (tool, index) => {

                const score =
                    Number(
                        tool.score
                    );


                return {

                    ...tool,

                    _index:
                        index,

                    _score:
                        Number.isFinite(score)
                            ? score
                            : 0,

                    _grade:
                        tool.grade ||
                        calculateGrade(score),

                    _issues:
                        getIssueCount(tool)

                };

            }
        );

}


/* =========================================================
   OVERVIEW
   ========================================================= */

function renderOverview() {

    const average =
        Number(
            auditData.averageScore
        );


    const calculatedAverage =
        tools.length
            ? tools.reduce(
                (
                    total,
                    tool
                ) => total + tool._score,
                0
            ) / tools.length
            : 0;


    const score =
        Number.isFinite(average)
            ? average
            : calculatedAverage;


    const roundedScore =
        Math.round(score);


    const grade =
        calculateGrade(
            roundedScore
        );


    overallScore.textContent =
        roundedScore;


    overallGrade.textContent =
        grade;


    applyGradeClass(
        overallGrade,
        grade
    );


    overallScoreBar.style.width =
        `${Math.max(
            0,
            Math.min(
                100,
                roundedScore
            )
        )}%`;


    overallMessage.textContent =
        getScoreMessage(
            roundedScore
        );


    totalTools.textContent =
        tools.length;


    excellentTools.textContent =
        tools.filter(
            tool => tool._score >= 90
        ).length;


    warningTools.textContent =
        tools.filter(
            tool => tool._score < 70
        ).length;

}


/* =========================================================
   LAST AUDIT
   ========================================================= */

function renderLastAudit() {

    const date =
        auditData.generatedAt ||
        auditData.timestamp ||
        auditData.updatedAt ||
        auditData.lastAudit;


    if (!date) {

        lastAudit.textContent =
            "Available";

        return;

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        lastAudit.textContent =
            String(date);

        return;

    }


    lastAudit.textContent =
        parsed.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

}


/* =========================================================
   RENDER TOOLS
   ========================================================= */

function renderTools() {

    if (!toolsTable) {
        return;
    }


    let filtered =
        [...tools];


    const query =
        searchInput?.value
            ?.trim()
            .toLowerCase() || "";


    const grade =
        gradeFilter?.value || "all";


    const sort =
        sortTools?.value ||
        "score-desc";


    if (query) {

        filtered =
            filtered.filter(
                tool => {

                    const text =
                        [
                            tool.name,
                            tool.description,
                            tool.category,
                            tool.slug
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    return text.includes(
                        query
                    );

                }
            );

    }


    if (grade !== "all") {

        filtered =
            filtered.filter(
                tool =>
                    tool._grade === grade
            );

    }


    if (sort === "score-desc") {

        filtered.sort(
            (a, b) =>
                b._score - a._score
        );

    }


    if (sort === "score-asc") {

        filtered.sort(
            (a, b) =>
                a._score - b._score
        );

    }


    if (sort === "name") {

        filtered.sort(
            (a, b) =>
                String(a.name)
                    .localeCompare(
                        String(b.name)
                    )
        );

    }


    if (sort === "issues") {

        filtered.sort(
            (a, b) =>
                b._issues - a._issues
        );

    }


    toolsTable.innerHTML = "";


    visibleCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "tool"
                : "tools"
        }`;


    if (!filtered.length) {

        emptyResults.hidden =
            false;

        return;

    }


    emptyResults.hidden =
        true;


    filtered.forEach(
        (tool, index) => {

            toolsTable.insertAdjacentHTML(
                "beforeend",
                createToolRow(
                    tool,
                    index
                )
            );

        }
    );


    toolsTable
        .querySelectorAll(
            "[data-tool-index]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset
                                    .toolIndex
                            );


                        const tool =
                            filtered[index];


                        openToolDetail(
                            tool
                        );

                    }
                );

            }
        );

}


/* =========================================================
   TABLE ROW
   ========================================================= */

function createToolRow(
    tool,
    index
) {

    const name =
        escapeHTML(
            tool.name ||
            "Unnamed Tool"
        );


    const category =
        escapeHTML(
            tool.category ||
            "Other Tools"
        );


    const score =
        Math.round(
            tool._score
        );


    const grade =
        escapeHTML(
            tool._grade
        );


    const issues =
        tool._issues;


    const logo =
        tool.logo
            ? escapeAttribute(
                tool.logo
            )
            : "";


    const logoHTML = logo

        ? `
            <img
                class="tool-logo"
                src="${logo}"
                alt=""
                loading="lazy"
                onerror="this.style.display='none'"
            >
        `

        : `
            <div
                class="tool-logo"
                aria-hidden="true"
            >
                🧰
            </div>
        `;


    return `

        <tr>

            <td>
                ${index + 1}
            </td>


            <td>

                <div class="tool-name-cell">

                    ${logoHTML}

                    <div>

                        <div class="tool-name">
                            ${name}
                        </div>

                        <div class="tool-category">
                            ${escapeHTML(
                                tool.slug || ""
                            )}
                        </div>

                    </div>

                </div>

            </td>


            <td>
                ${category}
            </td>


            <td>

                <span class="score-value">
                    ${score}/100
                </span>

            </td>


            <td>

                <span
                    class="
                        grade-badge
                        ${getGradeClass(grade)}
                    "
                >
                    ${grade}
                </span>

            </td>


            <td>

                <span
                    class="
                        issue-count
                        ${issues === 0
                            ? "zero"
                            : ""}
                    "
                >
                    ${issues}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="view-button"
                    data-tool-index="${index}"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   TOOL DETAIL
   ========================================================= */

function openToolDetail(tool) {

    selectedTool =
        tool;


    detailName.textContent =
        tool.name ||
        "Unnamed Tool";


    detailDescription.textContent =
        tool.description ||
        "No description available.";


    detailScore.textContent =
        `${Math.round(
            tool._score
        )}/100`;


    detailGrade.textContent =
        tool._grade;


    applyGradeClass(
        detailGrade,
        tool._grade
    );


    renderIssues(tool);

    renderChecks(tool);


    detailPanel.hidden =
        false;


    detailPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CLOSE DETAIL
   ========================================================= */

function closeToolDetail() {

    detailPanel.hidden =
        true;

    selectedTool =
        null;

}


/* =========================================================
   ISSUES
   ========================================================= */

function renderIssues(tool) {

    detailIssues.innerHTML =
        "";


    const issues =
        extractIssues(tool);


    if (!issues.length) {

        detailIssues.innerHTML = `

            <div class="check-item">
                ✓ No recorded issues
            </div>

        `;

        return;

    }


    issues.forEach(
        issue => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "issue-item";


            item.textContent =
                issue;


            detailIssues.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   CHECKS
   ========================================================= */

function renderChecks(tool) {

    detailChecks.innerHTML =
        "";


    const checks =
        extractChecks(tool);


    if (!checks.length) {

        detailChecks.innerHTML = `

            <div class="check-item">
                ✓ Audit completed successfully
            </div>

        `;

        return;

    }


    checks.forEach(
        check => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "check-item";


            item.textContent =
                `✓ ${check}`;


            detailChecks.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   EXTRACT ISSUES
   ========================================================= */

function extractIssues(tool) {

    const result = [];


    if (
        Array.isArray(
            tool.issues
        )
    ) {

        tool.issues.forEach(
            issue => {

                if (
                    typeof issue ===
                    "string"
                ) {

                    result.push(
                        issue
                    );

                } else if (
                    issue &&
                    typeof issue ===
                    "object"
                ) {

                    result.push(
                        issue.message ||
                        issue.description ||
                        issue.title ||
                        JSON.stringify(
                            issue
                        )
                    );

                }

            }
        );

    }


    if (
        Array.isArray(
            tool.warnings
        )
    ) {

        tool.warnings.forEach(
            warning => {

                if (
                    typeof warning ===
                    "string"
                ) {

                    result.push(
                        warning
                    );

                }

            }
        );

    }


    if (
        tool.issueSummary &&
        Array.isArray(
            tool.issueSummary.items
        )
    ) {

        tool.issueSummary.items.forEach(
            issue => {

                if (
                    typeof issue ===
                    "string"
                ) {

                    result.push(
                        issue
                    );

                } else if (
                    issue &&
                    typeof issue ===
                    "object"
                ) {

                    result.push(
                        issue.message ||
                        issue.description ||
                        issue.title ||
                        "SEO issue detected"
                    );

                }

            }
        );

    }


    return [
        ...new Set(
            result.filter(Boolean)
        )
    ];

}


/* =========================================================
   EXTRACT CHECKS
   ========================================================= */

function extractChecks(tool) {

    const result = [];


    if (
        Array.isArray(
            tool.checks
        )
    ) {

        tool.checks.forEach(
            check => {

                if (
                    typeof check ===
                    "string"
                ) {

                    result.push(
                        check
                    );

                } else if (
                    check &&
                    typeof check ===
                    "object"
                ) {

                    result.push(
                        check.message ||
                        check.description ||
                        check.title ||
                        "SEO check passed"
                    );

                }

            }
        );

    }


    if (
        tool.pass &&
        Array.isArray(
            tool.pass
        )
    ) {

        result.push(
            ...tool.pass
        );

    }


    return [
        ...new Set(
            result.filter(Boolean)
        )
    ];

}


/* =========================================================
   ISSUE COUNT
   ========================================================= */

function getIssueCount(tool) {

    if (
        tool.issueSummary &&
        typeof tool.issueSummary.total ===
        "number"
    ) {

        return tool.issueSummary.total;

    }


    return extractIssues(
        tool
    ).length;

}


/* =========================================================
   GRADE
   ========================================================= */

function calculateGrade(score) {

    score =
        Number(score) || 0;


    if (score >= 90) {
        return "A";
    }

    if (score >= 80) {
        return "B";
    }

    if (score >= 70) {
        return "C";
    }

    if (score >= 60) {
        return "D";
    }

    return "F";

}


function getGradeClass(grade) {

    return `grade-${String(
        grade
    ).toLowerCase()}`;

}


function applyGradeClass(
    element,
    grade
) {

    if (!element) {
        return;
    }


    element.classList.remove(
        "grade-a",
        "grade-b",
        "grade-c",
        "grade-d",
        "grade-f"
    );


    element.classList.add(
        getGradeClass(
            grade
        )
    );

}


/* =========================================================
   SCORE MESSAGE
   ========================================================= */

function getScoreMessage(score) {

    if (score >= 90) {

        return "Excellent SEO health. Keep maintaining this level.";

    }


    if (score >= 80) {

        return "Good SEO health. A few improvements could make it stronger.";

    }


    if (score >= 70) {

        return "Fair SEO health. Several improvements are recommended.";

    }


    if (score >= 60) {

        return "SEO needs attention. Review the reported issues.";

    }


    return "Critical SEO problems detected. Prioritize fixing the highest-impact issues.";

}


/* =========================================================
   STATES
   ========================================================= */

function showLoading() {

    loading.hidden =
        false;

    errorBox.hidden =
        true;

    dashboard.hidden =
        true;

}


function showDashboard() {

    loading.hidden =
        true;

    errorBox.hidden =
        true;

    dashboard.hidden =
        false;

}


function showError(message) {

    loading.hidden =
        true;

    dashboard.hidden =
        true;

    errorBox.hidden =
        false;


    errorMessage.textContent =
        message ||
        "Unable to load SEO audit data.";

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

    return escapeHTML(
        value
    );

}
