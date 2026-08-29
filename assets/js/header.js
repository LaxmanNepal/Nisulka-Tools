(function () {
    "use strict";

    const BASE = "/Nisulka-Tools/";
    const SEARCH_PAGE = `${BASE}search.html`;
    const headerHTML = `
        <header class="site-header" id="site-header">
            <div class="container header-inner">
                <a href="${BASE}" class="site-logo" aria-label="Nisulka Tools home"><span class="site-logo-mark" aria-hidden="true">N</span><span class="site-logo-text">Nisulka Tools</span></a>
                <nav class="site-nav" id="site-nav" aria-label="Main navigation">
                    <a href="${BASE}" class="nav-link" data-nav="home">Home</a>
                    <a href="${BASE}#tools" class="nav-link" data-nav="tools">All Tools</a>
                    <a href="${BASE}#categories" class="nav-link" data-nav="categories">Categories</a>
                    <a href="${BASE}#about" class="nav-link" data-nav="about">About</a>
                </nav>
                <div class="header-actions">
                    <form class="header-search" id="header-search-form" role="search"><button type="button" class="header-search-trigger" id="header-search-trigger" aria-label="Open search"><span class="header-search-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg></span></button><input id="header-search-input" type="search" placeholder="Search..." aria-label="Search tools" autocomplete="off" spellcheck="false"></form>
                    <button type="button" class="header-icon-button" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode"><span id="theme-icon" aria-hidden="true">☾</span></button>
                    <button type="button" class="mobile-menu-button" id="mobile-menu-button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>
                </div>
            </div>
        </header>`;

    function initializeHeader() {
        const mount = document.getElementById("site-header-mount");
        if (!mount) return;
        mount.innerHTML = headerHTML;
        initializeTheme(); initializeMobileMenu(); initializeActiveNavigation(); initializeHeaderSearch(); initializeStickyState();
    }
    function initializeStickyState() {
        const header = document.getElementById("site-header"); if (!header) return;
        const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
        update(); window.addEventListener("scroll", update, {passive:true});
    }
    function initializeHeaderSearch() {
        const form=document.getElementById("header-search-form"), input=document.getElementById("header-search-input"), trigger=document.getElementById("header-search-trigger"); if(!form||!input||!trigger)return;
        const q=new URLSearchParams(location.search).get("q"); if(q)input.value=q;
        const close=()=>{if(innerWidth<=767&&!input.value.trim()){form.classList.remove("is-expanded");trigger.setAttribute("aria-label","Open search")}};
        trigger.addEventListener("click",e=>{e.preventDefault();if(innerWidth<=767&&!form.classList.contains("is-expanded")){form.classList.add("is-expanded");trigger.setAttribute("aria-label","Close search");requestAnimationFrame(()=>input.focus())}else input.focus()});
        form.addEventListener("submit",e=>{e.preventDefault();navigateToSearch(input.value)});
        input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();navigateToSearch(input.value)}if(e.key==="Escape"){input.value="";input.blur();close()}});
        input.addEventListener("focus",()=>{form.classList.add("is-focused");if(innerWidth<=767)form.classList.add("is-expanded")});
        input.addEventListener("blur",()=>{form.classList.remove("is-focused");setTimeout(close,120)});
        addEventListener("resize",()=>{if(innerWidth>767)form.classList.remove("is-expanded")});
    }
    function navigateToSearch(query){const clean=String(query||"").trim();location.href=clean?`${SEARCH_PAGE}?q=${encodeURIComponent(clean)}`:SEARCH_PAGE}
    function initializeTheme(){const t=document.getElementById("theme-toggle"),i=document.getElementById("theme-icon");if(!t||!i)return;const saved=localStorage.getItem("nisulka-theme"),dark=matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches;setTheme(saved||(dark?"dark":"light"));t.addEventListener("click",()=>setTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"));function setTheme(theme){if(theme==="dark"){document.documentElement.setAttribute("data-theme","dark");i.textContent="☀";t.setAttribute("aria-label","Switch to light mode")}else{document.documentElement.removeAttribute("data-theme");i.textContent="☾";t.setAttribute("aria-label","Switch to dark mode")}localStorage.setItem("nisulka-theme",theme)}}
    function initializeMobileMenu(){const b=document.getElementById("mobile-menu-button"),n=document.getElementById("site-nav");if(!b||!n)return;b.addEventListener("click",()=>{const open=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",String(!open));n.classList.toggle("is-open",!open);document.body.classList.toggle("menu-open",!open)});n.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{b.setAttribute("aria-expanded","false");n.classList.remove("is-open");document.body.classList.remove("menu-open")}))}
    function initializeActiveNavigation(){const path=location.pathname.replace(/\/+$/,"/");document.querySelectorAll(".site-nav .nav-link").forEach(a=>a.classList.remove("active"));if(path===BASE||path===BASE+"index.html")document.querySelector('[data-nav="home"]')?.classList.add("active");else if(path.includes("/categories/"))document.querySelector('[data-nav="categories"]')?.classList.add("active");else if(path.includes("/tools/")||location.hash==="#tools")document.querySelector('[data-nav="tools"]')?.classList.add("active");}
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializeHeader);else initializeHeader();
})();
