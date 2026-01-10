# Service Worker Improvements

## Обзор улучшений

Service Worker был значительно улучшен для production-ready PWA приложения с оптимальным кэшированием и offline функциональностью.

## Ключевые улучшения

### 1. Версионирование кэша ✅
- Версия кэша: `v2` (легко обновляется для инвалидации старого кэша)
- Отдельные кэши для критических ресурсов и статики
- Автоматическая очистка старых версий кэша при активации

### 2. Стратегии кэширования

#### Network First (для API и динамического контента)
- **Используется для:** `/api/`, `/_next/`, `/manifest`
- **Логика:** Сначала сеть, при ошибке - кэш
- **Преимущества:** Актуальные данные, работает offline

#### Cache First (для статических ресурсов)
- **Используется для:** `.js`, `.css`, `.png`, `.svg`, `.woff`, `.woff2` и другие статические файлы
- **Логика:** Сначала кэш, при отсутствии - сеть с кэшированием
- **Преимущества:** Быстрая загрузка, минимум сетевых запросов

#### Stale While Revalidate (для HTML страниц)
- **Используется для:** HTML страницы
- **Логика:** Сразу возвращает кэш, обновляет в фоне
- **Преимущества:** Мгновенная загрузка, актуальный контент

### 3. Критические ресурсы

При установке Service Worker автоматически кэширует:
- `/` - Главная страница
- `/calculatorscope-logo.svg` - Логотип
- `/widget-192.png` - Иконка PWA
- `/widget-512.png` - Иконка PWA
- `/burger.svg` - Иконки меню
- `/burger-close.svg` - Иконки меню

### 4. Offline Fallback

- Красивая offline страница (`/offline.html`)
- Автоматическое определение offline режима
- Уведомление при восстановлении сети
- Список доступных offline функций

### 5. Обработка ошибок

- Graceful degradation при ошибках кэширования
- Логирование ошибок в консоль
- Обработка unhandled rejections
- Не прерывает установку при ошибках кэширования отдельных ресурсов

### 6. Message Handler

Service Worker поддерживает сообщения от клиентского кода:
- `SKIP_WAITING` - принудительная активация нового SW
- `CACHE_URLS` - кэширование дополнительных URL

## Технические детали

### Структура кэшей

```
calculatorscope-v2
├── HTML страницы
├── Критические ресурсы
└── API responses (кэшированные)

calculatorscope-static-v2
├── JS файлы
├── CSS файлы
├── Изображения
├── Шрифты
└── Другие статические ресурсы
```

### Автоматическое определение типа запроса

```javascript
// Статические ресурсы - Cache First
if (isStaticAsset(url)) {
    return cacheFirstStrategy(...)
}

// API запросы - Network First
if (shouldUseNetworkFirst(url)) {
    return networkFirstStrategy(...)
}

// HTML страницы - Stale While Revalidate
if (isHTMLRequest(request)) {
    return staleWhileRevalidateStrategy(...)
}
```

## Обновление версии кэша

При обновлении Service Worker:

1. **Измените `CACHE_VERSION`** в `sw.js`:
   ```javascript
   const CACHE_VERSION = 'v3' // Было v2
   ```

2. **Service Worker автоматически:**
   - Создаст новые кэши с новой версией
   - Удалит старые кэши при активации
   - Обновит все страницы после перезагрузки

## Мониторинг и отладка

### Chrome DevTools

1. **Application → Service Workers**
   - Проверить статус регистрации
   - Посмотреть логи
   - Обновить или удалить SW

2. **Application → Cache Storage**
   - Просмотреть содержимое кэшей
   - Очистить кэши вручную
   - Проверить размер кэшей

3. **Network → Offline**
   - Тестировать offline режим
   - Проверить fallback страницы
   - Убедиться, что ресурсы берутся из кэша

### Логирование

Service Worker логирует все важные события:
```
[Service Worker] Installing... calculatorscope-v2
[Service Worker] Caching critical assets
[Service Worker] Installation complete
[Service Worker] Activating...
[Service Worker] Deleting old cache: calculatorscope-v1
[Service Worker] Activation complete
```

## Производительность

### Ожидаемые улучшения:

- **First Load:** Зависит от сетевого подключения
- **Repeat Visits:** 80-90% ресурсов из кэша (мгновенная загрузка)
- **Offline:** Полная функциональность для ранее посещенных страниц
- **Network Requests:** Сокращение на 70-80% при повторных визитах

## Безопасность

- ✅ Проверка протокола (только HTTP/HTTPS)
- ✅ Проверка метода запроса (только GET)
- ✅ Игнорирование chrome-extension и других протоколов
- ✅ Корректная обработка ошибок

## Будущие улучшения (опционально)

1. **Background Sync** - синхронизация данных при восстановлении сети
2. **Push Notifications** - уведомления пользователям
3. **Periodic Background Sync** - фоновое обновление контента
4. **Web Share Target** - интеграция с системным меню "Поделиться"
5. **File System Access** - работа с файловой системой устройства

## Тестирование

### Чеклист для тестирования:

- [ ] Service Worker регистрируется при первой загрузке
- [ ] Критические ресурсы кэшируются при установке
- [ ] Статические ресурсы загружаются из кэша
- [ ] HTML страницы обновляются в фоне
- [ ] Offline страница показывается при отсутствии сети
- [ ] Старые кэши удаляются при обновлении версии
- [ ] Ошибки обрабатываются корректно
- [ ] Логи показывают все события

### Команды для тестирования:

```bash
# Очистить все кэши и Service Workers
# Chrome DevTools → Application → Clear storage → Clear site data

# Проверить размер кэшей
# Chrome DevTools → Application → Cache Storage → Inspect

# Тестировать offline
# Chrome DevTools → Network → Offline checkbox
```

## Заключение

Улучшенный Service Worker обеспечивает:
- ✅ Быструю загрузку при повторных визитах
- ✅ Offline функциональность
- ✅ Актуальный контент (stale-while-revalidate)
- ✅ Автоматическое управление версиями
- ✅ Production-ready качество кода

**Status: Production Ready** ✅

