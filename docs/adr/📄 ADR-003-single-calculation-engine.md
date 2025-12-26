# ADR-003: Single Calculation Engine

## Status
Accepted

## Context
The platform generates calculated values for:
- UI interaction
- SEO short answers
- Examples
- AI-readable content
- Share links

Duplicated calculation logic leads to:
- Inconsistent outputs
- SEO/AI mismatches
- High maintenance cost
- Regression risk

## Decision
All calculations MUST be performed using a single shared engine.

- Located in `/core/engines`
- Used by:
  - Server-side generation
  - Client-side UI
  - SEO blocks
  - AI content
  - Admin previews

Hardcoded values or duplicated logic are prohibited.

## Consequences
### Positive
- Deterministic outputs across the system
- Single source of truth
- Easier testing and refactoring

### Negative
- Requires stricter dependency management
- Engine changes affect multiple layers

## Notes
Any mismatch between example output and UI output
is considered a critical bug.
