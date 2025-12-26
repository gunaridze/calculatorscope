# ADR-004: Deterministic HTML for SEO & AI

## Status
Accepted

## Context
Search engines and LLMs consume server-rendered HTML.
Client-side rendering alone is insufficient for:
- Reliable indexing
- AI citation
- Short answer extraction

At the same time, the UI must remain interactive.

## Decision
All SEO- and AI-visible content MUST be:
- Generated server-side
- Deterministic
- Independent of client-side state

This includes:
- Short answers
- Examples
- Formulas
- Assumptions
- FAQ blocks

Client-side calculations are limited to interactive UI updates only.

## Consequences
### Positive
- Reliable SEO indexing
- Predictable AI parsing
- Stable content citations

### Negative
- Requires build/ISR computation
- Higher importance of calculation correctness

## Notes
Client-side state is never a source of truth
for indexed or AI-visible content.
