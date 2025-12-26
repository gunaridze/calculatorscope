# ADR-018: Widget Error Handling & Graceful Degradation

## Status
Accepted

## Context
Widgets run in diverse host environments with varying network conditions, browser versions, and user settings.  
Errors during widget loading or execution can break page layout, block other scripts, or negatively impact user experience.  

Requirements:

- Widgets must fail gracefully without breaking the host page.
- Errors should be logged for monitoring and diagnostics.
- Users should receive a fallback experience if the widget cannot render.

## Decision

### 1. Error Handling
- Wrap all initialization and runtime code in try/catch blocks.
- Capture both synchronous and asynchronous errors.
- Use `window.addEventListener('error', ...)` and `window.addEventListener('unhandledrejection', ...)` inside the widget iframe for uncaught errors.
- Notify the host (postMessage) when critical failures occur.

Example:

```javascript
try {
  initializeWidget(config);
} catch (err) {
  reportWidgetError(err);
  renderFallback();
}

window.addEventListener('error', e => reportWidgetError(e.error));
window.addEventListener('unhandledrejection', e => reportWidgetError(e.reason));
### 2. Fallback Content

Provide minimal fallback UI for failed widgets (e.g., placeholder, “Widget unavailable” message).

Ensure fallback content does not break layout or accessibility.

For critical widgets, provide an alternative interaction (link, static content).

### 3. Retry & Recovery

Implement automatic retry for recoverable errors (e.g., network failures).

Exponential backoff with a maximum number of attempts (3 by default).

Allow manual reload via host-triggered event (postMessage API).

### 4. Logging & Monitoring

All errors are reported to central analytics and error tracking pipeline (ADR-015).

Include widget ID, host URL, user agent, and error stack.

Separate critical vs non-critical errors for alerting.

### 5. Isolation & Sandbox Safety

Errors in one widget must not affect other widgets or host scripts (ADR-014).

Use iframe sandboxing and strict CSP policies.

Failures are contained inside the widget iframe.

### 6. Performance Considerations

Error handling and fallback logic must not block main thread.

Lazy-loaded widgets should handle errors even if they fail to fully initialize (DR-017).

Consequences
Positive

Host page remains stable even if widgets fail.

Users have a consistent experience with clear fallback content.

Errors are tracked for faster diagnosis and fixes.

Negative

Slightly larger widget bundle to include error handling and fallback logic.

Retry logic may introduce minor delays in rendering if failures occur repeatedly.