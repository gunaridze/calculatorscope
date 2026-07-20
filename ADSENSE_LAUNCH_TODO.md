# AdSense Launch To-Do (ручные шаги)

## Когда начинать
Когда в каждой из ~48 категорий будет минимум **10 калькуляторов** — этого объёма контента обычно достаточно, чтобы AdSense не отклонил заявку из-за "thin content". До этого момента подавать заявку смысла нет.

Техническая часть (Phase 0 из `ROADMAP.md`) уже готова и ждёт: privacy/terms/cookies страницы, cookie-consent баннер, готовая к подключению AdSense-ветка в `AdBanner.tsx`, `ads.txt`-заглушка.

## Что нужно сделать вручную

- [ ] **Подать заявку на Google AdSense** для calculatorscope.com
  - Понадобится: Google-аккаунт, доступ к домену для верификации
  - После подачи — ожидание проверки (обычно от нескольких дней до нескольких недель)

- [ ] **Создать GA4-свойство и настроить тег внутри GTM**
  - Контейнер уже подключен на сайте: `GTM-NHQV5G8C`
  - В GTM создать тег "GA4 Configuration" с ID нового GA4-свойства (см. `docs/GOOGLE_ANALYTICS_CLASSES.md` — там уже описана логика dataLayer-событий, которые GA4 должна собирать)

- [ ] **Отдать черновики Privacy/Terms/Cookie Policy на юридическую проверку**
  - Тексты уже засеяны в БД на всех 8 языках (`scripts/seed-legal-pages.ts`), доступны на `/{lang}/privacy`, `/{lang}/terms`, `/{lang}/cookies`
  - В английской версии (источник для остальных языков) нужно заполнить плейсхолдеры:
    - `[Company Legal Name, Address, Jurisdiction — to be completed]` (Privacy Policy, Terms)
    - `[Jurisdiction — to be completed]` (governing law в Terms)
  - После правок — обновить `scripts/seed-legal-pages.ts` и перезапустить `npx tsx scripts/seed-legal-pages.ts`

- [ ] **После одобрения AdSense — заполнить env-переменные и `ads.txt`**
  - В `.env` (по образцу `.env.example`): `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_ADSENSE_SLOT_1..4`
  - В `public/ads.txt` — заменить заглушку на реальную строку от Google (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`)
  - `AdBanner.tsx` автоматически переключится с placeholder-картинок на реальные объявления, как только переменные будут заданы — код менять не нужно
