// Service Worker для PWA виджетов
// Минимальная реализация для поддержки установки PWA

const CACHE_NAME = 'calculatorscope-widget-v1'

// Устанавливаем Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Можно добавить кэширование критических ресурсов
            return cache.addAll([
                '/',
                '/calculatorscope-logo.svg'
            ]).catch((err) => {
                console.log('Cache install error:', err)
            })
        })
    )
    self.skipWaiting()
})

// Активируем Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        })
    )
    return self.clients.claim()
})

// Обработка fetch запросов - используем network-first стратегию
self.addEventListener('fetch', (event) => {
    // Для PWA виджетов мы не кэшируем все запросы
    // Используем network-first стратегию для актуальных данных
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Если запрос успешен, кэшируем его
                const responseToCache = response.clone()
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache)
                })
                return response
            })
            .catch(() => {
                // Если сеть недоступна, пытаемся получить из кэша
                return caches.match(event.request)
            })
    )
})

