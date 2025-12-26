# ADR-016: Widget Feature Flags & Remote Configuration

## Status
Accepted

## Context
Widgets may require dynamic feature control without redeploying the code:

- Enable or disable features for specific users, hosts, or regions.
- Test new features with a subset of users (A/B testing).
- Roll back features quickly in case of issues.

Constraints:

- Changes must propagate quickly to embedded widgets.
- Must not compromise widget security or performance.
- Must respect user privacy and consent (see ADR-012 and ADR-015).

## Decision

### 1. Feature Flags
- Each feature has a unique `flagName`.
- Flags can have boolean values (`true`/`false`) or multi-variant (`control`, `variantA`, `variantB`).
- Flags are versioned per widget version.

Example flag payload:

```json
{
  "flagName": "enableNewUI",
  "value": true,
  "targetHosts": ["example.com", "testsite.com"],
  "variants": ["control", "variantA"]
}
### 2. Remote Configuration

Widgets fetch configuration from a central endpoint at initialization.

Config is cached locally (memory/session storage) for performance.

Supports real-time updates via WebSocket or server-sent events (optional).

Example config:

{
  "widgetId": "widget-123",
  "widgetVersion": "1.2.0",
  "featureFlags": [
    { "flagName": "enableNewUI", "value": true },
    { "flagName": "showPromoBanner", "value": false }
  ],
  "experimentVariants": {
    "newCheckoutFlow": "variantA"
  }
}

### 3. Targeting & Rules

Flags can target based on:

Host/domain of embedding page

User segments (if consent given)

Geolocation (optional)

Widget version

Evaluation happens client-side for speed, with server-side fallback if needed.

### 4. Fallback & Defaults

Default flag values embedded in widget code ensure graceful degradation.

Remote fetch failures do not block widget loading; cached or default values are used.

### 5. Security & Privacy

Configuration data does not include sensitive user information.

All fetch requests are validated for allowed hosts (see ADR-014).

Real-time updates cannot inject arbitrary scripts or bypass sandbox.

### 6. Analytics & Metrics

Feature flag evaluation is logged via ADR-015 analytics events.

Enables measurement of adoption, A/B test performance, and feature usage.

Consequences
Positive

Dynamic control over widget features without redeployment.

Supports gradual rollouts, experiments, and quick rollbacks.

Compatible with analytics, consent, and privacy frameworks.

Negative

Adds complexity to widget initialization and configuration management.

Requires caching and update handling logic.