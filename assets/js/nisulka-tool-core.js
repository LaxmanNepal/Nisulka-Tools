/* Nisulka Tools Core v2 — shared, privacy-first utilities. */
(function (w) {
  'use strict';
  const NS = w.NisulkaTools = w.NisulkaTools || {};
  NS.version = '2.0.0';
  const PREFIX = 'nisulka:';
  NS.storage = {
    get(key, fallback) { try { const raw = localStorage.getItem(PREFIX + key); return raw === null ? fallback : JSON.parse(raw); } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch (_) { return false; } },
    remove(key) { try { localStorage.removeItem(PREFIX + key); } catch (_) {} }
  };
  NS.toast = function (message, type) { let el = document.querySelector('[data-nisulka-toast]'); if (!el) { el = document.createElement('div'); el.dataset.nisulkaToast = ''; el.className = 'nisulka-toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); } el.textContent = String(message || ''); el.dataset.type = type || 'info'; el.classList.add('is-visible'); clearTimeout(el._timer); el._timer = setTimeout(() => el.classList.remove('is-visible'), 2800); };
  NS.downloadBlob = function (blob, filename) { if (!blob) return false; const a = document.createElement('a'); const url = URL.createObjectURL(blob); a.href = url; a.download = filename || 'download'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); return true; };
  NS.downloadDataURL = function (url, filename) { if (!url) return false; const a = document.createElement('a'); a.href = url; a.download = filename || 'download'; document.body.appendChild(a); a.click(); a.remove(); return true; };
  NS.favorites = { all() { return NS.storage.get('favorites', []); }, has(slug) { return this.all().includes(String(slug)); }, toggle(slug) { slug = String(slug || ''); if (!slug) return false; const a = this.all(); const i = a.indexOf(slug); if (i >= 0) a.splice(i, 1); else a.unshift(slug); NS.storage.set('favorites', a.slice(0, 100)); return i < 0; } };
  NS.history = { add(tool) { if (!tool || !tool.slug) return; let a = NS.storage.get('history', []); a = [tool].concat(a.filter(x => x && x.slug !== tool.slug)).slice(0, 20); NS.storage.set('history', a); }, all() { return NS.storage.get('history', []); }, clear() { NS.storage.remove('history'); } };
  NS.analytics = function (event, data) { if (NS.storage.get('analyticsDisabled', false)) return; try { const payload = { event: String(event || 'event'), data: data || {}, path: location.pathname, ts: Date.now() }; const a = NS.storage.get('events', []); a.push(payload); NS.storage.set('events', a.slice(-200)); } catch (_) {} try { w.dispatchEvent(new CustomEvent('nisulka:analytics', { detail: { event, data: data || {} } })); } catch (_) {} };
  NS.analytics.disable = function () { NS.storage.set('analyticsDisabled', true); NS.storage.remove('events'); };
  NS.analytics.enable = function () { NS.storage.set('analyticsDisabled', false); };
  NS.copy = async function (text) { try { if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(String(text)); else { const ta = document.createElement('textarea'); ta.value = String(text); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } NS.toast('Copied', 'success'); NS.analytics('copy'); return true; } catch (_) { NS.toast('Copy failed', 'error'); return false; } };
  NS.debounce = function (fn, wait) { let t; return function () { clearTimeout(t); const args = arguments; t = setTimeout(() => fn.apply(this, args), wait); }; };
  NS.escapeHTML = function (value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;'); };
  NS.isTypingTarget = function (el) { const tag = el && el.tagName ? el.tagName.toLowerCase() : ''; return tag === 'input' || tag === 'textarea' || tag === 'select' || !!(el && el.isContentEditable); };
  NS.markToolUsed = function (tool) { NS.history.add(tool); NS.analytics('tool_use', { slug: tool && tool.slug, name: tool && tool.name }); };
  NS.registerGlobalErrorHandling = function () { if (NS._errorsRegistered) return; NS._errorsRegistered = true; w.addEventListener('error', e => NS.analytics('js_error', { message: e.message, source: e.filename, line: e.lineno })); w.addEventListener('unhandledrejection', e => NS.analytics('promise_error', { message: String(e.reason && e.reason.message || e.reason || 'Unknown rejection') })); };
  NS.registerGlobalErrorHandling();
})(window);
