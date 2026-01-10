# Google Analytics Tracking Classes

Этот документ описывает классы и события, используемые для отслеживания взаимодействий пользователей в Google Analytics через Google Tag Manager (GTM).

## Обзор

Все события отслеживания отправляются через `dataLayer` в Google Tag Manager. GTM уже настроен в `app/layout.tsx` с ID `GTM-NHQV5G8C`.

## Классы для отслеживания

### 1. `logo-widget` - Клики по логотипу в виджете

**Назначение:** Отслеживание кликов по логотипу CalculatorScope в виджете калькулятора.

**Где используется:**
- Компонент: `components/CalculatorWidget.tsx`
- Элемент: Логотип в футере виджета

**Как применить:**
```tsx
<Link 
    href={`/${lang}`}
    className="logo-widget inline-block"
    onClick={() => {
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'logo_click',
                eventCategory: 'Widget',
                eventAction: 'Logo Click',
                eventLabel: 'Logo Click',
                widgetToolId: toolId || 'unknown',
                widgetH1: h1 || 'Unknown',
                widgetH1En: h1En || h1 || 'Unknown',
                widgetLang: lang,
                widgetReferrer: document.referrer || window.location.href
            })
        }
    }}
>
    <Image
        src="/calculatorscope-logo.svg"
        alt="Calculator Scope"
        width={90}
        height={90}
        className="object-contain inline-block"
    />
</Link>
```

**Отправляемые данные:**
- `event`: `'logo_click'`
- `eventCategory`: `'Widget'`
- `eventAction`: `'Logo Click'`
- `eventLabel`: `'Logo Click'`
- `widgetToolId`: ID инструмента из БД
- `widgetH1`: Заголовок H1 для текущего языка
- `widgetH1En`: H1 на английском языке (из `tool_i18n` где `lang='en'`)
- `widgetLang`: Язык виджета
- `widgetReferrer`: URL страницы, с которой открыт виджет

**В Google Analytics:**
- Событие: `logo_click`
- Категория: `Widget`
- Действие: `Logo Click`
- Метки: Все параметры виджета доступны как custom dimensions

## Автоматические события

### 2. `widget_load` - Загрузка виджета

**Назначение:** Автоматическое отслеживание загрузки виджета с информацией о контексте использования.

**Где используется:**
- Компонент: `components/CalculatorWidget.tsx`
- Триггер: Автоматически при монтировании компонента (useEffect)

**Как это работает:**
```tsx
useEffect(() => {
    if (typeof window !== 'undefined') {
        const referrer = document.referrer || window.location.href
        
        if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'widget_load',
                eventCategory: 'Widget',
                eventAction: 'Widget Loaded',
                eventLabel: h1 || 'Unknown Widget',
                widgetToolId: toolId || 'unknown',
                widgetH1: h1 || 'Unknown',
                widgetH1En: h1En || h1 || 'Unknown',
                widgetLang: lang,
                widgetReferrer: referrer,
                widgetUrl: window.location.href
            })
        }
    }
}, [toolId, h1, h1En, lang])
```

**Отправляемые данные:**
- `event`: `'widget_load'`
- `eventCategory`: `'Widget'`
- `eventAction`: `'Widget Loaded'`
- `eventLabel`: H1 виджета
- `widgetToolId`: ID инструмента из БД
- `widgetH1`: Заголовок H1 для текущего языка
- `widgetH1En`: H1 на английском языке
- `widgetLang`: Язык виджета
- `widgetReferrer`: URL страницы, с которой открыт виджет (сторонний сайт)
- `widgetUrl`: URL самого виджета

**В Google Analytics:**
- Событие: `widget_load`
- Категория: `Widget`
- Действие: `Widget Loaded`
- Метки: Все параметры виджета доступны как custom dimensions

## Как добавить новый класс для отслеживания

### Шаг 1: Определите событие

Решите, какое событие вы хотите отслеживать:
- Клик по элементу
- Загрузка компонента
- Взаимодействие пользователя
- Другое действие

### Шаг 2: Добавьте класс

Добавьте уникальный класс к элементу:
```tsx
<button className="your-tracking-class">
    Click me
</button>
```

### Шаг 3: Добавьте обработчик события

Добавьте обработчик, который отправляет событие в dataLayer:
```tsx
<button 
    className="your-tracking-class"
    onClick={() => {
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'your_event_name',
                eventCategory: 'Category Name',
                eventAction: 'Action Name',
                eventLabel: 'Label',
                // Дополнительные параметры
                customParam1: 'value1',
                customParam2: 'value2'
            })
        }
    }}
>
    Click me
</button>
```

### Шаг 4: Документируйте класс

Добавьте описание нового класса в этот файл с примером использования.

## Структура событий

Все события должны следовать стандартной структуре:

```typescript
{
    event: string,              // Название события (например, 'logo_click')
    eventCategory: string,      // Категория события (например, 'Widget')
    eventAction: string,        // Действие (например, 'Logo Click')
    eventLabel?: string,        // Метка (опционально)
    // Дополнительные параметры
    [key: string]: any
}
```

## Настройка в Google Tag Manager

### Создание триггера

1. Перейдите в GTM → Triggers → New
2. Выберите тип триггера: **Custom Event**
3. Введите название события (например, `widget_load`)
4. Сохраните триггер

### Создание тега

1. Перейдите в GTM → Tags → New
2. Выберите тип тега: **Google Analytics: GA4 Event**
3. Настройте:
   - **Event Name**: Используйте переменную `{{Event}}`
   - **Event Parameters**: Добавьте все custom параметры
4. Выберите триггер, созданный выше
5. Сохраните тег

### Настройка Custom Dimensions

Для отслеживания дополнительных параметров (например, `widgetToolId`, `widgetH1En`) настройте Custom Dimensions в GA4:

1. Перейдите в GA4 → Admin → Custom Definitions → Custom Dimensions
2. Создайте новую dimension:
   - **Dimension name**: `Widget Tool ID`
   - **Scope**: `Event`
   - **Event parameter**: `widgetToolId`
3. Повторите для других параметров

## Примеры использования

### Пример 1: Отслеживание клика по кнопке

```tsx
<button 
    className="cta-button-primary"
    onClick={() => {
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'button_click',
                eventCategory: 'Engagement',
                eventAction: 'CTA Click',
                eventLabel: 'Primary Button',
                buttonLocation: 'header',
                buttonText: 'Get Started'
            })
        }
        // Ваш код обработки клика
    }}
>
    Get Started
</button>
```

### Пример 2: Отслеживание загрузки секции

```tsx
useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: 'section_view',
            eventCategory: 'Content',
            eventAction: 'Section Viewed',
            eventLabel: 'FAQ Section',
            sectionName: 'FAQ',
            pageUrl: window.location.href
        })
    }
}, [])
```

### Пример 3: Отслеживание взаимодействия с формой

```tsx
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Отправка события
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: 'form_submit',
            eventCategory: 'Form',
            eventAction: 'Form Submitted',
            eventLabel: 'Contact Form',
            formName: 'contact',
            formLocation: 'footer'
        })
    }
    
    // Ваш код обработки формы
}
```

## Рекомендации

1. **Используйте осмысленные названия классов**: Классы должны быть понятными и отражать назначение элемента
2. **Стандартизируйте структуру событий**: Всегда используйте `eventCategory`, `eventAction`, `eventLabel`
3. **Добавляйте контекст**: Включайте дополнительную информацию, которая поможет в анализе
4. **Проверяйте наличие dataLayer**: Всегда проверяйте, что `dataLayer` существует перед отправкой события
5. **Документируйте новые классы**: Добавляйте описание в этот файл при создании нового класса

## Отладка

### Проверка событий в браузере

1. Откройте DevTools (F12)
2. Перейдите на вкладку **Console**
3. Введите: `dataLayer`
4. Вы увидите все отправленные события

### Проверка в GTM Preview Mode

1. Откройте GTM → Preview
2. Введите URL вашего сайта
3. Вы увидите все события в реальном времени

### Проверка в GA4 Real-Time

1. Перейдите в GA4 → Reports → Real-time
2. Выполните действие на сайте
3. Событие должно появиться в течение нескольких секунд

## Список всех классов

| Класс | Назначение | Событие | Компонент |
|-------|-----------|---------|-----------|
| `logo-widget` | Клики по логотипу в виджете | `logo_click` | `CalculatorWidget.tsx` |

## Автоматические события

| Событие | Назначение | Компонент |
|---------|-----------|-----------|
| `widget_load` | Загрузка виджета | `CalculatorWidget.tsx` |

---

**Последнее обновление:** 2025-01-XX  
**Версия:** 1.0

