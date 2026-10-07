var currentLang = 'zh';

// 站内页面索引（用于搜索）
var PAGES = [
    { url:'index.html', zh:'主页', 'zh-tw':'主頁', en:'Home' },
    { url:'furry-intro.html', zh:'Furry 兽迷文化', 'zh-tw':'Furry 獸迷文化', en:'Furry Fandom' },
    { url:'history.html', zh:'历史', 'zh-tw':'歷史', en:'History' },
    { url:'current-status.html', zh:'福瑞现状与反福瑞', 'zh-tw':'福瑞現狀與反福瑞', en:'Furry Status & Anti-Furry' },
    { url:'works.html', zh:'福瑞周边推荐', 'zh-tw':'福瑞周邊推薦', en:'Furry Merch' },
    { url:'studio.html', zh:'兽装工作室', 'zh-tw':'獸裝工作室', en:'Fursuit Studio' },
    { url:'con-info.html', zh:'站内合作兽聚', 'zh-tw':'站內合作獸聚', en:'Partner Conventions' },
    { url:'old-wiki.html', zh:'下架的Wiki列表', 'zh-tw':'下架的Wiki列表', en:'Delisted Wikis' },
    { url:'calendar.html', zh:'兽聚日期', 'zh-tw':'獸聚日期', en:'Con Calendar' },
    { url:'bilibili-up.html', zh:'B站UP主', 'zh-tw':'B站UP主', en:'Bilibili UP' },
    { url:'terminology.html', zh:'术语', 'zh-tw':'術語', en:'Terminology' },
    { url:'chat.html', zh:'群聊', 'zh-tw':'群聊', en:'Chat Groups' },
    { url:'编辑.html', zh:'编辑', 'zh-tw':'編輯', en:'Edit' },
    { url:'about.html', zh:'关于', 'zh-tw':'關於', en:'About' }
];

function getPageTitle(p){ return p[currentLang] || p.zh; }

// 内容索引缓存
var contentIndex = null;
var contentIndexLoading = false;
var contentIndexCallbacks = [];

function buildContentIndex(callback){
    // 优先使用预生成的静态索引（兼容 file:// 协议）
    if(typeof SEARCH_INDEX !== 'undefined'){
        var staticIndex = PAGES.map(function(p){
            return { page: p, text: SEARCH_INDEX[p.url] || '' };
        });
        contentIndex = staticIndex;
        if(callback) callback(contentIndex);
        return;
    }

    // fallback：运行时 fetch（仅 http:// 环境可用）
    if(contentIndex){
        if(callback) callback(contentIndex);
        return;
    }
    if(callback) contentIndexCallbacks.push(callback);
    if(contentIndexLoading) return;
    contentIndexLoading = true;

    var index = [];
    var loaded = 0;
    var total = PAGES.length;

    PAGES.forEach(function(p){
        fetch(p.url)
            .then(function(r){ return r.text(); })
            .then(function(html){
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var scripts = doc.querySelectorAll('script, style, nav, .lang-group, .theme-toggle-row');
                scripts.forEach(function(s){ s.remove(); });
                var text = (doc.body ? doc.body.innerText : '').replace(/\s+/g, ' ').trim();
                index.push({ page: p, text: text });
            })
            .catch(function(){
                index.push({ page: p, text: '' });
            })
            .finally(function(){
                loaded++;
                if(loaded === total){
                    contentIndex = index;
                    contentIndexLoading = false;
                    var cbs = contentIndexCallbacks.slice();
                    contentIndexCallbacks.length = 0;
                    cbs.forEach(function(cb){ cb(index); });
                }
            });
    });
}

function searchContent(q){
    q = (q||'').trim().toLowerCase();
    if(!q) return [];

    var results = [];

    // 先匹配标题
    PAGES.forEach(function(p){
        var title = getPageTitle(p).toLowerCase();
        if(title.indexOf(q) !== -1){
            results.push({ page: p, type: 'title', snippet: getPageTitle(p) });
        }
    });

    // 再匹配内容
    if(contentIndex){
        contentIndex.forEach(function(item){
            var text = item.text.toLowerCase();
            var pos = text.indexOf(q);
            if(pos !== -1){
                // 避免重复标题结果
                var already = results.some(function(r){ return r.page.url === item.page.url && r.type === 'title'; });
                if(!already){
                    var start = Math.max(0, pos - 20);
                    var end = Math.min(text.length, pos + q.length + 30);
                    var snippet = item.text.substring(start, end);
                    if(start > 0) snippet = '…' + snippet;
                    if(end < text.length) snippet = snippet + '…';
                    results.push({ page: item.page, type: 'content', snippet: snippet });
                }
            }
        });
    }

    return results.slice(0, 10);
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
        '<div id="site-search-results" style="display:none;max-height:320px;overflow-y:auto;background:rgba(255,255,255,0.98);border:1px solid rgba(120,120,130,0.25);border-radius:12px;padding:6px;box-shadow:0 4px 16px rgba(0,0,0,0.18);backdrop-filter:blur(6px);"></div>';
    document.body.appendChild(wrap);

    // 预加载内容索引
    buildContentIndex();

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

function highlightMatch(text, q){
    var lower = text.toLowerCase();
    var ql = q.toLowerCase();
    var pos = lower.indexOf(ql);
    if(pos === -1) return escapeHtml(text);
    var before = text.substring(0, pos);
    var match = text.substring(pos, pos + q.length);
    var after = text.substring(pos + q.length);
    return escapeHtml(before) + '<mark style="background:#ffe082;padding:0 2px;border-radius:3px;">' + escapeHtml(match) + '</mark>' + escapeHtml(after);
}

function escapeHtml(s){
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function onSearchInput(e){
    var q = e.target.value;
    var results = document.getElementById('site-search-results');
    if(!q.trim()){ results.style.display='none'; return; }

    // 如果索引未就绪，先只显示标题匹配，同时等待索引
    if(!contentIndex){
        buildContentIndex(function(){
            // 索引完成后重新触发搜索
            var input = document.getElementById('site-search-input');
            if(input && input.value.trim()){
                onSearchInput({ target: input });
            }
        });
    }

    var matches = searchContent(q);
    if(matches.length === 0){
        results.style.display = 'block';
        results.innerHTML = '<div style="padding:10px;color:#999;font-size:13px;text-align:center;">' + (currentLang==='en'?'No results':'无匹配结果') + '</div>';
        return;
    }
    results.style.display = 'block';
    results.innerHTML = matches.map(function(r){
        var icon = r.type === 'title' ? '📄' : '📝';
        var snippetHtml = r.type === 'title'
            ? '<div style="font-weight:600;">' + highlightMatch(getPageTitle(r.page), q) + '</div>'
            : '<div style="font-weight:600;">' + escapeHtml(getPageTitle(r.page)) + '</div><div style="font-size:11px;color:#666;margin-top:2px;line-height:1.4;">' + highlightMatch(r.snippet, q) + '</div>';
        return '<a href="'+r.page.url+'" style="display:block;padding:8px 12px;color:#333;text-decoration:none;border-radius:8px;font-size:13px;" onmouseover="this.style.background=\'rgba(0,0,0,0.06)\'" onmouseout="this.style.background=\'transparent\'">' +
            icon + ' ' + snippetHtml + '</a>';
    }).join('');
}

function onSearchKey(e){
    if(e.key === 'Enter'){ doSearch(); }
}

function doSearch(){
    var input = document.getElementById('site-search-input');
    var q = input.value.trim();
    if(!q) return;
    var matches = searchContent(q);
    if(matches.length > 0){
        window.location.href = matches[0].page.url;
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