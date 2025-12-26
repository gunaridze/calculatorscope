# Project Conventions

This document defines mandatory conventions for consistency,
maintainability, and SEO/AI correctness.

---

## Examples & Calculation Consistency (MANDATORY)

Examples displayed in:
- SEO blocks
- AI citation blocks
- HTML content sections

MUST be generated using the same calculation engine
located in `/core/engines`.

### Rules
- No hardcoded example outputs
- No duplicated logic
- Examples are treated as content, not UI

Generation time:
- Build-time
- ISR
- Admin preview

Any mismatch between examples and UI output is considered a critical bug.

---

## Client vs Server Calculation (Clarification)

The rule “calculate on the client if possible”
applies ONLY to interactive UI updates.

All SEO / AI-visible content (Short answer, Examples, Formula)
MUST be generated server-side
using the core calculation engine.

---

## Content Stability

- SEO-visible content must be deterministic
- UI interactivity must not alter indexed HTML
- Client-side state is never a source of truth

---

## Naming & Structure

- Clear, explicit naming
- No ambiguous flags or magic behavior
- Predictability over convenience
