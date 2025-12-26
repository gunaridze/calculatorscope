# ADR-001: Query Parameters & Server-Side Rendering

## Status
Accepted

## Context
Tool pages may be accessed with query parameters representing user input
(e.g. `?amount=100&rate=5`).

Naive server-side rendering of query-based state leads to:
- CDN cache fragmentation
- Poor ISR efficiency
- Accidental indexing of stateful HTML variants
- Unbounded HTML permutations

However, SEO and AI requirements demand deterministic, server-generated content
for examples and short answers.

## Decision
Server-side calculation using query parameters is STRICTLY LIMITED.

Server-side initial state calculation is performed ONLY when:
- The request is an explicit share link (`?share=1`)
- The request is for pre-generated examples
- Optional: verified bot user-agents

For regular user navigation:
- Tool pages are rendered with a clean default state
- Query parameters are applied client-side only
- Canonical URL is always query-free

## Consequences
### Positive
- High CDN cache hit ratio
- Predictable ISR behavior
- No accidental SEO duplication
- Clear separation between content and interaction

### Negative
- Query-based deep links do not produce pre-filled HTML
- Client-side hydration is required for most user states

## Notes
This decision is foundational and MUST NOT be overridden
by individual feature implementations.
