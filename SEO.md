
---

# SEO Principles

This project is SEO-first by design.

---

## Flat Category URLs (Intentional Trade-off)

Category URLs are intentionally flat
and do not reflect hierarchy.

### Examples
- /finance/
- /mortgage/

### Rationale
This is a deliberate architectural decision to:
- Keep URLs short and stable
- Avoid deep URL restructuring at scale

### Hierarchy Expression
Topical hierarchy is expressed via:
- Breadcrumbs
- Internal linking
- Content blocks on category pages

This decision is intentional and not considered a limitation.

---

### Clarification on Examples

Examples like:
- /algebra/powers-roots/
- /geometry/solid/

represent logical hierarchy only.

Actual routing is always flat:
- /powers-roots/
- /solid/

Parent category is expressed via breadcrumbs and content,
not via URL nesting.

---

## Embed Dofollow Policy

Dofollow backlinks from embeds are allowed ONLY when:
- Anchor text is brand-only
- Link points to homepage or tools hub
- Partner domain is explicitly approved
- Total number of dofollow embed domains is limited

Uncontrolled dofollow embeds are prohibited.

---

## Indexing Rules

- index,follow by default
- Clean canonical URLs
- No indexing of stateful variants