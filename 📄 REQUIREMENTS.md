# Business & Product Requirements

## Business Goal
Reach ~3M visits/month (~100k/day) within 18 months via:
- SEO (localization + scalable content)
- Performance (CWV)
- Link building

## Key Requirements
- Technical SEO: hreflang, sitemap, clean URLs
- Scale: 200 → 500 → 1000+ tools
- Monetization: AdSense with reserved slots (no CLS)
- Widgets: iframe + popup, brand-only backlinks
- Load: 100+ concurrent users per tool
- Security: rate limit + CAPTCHA on abuse

## Product Model

### Core Entity: Tool
All calculators, converters, generators are represented by a single entity: `Tool`.

### Tool Types
- calculator
- converter
- text_tool
- generator
- checker

### Rationale
- Unified routing and SEO templates
- Unified embed logic
- Simpler admin and imports
- Horizontal scalability
