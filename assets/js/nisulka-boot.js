/* Loads the shared tool core once on tool pages. Safe to include anywhere. */
(function(){
  if(window.NisulkaTools) return;
  var s=document.createElement('script'); s.src='/Nisulka-Tools/assets/js/nisulka-tool-core.js'; s.defer=true; document.head.appendChild(s);
})();
