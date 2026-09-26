var currentLang = 'zh';

// 站内页面索引（用于搜索）
var PAGES = [
    { url:'index.html', zh:'主页', 'zh-tw':'主頁', en:'Home', keywords:['首页','home','主页'] },
    { url:'furry-intro.html', zh:'Furry 兽迷文化', 'zh-tw':'Furry 獸迷文化', en:'Furry Fandom', keywords:['福瑞','furry','兽迷','兽人','文化','介绍'] },
    { url:'history.html', zh:'历史', 'zh-tw':'歷史', en:'History', keywords:['福瑞历史','发展史','时间线'] },
    { url:'current-status.html', zh:'福瑞现状与反福瑞', 'zh-tw':'福瑞現狀與反福瑞', en:'Furry Status & Anti-Furry', keywords:['现状','反福瑞','污名化','网暴','小鹏','豪城'] },
    { url:'works.html', zh:'福瑞周边推荐', 'zh-tw':'福瑞周邊推薦', en:'Furry Merch', keywords:['漫画','小说','游戏','兽频道','识兽','周边','作品'] },
    { url:'studio.html', zh:'兽装工作室', 'zh-tw':'獸裝工作室', en:'Fursuit Studio', keywords:['兽装','fursuit','工作室','定制','毛装'] },
    { url:'con-info.html', zh:'站内合作兽聚', 'zh-tw':'站內合作獸聚', en:'Partner Conventions', keywords:['兽聚','展会','狸想城','兽展','活动'] },
    { url:'old-wiki.html', zh:'下架的Wiki列表', 'zh-tw':'下架的Wiki列表', en:'Delisted Wikis', keywords:['wiki','下架','旧wiki','wikifur'] },
    { url:'calendar.html', zh:'兽聚日期', 'zh-tw':'獸聚日期', en:'Con Calendar', keywords:['日历','日期','兽聚','展会','时间'] },
    { url:'bilibili-up.html', zh:'B站UP主', 'zh-tw':'B站UP主', en:'Bilibili UP', keywords:['b站','up主','视频','画师','博主'] },
    { url:'terminology.html', zh:'术语', 'zh-tw':'術語', en:'Terminology', keywords:['术语','名词','解释','定义'] },
    { url:'chat.html', zh:'群聊', 'zh-tw':'群聊', en:'Chat Groups', keywords:['qq群','群聊','社群','交流'] },
    { url:'编辑.html', zh:'编辑', 'zh-tw':'編輯', en:'Edit', keywords:['编辑','投稿','反馈','贡献'] },
    { url:'about.html', zh:'关于', 'zh-tw':'關於', en:'About', keywords:['关于','介绍','联系'] }
];

function getPageTitle(p){ return p[currentLang] || p.zh; }

function searchPages(q){
    q = (q||'').trim().toLowerCase();
    if(!q) return [];
    return PAGES.filter(function(p){
        var title = getPageTitle(p).toLowerCase();
        if(title.indexOf(q) !== -1) return true;
        return (p.keywords||[]).some(function(k){ return k.toLowerCase().indexOf(q) !== -1; });
    }).slice(0, 8);
}

function renderSearchBox(){
    var currentPage = window.location.pathname.split('/').pop();
    if(currentPage === 'bilibili-up.html') return;
    if(document.getElementById('search-box-wrap')) return;

    var wrap = document.createElement('div');
    wrap.id = 'search-box-wrap';
    wrap.style.cssText = 'position:fixed;top:16px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:4px;';
    wrap.innerHTML =
        '<div style="display:flex;gap:6px;align-items:center;">' +
        '  <input id="site-search-input" type="text" placeholder="' + (currentLang==='en'?'Search...':'搜索站内…') + '" style="width:180px;padding:8px 14px;border-radius:20px;border:1px solid rgba(120,120,130,0.4);background:rgba(255,255,255,0.85);color:#222;font-size:13px;outline:none;box-shadow:0 2px 8px rgba(0,0,0,0.12);" oninput="onSearchInput(event)" onkeydown="onSearchKey(event)" onfocus="onSearchInput(event)">' +
        '  <button id="site-search-btn" onclick="doSearch()" style="padding:8px 14px;border-radius:20px;border:none;background:var(--accent,#57c3ff);color:#fff;cursor:pointer;font-size:13px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.12);">🔍</button>' +
        '</div>' +
        '<div id="site-search-results" style="display:none;max-height:280px;overflow-y:auto;background:rgba(255,255,255,0.98);border:1px solid rgba(120,120,130,0.25);border-radius:12px;padding:6px;box-shadow:0 4px 16px rgba(0,0,0,0.18);backdrop-filter:blur(6px);"></div>';
    document.body.appendChild(wrap);

    // 点击外部关闭下拉
    document.addEventListener('click', function(e){
        var wrap = document.getElementById('search-box-wrap');
        if(!wrap) return;
        if(!wrap.contains(e.target)){
            var r = document.getElementById('site-search-results');
            if(r) r.style.display = 'none';
        }
    });
}

function onSearchInput(e){
    var q = e.target.value;
    var results = document.getElementById('site-search-results');
    if(!q.trim()){ results.style.display='none'; return; }
    var matches = searchPages(q);
    if(matches.length === 0){
        results.style.display = 'block';
        results.innerHTML = '<div style="padding:10px;color:#999;font-size:13px;text-align:center;">' + (currentLang==='en'?'No results':'无匹配结果') + '</div>';
        return;
    }
    results.style.display = 'block';
    results.innerHTML = matches.map(function(p){
        return '<a href="'+p.url+'" style="display:block;padding:8px 12px;color:#333;text-decoration:none;border-radius:8px;font-size:13px;" onmouseover="this.style.background=\'rgba(0,0,0,0.06)\'" onmouseout="this.style.background=\'transparent\'">'+getPageTitle(p)+'</a>';
    }).join('');
}

function onSearchKey(e){
    if(e.key === 'Enter'){ doSearch(); }
}

function doSearch(){
    var input = document.getElementById('site-search-input');
    var q = input.value.trim();
    if(!q) return;
    var matches = searchPages(q);
    if(matches.length > 0){
        window.location.href = matches[0].url;
    }
}

var NAV_DATA = {
    'nav-home': { zh:'主页', 'zh-tw':'主頁', en:'Home' },
    'nav-intro': { zh:'Furry (兽迷文化)', 'zh-tw':'Furry (獸迷文化)', en:'Furry (Furry Fandom)' },
    'nav-characters': { zh:'角色', 'zh-tw':'角色', en:'Characters' },
    'nav-history': { zh:'历史', 'zh-tw':'歷史', en:'History' },
    'nav-status': { zh:'福瑞现状与反福瑞', 'zh-tw':'福瑞現狀與反福瑞', en:'Furry Status & Anti-Furry' },
    'nav-works': { zh:'福瑞周边推荐', 'zh-tw':'福瑞周邊推薦', en:'Furry Merch' },
    'nav-studio': { zh:'兽装工作室', 'zh-tw':'獸裝工作室', en:'Fursuit Studio' },
    'nav-coninfo': { zh:'站内合作兽聚', 'zh-tw':'站內合作獸聚', en:'Partner Conventions' },
    'nav-oldwiki': { zh:'下架的Wiki列表', 'zh-tw':'下架的Wiki列表', en:'Delisted Wikis' },
    'nav-calendar': { zh:'兽聚日期', 'zh-tw':'獸聚日期', en:'Con Calendar' },

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
    // 更新搜索框占位符
    var searchInput = document.getElementById('site-search-input');
    if(searchInput){
        searchInput.placeholder = l === 'en' ? 'Search...' : '搜索站内…';
    }
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
        'con-detail.html': 'nav-coninfo',
        'old-wiki.html': 'nav-oldwiki',
        'calendar.html': 'nav-calendar',
        'bilibili-up.html': 'nav-bilibili',
        'terminology.html': 'nav-terminology',
        'chat.html': 'nav-chat',
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
        renderSearchBox();
    });
}else{
    console.log('DOM already ready, initializing...');
    initTheme();
    initColorblind();
    initLang();
    initNav();
    renderSearchBox();
}