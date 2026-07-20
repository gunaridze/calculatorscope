# Revenue Roadmap — Path to €3,000/month

## Target
€3,000/month in passive AdSense + embed revenue, sustained (not a one-off spike).

## Current State (2026-07-20)
Honest baseline, verified against the codebase and live site:
- **Ads: not functional.** `components/AdBanner.tsx` renders static placeholder PNGs (`/public/assets/banners/*`). No `adsbygoogle` / `ca-pub-` script exists anywhere in the app. Revenue today = €0.
- **AdSense account: none.** No application submitted yet.
- **Content: 3 of 200–1000+ planned tools live** (BMI Calculator, Number to Words, Case Converter). Status per README: "Foundation phase."
- **Locales: 8 planned** (en, de, es, fr, it, lv, pl, ru) — banner assets exist for all, but content/i18n is only built for the 3 live tools.
- **Categories: ~48 seeded** in `prisma/seeds/data/categoriesSeed.ts` (math, finance, health, physics, converters, text tools, etc.) — taxonomy is ready, content is not.
- **No privacy policy / terms / cookie-consent page found.** This blocks AdSense approval and is a GDPR requirement given EU locales (de/es/fr/it/lv/pl).
- **No analytics wired** (no GA/Plausible found in code) — traffic is currently unmeasured.
- Embed/backlink SEO strategy is already designed (ADR-006, ADR-012 through ADR-020) but unused, since there's not enough content yet to embed.

## Revenue Math (sanity check)
At a blended RPM of €5–15 per 1,000 pageviews (typical for a multi-geo calculator site), €3,000/month requires roughly **250,000–650,000 monthly visits**. The project's own stated goal (README) is 3M visits/month in 18 months — well above what's needed, *if* the roadmap below is executed.

---

## Phase 0 — AdSense-Ready Foundation (Weeks 1–4)
Goal: remove every hard blocker to running real ads legally and technically.

- [ ] Add Privacy Policy, Terms, Cookie Policy pages (required by AdSense + GDPR)
- [ ] Add a cookie-consent banner gating ad personalization for EU visitors
- [ ] Wire real analytics (GA4 recommended — `docs/GOOGLE_ANALYTICS_CLASSES.md` already defines tracking classes to hook into)
- [ ] Replace `AdBanner.tsx` placeholder images with real `adsbygoogle` ad units, feature-flagged so it degrades to house ads if AdSense isn't approved yet
- [ ] Submit sitemap + verify all 8 locales in Google Search Console
- [ ] Submit AdSense application (needs ~20–30 genuine content pages — see Phase 1)

**Owner split:** engineering (Claude Code) does pages/code; you submit the AdSense application yourself (requires your Google account/business info).

## Phase 1 — Enough Content to Get Approved & Indexed (Months 1–3)
Goal: 3 → ~100 tools, using the existing config-driven pattern (`scripts/*-config.json` → `lib/tools/*.ts` → i18n translation files).

- [ ] Build an AI-assisted content pipeline: LLM drafts tool copy + translations per locale into the existing config format; human (you or hired help) reviews before merge
- [ ] Prioritize by keyword opportunity: high search volume, low competition first — start with `finance`, `health-fitness`, `converters`, `percentages` categories (fast to build, commercially relevant for ad RPM)
- [ ] Hire freelance help for translation QA and content review (budget already available per your answer)
- [ ] Re-submit/confirm AdSense approval once ~20–30 pages are live and indexed

**Checkpoint metric:** pages indexed in GSC, AdSense approval status.

## Phase 2 — Traffic Growth Engine (Months 3–6)
Goal: move from near-zero organic traffic to tens of thousands of visits/month.

- [ ] Activate the embed/backlink strategy (ADR-006): outreach to blogs/finance/health sites to embed your calculators (brand-only backlink, already spec'd)
- [ ] Core Web Vitals audit (SSR/ISR is already the architecture — verify it's actually fast in production)
- [ ] Expand from ~100 → ~250 tools using the same pipeline
- [ ] First real RPM data comes in — use it to see which categories/geos actually pay, and re-weight Phase 3 priorities accordingly

**Checkpoint metric:** organic sessions/month, live AdSense RPM by category/locale.

## Phase 3 — Scale to Revenue Target (Months 6–12)
Goal: reach the 250k–650k visits/month needed for €3,000/month.

- [ ] Scale to 300–500+ tools, fully AI-assisted with sampled human QA
- [ ] Introduce white-label paid embeds (ADR-006 exception path) as a second revenue line
- [ ] A/B test ad density/placement against bounce rate and RPM
- [ ] Revisit Phase 1 keyword priorities using real Phase 2 RPM data — double down on what's actually earning, deprioritize what isn't

**Checkpoint metric:** monthly AdSense revenue trending toward €3,000.

## Phase 4 — Sustain & Make It Actually Passive (Month 9+)
- [ ] Automate stale-content/broken-tool monitoring
- [ ] Alerting for traffic drops (algorithm updates hit calculator/finance niches hard)
- [ ] Document runbooks so hired help can operate content pipeline without you in the loop

## Phase 5 — Modern Redesign (Deferred to final stage, after content scaling)
Goal: move from "functional MVP" visual design to a polished, modern look — deliberately deferred until content/tool count is largely built out, so design work isn't repeated as the widget/page templates keep evolving.

- [ ] Replace plain category tool-lists with proper cards (icon/thumbnail + title + description) instead of bare text links
- [ ] Add live-as-you-type calculation (no explicit "Calculate" click required) as the default interaction pattern
- [ ] Custom-styled form controls (selects, inputs) instead of bare browser defaults — shadows/rounding/focus states
- [ ] Address the large empty-whitespace problem on category/tool pages once real ad content replaces placeholders (may resolve itself, re-check first)
- [ ] Consider a proper accent/brand color system beyond the single blue, without violating the "always light, no dark mode" decision already made

**Correction (2026-07-20):** an earlier pass of this review flagged a mobile horizontal-overflow bug in `components/CookieConsentBanner.tsx`. Re-verified with a properly-waited headless measurement (Puppeteer, `scrollWidth` vs `innerWidth`) and the page shows **zero overflow**, with or without the fix — the original finding was an artifact of a single-shot screenshot tool capturing the page before hydration/layout settled, not a real defect. A small harmless tweak (`items-stretch` instead of `items-center` on the mobile flex-col layout, so the message text properly fills the row) was kept since it's marginally more correct, but there was no actual bug to fix.

---

## Key Risks
- **AdSense approval isn't guaranteed** on the first pass — Google can reject for thin content or missing policy pages; Phase 0 exists specifically to avoid the common rejection reasons.
- **Calculator SEO is competitive** (calculator.net, omnicalculator, etc.) — ranking for head terms is unlikely; the plan leans on long-tail + volume of tools, matching the project's own "1000+ tools" strategy.
- **AI-generated content risk:** Google penalizes low-quality mass-generated content. Human review before publish (per Phase 1) is not optional.
- **Revenue is not linear with tool count** — 3 tools → 100 tools won't 33x traffic; most of the early tools will get near-zero traffic until domain authority builds. Don't project revenue off tool count alone; use Phase 2 real RPM data.

## Next Action
Start Phase 0. Recommend I draft the implementation plan for the code portion (privacy/terms pages, cookie consent, GA4 wiring, real ad units in `AdBanner.tsx`) so you can review before I touch anything.
