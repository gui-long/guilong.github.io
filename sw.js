// FurryWiki Service Worker
// 策略：
//  1. HTML 页面：网络优先，但最多等 2.5 秒；超时/失败立刻用缓存兜底（弱网可用）
//  2. 带版本号的静态资源（common.js?v=…）：缓存优先
//  3. 其它请求：直接走网络，不介入

var CACHE = 'furrywiki-v1';
var NETWORK_TIMEOUT = 2500;

self.addEventListener('install', function(e){
    self.skipWaiting();
});

self.addEventListener('activate', function(e){
    e.waitUntil(
        caches.keys().then(function(keys){
            return Promise.all(keys.map(function(k){
                if(k !== CACHE) return caches.delete(k);
            }));
        }).then(function(){ return self.clients.claim(); })
    );
});

function fetchWithTimeout(request, ms){
    return new Promise(function(resolve, reject){
        var timer = setTimeout(function(){ reject(new Error('timeout')); }, ms);
        fetch(request).then(function(resp){
            clearTimeout(timer);
            resolve(resp);
        }).catch(function(err){
            clearTimeout(timer);
            reject(err);
        });
    });
}

self.addEventListener('fetch', function(e){
    var req = e.request;
    if(req.method !== 'GET') return;

    var url = new URL(req.url);
    if(url.origin !== self.location.origin) return;

    // HTML 页面：网络优先 + 超时兜底
    var isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').indexOf('text/html') !== -1;

    if(isHTML){
        e.respondWith(
            fetchWithTimeout(req, NETWORK_TIMEOUT)
                .then(function(resp){
                    if(resp && resp.ok){
                        var copy = resp.clone();
                        caches.open(CACHE).then(function(c){ c.put(req, copy); });
                    }
                    return resp;
                })
                .catch(function(){
                    return caches.match(req).then(function(hit){
                        if(hit) return hit;
                        return fetch(req);
                    });
                })
        );
        return;
    }

    // 带版本号的本地资源：缓存优先
    if(/\.(js|css)$/.test(url.pathname) && url.search.indexOf('v=') !== -1){
        e.respondWith(
            caches.match(req).then(function(hit){
                if(hit) return hit;
                return fetch(req).then(function(resp){
                    if(resp && resp.ok){
                        var copy = resp.clone();
                        caches.open(CACHE).then(function(c){ c.put(req, copy); });
                    }
                    return resp;
                });
            })
        );
    }
});
