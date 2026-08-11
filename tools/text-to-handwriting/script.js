(function () {
    "use strict";

    const textInput =
        document.getElementById(
            "handwriting-text"
        );

    const preview =
        document.getElementById(
            "handwriting-preview"
        );

    const fontSize =
        document.getElementById(
            "font-size"
        );

    const lineHeight =
        document.getElementById(
            "line-height"
        );

    const clearButton =
        document.getElementById(
            "clear-tool"
        );

    const copyButton =
        document.getElementById(
            "copy-result"
        );

    const downloadButton =
        document.getElementById(
            "download-result"
        );


    if (
        !textInput ||
        !preview ||
        !fontSize ||
        !lineHeight
    ) {
        console.error(
            "Text to Handwriting: required elements not found."
        );

        return;
    }


    /* =========================
       Update Preview
       ========================= */

    function updatePreview() {

        const text =
            textInput.value.trim();

        preview.textContent =
            text ||
            "Your handwritten preview will appear here.";

        preview.style.fontSize =
            `${fontSize.value}px`;

        preview.style.lineHeight =
            `${lineHeight.value}px`;

        preview.style.backgroundSize =
            `100% ${lineHeight.value}px`;
    }


    /* =========================
       Copy
       ========================= */

    async function copyText() {

        const text =
            textInput.value.trim();

        if (!text) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                text
            );

            const original =
                copyButton.textContent;

            copyButton.textContent =
                "Copied!";

            setTimeout(
                function () {
                    copyButton.textContent =
                        original;
                },
                1500
            );

        } catch (error) {

            console.error(
                "Clipboard error:",
                error
            );

        }
    }


    /* =========================
       Download Text
       ========================= */

    function downloadText() {

        const text =
            textInput.value.trim();

        if (!text) {
            return;
        }

        const blob =
            new Blob(
                [text],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "nisulka-handwritten-text.txt";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
    }


    /* =========================
       Clear
       ========================= */

    function clearTool() {

        textInput.value = "";

        updatePreview();

        textInput.focus();
    }


    /* =========================
       Events
       ========================= */

    textInput.addEventListener(
        "input",
        updatePreview
    );

    fontSize.addEventListener(
        "input",
        updatePreview
    );

    lineHeight.addEventListener(
        "input",
        updatePreview
    );


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            copyText
        );
    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearTool
        );
    }


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            downloadText
        );
    }


    /* =========================
       Initial State
       ========================= */

    updatePreview();

})();
