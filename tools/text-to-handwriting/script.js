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

    const canvas =
        document.getElementById(
            "handwriting-canvas"
        );


    if (
        !textInput ||
        !preview ||
        !fontSize ||
        !lineHeight ||
        !canvas
    ) {
        console.error(
            "Text to Handwriting: required elements not found."
        );

        return;
    }


    /* =========================
       Preview
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
       Canvas Text Rendering
       ========================= */

    function wrapText(
        context,
        text,
        maxWidth
    ) {

        const words =
            text.split(/\s+/);

        const lines = [];

        let currentLine = "";

        words.forEach(
            function (word) {

                const testLine =
                    currentLine
                        ? `${currentLine} ${word}`
                        : word;

                const width =
                    context.measureText(
                        testLine
                    ).width;

                if (
                    width >
                        maxWidth &&
                    currentLine
                ) {

                    lines.push(
                        currentLine
                    );

                    currentLine =
                        word;

                } else {

                    currentLine =
                        testLine;
                }
            }
        );

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }


    /* =========================
       Generate PNG
       ========================= */

    function generatePNG() {

        const text =
            textInput.value.trim();

        if (!text) {
            alert(
                "Please enter some text first."
            );

            return;
        }


        const ctx =
            canvas.getContext("2d");


        const size =
            Number(fontSize.value);

        const spacing =
            Number(lineHeight.value);


        const padding = 80;

        const width = 1600;

        const maxTextWidth =
            width - (
                padding * 2
            );


        /*
         * Use a handwriting-style
         * system font.
         */

        ctx.font =
            `${size}px "Segoe Print", "Comic Sans MS", cursive`;


        const paragraphs =
            text.split("\n");


        const lines = [];


        paragraphs.forEach(
            function (paragraph) {

                if (!paragraph.trim()) {

                    lines.push("");

                    return;
                }

                const wrapped =
                    wrapText(
                        ctx,
                        paragraph,
                        maxTextWidth
                    );

                lines.push(
                    ...wrapped
                );
            }
        );


        const height =
            Math.max(
                400,
                (
                    lines.length *
                    spacing
                ) +
                (
                    padding * 2
                )
            );


        /*
         * High-resolution canvas.
         */

        canvas.width =
            width;

        canvas.height =
            height;


        /*
         * Paper.
         */

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
         * Notebook lines.
         */

        ctx.strokeStyle =
            "#dbeafe";

        ctx.lineWidth = 2;


        for (
            let y = padding;
            y < height - padding;
            y += spacing
        ) {

            ctx.beginPath();

            ctx.moveTo(
                padding / 2,
                y
            );

            ctx.lineTo(
                width - (
                    padding / 2
                ),
                y
            );

            ctx.stroke();
        }


        /*
         * Handwriting text.
         */

        ctx.font =
            `${size}px "Segoe Print", "Comic Sans MS", cursive`;

        ctx.fillStyle =
            "#1f2937";

        ctx.textBaseline =
            "top";


        let y =
            padding;


        lines.forEach(
            function (line) {

                ctx.fillText(
                    line,
                    padding,
                    y
                );

                y += spacing;
            }
        );


        /*
         * Download.
         */

        canvas.toBlob(
            function (blob) {

                if (!blob) {
                    return;
                }

                const url =
                    URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href = url;

                link.download =
                    "nisulka-handwriting.png";

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                URL.revokeObjectURL(
                    url
                );
            },
            "image/png"
        );
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


    copyButton.addEventListener(
        "click",
        copyText
    );


    clearButton.addEventListener(
        "click",
        clearTool
    );


    downloadButton.addEventListener(
        "click",
        generatePNG
    );


    /* =========================
       Initial State
       ========================= */

    updatePreview();

})();
