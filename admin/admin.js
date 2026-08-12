"use strict";


/*
 * =========================================
 * CONFIGURATION
 * =========================================
 */

const API_BASE =
    "https://admin-api.laxmannepal.com.np";


const REFRESH_INTERVAL =
    15000;


/*
 * =========================================
 * DOM
 * =========================================
 */

const runButton =
    document.getElementById(
        "run-audit"
    );


const auditStatus =
    document.getElementById(
        "audit-status"
    );


const lastAudit =
    document.getElementById(
        "last-audit"
    );


const averageScore =
    document.getElementById(
        "average-score"
    );


const totalTools =
    document.getElementById(
        "total-tools"
    );


const excellentTools =
    document.getElementById(
        "excellent-tools"
    );


const attentionTools =
    document.getElementById(
        "attention-tools"
    );


const healthProgress =
    document.getElementById(
        "health-progress"
    );


const healthLabel =
    document.getElementById(
        "health-label"
    );


const toolsTable =
    document.getElementById(
        "tools-table"
    );


const workflowRuns =
    document.getElementById(
        "workflow-runs"
    );


/*
 * =========================================
 * INITIALIZE
 * =========================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadEverything();

        setInterval(
            loadEverything,
            REFRESH_INTERVAL
        );

    }
);


/*
 * =========================================
 * LOAD EVERYTHING
 * =========================================
 */

async function loadEverything() {

    await Promise.allSettled([
        loadAudit(),
        loadStatus()
    ]);

}


/*
 * =========================================
 * LOAD AUDIT
 * =========================================
 */

async function loadAudit() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/audit?t=${Date.now()}`,
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        renderAudit(data);


    } catch (error) {

        console.error(
            "Audit loading error:",
            error
        );


        toolsTable.innerHTML = `

            <div class="error">

                ⚠️ SEO data unavailable

                <br>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/*
 * =========================================
 * RENDER AUDIT
 * =========================================
 */

function renderAudit(data) {

    const tools =
        Array.isArray(data.tools)
            ? data.tools
            : [];


    averageScore.textContent =
        `${data.averageScore ?? 0}/100`;


    totalTools.textContent =
        data.totalTools ??
        tools.length;


    const excellent =
        tools.filter(
            tool =>
                Number(tool.score) >= 90
        ).length;


    const attention =
        tools.filter(
            tool =>
                Number(tool.score) < 80
        ).length;


    excellentTools.textContent =
        excellent;


    attentionTools.textContent =
        attention;


    const score =
        Number(
            data.averageScore || 0
        );


    healthProgress.style.width =
        `${Math.min(score, 100)}%`;


    healthLabel.textContent =
        getHealthLabel(score);


    if (data.generatedAt) {

        lastAudit.textContent =
            formatDate(
                data.generatedAt
            );

    }


    renderToolsTable(
        tools
    );

}


/*
 * =========================================
 * TOOLS TABLE
 * =========================================
 */

function renderToolsTable(
    tools
) {

    if (!tools.length) {

        toolsTable.innerHTML = `
            <div class="loading">
                No SEO data available.
            </div>
        `;

        return;

    }


    const rows =
        tools.map(
            tool => {

                const score =
                    Number(
                        tool.score || 0
                    );


                const issues =
                    tool.issueSummary
                        ?.total || 0;


                return `

                    <tr>

                        <td>
                            #${tool.rank || "—"}
                        </td>

                        <td>

                            <div class="tool-name">

                                ${escapeHTML(
                                    tool.name
                                )}

                            </div>

                            <small>

                                ${escapeHTML(
                                    tool.slug || ""
                                )}

                            </small>

                        </td>

                        <td>

                            <span class="score">

                                ${score}/100

                            </span>

                        </td>

                        <td>

                            <span class="badge ${getBadgeClass(score)}">

                                ${escapeHTML(
                                    tool.grade || "—"
                                )}

                            </span>

                        </td>

                        <td>

                            ${issues}

                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    toolsTable.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>
                        Rank
                    </th>

                    <th>
                        Tool
                    </th>

                    <th>
                        Score
                    </th>

                    <th>
                        Grade
                    </th>

                    <th>
                        Issues
                    </th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


/*
 * =========================================
 * LOAD WORKFLOW STATUS
 * =========================================
 */

async function loadStatus() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/status?t=${Date.now()}`,
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        renderWorkflowStatus(
            data
        );


    } catch (error) {

        console.error(
            "Status error:",
            error
        );

        auditStatus.textContent =
            "Status unavailable";

    }

}


/*
 * =========================================
 * WORKFLOW STATUS
 * =========================================
 */

function renderWorkflowStatus(
    data
) {

    const runs =
        data.runs || [];


    if (!runs.length) {

        auditStatus.textContent =
            "No audit runs yet";

        workflowRuns.innerHTML = `
            <div class="loading">
                No GitHub Actions runs found.
            </div>
        `;

        return;

    }


    const latest =
        runs[0];


    if (
        latest.status ===
        "in_progress" ||
        latest.status ===
        "queued"
    ) {

        auditStatus.textContent =
            "🟡 Audit running...";

    }

    else if (
        latest.conclusion ===
        "success"
    ) {

        auditStatus.textContent =
            "🟢 Audit successful";

    }

    else if (
        latest.conclusion ===
        "failure"
    ) {

        auditStatus.textContent =
            "🔴 Audit failed";

    }

    else {

        auditStatus.textContent =
            latest.status ||
            "Unknown";

    }


    workflowRuns.innerHTML =
        runs
            .map(
                run => {

                    const status =
                        getRunStatus(
                            run
                        );


                    return `

                        <div class="workflow-item">

                            <div>

                                <strong>

                                    Audit #${run.runNumber}

                                </strong>

                                <br>

                                <small>

                                    ${formatDate(
                                        run.createdAt
                                    )}

                                </small>

                            </div>


                            <div>

                                <span
                                    class="badge ${getRunBadge(run)}"
                                >

                                    ${status}

                                </span>


                                ${
                                    run.htmlUrl
                                    ? `
                                        <a
                                            href="${escapeAttribute(
                                                run.htmlUrl
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View
                                        </a>
                                      `
                                    : ""
                                }

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/*
 * =========================================
 * RUN AUDIT
 * =========================================
 */

runButton.addEventListener(
    "click",
    async () => {

        if (
            runButton.disabled
        ) {

            return;

        }


        runButton.disabled =
            true;


        runButton.textContent =
            "⏳ Starting audit...";


        auditStatus.textContent =
            "Starting GitHub Action...";


        try {

            const response =
                await fetch(
                    `${API_BASE}/api/run-audit`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    `HTTP ${response.status}`
                );

            }


            auditStatus.textContent =
                "🟡 Audit started";


            /*
             * Give GitHub a moment to create
             * the workflow run.
             */

            setTimeout(
                loadStatus,
                3000
            );


        } catch (error) {

            console.error(
                error
            );


            auditStatus.textContent =
                `❌ ${error.message}`;

        }


        setTimeout(
            () => {

                runButton.disabled =
                    false;

                runButton.textContent =
                    "🔍 Run SEO Audit";

            },
            5000
        );

    }
);


/*
 * =========================================
 * HELPERS
 * =========================================
 */

function getHealthLabel(
    score
) {

    if (score >= 90) {
        return "Excellent";
    }

    if (score >= 80) {
        return "Good";
    }

    if (score >= 70) {
        return "Needs improvement";
    }

    return "Poor";

}


function getBadgeClass(
    score
) {

    if (score >= 90) {
        return "badge-good";
    }

    if (score >= 80) {
        return "badge-warning";
    }

    return "badge-danger";

}


function getRunStatus(
    run
) {

    if (
        run.status ===
        "queued"
    ) {

        return "Queued";

    }


    if (
        run.status ===
        "in_progress"
    ) {

        return "Running";

    }


    if (
        run.conclusion ===
        "success"
    ) {

        return "Success";

    }


    if (
        run.conclusion ===
        "failure"
    ) {

        return "Failed";

    }


    return run.status ||
        "Unknown";

}


function getRunBadge(
    run
) {

    if (
        run.conclusion ===
        "success"
    ) {

        return "badge-good";

    }


    if (
        run.conclusion ===
        "failure"
    ) {

        return "badge-danger";

    }


    return "badge-warning";

}


function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString();

}


function escapeHTML(
    value
) {

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


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}
