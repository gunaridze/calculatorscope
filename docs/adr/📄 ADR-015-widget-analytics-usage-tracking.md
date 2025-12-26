# ADR-015: Widget Analytics & Usage Tracking

## Status
Accepted

## Context
Widgets embedded on third-party sites need to collect usage data and analytics for:

- Measuring engagement and adoption.
- Debugging and monitoring widget performance.
- Optimizing features based on real-world usage.

Constraints:

- Must respect user privacy and comply with GDPR, CCPA, and other regulations.
- No personally identifiable information (PII) should be sent without explicit consent.
- Analytics should work reliably even in isolated iframe environments (see ADR-014 Widget Communication & Sandbox Isolation).

## Decision

### 1. Event Types
Analytics events are structured and categorized:

- **Lifecycle events**: `widgetLoad`, `widgetReady`, `widgetUnload`
- **User interactions**: `clickAction`, `formSubmit`, `inputChange`
- **State changes**: `stateChange`, `localeChange`
- **Errors & warnings**: `error`, `validationFailed`
- **Performance metrics**: `loadTime`, `renderTime`, `apiResponseTime`

### 2. Event Payload
All events share a standard payload:

```json
{
  "eventType": "string",
  "timestamp": "ISO8601 string",
  "widgetId": "string",
  "widgetVersion": "string",
  "data": { "key": "value" }
}
widgetId: unique identifier for the widget instance.

widgetVersion: current version of the widget.

data: event-specific information (e.g., click target, error message, API response).

### 3. Event Transmission

Events sent via postMessage to the host page (preferred) or fallback to direct API call if allowed.

Messages validated against allowlist of hosts (see ADR-014).

Batch or queue events if network is unavailable.

### 4. Privacy & Consent

Analytics collection is disabled by default until user consent is granted.

Consent can be managed via host page or embedded consent manager.

Pseudonymous IDs are used instead of personal data.

Sensitive user input (emails, names) is never sent in analytics events.

### 5. Storage & Retention

Temporary storage in memory or session storage until successful delivery.

Optionally allow short-term local storage for retry logic.

No long-term storage of PII without explicit user opt-in.

### 6. Integration with External Analytics

Provide hooks to forward events to Google Analytics, Mixpanel, or custom backend.

Events are transformed to the expected format of the target analytics service.

Must preserve widgetId and widgetVersion for consistency.

### 7. Versioning & Extensibility

widgetVersion in events allows tracking analytics separately for different widget versions.

New event types can be added without breaking older analytics consumers.

Consequences
Positive

Provides structured, privacy-compliant analytics across third-party sites.

Enables optimization of widget features based on real usage.

Compatible with multiple widget versions and host environments.

Negative

Requires consent management and strict privacy handling.

Implementation slightly increases widget complexity (event queue, batching, validation).