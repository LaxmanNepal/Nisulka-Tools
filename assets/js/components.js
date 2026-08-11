/* =========================================================
   NISULKA TOOLS — SHARED COMPONENT FUNCTIONS
   ========================================================= */

(function () {
    "use strict";

    window.NisulkaComponents = {

        /* =========================
           Escape HTML
           ========================= */

        escapeHTML: function (value) {

            if (value === null || value === undefined) {
                return "";
            }

            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        /* =========================
           Create Tool Card
           ========================= */

        createToolCard: function (tool, categoryMap) {

            const escape =
                this.escapeHTML;

            const category =
                categoryMap &&
                categoryMap[tool.category]
                    ? categoryMap[tool.category]
                    : null;

            const categoryName =
                category
                    ? category.name
                    : tool.category || "Tool";

            const popularBadge =
                tool.popular
                    ? `
                        <span class="badge badge-primary">
                            Popular
                        </span>
                    `
                    : "";

            return `
                <article
                    class="tool-card"
                    data-tool-id="${escape(tool.id)}"
                    data-category="${escape(tool.category)}"
                >

                    <div class="tool-card-icon"
                         aria-hidden="true">
                        ${escape(tool.icon || "⚙️")}
                    </div>

                    <div class="tool-card-content">

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:space-between;
                                gap:0.5rem;
                                margin-bottom:0.5rem;
                            "
                        >
                            <span
                                class="badge"
                                style="
                                    background:
                                    var(--bg-surface-secondary);
                                    color:
                                    var(--text-secondary);
                                "
                            >
                                ${escape(categoryName)}
                            </span>

                            ${popularBadge}

                        </div>

                        <h3 class="tool-card-title">
                            ${escape(tool.name)}
                        </h3>

                        <p class="tool-card-description">
                            ${escape(tool.shortDescription)}
                        </p>

                    </div>

                    <div class="tool-card-action">

                        <a
                            href="${escape(tool.url)}"
                            class="btn btn-secondary btn-block"
                        >
                            Open Tool
                        </a>

                    </div>

                </article>
            `;
        },

        /* =========================
           Create Category Button
           ========================= */

        createCategoryButton: function (
            category,
            active
        ) {

            const escape =
                this.escapeHTML;

            return `
                <button
                    type="button"
                    class="category-button ${
                        active ? "active" : ""
                    }"
                    data-category="${escape(category.id)}"
                >
                    ${escape(category.name)}
                </button>
            `;
        },

        /* =========================
           Create Empty State
           ========================= */

        createEmptyState: function (
            title,
            description
        ) {

            return `
                <div class="empty-state">

                    <div
                        class="empty-state-icon"
                        aria-hidden="true"
                    >
                        🔍
                    </div>

                    <h3 class="empty-state-title">
                        ${this.escapeHTML(title)}
                    </h3>

                    <p class="empty-state-description">
                        ${this.escapeHTML(description)}
                    </p>

                </div>
            `;
        },

        /* =========================
           Create Loading State
           ========================= */

        createLoadingCards: function (
            count
        ) {

            const total =
                Number(count) || 6;

            let html = "";

            for (
                let i = 0;
                i < total;
                i++
            ) {

                html += `
                    <div
                        class="tool-card"
                        aria-hidden="true"
                    >

                        <div
                            class="skeleton"
                            style="
                                width:48px;
                                height:48px;
                                margin-bottom:1rem;
                            "
                        ></div>

                        <div
                            class="skeleton"
                            style="
                                width:70%;
                                height:18px;
                                margin-bottom:0.75rem;
                            "
                        ></div>

                        <div
                            class="skeleton"
                            style="
                                width:100%;
                                height:14px;
                                margin-bottom:0.5rem;
                            "
                        ></div>

                        <div
                            class="skeleton"
                            style="
                                width:85%;
                                height:14px;
                                margin-bottom:1.25rem;
                            "
                        ></div>

                        <div
                            class="skeleton"
                            style="
                                width:100%;
                                height:44px;
                            "
                        ></div>

                    </div>
                `;
            }

            return html;
        },

        /* =========================
           Create Tool Count
           ========================= */

        createToolCount: function (
            count
        ) {

            const number =
                Number(count) || 0;

            return `
                <span class="tool-count">
                    ${number}
                    ${number === 1 ? "tool" : "tools"}
                </span>
            `;
        }

    };

})();
