var currentLang = 'zh';

var NAV_DATA = {
    'nav-home': { zh:'主页', 'zh-tw':'主頁', en:'Home' },
    'nav-intro': { zh:'Furry (兽迷文化)', 'zh-tw':'Furry (獸迷文化)', en:'Furry (Furry Fandom)' },
    'nav-characters': { zh:'角色', 'zh-tw':'角色', en:'Characters' },
    'nav-history': { zh:'历史', 'zh-tw':'歷史', en:'History' },
    'nav-status': { zh:'福瑞现状与反福瑞', 'zh-tw':'福瑞現狀與反福瑞', en:'Furry Status & Anti-Furry' },
    'nav-works': { zh:'福瑞周边推荐', 'zh-tw':'福瑞周邊推薦', en:'Furry Merch' },
    'nav-studio': { zh:'兽装工作室', 'zh-tw':'獸裝工作室', en:'Fursuit Studio' },
    'nav-coninfo': { zh:'兽聚信息', 'zh-tw':'獸聚資訊', en:'Con Info' },
    'nav-oldwiki': { zh:'旧Wiki档案', 'zh-tw':'舊Wiki檔案', en:'Old Wiki' },
    'nav-calendar': { zh:'兽聚日期', 'zh-tw':'獸聚日期', en:'Con Calendar' },

    'nav-gallery': { zh:'绘画作品', 'zh-tw':'繪畫作品', en:'Art Gallery' },
    'nav-bilibili': { zh:'B站UP主', 'zh-tw':'B站UP主', en:'Bilibili UP' },
    'nav-terminology': { zh:'术语', 'zh-tw':'術語', en:'Terminology' },
    'nav-chat': { zh:'群聊', 'zh-tw':'群聊', en:'Chat Groups' },
    'nav-contribute': { zh:'编辑', 'zh-tw':'編輯', en:'Edit' },
    'nav-about': { zh:'关于', 'zh-tw':'關於', en:'About' },
};

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
            btn.innerHTML = currentLang === 'zh' ? '☀️ 亮色模式' : currentLang === 'zh-tw' ? '☀️ 亮色模式' : '☀️ Light Mode';
        }else{
            btn.innerHTML = currentLang === 'zh' ? '🌙 深色模式' : currentLang === 'zh-tw' ? '🌙 深色模式' : '🌙 Dark Mode';
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
            btn.innerHTML = currentLang === 'zh' ? '🔴 色盲模式' : currentLang === 'zh-tw' ? '🔴 色盲模式' : '🔴 Colorblind Mode';
            btn.style.borderColor = '#f59e0b';
            btn.style.background = 'rgba(245,158,11,0.15)';
        }else{
            btn.innerHTML = currentLang === 'zh' ? '👁️ 正常模式' : currentLang === 'zh-tw' ? '👁️ 正常模式' : '👁️ Normal Mode';
            btn.style.borderColor = '';
            btn.style.background = '';
        }
    }
}

function switchLang(l){
    console.log('switchLang called with:', l);
    currentLang = l;
    localStorage.setItem('lang', l);
    document.querySelectorAll('.lang-btn').forEach(function(b){
        b.classList.remove('active');
        if(b.dataset.lang === l) b.classList.add('active');
    });
    document.querySelectorAll('nav a[id^="nav-"]').forEach(function(el){
        if(NAV_DATA[el.id]){
            console.log('Updating nav text for', el.id, 'to', NAV_DATA[el.id][l]);
            el.textContent = NAV_DATA[el.id][l];
        }
    });
    var els = document.querySelectorAll('[data-zh]');
    console.log('Found', els.length, 'elements with data-zh attribute');
    els.forEach(function(el){
        var key = 'zh';
        if(l === 'zh-tw') key = 'zhtw';
        else if(l === 'en') key = 'en';
        if(el.dataset[key]){
            console.log('Updating text for', el.textContent, 'to', el.dataset[key]);
            el.textContent = el.dataset[key];
        }
    });
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeBtn(theme);
    var colorblind = document.documentElement.getAttribute('data-colorblind') === 'true';
    updateColorblindBtn(colorblind);
    if(typeof updateContent === 'function'){
        updateContent();
    }
    if(typeof updatePageLang === 'function'){
        updatePageLang(l);
    }
    console.log('switchLang done');
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
        'studio.html': 'nav-studio',
        'con-info.html': 'nav-coninfo',
        'con-detail.html': '',
        'old-wiki.html': 'nav-oldwiki',
        'calendar.html': 'nav-calendar',
        'gallery.html': 'nav-gallery',
        'bilibili-up.html': 'nav-bilibili',
        'terminology.html': 'nav-terminology',
        'contribute.html': 'nav-contribute',
        '编辑.html': 'nav-contribute',
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