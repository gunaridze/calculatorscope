# Architecture Overview

This project is a SEO-first, AI-readable tools platform with a strong focus on
performance, cache efficiency, and deterministic content generation.

---

## Rendering Strategy

The platform uses a hybrid rendering model:

- Static Generation (SSG) where possible
- Incremental Static Regeneration (ISR) for scalable freshness
- Client-side interactivity for user-driven calculations

---

## Initial State Rule (FINAL)

Server-side calculation of initial state is performed ONLY when:
- The request is an explicit share link (`?share=1`)
- The request is for pre-generated examples
- Optional: verified bot user-agents

For regular user navigation:
- Tool pages are rendered with a clean default state
- Query parameters are applied client-side only
- Canonical URL is always query-free

---

## Query Parameters & Server-Side Calculation (FIXED)

Server-side calculation using query parameters is STRICTLY LIMITED.

### Allowed cases
- Explicit share links (e.g. `?share=1`)
- Pre-generated examples
- Optional: verified bot user-agents

### Default behavior
- Default HTML for tool pages is rendered without query-based state
- Query parameters are applied client-side only
- Canonical URL is always the clean URL without parameters

### Rationale
This prevents:
- CDN cache fragmentation
- ISR inefficiency
- Accidental indexing of stateful HTML variants

---

## Calculation Engine

All calculations must be performed using the shared core engine:

- Located in `/core/engines`
- Used by:
  - UI
  - SEO blocks
  - AI content
  - Examples
  - Share links

Duplicated or hardcoded logic is prohibited.

---

## Performance Principles

- HTML must be cacheable at CDN level
- No user-specific state in server-rendered HTML
- Client-side calculations must not affect SEO-visible content

---

## Error Handling

- Invalid query parameters are ignored on the server
- Client validates and applies parameters safely
- No server errors caused by malformed URLs