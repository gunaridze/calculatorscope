# AI & LLM Readability

The platform is designed to be easily parsed and cited by LLMs.

---

## llms.txt

If present, llms.txt describes:
- Tools
- Capabilities
- Preferred citation structure

However, llms.txt is not guaranteed to be respected.

---

## AI Fallback Signals (HTML-Level)

Because llms.txt is not yet a universal standard,
additional HTML-level signals are REQUIRED.

### Tool pages MUST include:
- Stable section headings:
  - Examples
  - Formula
  - Assumptions
  - FAQ
- Predictable HTML structure using `<section id="...">`
- Meta robots:
  - index,follow
  - max-snippet:300

This improves AI parsing consistency
even if llms.txt is ignored.

---

## Content Determinism

- AI-visible content must be stable
- Generated using the core calculation engine
- Never dependent on client-side state
