/**
 * Nisulka Tools - Gemini Watermark Remover
 * 100% Client-side canvas boundary diffusion inpainting.
 */

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const panel = document.getElementById('panel');
  
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const fileInfoText = document.getElementById('file-info-text');
  const progressWrap = document.getElementById('progress-wrap');
  const progressBar = document.getElementById('progress-bar');
  
  const presetSelect = document.getElementById('preset-select');
  const brushSizeInput = document.getElementById('brush-size');
  const brushValDisplay = document.getElementById('brush-val');
  const btnClearMask = document.getElementById('btn-clear-mask');
  
  const imageCanvas = document.getElementById('image-canvas');
  const maskCanvas = document.getElementById('mask-canvas');
  const imgCtx = imageCanvas.getContext('2d', { willReadFrequently: true });
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  
  const btnProcess = document.getElementById('btn-process');
  const btnReset = document.getElementById('btn-reset');
  
  const resultContainer = document.getElementById('result-container');
  const imgOriginalPreview = document.getElementById('img-original-preview');
  const imgResultPreview = document.getElementById('img-result-preview');
  const exportFormatSelect = document.getElementById('export-format');
  const btnDownload = document.getElementById('btn-download');

  // State
  let currentFile = null;
  let originalImage = null;
  let objectUrl = null;
  let resultObjectUrl = null;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // File Dropzone Handling
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  // Load File
  function handleFile(file) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      alert('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25 MB limit.');
      return;
    }

    currentFile = file;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);

    originalImage = new Image();
    originalImage.onload = () => {
      initWorkspace();
      dropzone.style.display = 'none';
      panel.style.display = 'block';
      fileInfoText.textContent = `${file.name} (${formatBytes(file.size)}) — ${originalImage.width}x${originalImage.height}px`;
      setStatus('Image loaded. Apply corner preset or draw watermark mask.', 'ok');
    };
    originalImage.src = objectUrl;
  }

  // Initialize Canvas Dimensions & Presets
  function initWorkspace() {
    const width = originalImage.width;
    const height = originalImage.height;

    imageCanvas.width = width;
    imageCanvas.height = height;
    maskCanvas.width = width;
    maskCanvas.height = height;

    imgCtx.drawImage(originalImage, 0, 0);
    clearMask();
    applyPreset(presetSelect.value);

    imgOriginalPreview.src = objectUrl;
    resultContainer.style.display = 'none';
  }

  // Format Helper
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Brush Settings
  brushSizeInput.addEventListener('input', (e) => {
    brushValDisplay.textContent = `${e.target.value}px`;
  });

  presetSelect.addEventListener('change', (e) => {
    clearMask();
    applyPreset(e.value || e.target.value);
  });

  btnClearMask.addEventListener('click', clearMask);

  function clearMask() {
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  }

  function applyPreset(preset) {
    if (preset === 'custom') return;

    const w = maskCanvas.width;
    const h = maskCanvas.height;

    // Gemini watermark preset dimensions (~12% corner bounding box)
    const boxW = Math.max(40, Math.round(w * 0.12));
    const boxH = Math.max(40, Math.round(h * 0.12));
    const padding = Math.max(10, Math.round(w * 0.015));

    maskCtx.fillStyle = 'rgba(255, 0, 85, 0.65)';

    switch (preset) {
      case 'bottom-right':
        maskCtx.fillRect(w - boxW - padding, h - boxH - padding, boxW, boxH);
        break;
      case 'bottom-left':
        maskCtx.fillRect(padding, h - boxH - padding, boxW, boxH);
        break;
      case 'top-right':
        maskCtx.fillRect(w - boxW - padding, padding, boxW, boxH);
        break;
      case 'top-left':
        maskCtx.fillRect(padding, padding, boxW, boxH);
        break;
    }
  }

  // Interactive Drawing on Mask
  function getCanvasCoords(e) {
    const rect = maskCanvas.getBoundingClientRect();
    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDrawing(e) {
    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    drawDot(coords.x, coords.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);

    maskCtx.strokeStyle = 'rgba(255, 0, 85, 0.65)';
    maskCtx.lineJoin = 'round';
    maskCtx.lineCap = 'round';
    maskCtx.lineWidth = parseFloat(brushSizeInput.value) * (maskCanvas.width / maskCanvas.getBoundingClientRect().width);

    maskCtx.beginPath();
    maskCtx.moveTo(lastX, lastY);
    maskCtx.lineTo(coords.x, coords.y);
    maskCtx.stroke();

    lastX = coords.x;
    lastY = coords.y;
  }

  function drawDot(x, y) {
    const radius = (parseFloat(brushSizeInput.value) / 2) * (maskCanvas.width / maskCanvas.getBoundingClientRect().width);
    maskCtx.fillStyle = 'rgba(255, 0, 85, 0.65)';
    maskCtx.beginPath();
    maskCtx.arc(x, y, radius, 0, Math.PI * 2);
    maskCtx.fill();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  maskCanvas.addEventListener('mousedown', startDrawing);
  maskCanvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  maskCanvas.addEventListener('touchstart', startDrawing, { passive: false });
  maskCanvas.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  // Inpainting Algorithm Engine (Multi-pass fast diffusion)
  btnProcess.addEventListener('click', runInpaintProcess);

  function runInpaintProcess() {
    setStatus('Processing image watermark inpainting...', 'busy');
    progressWrap.style.display = 'block';
    progressBar.style.width = '10%';
    btnProcess.disabled = true;

    setTimeout(() => {
      try {
        const width = imageCanvas.width;
        const height = imageCanvas.height;

        const imgData = imgCtx.getImageData(0, 0, width, height);
        const maskData = maskCtx.getImageData(0, 0, width, height);

        const pixels = imgData.data;
        const maskPixels = maskData.data;

        // Extract binary mask: true = area to erase
        const mask = new Uint8Array(width * height);
        let maskedCount = 0;
        for (let i = 0; i < width * height; i++) {
          if (maskPixels[i * 4 + 3] > 20) { // alpha > 20
            mask[i] = 1;
            maskedCount++;
          }
        }

        if (maskedCount === 0) {
          alert('Please select or draw over the watermark area first.');
          progressWrap.style.display = 'none';
          btnProcess.disabled = false;
          setStatus('No mask region selected.', 'warn');
          return;
        }

        progressBar.style.width = '30%';

        // Boundary propagation inpainting loop
        inpaintPixels(pixels, mask, width, height, () => {
          progressBar.style.width = '80%';
          
          // Put clean image data back
          imgCtx.putImageData(imgData, 0, 0);

          updateExportPreview(() => {
            progressBar.style.width = '100%';
            setTimeout(() => {
              progressWrap.style.display = 'none';
              resultContainer.style.display = 'block';
              btnProcess.disabled = false;
              setStatus('Watermark removed successfully!', 'ok');
              resultContainer.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          });
        });

      } catch (err) {
        console.error(err);
        alert('An error occurred during image processing.');
        btnProcess.disabled = false;
        progressWrap.style.display = 'none';
        setStatus('Processing failed.', 'error');
      }
    }, 50);
  }

  function inpaintPixels(pixels, mask, width, height, callback) {
    const maxPasses = 8;
    const workMask = new Uint8Array(mask);

    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (workMask[idx] === 1) {
            let r = 0, g = 0, b = 0, count = 0;

            // Check 8 neighbors
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nIdx = ny * width + nx;
                  if (workMask[nIdx] === 0) {
                    const weight = 1 / (dx * dx + dy * dy);
                    const p = nIdx * 4;
                    r += pixels[p] * weight;
                    g += pixels[p + 1] * weight;
                    b += pixels[p + 2] * weight;
                    count += weight;
                  }
                }
              }
            }

            if (count > 0) {
              const p = idx * 4;
              pixels[p] = Math.round(r / count);
              pixels[p + 1] = Math.round(g / count);
              pixels[p + 2] = Math.round(b / count);
              pixels[p + 3] = 255;
              workMask[idx] = 0; // Filled
              changed = true;
            }
          }
        }
      }

      if (!changed) break;
    }

    if (callback) callback();
  }

  // Update Result Preview & Export Download Link
  function updateExportPreview(onComplete) {
    const mimeType = exportFormatSelect.value;
    const ext = mimeType === 'image/jpeg' ? 'jpg' : (mimeType === 'image/webp' ? 'webp' : 'png');

    imageCanvas.toBlob((blob) => {
      if (resultObjectUrl) URL.revokeObjectURL(resultObjectUrl);
      resultObjectUrl = URL.createObjectURL(blob);
      imgResultPreview.src = resultObjectUrl;
      btnDownload.href = resultObjectUrl;
      btnDownload.download = `nisulka-gemini-cleaned.${ext}`;

      if (onComplete) onComplete();
    }, mimeType, 0.95);
  }

  exportFormatSelect.addEventListener('change', () => {
    if (resultObjectUrl) updateExportPreview();
  });

  // Reset Tool State
  btnReset.addEventListener('click', () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (resultObjectUrl) URL.revokeObjectURL(resultObjectUrl);
    objectUrl = null;
    resultObjectUrl = null;
    currentFile = null;
    originalImage = null;

    fileInput.value = '';
    dropzone.style.display = 'block';
    panel.style.display = 'none';
    resultContainer.style.display = 'none';
    setStatus('Ready for upload.', 'ok');
  });

  // Status Indicator
  function setStatus(msg, type) {
    statusText.textContent = msg;
    statusDot.className = 'sdot ' + (type || 'ok');
  }
});
