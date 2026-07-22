var currentLang = 'zh';

function initTheme(){
    console.log('initTheme called');
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeBtn(theme);
    console.log('initTheme done, theme:', theme);
}

function toggleTheme(){
    console.log('toggleTheme called');
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var newTheme = current === 'dark' ? 'light' : 'dark';
    console.log('toggleTheme: current=', current, 'new=', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeBtn(newTheme);
    console.log('toggleTheme done');
}

function updateThemeBtn(theme){
    var btn = document.getElementById('themeToggle');
    if(btn){
        if(theme === 'dark'){
            btn.innerHTML = '☀️ 亮色模式';
        }else{
            btn.innerHTML = '🌙 深色模式';
        }
    }
}

function initColorblind(){
    var saved = localStorage.getItem('colorblind');
    var colorblind = saved === 'true';
    document.documentElement.setAttribute('data-colorblind', colorblind);
    updateColorblindBtn(colorblind);
}

function toggleColorblind(){
    console.log('toggleColorblind called');
    var current = document.documentElement.getAttribute('data-colorblind') === 'true';
    var newColorblind = !current;
    console.log('toggleColorblind: current=', current, 'new=', newColorblind);
    document.documentElement.setAttribute('data-colorblind', newColorblind);
    localStorage.setItem('colorblind', newColorblind);
    updateColorblindBtn(newColorblind);
    console.log('toggleColorblind done');
}

function updateColorblindBtn(colorblind){
    var btn = document.getElementById('colorblindToggle');
    if(btn){
        if(colorblind){
            btn.innerHTML = '🔴 色盲模式';
            btn.style.borderColor = '#f59e0b';
            btn.style.background = 'rgba(245,158,11,0.15)';
        }else{
            btn.innerHTML = '👁️ 正常模式';
            btn.style.borderColor = '';
            btn.style.background = '';
        }
    }
}

function switchLang(l){
    currentLang = l;
    localStorage.setItem('lang', l);
    document.querySelectorAll('.lang-btn').forEach(function(b){
        b.classList.remove('active');
        if(b.dataset.lang === l) b.classList.add('active');
    });
    if(typeof updateContent === 'function'){
        updateContent();
    }
}

function initLang(){
    var saved = localStorage.getItem('lang');
    var lang = saved || 'zh';
    switchLang(lang);
}

function initNav(){
    var currentPage = window.location.pathname.split('/').pop();
    if(currentPage === '') currentPage = 'index.html';
    var navMap = {
        'index.html': 'nav-home',
        'furry-intro.html': 'nav-intro',
        'characters.html': 'nav-characters',
        'history.html': 'nav-history',
        'current-status.html': 'nav-status',
        'works.html': 'nav-works',
        'old-wiki.html': 'nav-oldwiki',
        'calendar.html': 'nav-calendar',
        'fursuit-tv.html': 'nav-tv',
        'gallery.html': 'nav-gallery',
        'bilibili-up.html': 'nav-bilibili',
        'terminology.html': 'nav-terminology',
        'contribute.html': 'nav-contribute',
        'about.html': 'nav-about'
    };
    var navId = navMap[currentPage];
    if(navId){
        var activeLink = document.getElementById(navId);
        if(activeLink) activeLink.classList.add('active');
    }
}

console.log('=== common.js loaded ===');
console.log('document.readyState:', document.readyState);

if(document.readyState === 'loading'){
    console.log('Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', function(){
        console.log('DOMContentLoaded fired');
        initTheme();
        initColorblind();
        initLang();
        initNav();
    });
}else{
    console.log('DOM already ready, initializing...');
    initTheme();
    initColorblind();
    initLang();
    initNav();
}