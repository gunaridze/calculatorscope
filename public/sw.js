// Service Worker для PWA CalculatorScope
// Production-ready реализация с улучшенным кэшированием

const CACHE_VERSION = 'v2'
const CACHE_NAME = `calculatorscope-${CACHE_VERSION}`
const STATIC_CACHE_NAME = `calculatorscope-static-${CACHE_VERSION}`

// Критические ресурсы для установки
const CRITICAL_ASSETS = [
    '/',
    '/offline.html',
    '/calculatorscope-logo.svg',
    // PWA Icons - стандартные
    '/widget-96.png',
    '/widget-144.png',
    '/widget-192.png',
    '/widget-384.png',
    '/widget-512.png',
    // PWA Icons - maskable для Android
    '/widget-maskable-190.png',
    '/widget-maskable-512.png',
    // Apple Touch Icons
    '/widget-apple-120.png',
    '/widget-apple-152.png',
    '/widget-apple-180.png',
    // UI Icons
    '/burger.svg',
    '/burger-close.svg'
]

// Расширения файлов, которые кэшируются как статика (Cache First)
const STATIC_EXTENSIONS = [
    '.js', '.css', '.woff', '.woff2', '.ttf', '.eot',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.ico', '.pdf'
]

// Пути, которые всегда должны использовать Network First
const NETWORK_FIRST_PATHS = [
    '/api/',
    '/_next/',
    '/manifest'
]

// Проверка, является ли запрос статическим ресурсом
function isStaticAsset(url) {
    const urlPath = new URL(url).pathname
    return STATIC_EXTENSIONS.some(ext => urlPath.endsWith(ext))
}

// Проверка, должен ли запрос использовать Network First
function shouldUseNetworkFirst(url) {
    return NETWORK_FIRST_PATHS.some(path => url.includes(path))
}

// Проверка, является ли запрос HTML страницей
function isHTMLRequest(request) {
    const acceptHeader = request.headers.get('accept')
    return acceptHeader && acceptHeader.includes('text/html')
}

// ========== INSTALL EVENT ==========
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...', CACHE_NAME)
    
    event.waitUntil(
        Promise.all([
            // Кэшируем критические ресурсы
            caches.open(CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching critical assets')
                return cache.addAll(CRITICAL_ASSETS.map(url => new Request(url, { cache: 'reload' })))
                    .catch((err) => {
                        console.warn('[Service Worker] Some critical assets failed to cache:', err)
                        // Не прерываем установку, если некоторые ресурсы не кэшировались
                        return Promise.resolve()
                    })
            }),
            // Создаем кэш для статических ресурсов
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Static cache ready')
                return cache
            })
        ]).then(() => {
            console.log('[Service Worker] Installation complete')
            // Принудительно активируем новый Service Worker
            return self.skipWaiting()
        })
    )
})

// ========== ACTIVATE EVENT ==========
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...', CACHE_NAME)
    
    event.waitUntil(
        Promise.all([
            // Удаляем старые кэши
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name !== CACHE_NAME && 
                                   name !== STATIC_CACHE_NAME &&
                                   name.startsWith('calculatorscope-')
                        })
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name)
                            return caches.delete(name)
                        })
                )
            }),
            // Берем контроль над всеми открытыми страницами
            self.clients.claim()
        ]).then(() => {
            console.log('[Service Worker] Activation complete')
        })
    )
})

// ========== FETCH EVENT ==========
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)
    
    // Пропускаем неподдерживаемые методы
    if (request.method !== 'GET') {
        return
    }
    
    // Пропускаем chrome-extension и другие внешние протоколы
    if (!url.protocol.startsWith('http')) {
        return
    }
    
    // Network First для API и динамического контента
    if (shouldUseNetworkFirst(url.href)) {
        event.respondWith(networkFirstStrategy(request, CACHE_NAME))
        return
    }
    
    // Cache First для статических ресурсов
    if (isStaticAsset(url.href)) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME))
        return
    }
    
    // Stale While Revalidate для HTML страниц
    if (isHTMLRequest(request)) {
        event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAME))
        return
    }
    
    // По умолчанию: Network First с fallback к кэшу
    event.respondWith(networkFirstStrategy(request, CACHE_NAME))
})

// ========== CACHING STRATEGIES ==========

/**
 * Network First Strategy
 * Пытается загрузить из сети, при ошибке возвращает из кэша
 * Подходит для: API запросы, динамический контент
 */
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request)
        
        // Кэшируем успешные ответы (кроме ошибок)
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName)
            // Клонируем ответ, так как он может быть использован только один раз
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('[Service Worker] Failed to cache response:', err)
            })
        }
        
        return networkResponse
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url)
        const cachedResponse = await caches.match(request)
        
        if (cachedResponse) {
            return cachedResponse
        }
        
        // Если это HTML запрос и нет кэша, возвращаем offline страницу
        if (isHTMLRequest(request)) {
            return getOfflineFallback()
        }
        
        // Для других типов возвращаем ошибку
        throw error
    }
}

/**
 * Cache First Strategy
 * Сначала проверяет кэш, при отсутствии загружает из сети и кэширует
 * Подходит для: статические ресурсы (изображения, шрифты, CSS, JS)
 */
async function cacheFirstStrategy(request, cacheName) {
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
        return cachedResponse
    }
    
    try {
        const networkResponse = await fetch(request)
        
        // Кэшируем успешные ответы
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName)
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('[Service Worker] Failed to cache static asset:', err)
            })
        }
        
        return networkResponse
    } catch (error) {
        console.warn('[Service Worker] Failed to fetch static asset:', request.url, error)
        
        // Для изображений можно вернуть placeholder, но пока просто возвращаем ошибку
        // В будущем можно добавить placeholder изображения
        throw error
    }
}

/**
 * Stale While Revalidate Strategy
 * Сразу возвращает из кэша (если есть), но обновляет кэш в фоне
 * Подходит для: HTML страницы
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cachedResponse = await caches.match(request)
    
    // Запускаем обновление кэша в фоне
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('[Service Worker] Failed to update cache:', err)
            })
        }
        return networkResponse
    }).catch(() => {
        // Игнорируем ошибки сети в фоновом обновлении
    })
    
    // Возвращаем кэш или сетевой ответ
    return cachedResponse || fetchPromise
}

/**
 * Offline Fallback
 * Возвращает HTML страницу для offline режима
 */
async function getOfflineFallback() {
    const cache = await caches.open(CACHE_NAME)
    const offlinePage = await cache.match('/offline.html')
    
    if (offlinePage) {
        return offlinePage
    }
    
    // Если offline страницы нет, создаем простую HTML страницу
    const fallbackHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CalculatorScope - Offline</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            background: #f9fafb;
            color: #1f2937;
            text-align: center;
        }
        .container {
            max-width: 500px;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #1a73e8;
        }
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
            color: #6b7280;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        button {
            background: #1a73e8;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #1557b0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>It looks like you're not connected to the internet. Some features may not be available.</p>
        <button onclick="window.location.reload()">Try Again</button>
    </div>
</body>
</html>
    `
    
    const response = new Response(fallbackHTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
    
    // Кэшируем offline страницу для будущего использования
    cache.put('/offline.html', response.clone()).catch(() => {})
    
    return response
}

// ========== MESSAGE HANDLER ==========
// Для обновления кэша из клиентского кода
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urlsToCache = event.data.urls || []
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return Promise.all(
                    urlsToCache.map(url => {
                        return fetch(url)
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response)
                                }
                            })
                            .catch(err => {
                                console.warn('[Service Worker] Failed to cache URL:', url, err)
                            })
                    })
                )
            })
        )
    }
})

// ========== ERROR HANDLING ==========
self.addEventListener('error', (event) => {
    console.error('[Service Worker] Error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
    console.error('[Service Worker] Unhandled rejection:', event.reason)
})
