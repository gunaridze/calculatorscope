# ADR-002: Flat Category URLs

## Status
Accepted

## Context
The platform contains a large and evolving number of tools
grouped into logical categories and subcategories.

Hierarchical URLs (e.g. `/math/algebra/powers/`) create:
- Long, unstable URLs
- Costly restructuring when taxonomy changes
- Routing and migration complexity

At the same time, SEO requires clear topical hierarchy.

## Decision
All category URLs are intentionally FLAT.

Examples:
- `/finance/`
- `/mortgage/`
- `/powers-roots/`

Logical hierarchy is NOT expressed in URLs.

Hierarchy is expressed via:
- Breadcrumbs
- Internal linking
- Content blocks
- Page structure

## Consequences
### Positive
- Short, stable URLs
- Easy category reorganization
- No URL migrations on taxonomy changes

### Negative
- URL alone does not express full hierarchy
- Requires strong internal linking discipline

## Notes
Flat URLs are a deliberate architectural trade-off
and not a limitation or temporary solution.
