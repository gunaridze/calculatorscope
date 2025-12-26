# ADR-009: SEO & i18n URL Strategy

## Status
Accepted

## Context
The platform is multilingual and content-heavy:
- Eight initial languages: `en, de, es, fr, it, pl, ru, lv`
- Category and tool pages must be indexed correctly
- Structured content must be AI-friendly
- Canonical URLs, hreflang, and sitemap must prevent duplicate content
- URL structure must remain simple and scalable

Constraints:
- Avoid deep hierarchy in URLs
- Ensure slug uniqueness per language
- Embed pages and query param URLs are **functional but not indexed**
- SEO templates must be consistent across languages

Problems:
- Potential slug conflicts across languages
- Canonical conflicts if query parameters are indexed
- Complexity of managing hreflang for large number of tools
- Flat URLs can make hierarchy ambiguous if not expressed via breadcrumbs

## Decision
### 1. URL Structure
- Canonical: `/{lang}/{category}/{tool}/`
- Flat category URLs; hierarchy expressed only in breadcrumbs and internal links
- Reserved slugs:
embed, api, admin, assets, static, search,
sitemap.xml, robots.txt, favicon.ico,
terms, privacy, contact, get-free-calculator-widget,
pop-up-calculator-widget, embed-calculator-widget,
development-and-integration-of-custom-calculator


### 2. Slugs
- `tool_i18n.slug` unique per language globally
- `category_i18n.slug` unique per language globally
- No shared slugs across languages

### 3. hreflang
- Server-rendered for all canonical pages
- `x-default` → English
- hreflang in sitemap duplicates all canonical URLs
- For new languages: add hreflang entries in sitemap and page headers

### 4. Canonical URLs
- Canonical always points to clean URL (no query params)
- Share links and embeds must **not be indexed** unless explicitly canonical

### 5. Sitemap
- Sitemap index + chunks
- Include only canonical pages
- Embed pages and query param URLs excluded
- hreflang duplicated in sitemap

### 6. Embeds & Query Params
- Embed pages: `/embed/{tool}/` → `noindex,follow`
- Query param pages: functional only, canonical points to clean URL
- Prevent indexing of stateful HTML

### 7. AI / LLM Considerations
- Stable section headings (`Examples`, `Formula`, `Assumptions`, `FAQ`)
- Canonical pages prioritized for AI citation
- Embed pages ignored by AI systems

## Consequences
### Positive
- Consistent SEO for multilingual site
- Prevents duplicate content and canonical conflicts
- Maintains flat URLs for scalability
- AI-friendly structured content across languages

### Negative
- Requires strict validation for slug uniqueness
- Flat URLs may require careful breadcrumb and internal linking management
- Extra operational work to maintain hreflang and sitemap consistency

## Notes
- Any new language added must follow same slug uniqueness rules
- Embed and query param pages never become canonical
- Admin preview pages may render server-side with query params safely, but **noindex**
