(function () {
    "use strict";

    const $ = (id) => document.getElementById(id);
    const textInput = $("handwriting-text");
    const preview = $("handwriting-preview");
    const font = $("handwriting-font");
    const fontSize = $("font-size");
    const lineHeight = $("line-height");
    const fontSizeValue = $("font-size-value");
    const lineHeightValue = $("line-height-value");
    const inkColor = $("ink-color");
    const paperStyle = $("paper-style");
    const textAlign = $("text-align");
    const characterCount = $("character-count");
    const clearButton = $("clear-tool");
    const copyButton = $("copy-result");
    const downloadButton = $("download-result");
    const canvas = $("handwriting-canvas");

    if (!textInput || !preview || !canvas) {
        console.error("Nisulka Tools: Text to Handwriting initialization failed.");
        return;
    }

    const state = {
        aiImageUrl: "",
        aiBusy: false,
        aiModels: [],
        pollinationsKey: localStorage.getItem("nisulka_pollinations_key") || "",
        hfToken: localStorage.getItem("nisulka_hf_token") || ""
    };

    const style = document.createElement("style");
    style.textContent = `
        .ai-handwriting-panel{margin-top:1.5rem;border:1px solid var(--border-color,#e5e7eb);border-radius:18px;padding:1.25rem;background:var(--bg-surface,#fff);box-shadow:0 8px 30px rgba(15,23,42,.06)}
        .ai-handwriting-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
        .ai-handwriting-panel h3{margin:.1rem 0 .35rem}
        .ai-handwriting-panel p{color:var(--text-secondary,#64748b);line-height:1.6}
        .ai-handwriting-field{display:flex;flex-direction:column;gap:.45rem}
        .ai-handwriting-field label{font-weight:600;font-size:.9rem}
        .ai-handwriting-field input,.ai-handwriting-field select{width:100%;box-sizing:border-box;padding:.75rem;border:1px solid var(--border-color,#e5e7eb);border-radius:10px;background:var(--bg-surface,#fff);color:inherit}
        .ai-handwriting-actions{display:flex;gap:.65rem;flex-wrap:wrap;margin-top:1rem}
        .ai-handwriting-actions button{border:0;border-radius:10px;padding:.7rem 1rem;cursor:pointer;font:inherit;font-weight:600}
        .ai-primary{background:#2563eb;color:#fff}.ai-secondary{background:#eef2ff;color:#1e3a8a}
        .ai-status{margin-top:.8rem;font-size:.88rem;min-height:1.3em}
        .ai-result{margin-top:1rem;display:none}.ai-result img{display:block;max-width:100%;max-height:900px;margin:auto;border-radius:12px;border:1px solid var(--border-color,#e5e7eb)}
        .ai-note{font-size:.8rem!important;margin:.65rem 0 0}
        .ai-model-row{display:flex;gap:.5rem}.ai-model-row select{flex:1}.ai-model-row button{white-space:nowrap}
        .ai-engine-badge{display:inline-flex;padding:.25rem .55rem;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:.75rem;font-weight:700}
        @media(max-width:639px){.ai-handwriting-grid{grid-template-columns:1fr}.ai-model-row{flex-direction:column}.ai-model-row button{width:100%}}
    `;
    document.head.appendChild(style);

    function getFontFamily() {
        if (font && font.value === "Caveat") return '"Caveat", cursive';
        return font ? font.value || "cursive" : "cursive";
    }

    function updateCharacterCount() {
        if (!characterCount) return;
        const count = textInput.value.length;
        characterCount.textContent = `${count.toLocaleString()} character${count === 1 ? "" : "s"}`;
    }

    function updatePaperPreview() {
        if (!preview || !lineHeight || !paperStyle) return;
        const spacing = Number(lineHeight.value) || 38;
        if (paperStyle.value === "plain") {
            preview.style.backgroundImage = "none";
            return;
        }
        if (paperStyle.value === "grid") {
            preview.style.backgroundImage = `linear-gradient(#dbeafe 1px,transparent 1px),linear-gradient(90deg,#dbeafe 1px,transparent 1px)`;
            preview.style.backgroundSize = `${spacing}px ${spacing}px`;
            return;
        }
        preview.style.backgroundImage = `linear-gradient(to bottom,transparent ${spacing - 1}px,#dbeafe ${spacing}px)`;
        preview.style.backgroundSize = `100% ${spacing}px`;
    }

    function updatePreview() {
        const text = textInput.value;
        preview.textContent = text.trim() ? text : "Your handwritten preview will appear here.";
        preview.classList.toggle("placeholder", !text.trim());
        if (font) preview.style.fontFamily = getFontFamily();
        if (fontSize) preview.style.fontSize = `${fontSize.value}px`;
        if (lineHeight) preview.style.lineHeight = `${lineHeight.value}px`;
        if (inkColor) preview.style.color = inkColor.value;
        if (textAlign) preview.style.textAlign = textAlign.value;
        if (fontSizeValue && fontSize) fontSizeValue.textContent = `${fontSize.value} px`;
        if (lineHeightValue && lineHeight) lineHeightValue.textContent = `${lineHeight.value} px`;
        updateCharacterCount();
        updatePaperPreview();
    }

    function wrapLine(ctx, line, maxWidth) {
        if (ctx.measureText(line).width <= maxWidth) return [line];
        const words = line.split(/\s+/);
        if (words.length === 1) {
            const parts = [];
            let current = "";
            for (const char of line) {
                const test = current + char;
                if (ctx.measureText(test).width > maxWidth && current) {
                    parts.push(current); current = char;
                } else current = test;
            }
            if (current) parts.push(current);
            return parts;
        }
        const result = [];
        let current = "";
        for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            if (ctx.measureText(test).width > maxWidth && current) {
                result.push(current); current = word;
            } else current = test;
        }
        if (current) result.push(current);
        return result;
    }

    function createLines(ctx, text, maxWidth) {
        const lines = [];
        text.split("\n").forEach((paragraph) => {
            if (!paragraph) { lines.push(""); return; }
            lines.push(...wrapLine(ctx, paragraph, maxWidth));
        });
        return lines;
    }

    function drawPaper(ctx, width, height, spacing) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
        if (!paperStyle || paperStyle.value === "plain") return;
        ctx.strokeStyle = "#dbeafe";
        ctx.lineWidth = 1;
        if (paperStyle.value === "lined") {
            for (let y = 70; y < height; y += spacing) {
                ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(width - 40, y); ctx.stroke();
            }
        } else if (paperStyle.value === "grid") {
            for (let x = 40; x < width; x += spacing) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
            for (let y = 40; y < height; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
        }
    }

    async function generateLocalPNG() {
        const text = textInput.value.trim();
        if (!text) { alert("Please enter some text first."); textInput.focus(); return; }
        await document.fonts.ready;
        const ctx = canvas.getContext("2d");
        const size = Number(fontSize?.value || 26);
        const spacing = Number(lineHeight?.value || 38);
        const width = 1800;
        const padding = 120;
        ctx.font = `${size}px ${getFontFamily()}`;
        const lines = createLines(ctx, text, width - padding * 2);
        const height = Math.max(600, padding * 2 + lines.length * spacing);
        canvas.width = width; canvas.height = height;
        drawPaper(ctx, width, height, spacing);
        ctx.font = `${size}px ${getFontFamily()}`;
        ctx.fillStyle = inkColor?.value || "#1f2937";
        ctx.textBaseline = "top";
        lines.forEach((line, i) => {
            const w = ctx.measureText(line).width;
            let x = padding;
            if (textAlign?.value === "center") x = (width - w) / 2;
            if (textAlign?.value === "right") x = width - padding - w;
            ctx.fillText(line, x, padding + i * spacing);
        });
        canvas.toBlob((blob) => {
            if (!blob) return;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob); a.download = "nisulka-handwriting.png";
            a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }, "image/png");
    }

    async function copyText() {
        if (!textInput.value.trim()) return;
        try { await navigator.clipboard.writeText(textInput.value); }
        catch { const t = document.createElement("textarea"); t.value = textInput.value; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
        if (copyButton) { const old = copyButton.textContent; copyButton.textContent = "Copied!"; setTimeout(() => copyButton.textContent = old, 1200); }
    }

    function addAiPanel() {
        if (document.querySelector(".ai-handwriting-panel")) return;
        const panel = document.createElement("section");
        panel.className = "ai-handwriting-panel";
        panel.innerHTML = `
            <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
                <h3>🤖 AI Handwriting Engine</h3><span class="ai-engine-badge">Multi-model</span>
            </div>
            <p>Use the local renderer for exact text, or connect an AI image model for more natural handwriting. Nepali/Devanagari AI output depends on the selected model and may alter characters, so the exact local mode remains the reliable fallback.</p>
            <div class="ai-handwriting-grid">
                <div class="ai-handwriting-field">
                    <label for="ai-provider">AI provider</label>
                    <select id="ai-provider">
                        <option value="pollinations">Pollinations — multi-model image API</option>
                        <option value="huggingface">Hugging Face — image inference</option>
                        <option value="custom">Custom image API</option>
                    </select>
                </div>
                <div class="ai-handwriting-field">
                    <label for="ai-model">Model</label>
                    <div class="ai-model-row"><select id="ai-model"><option value="gptimage">gptimage</option><option value="ideogram-v4-quality">ideogram-v4-quality</option><option value="qwen-image">qwen-image</option><option value="flux">flux</option><option value="seedream5-pro">seedream5-pro</option><option value="nanobanana-2">nanobanana-2</option></select><button id="ai-refresh-models" class="ai-secondary" type="button">Refresh</button></div>
                </div>
                <div class="ai-handwriting-field">
                    <label for="ai-key">API key / token <span style="font-weight:400">(stored only in this browser)</span></label>
                    <input id="ai-key" type="password" autocomplete="off" placeholder="Optional for local mode; required by most AI providers">
                </div>
                <div class="ai-handwriting-field">
                    <label for="ai-custom-endpoint">Custom endpoint</label>
                    <input id="ai-custom-endpoint" type="url" placeholder="https://your-server.example/v1/images/generations">
                </div>
            </div>
            <div class="ai-handwriting-actions">
                <button id="ai-generate" class="ai-primary" type="button">Generate with AI</button>
                <button id="ai-local" class="ai-secondary" type="button">Exact Local PNG</button>
                <button id="ai-download" class="ai-secondary" type="button" disabled>Download AI Result</button>
            </div>
            <div id="ai-status" class="ai-status" role="status"></div>
            <div id="ai-result" class="ai-result"><img id="ai-result-image" alt="AI generated handwriting preview"></div>
            <p class="ai-note">Security: do not put a secret server API key into public source code. For a public site, use a user-owned token/BYOK flow or your own protected backend proxy.</p>
        `;
        const workspace = document.querySelector(".tool-workspace");
        (workspace || document.querySelector("main") || document.body).appendChild(panel);

        const provider = $("ai-provider");
        const model = $("ai-model");
        const key = $("ai-key");
        const endpoint = $("ai-custom-endpoint");
        const status = $("ai-status");
        const result = $("ai-result");
        const resultImage = $("ai-result-image");
        const generate = $("ai-generate");
        const local = $("ai-local");
        const download = $("ai-download");
        const refresh = $("ai-refresh-models");

        key.value = state.pollinationsKey || state.hfToken;
        provider.addEventListener("change", () => {
            key.value = provider.value === "pollinations" ? state.pollinationsKey : provider.value === "huggingface" ? state.hfToken : "";
            endpoint.disabled = provider.value !== "custom";
        });
        endpoint.disabled = true;

        function setStatus(message, error = false) { status.textContent = message; status.style.color = error ? "#b91c1c" : ""; }

        async function refreshModels() {
            if (provider.value !== "pollinations") { setStatus("Live model discovery is currently available for Pollinations."); return; }
            setStatus("Loading live image models…");
            try {
                const r = await fetch("https://gen.pollinations.ai/v1/models");
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                const list = Array.isArray(data) ? data : (data.data || data.models || []);
                const names = list.map(x => typeof x === "string" ? x : x.id || x.name).filter(Boolean);
                if (names.length) {
                    model.innerHTML = names.map(n => `<option value="${String(n).replace(/"/g,"&quot;")}">${String(n).replace(/</g,"&lt;")}</option>`).join("");
                    state.aiModels = names;
                    setStatus(`${names.length} live models loaded.`);
                } else setStatus("No live image models were returned; using the built-in model list.", true);
            } catch (e) { setStatus("Could not load live models. Built-in models remain available.", true); }
        }

        async function generateAi() {
            const text = textInput.value.trim();
            if (!text) { setStatus("Enter text first.", true); textInput.focus(); return; }
            state.aiBusy = true; generate.disabled = true; setStatus("Generating AI handwriting…"); result.style.display = "none";
            try {
                const p = provider.value;
                const selectedModel = model.value;
                const apiKey = key.value.trim();
                if (p === "pollinations") {
                    if (!apiKey) throw new Error("Pollinations now requires authentication. Enter your key or use Exact Local PNG.");
                    localStorage.setItem("nisulka_pollinations_key", apiKey); state.pollinationsKey = apiKey;
                    const prompt = `Create a realistic handwritten note on clean white lined paper. Write the following text EXACTLY, preserving every character, spelling, punctuation, spacing and line breaks. Do not translate, paraphrase, add, remove or correct anything. Text: ${text}. Natural black or dark-blue ink, authentic human handwriting, flat scanned paper, no decorations, no watermark, no extra words.`;
                    const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${encodeURIComponent(selectedModel)}&width=1536&height=1024&nologo=true&key=${encodeURIComponent(apiKey)}`;
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}`);
                    const blob = await response.blob();
                    state.aiImageUrl = URL.createObjectURL(blob);
                } else if (p === "huggingface") {
                    if (!apiKey) throw new Error("Enter a Hugging Face token with inference permissions.");
                    localStorage.setItem("nisulka_hf_token", apiKey); state.hfToken = apiKey;
                    const modelId = selectedModel;
                    const prompt = `A realistic scanned handwritten note containing exactly this text: ${text}. Preserve Devanagari/Nepali characters exactly. White paper, natural pen strokes, no extra text.`;
                    const response = await fetch(`https://router.huggingface.co/hf-inference/models/${encodeURIComponent(modelId)}`, {method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({inputs:prompt})});
                    if (!response.ok) throw new Error(`Hugging Face returned HTTP ${response.status}`);
                    const blob = await response.blob();
                    if (!blob.type.startsWith("image/")) throw new Error("Selected Hugging Face model did not return an image. Choose a text-to-image model.");
                    state.aiImageUrl = URL.createObjectURL(blob);
                } else {
                    const url = endpoint.value.trim();
                    if (!url) throw new Error("Enter a custom image-generation endpoint.");
                    const response = await fetch(url, {method:"POST",headers:{"Content-Type":"application/json",...(apiKey?{Authorization:`Bearer ${apiKey}`}:{})},body:JSON.stringify({model:selectedModel,prompt:`Generate realistic handwritten text exactly as supplied: ${text}`,text})});
                    if (!response.ok) throw new Error(`Custom endpoint returned HTTP ${response.status}`);
                    const contentType = response.headers.get("content-type") || "";
                    if (contentType.startsWith("image/")) state.aiImageUrl = URL.createObjectURL(await response.blob());
                    else {
                        const data = await response.json();
                        const imageUrl = data.image_url || data.url || data.data?.[0]?.url || data.data?.[0]?.b64_json;
                        if (!imageUrl) throw new Error("Custom endpoint response did not contain an image URL or base64 image.");
                        state.aiImageUrl = imageUrl.startsWith("data:") ? imageUrl : imageUrl;
                    }
                }
                resultImage.src = state.aiImageUrl; result.style.display = "block"; download.disabled = false; setStatus("AI handwriting generated. Check the text carefully, especially Nepali/Devanagari characters.");
            } catch (e) { console.error(e); setStatus(e.message || "AI generation failed.", true); }
            finally { state.aiBusy = false; generate.disabled = false; }
        }

        generate.addEventListener("click", generateAi);
        local.addEventListener("click", generateLocalPNG);
        refresh.addEventListener("click", refreshModels);
        download.addEventListener("click", () => {
            if (!state.aiImageUrl) return;
            const a = document.createElement("a"); a.href = state.aiImageUrl; a.download = "nisulka-ai-handwriting.png"; a.target = "_blank"; a.click();
        });
        setStatus("Local exact rendering is ready. Connect an AI provider for neural image generation.");
    }

    [textInput, font, fontSize, lineHeight, inkColor, paperStyle, textAlign].forEach((el) => {
        if (el) el.addEventListener(el.tagName === "TEXTAREA" || el.type === "range" || el.type === "color" ? "input" : "change", updatePreview);
    });
    if (clearButton) clearButton.addEventListener("click", () => { textInput.value = ""; updatePreview(); textInput.focus(); });
    if (copyButton) copyButton.addEventListener("click", copyText);
    if (downloadButton) downloadButton.addEventListener("click", generateLocalPNG);
    document.querySelectorAll(".tool-faq-question").forEach((question) => question.addEventListener("click", () => {
        const expanded = question.getAttribute("aria-expanded") === "true";
        question.setAttribute("aria-expanded", String(!expanded));
        const answer = document.getElementById(question.getAttribute("aria-controls"));
        if (answer) answer.hidden = expanded;
        const icon = question.querySelector("span"); if (icon) icon.textContent = expanded ? "+" : "−";
    }));

    updatePreview();
    addAiPanel();
})();
