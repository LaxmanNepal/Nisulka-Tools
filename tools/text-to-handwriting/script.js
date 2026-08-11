(function () {

    "use strict";


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const textInput =
        document.getElementById(
            "handwriting-text"
        );

    const preview =
        document.getElementById(
            "handwriting-preview"
        );

    const font =
        document.getElementById(
            "handwriting-font"
        );

    const fontSize =
        document.getElementById(
            "font-size"
        );

    const lineHeight =
        document.getElementById(
            "line-height"
        );

    const fontSizeValue =
        document.getElementById(
            "font-size-value"
        );

    const lineHeightValue =
        document.getElementById(
            "line-height-value"
        );

    const inkColor =
        document.getElementById(
            "ink-color"
        );

    const paperStyle =
        document.getElementById(
            "paper-style"
        );

    const textAlign =
        document.getElementById(
            "text-align"
        );

    const characterCount =
        document.getElementById(
            "character-count"
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


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (
        !textInput ||
        !preview ||
        !font ||
        !fontSize ||
        !lineHeight ||
        !inkColor ||
        !paperStyle ||
        !textAlign ||
        !characterCount ||
        !clearButton ||
        !copyButton ||
        !downloadButton ||
        !canvas
    ) {

        console.error(
            "Nisulka Tools: Text to Handwriting initialization failed."
        );

        return;
    }


    /* =====================================================
       FONT
       ===================================================== */

    function getFontFamily() {

        if (
            font.value ===
            "Caveat"
        ) {

            return '"Caveat", cursive';
        }

        return "cursive";
    }


    /* =====================================================
       CHARACTER COUNT
       ===================================================== */

    function updateCharacterCount() {

        const count =
            textInput.value.length;

        characterCount.textContent =
            `${count.toLocaleString()} character${count === 1 ? "" : "s"}`;
    }


    /* =====================================================
       PAPER PREVIEW
       ===================================================== */

    function updatePaperPreview() {

        const spacing =
            Number(
                lineHeight.value
            );


        if (
            paperStyle.value ===
            "plain"
        ) {

            preview.style.backgroundImage =
                "none";

            preview.style.backgroundSize =
                "auto";

            return;
        }


        if (
            paperStyle.value ===
            "grid"
        ) {

            preview.style.backgroundImage = `
                linear-gradient(
                    #dbeafe 1px,
                    transparent 1px
                ),
                linear-gradient(
                    90deg,
                    #dbeafe 1px,
                    transparent 1px
                )
            `;

            preview.style.backgroundSize =
                `${spacing}px ${spacing}px`;

            return;
        }


        /* Lined */

        preview.style.backgroundImage = `
            linear-gradient(
                to bottom,
                transparent ${spacing - 1}px,
                #dbeafe ${spacing}px
            )
        `;

        preview.style.backgroundSize =
            `100% ${spacing}px`;
    }


    /* =====================================================
       LIVE PREVIEW
       ===================================================== */

    function updatePreview() {

        const text =
            textInput.value;


        if (
            text.trim()
        ) {

            preview.textContent =
                text;

            preview.classList.remove(
                "placeholder"
            );

        } else {

            preview.textContent =
                "Your handwritten preview will appear here.";

            preview.classList.add(
                "placeholder"
            );
        }


        preview.style.fontFamily =
            getFontFamily();

        preview.style.fontSize =
            `${fontSize.value}px`;

        preview.style.lineHeight =
            `${lineHeight.value}px`;

        preview.style.color =
            inkColor.value;

        preview.style.textAlign =
            textAlign.value;


        fontSizeValue.textContent =
            `${fontSize.value} px`;

        lineHeightValue.textContent =
            `${lineHeight.value} px`;


        updateCharacterCount();

        updatePaperPreview();
    }


    /* =====================================================
       TEXT WRAPPING
       ===================================================== */

    function wrapText(
        context,
        text,
        maxWidth
    ) {

        const words =
            text.split(/\s+/);

        const lines = [];

        let currentLine =
            "";


        words.forEach(
            function (word) {

                const testLine =
                    currentLine
                        ? `${currentLine} ${word}`
                        : word;


                const testWidth =
                    context.measureText(
                        testLine
                    ).width;


                if (
                    testWidth >
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

            lines.push(
                currentLine
            );
        }


        return lines;
    }


    /* =====================================================
       CANVAS TEXT LAYOUT
       ===================================================== */

    function createCanvasLines(
        context,
        text,
        maxWidth
    ) {

        const paragraphs =
            text.split("\n");

        const lines = [];


        paragraphs.forEach(
            function (paragraph) {

                if (
                    !paragraph.trim()
                ) {

                    lines.push("");

                    return;
                }


                const wrapped =
                    wrapText(
                        context,
                        paragraph,
                        maxWidth
                    );


                lines.push(
                    ...wrapped
                );
            }
        );


        return lines;
    }


    /* =====================================================
       DRAW PAPER
       ===================================================== */

    function drawPaper(
        context,
        width,
        height,
        spacing
    ) {

        context.fillStyle =
            "#ffffff";

        context.fillRect(
            0,
            0,
            width,
            height
        );


        if (
            paperStyle.value ===
            "plain"
        ) {

            return;
        }


        context.strokeStyle =
            "#dbeafe";

        context.lineWidth = 1;


        if (
            paperStyle.value ===
            "lined"
        ) {

            for (
                let y = 60;
                y < height;
                y += spacing
            ) {

                context.beginPath();

                context.moveTo(
                    30,
                    y
                );

                context.lineTo(
                    width - 30,
                    y
                );

                context.stroke();
            }

            return;
        }


        if (
            paperStyle.value ===
            "grid"
        ) {

            for (
                let x = 30;
                x < width;
                x += spacing
            ) {

                context.beginPath();

                context.moveTo(
                    x,
                    0
                );

                context.lineTo(
                    x,
                    height
                );

                context.stroke();
            }


            for (
                let y = 30;
                y < height;
                y += spacing
            ) {

                context.beginPath();

                context.moveTo(
                    0,
                    y
                );

                context.lineTo(
                    width,
                    y
                );

                context.stroke();
            }
        }
    }


    /* =====================================================
       DRAW TEXT
       ===================================================== */

    function drawText(
        context,
        lines,
        width,
        padding,
        spacing,
        size
    ) {

        context.font =
            `${size}px ${getFontFamily()}`;

        context.fillStyle =
            inkColor.value;

        context.textBaseline =
            "top";


        lines.forEach(
            function (
                line,
                index
            ) {

                const textWidth =
                    context.measureText(
                        line
                    ).width;


                let x =
                    padding;


                if (
                    textAlign.value ===
                    "center"
                ) {

                    x =
                        (
                            width -
                            textWidth
                        ) / 2;
                }


                if (
                    textAlign.value ===
                    "right"
                ) {

                    x =
                        width -
                        padding -
                        textWidth;
                }


                const y =
                    padding +
                    (
                        index *
                        spacing
                    );


                context.fillText(
                    line,
                    x,
                    y
                );
            }
        );
    }


    /* =====================================================
       DOWNLOAD PNG
       ===================================================== */

    function generatePNG() {

        const text =
            textInput.value.trim();


        if (!text) {

            alert(
                "Please enter some text first."
            );

            textInput.focus();

            return;
        }


        const context =
            canvas.getContext(
                "2d"
            );


        const size =
            Number(
                fontSize.value
            );


        const spacing =
            Number(
                lineHeight.value
            );


        const padding =
            100;


        const width =
            1600;


        const maxWidth =
            width -
            (
                padding * 2
            );


        /*
         * Ensure the web font has
         * finished loading before
         * measuring the text.
         */

        document.fonts
            .ready
            .then(
                function () {

                    context.font =
                        `${size}px ${getFontFamily()}`;


                    const lines =
                        createCanvasLines(
                            context,
                            text,
                            maxWidth
                        );


                    const height =
                        Math.max(
                            500,
                            (
                                lines.length *
                                spacing
                            ) +
                            (
                                padding * 2
                            )
                        );


                    canvas.width =
                        width;

                    canvas.height =
                        height;


                    drawPaper(
                        context,
                        width,
                        height,
                        spacing
                    );


                    drawText(
                        context,
                        lines,
                        width,
                        padding,
                        spacing,
                        size
                    );


                    canvas.toBlob(
                        function (blob) {

                            if (!blob) {

                                alert(
                                    "Unable to generate the PNG image."
                                );

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


                            link.href =
                                url;


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
            );
    }


    /* =====================================================
       COPY
       ===================================================== */

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


            /*
             * Fallback for browsers
             * where Clipboard API is
             * unavailable.
             */

            const temporary =
                document.createElement(
                    "textarea"
                );


            temporary.value =
                text;


            temporary.style.position =
                "fixed";

            temporary.style.opacity =
                "0";


            document.body.appendChild(
                temporary
            );


            temporary.select();


            try {

                document.execCommand(
                    "copy"
                );

                copyButton.textContent =
                    "Copied!";


                setTimeout(
                    function () {

                        copyButton.textContent =
                            "Copy Text";

                    },
                    1500
                );

            } catch (
                fallbackError
            ) {

                console.error(
                    "Clipboard fallback failed:",
                    fallbackError
                );

            }


            temporary.remove();
        }
    }


    /* =====================================================
       CLEAR
       ===================================================== */

    function clearTool() {

        textInput.value =
            "";

        updatePreview();

        textInput.focus();
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    textInput.addEventListener(
        "input",
        updatePreview
    );


    font.addEventListener(
        "change",
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


    inkColor.addEventListener(
        "input",
        updatePreview
    );


    paperStyle.addEventListener(
        "change",
        updatePreview
    );


    textAlign.addEventListener(
        "change",
        updatePreview
    );


    clearButton.addEventListener(
        "click",
        clearTool
    );


    copyButton.addEventListener(
        "click",
        copyText
    );


    downloadButton.addEventListener(
        "click",
        generatePNG
    );


    /* =====================================================
       FAQ
       ===================================================== */

    const faqQuestions =
        document.querySelectorAll(
            ".tool-faq-question"
        );


    faqQuestions.forEach(
        function (question) {

            question.addEventListener(
                "click",
                function () {

                    const expanded =
                        question.getAttribute(
                            "aria-expanded"
                        ) === "true";


                    const answerId =
                        question.getAttribute(
                            "aria-controls"
                        );


                    const answer =
                        document.getElementById(
                            answerId
                        );


                    question.setAttribute(
                        "aria-expanded",
                        String(!expanded)
                    );


                    if (answer) {

                        answer.hidden =
                            expanded;
                    }


                    const icon =
                        question.querySelector(
                            "span"
                        );


                    if (icon) {

                        icon.textContent =
                            expanded
                                ? "+"
                                : "−";
                    }

                }
            );
        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    updatePreview();

})();
