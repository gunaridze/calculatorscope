# ADR-019: Widget Internationalization & Dynamic Content Localization

## Status
Accepted

## Context
Widgets are embedded in websites with global audiences, requiring:

- Multi-language support (i18n) for UI elements.
- Dynamic content localization based on user preferences, host site locale, or URL parameters.
- Seamless integration without affecting host page performance.

Challenges:

- Host pages may use different frameworks, locales, or character encodings.
- Dynamic content may change frequently and require real-time localization.
- Widget bundle size and load time should remain minimal.

## Decision

### 1. Language Detection
- Detect language via:
  1. Explicit `locale` parameter from host (preferred).
  2. URL query parameter (`?lang=xx`).
  3. Browser `navigator.language`.
- Fallback to default language (`en`) if detection fails.

### 2. Translation Storage
- Use JSON-based translation files, e.g., `en.json`, `fr.json`, `de.json`.
- Load translations dynamically (lazy loading) to reduce initial bundle size.
- Support nested keys and interpolation for dynamic content.

Example structure:

```json
{
  "greeting": "Hello, {name}!",
  "cta": {
    "buy": "Buy now",
    "learn_more": "Learn more"
  }
}
### 3. Runtime Localization

Translate static UI elements using translation keys.

For dynamic content:

Support host-provided translations via postMessage or API.

Fallback to default language if host translation is unavailable.

Format dates, numbers, and currencies according to locale.

### 4. Host Integration

Host can provide locale and translations via:

Widget.init({ locale: 'fr', translations: {...} });


If no host-provided translations, widget loads default JSON file dynamically.

### 5. Fallback Strategy

If translation fails or key is missing:

Use default language string.

Log missing keys to monitoring (ADR-015).

Avoid breaking layout when text length differs across languages.

### 6. Performance & Caching

Cache loaded translation files in browser (IndexedDB or localStorage).

Only load necessary locale files (lazy load on demand).

Combine with lazy-loaded widgets strategy (DR-017) to reduce network requests.

### 7. Accessibility

Ensure translated content supports screen readers and right-to-left (RTL) languages.

Maintain consistent font sizes and spacing across locales.

Consequences
Positive

Widgets provide consistent multi-language experience.

Hosts can control localization without modifying widget code.

Dynamic content adapts in real-time to user or host preferences.

Negative

Slight increase in widget complexity and bundle size.

Requires robust error handling for missing or malformed translation data (linked with ADR-018).