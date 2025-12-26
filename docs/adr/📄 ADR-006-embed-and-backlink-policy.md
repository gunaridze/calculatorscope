# ADR-006: Embed & Backlink Policy

## Status
Accepted

## Context
The platform provides embeddable calculators/widgets for third-party websites. Challenges include:
- SEO risks due to keyword-rich backlinks
- Duplicate content indexing
- Maintaining brand consistency
- Tracking usage without compromising page performance

Goals:
- Ensure embeds are safe for SEO
- Preserve brand authority
- Prevent CLS / layout shifts
- Allow controlled attribution (backlink)

## Decision
All embeds must follow strict rules for layout, indexing, and backlinks:

### 1. Embed URLs
- `/embed/{tool}/` per language
- Query parameters allowed (for user state), but **do not affect canonical**:
  - `?amount=100000&rate=5`
- Canonical URL is always the main tool page without parameters.

### 2. SEO
- `meta robots: noindex,follow`
- No schema.org markup to prevent duplicate content competition
- HTML structure simplified for fast rendering
- Embed pages **cannot be cited by AI as canonical**

### 3. Backlink Policy
- Must include **brand-only backlink**:
  - Anchor text: brand name only, e.g., `CalculatorScope`
  - No keyword-rich anchors (e.g., “Mortgage Calculator”) allowed
  - URL points to main site or tools hub
  - Attributes: `rel="nofollow"` by default; `dofollow` optional in advanced paid mode
- Backlink is mandatory for all free embeds

### 4. Layout
- Lightweight HTML / CSS
- Minimal JS
- No CLS; layout height reserved
- Responsive design enforced

### 5. Tracking & Usage
- Optional: analytics pixel or callback
- Must not affect iframe performance
- Respect user privacy

### 6. Exceptions
- White-label paid embeds:
  - Brand link optional
  - Must still follow layout / performance rules

## Consequences
### Positive
- Protects SEO rankings of main site
- Ensures embeds remain brand-safe
- Reduces CLS and page load issues for third-party sites
- Simplifies audit and compliance

### Negative
- Slightly restricted customization for free embeds
- Requires enforcement in both frontend and admin tools

## Notes
- Embed compliance checks should be part of **CI/CD validation**
- All new embeds must go through QA to verify:
  - Noindex tag present
  - Backlink present and correct
  - Layout meets CLS and performance standards
