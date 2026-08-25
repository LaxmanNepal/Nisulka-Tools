/* Nisulka Tools Core v1 — shared utilities for all tools. */
(function (w) {
  'use strict';
  const NS = w.NisulkaTools = w.NisulkaTools || {};
  NS.version = '1.0.0';
  NS.storage = {
    get(key, fallback) { try { const v = localStorage.getItem('nisulka:' + key); return v === null ? fallback : JSON.parse(v); } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem('nisulka:' + key, JSON.stringify(value)); } catch (_) {} }
  };
  NS.toast = function (message, type) {
    let el = document.querySelector('[data-nisulka-toast]');
    if (!el) { el = document.createElement('div'); el.dataset.nisulkaToast = ''; el.className = 'nisulka-toast'; document.body.appendChild(el); }
    el.textContent = message; el.dataset.type = type || 'info'; el.classList.add('is-visible'); clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('is-visible'), 2800);
  };
  NS.downloadBlob = function (blob, filename) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename || 'download'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  NS.downloadDataURL = function (url, filename) { const a = document.createElement('a'); a.href = url; a.download = filename || 'download'; a.click(); };
  NS.favorites = {
    all() { return NS.storage.get('favorites', []); },
    has(slug) { return this.all().includes(slug); },
    toggle(slug) { const a = this.all(); const i = a.indexOf(slug); i >= 0 ? a.splice(i, 1) : a.push(slug); NS.storage.set('favorites', a); return i < 0; }
  };
  NS.history = {
    add(tool) { if (!tool || !tool.slug) return; let a = NS.storage.get('history', []); a = [tool].concat(a.filter(x => x.slug !== tool.slug)).slice(0, 12); NS.storage.set('history', a); },
    all() { return NS.storage.get('history', []); }
  };
  NS.analytics = function (event, data) {
    try { const payload = { event, data: data || {}, path: location.pathname, ts: Date.now() }; const a = NS.storage.get('events', []); a.push(payload); NS.storage.set('events', a.slice(-200)); } catch (_) {}
    w.dispatchEvent(new CustomEvent('nisulka:analytics', { detail: { event, data: data || {} } }));
  };
  NS.copy = async function (text) { try { await navigator.clipboard.writeText(text); NS.toast('Copied'); NS.analytics('copy'); return true; } catch (_) { NS.toast('Copy failed', 'error'); return false; } };
  NS.debounce = function (fn, wait) { let t; return function () { clearTimeout(t); const args = arguments; t = setTimeout(() => fn.apply(this, args), wait); }; };
})(window);
