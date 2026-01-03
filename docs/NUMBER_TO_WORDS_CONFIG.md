# Конфигурация для Numbers to Words Converter

## JSON конфигурации для обновления БД

### config_json

```json
{
  "inputs": [
    {
      "key": "inputNumber",
      "default": ""
    },
    {
      "key": "conversionMode",
      "default": "words"
    },
    {
      "key": "currency",
      "default": "USD"
    },
    {
      "key": "vatRate",
      "default": 0
    },
    {
      "key": "textCase",
      "default": "Sentence case"
    }
  ],
  "functions": {
    "numberToWordsResult": {
      "type": "function",
      "functionName": "numberToWords",
      "params": {
        "value": "inputNumber",
        "mode": "conversionMode",
        "currency": "currency",
        "vatRate": "vatRate",
        "textCase": "textCase"
      }
    }
  },
  "outputs": [
    {
      "key": "textResult",
      "precision": 0
    },
    {
      "key": "calculatedTotal",
      "precision": 2
    }
  ]
}
```

### inputs_json

```json
[
  {
    "name": "inputNumber",
    "label": "Convert this Number:",
    "type": "text",
    "unit": null,
    "min": null,
    "max": null,
    "description": "The numerical value you wish to convert. Accepts integers, decimals (floats), and scientific notation (e.g., 1.5e6). Supports values up to 300 digits.",
    "placeholder": "Enter number (e.g., 150, 1.5e100, 1234.56)"
  },
  {
    "name": "conversionMode",
    "label": "To:",
    "type": "select",
    "unit": null,
    "min": null,
    "max": null,
    "description": "Defines the output format. Options include 'Words' (standard text), 'Check Writing' (bank format with fractions), 'Currency' (monetary format), or 'Currency + VAT' (tax calculation).",
    "options": [
      {
        "value": "words",
        "label": "Words"
      },
      {
        "value": "check_writing",
        "label": "Check Writing"
      },
      {
        "value": "currency",
        "label": "Currency"
      },
      {
        "value": "currency_vat",
        "label": "Currency + VAT"
      }
    ]
  },
  {
    "name": "currency",
    "label": "Currency:",
    "type": "select",
    "unit": null,
    "min": null,
    "max": null,
    "description": "Select the currency context for the text. Supported options: USD, EUR, GBP, PLN, RUB. This appends the correct currency name and subdivision (e.g., dollars/cents).",
    "options": [
      {
        "value": "USD",
        "label": "USD (United States Dollar)"
      },
      {
        "value": "GBP",
        "label": "GBP (British Pound Sterling)"
      },
      {
        "value": "EUR",
        "label": "EUR (Euro)"
      },
      {
        "value": "PLN",
        "label": "PLN (Polish Zloty)"
      },
      {
        "value": "RUB",
        "label": "RUB (Russian Ruble)"
      }
    ],
    "showCondition": {
      "field": "conversionMode",
      "operator": "notEquals",
      "value": "words"
    }
  },
  {
    "name": "vatRate",
    "label": "VAT Rate (%):",
    "type": "number",
    "unit": "%",
    "min": 0,
    "max": 100,
    "description": "The tax percentage to apply. Only active when 'Currency + VAT' mode is selected. It calculates the tax and adds it to the principal before conversion.",
    "showCondition": {
      "field": "conversionMode",
      "operator": "equals",
      "value": "currency_vat"
    }
  },
  {
    "name": "textCase",
    "label": "Letter Case:",
    "type": "select",
    "unit": null,
    "min": null,
    "max": null,
    "description": "Controls the capitalization of the result. Choose 'Sentence case' for standard grammar, 'Title Case' for headlines, 'UPPERCASE' for legal emphasis, or 'lowercase'.",
    "options": [
      {
        "value": "lowercase",
        "label": "lowercase"
      },
      {
        "value": "UPPERCASE",
        "label": "UPPERCASE"
      },
      {
        "value": "Title Case",
        "label": "Title Case"
      },
      {
        "value": "Sentence case",
        "label": "Sentence case"
      }
    ]
  }
]
```

## Как обновить БД

### Вариант 1: Через SQL запрос

```sql
-- Обновить config_json для tool_id = '1001'
UPDATE tool_config 
SET config_json = '{"inputs":[...],"functions":{...},"outputs":[...]}'::jsonb
WHERE tool_id = '1001';

-- Обновить inputs_json для всех языков tool_id = '1001'
UPDATE tool_i18n 
SET inputs_json = '[{...}]'::jsonb
WHERE tool_id = '1001';
```

### Вариант 2: Через скрипт import-tool-i18n.ts

Добавьте эти поля в файл `scripts/tool_i18n` для каждой языковой версии инструмента.

## Реализованная функциональность

✅ Поддержка научной нотации (1e100, 1E100)
✅ Большие числа до 300 цифр (обработка через строки)
✅ Десятичные числа
✅ Режимы: words, check_writing, currency, currency_vat
✅ Валюты: USD, GBP, EUR, PLN, RUB
✅ Русские склонения для RUB (рубль/рубля/рублей, копейка/копейки/копеек)
✅ Регистры: lowercase, UPPERCASE, Title Case, Sentence case
✅ Условное отображение полей (currency показывается только если mode != words)
✅ Расчет НДС для режима currency_vat

## Файлы

- `lib/tools/numberToWords.ts` - основная логика конвертации
- `core/engines/json.ts` - расширенный движок с поддержкой кастомных функций
- `components/CalculatorWidget.tsx` - обновленный виджет с поддержкой select и text полей
- `scripts/number-to-words-config.json` - готовые JSON конфигурации

