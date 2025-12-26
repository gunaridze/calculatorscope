# ADR-008: Server-Side Query Parameters & Share Links

## Status
Accepted

## Context
The platform supports calculators and tools that may receive query parameters (e.g., `?amount=100000&rate=5`) for:
- Shareable links
- Pre-filled examples
- Bot previews for SEO

Constraints:
- SSR/ISR for SEO
- Avoid cache fragmentation on CDN
- Prevent accidental indexing of stateful HTML variants
- Query parameters can represent sensitive or ephemeral user state

Problems:
- Query-based HTML could create multiple cached versions of the same page
- Risk of hydration mismatch if server-calculated state differs from client
- Risk of duplicate content if search engines index query variants

## Decision
### 1. Server-Side Rendering Rules
- Default tool pages render **without query-based state**.
- Query parameters are applied **client-side** by default.
- Only allow **server-side calculation** for:
  - Explicit share links: `?share=1`
  - Pre-generated examples (build-time / ISR)
  - Optional: verified bot user-agents

### 2. Canonical URLs
- Always point to clean URL without query parameters
- Example:
/en/mortgage/simple-calculator/ ← canonical
/en/mortgage/simple-calculator/?amount=100000&rate=5 ← share link / embedv


### 3. Client Hydration
- React hydrates pre-rendered HTML
- State from query parameters is applied **after hydration**
- Ensures no mismatch between server-rendered HTML and client-side behavior

### 4. CDN & Cache
- Default HTML (without query params) is cached (ISR / CDN)
- Query param variants are **not cached separately** except for pre-rendered share links
- Prevents unnecessary cache fragmentation

### 5. SEO & AI Safety
- Only canonical pages without query parameters are indexed
- Share links or pre-filled URLs are functional but **noindex** if they diverge from canonical
- AI-friendly structured content must use **engine-generated examples**, not query-based HTML

### 6. Embeds
- Embedded calculators **always apply query params client-side**
- Embed pages are `noindex,follow`
- Backlinks must remain brand-only

## Consequences
### Positive
- Prevents duplicate content issues
- Keeps CDN caches efficient
- Guarantees consistent hydration for React
- Enables share links and pre-filled examples safely

### Negative
- Some complexity in client-side state hydration
- SSR pre-rendering limited only to approved cases

## Notes
- Any change in allowed server-side parameters must trigger ADR update
- Share links should always include `?share=1` flag to differentiate server prerender
- Admin preview pages can render server-side with query params safely
