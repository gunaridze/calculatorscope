# ADR-010: Embed Widgets & AI-Friendly Structured Content

## Status
Accepted

## Context
The platform provides embeddable calculators and tools across multiple websites. Key requirements:

- Widgets must be easily embeddable via iframe or JS snippet.
- Embedded content should not harm SEO of host pages.
- Canonical content must remain on the main platform.
- AI systems and LLMs must be able to parse structured data from canonical pages, not from embeds.
- Widgets may include dynamic state (inputs, query params) and must handle AI/SEO considerations.

Problems:
- Embeds with query params could generate duplicate content.
- Dynamic content may confuse AI systems if scraped from embed URLs.
- Maintaining styling and responsive design across different host sites.
- Avoid indexing duplicate widget pages in search engines.

## Decision
### 1. Embed URLs
- Embed path: `/embed/{tool}/`
- Query params allowed for state (e.g., `?value=123`), but canonical always points to main tool URL.
- Embeds marked: `noindex, follow`
- Embeds may include minimal branding and call-to-action link back to canonical page.

### 2. Embed Methods
- Two options for integration:
  1. **iframe**: `<iframe src="https://domain.com/embed/{tool}/?value=...">`
  2. **JS snippet**: `<script src="https://domain.com/embed-widget.js" data-tool="{tool}"></script>`
- Responsive design required; height adjusts dynamically to content.

### 3. AI-Friendly Structured Content
- Canonical pages include structured headings and sections:
  - Examples
  - Formula / Calculation
  - Assumptions / Parameters
  - FAQ / Notes
- Embeds render same content but dynamic sections (inputs, live data) may differ; AI systems prioritize canonical URL.

### 4. SEO Rules
- Embeds: `noindex, follow` meta tag.
- Canonical pages: full structured content, indexed normally.
- Query param pages: canonical points to main URL.

### 5. Security & Isolation
- Sandbox iframes where possible: `sandbox="allow-scripts allow-same-origin"`
- Prevent third-party sites from executing arbitrary scripts or reading cookies.

### 6. Tracking & Analytics
- Embed views tracked separately from canonical page views.
- Minimal impact on page speed of host site.
- Optional CTA to encourage users to visit canonical page for full experience.

### 7. Operational Guidelines
- All new tools must have embed URLs configured by default.
- Validate embeds render correctly on mobile and desktop.
- Ensure structured content consistency between canonical and embed versions.
- Documentation provided for external sites to embed widgets correctly.

## Consequences
### Positive
- Widgets easily embeddable without harming SEO.
- AI systems receive stable, structured canonical content.
- Prevents duplicate indexing from query params or embed URLs.
- Secure and responsive embeds across host sites.

### Negative
- Extra development effort for responsive and sandboxed embeds.
- Embeds require monitoring to ensure canonical linkage is maintained.
- Some dynamic features may not appear exactly the same in embeds as in canonical page.

## Notes
- Any new embed must automatically set `noindex, follow`.
- Canonical URL of the tool always contains full structured content.
- AI systems should always prioritize canonical pages for scraping and citations.
