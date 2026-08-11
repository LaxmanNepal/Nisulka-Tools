(function () {
    "use strict";

    const footerHTML = `
        <footer class="site-footer">

            <div class="container">

                <div class="footer-main">

                    <!-- Brand -->

                    <div class="footer-brand">

                        <a
                            href="/Nisulka-Tools/"
                            class="footer-logo"
                            aria-label="Nisulka Tools home"
                        >
                            <span
                                class="footer-logo-mark"
                                aria-hidden="true"
                            >
                                N
                            </span>

                            <span>
                                Nisulka Tools
                            </span>
                        </a>

                        <p class="footer-description">
                            Free, fast and privacy-friendly
                            online tools for everyday tasks.
                        </p>

                    </div>

                    <!-- Tools -->

                    <div class="footer-column">

                        <h3 class="footer-title">
                            Tools
                        </h3>

                        <ul class="footer-links">

                            <li>
                                <a
                                    href="/Nisulka-Tools/#tools"
                                >
                                    All Tools
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/Nisulka-Tools/#categories"
                                >
                                    Categories
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/Nisulka-Tools/#popular"
                                >
                                    Popular Tools
                                </a>
                            </li>

                        </ul>

                    </div>

                    <!-- Company -->

                    <div class="footer-column">

                        <h3 class="footer-title">
                            Company
                        </h3>

                        <ul class="footer-links">

                            <li>
                                <a
                                    href="/Nisulka-Tools/about.html"
                                >
                                    About
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/Nisulka-Tools/contact.html"
                                >
                                    Contact
                                </a>
                            </li>

                        </ul>

                    </div>

                    <!-- Legal -->

                    <div class="footer-column">

                        <h3 class="footer-title">
                            Legal
                        </h3>

                        <ul class="footer-links">

                            <li>
                                <a
                                    href="/Nisulka-Tools/privacy.html"
                                >
                                    Privacy Policy
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/Nisulka-Tools/terms.html"
                                >
                                    Terms of Service
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/Nisulka-Tools/disclaimer.html"
                                >
                                    Disclaimer
                                </a>
                            </li>

                        </ul>

                    </div>

                </div>

                <div class="footer-bottom">

                    <p>
                        ©
                        <span id="current-year"></span>
                        Nisulka Tools.
                        All rights reserved.
                    </p>

                    <p>
                        Built with simplicity in mind.
                    </p>

                </div>

            </div>

        </footer>
    `;

    function initializeFooter() {

        const mount =
            document.getElementById(
                "site-footer-mount"
            );

        if (!mount) {
            console.warn(
                "Nisulka Tools: #site-footer-mount not found."
            );

            return;
        }

        mount.innerHTML = footerHTML;

        const yearElement =
            document.getElementById(
                "current-year"
            );

        if (yearElement) {
            yearElement.textContent =
                new Date().getFullYear();
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeFooter
        );
    } else {
        initializeFooter();
    }
})();
