# Content Blocks для инструментов

## Описание

Поле `content_blocks_json` в таблице `tool_i18n` позволяет создавать произвольный структурированный контент с заголовками h2, между которыми в мобильной версии автоматически вставляются рекламные баннеры.

## Структура данных

`content_blocks_json` - это массив объектов типа `ContentBlock`:

```typescript
interface ContentBlock {
    type: 'h2' | 'paragraph' | 'html' | 'section'
    content: string
    id?: string  // Опциональный id для секции (для якорей)
}
```

## Типы блоков

### 1. `h2` - Заголовок второго уровня
Создает заголовок h2. Перед каждым h2 (начиная со второго) в мобильной версии автоматически вставляется рекламный баннер.

```json
{
  "type": "h2",
  "content": "General Tool Overview",
  "id": "overview"  // опционально
}
```

### 2. `paragraph` - Обычный параграф
Создает текстовый параграф.

```json
{
  "type": "paragraph",
  "content": "Это описание инструмента..."
}
```

### 3. `html` - HTML контент
Вставляет произвольный HTML контент.

```json
{
  "type": "html",
  "content": "<p>HTML контент с <strong>форматированием</strong></p>"
}
```

### 4. `section` - HTML секция
Создает секцию с HTML контентом (обернута в `<section>`).

```json
{
  "type": "section",
  "content": "<div>Содержимое секции</div>",
  "id": "section-id"  // опционально
}
```

## Пример полного content_blocks_json

```json
[
  {
    "type": "paragraph",
    "content": "Этот инструмент позволяет конвертировать числа в слова."
  },
  {
    "type": "h2",
    "content": "General Tool Overview",
    "id": "overview"
  },
  {
    "type": "paragraph",
    "content": "Инструмент поддерживает различные форматы и языки."
  },
  {
    "type": "h2",
    "content": "Interface and Controls",
    "id": "interface"
  },
  {
    "type": "html",
    "content": "<ul><li>Пункт 1</li><li>Пункт 2</li></ul>"
  },
  {
    "type": "h2",
    "content": "Mathematical Capabilities",
    "id": "capabilities"
  },
  {
    "type": "section",
    "content": "<div>Подробное описание возможностей...</div>",
    "id": "capabilities-details"
  }
]
```

## Инъекция баннеров в мобильной версии

Баннеры автоматически вставляются перед каждым h2 (начиная со второго):

- **Перед 2-м h2** → Баннер 2 (`{lang}-google-ads-2`)
- **Перед 3-м h2** → Баннер 3 (`{lang}-own-ads`)
- **Перед 4-м h2** → Баннер 4 (`{lang}-google-ads-3`)

Первый баннер (`{lang}-google-ads-1`) всегда показывается сразу после виджета калькулятора, перед началом текста.

## Порядок отображения контента

1. `intro_text` (если есть) - вступительный текст без заголовка
2. `content_blocks_json` - произвольный структурированный контент
3. `examples_json` - секция Examples (если есть)
4. `formula_md` - секция Formula (если есть)
5. `assumptions_md` - секция Assumptions (если есть)
6. `faq_json` - секция FAQ (если есть)

## Приоритет

Если указан `content_blocks_json`, он будет отображаться **до** старых секций (Examples, Formula, Assumptions, FAQ). Это позволяет использовать `content_blocks_json` как основной контент, а старые поля - как дополнительные секции.

## Миграция

Поле `content_blocks_json` было добавлено в миграции `20260103155827_add_content_blocks_json_to_tool_i18n`.

Для применения миграции:
```bash
npx prisma migrate deploy
```

