# ADR-017: Widget Performance Optimization & Lazy Loading

## Status
Accepted

## Context
Widgets can impact page load times and user experience if not optimized:

- Multiple widgets on the same page can slow down initial render.
- Heavy scripts or large assets can block the main thread.
- Some widgets are below-the-fold or not immediately visible.

Constraints:

- Widgets must not significantly delay the host page’s Largest Contentful Paint (LCP) or First Input Delay (FID).
- Lazy loading should respect SEO, accessibility, and analytics requirements.
- Must remain compatible with embedding hosts and sandboxed environments.

## Decision

### 1. Lazy Loading
- Widgets are loaded only when near the viewport or triggered by user interaction.
- Use Intersection Observer API for viewport detection.
- Fallback: load after a short delay if Intersection Observer is unsupported.

Example lazy load trigger:

```javascript
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadWidget(entry.target.dataset.widgetId);
      observer.unobserve(entry.target);
    }
  });
});
document.querySelectorAll('.widget-container').forEach(el => observer.observe(el));

## 2. Asynchronous Script Loading

Widget scripts load asynchronously using <script async> or dynamic import.

Avoid blocking the main thread during initialization.

Critical rendering parts are split into smaller chunks (code-splitting).

## 3. Resource Optimization

Minify and compress widget JS/CSS.

Serve images in modern formats (WebP, AVIF) and appropriate resolutions.

Use caching strategies to reduce repeated network requests.

## 4. Deferred Initialization

Non-critical features (animations, analytics, experiments) are initialized after main widget content renders.

Config and feature flags (DR-016) are loaded asynchronously post-render if possible.

## 5. Metrics & Monitoring

Measure LCP, FID, and Cumulative Layout Shift (CLS) for widgets.

Log performance events via ADR-015 analytics pipeline.

Alerts if widget load times exceed thresholds on key hosts.

## 6. Compatibility & Fallback

Ensure lazy loading works in sandboxed iframes (ADR-013).

Default to immediate load if Intersection Observer is unsupported or fails.

SEO-friendly content (text, structured data) is pre-rendered server-side when necessary (ADR-009, ADR-008).

Consequences
Positive

Faster page load and improved user experience.

Reduces resource consumption on pages with multiple widgets.

Supports gradual feature rollout without impacting performance.

Negative

Slightly more complex widget initialization logic.

Lazy-loaded widgets may delay analytics or experiment data collection slightly.