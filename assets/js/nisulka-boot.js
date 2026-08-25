/* Nisulka shared runtime bootstrap. Safe to include on every tool page. */
(function () {
  'use strict';
  var base = '/Nisulka-Tools/';
  function load(kind, href) {
    if (document.querySelector('[data-nisulka-' + kind + ']')) return;
    if (kind === 'css') {
      var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; link.dataset.nisulkaCss = ''; document.head.appendChild(link); return;
    }
    var script = document.createElement('script'); script.src = href; script.defer = true; script.dataset.nisulkaScript = ''; document.head.appendChild(script);
  }
  load('css', base + 'assets/css/nisulka-tool-core.css');
  load('script', base + 'assets/js/nisulka-tool-core.js');
})();
