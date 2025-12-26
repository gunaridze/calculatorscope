# ADR-014: Widget Communication via postMessage

## Status
Accepted

## Context
Widgets are embedded via `<iframe>` on third-party sites. Direct DOM access to the host page is forbidden for security and isolation reasons (see ADR-013 Widget Security & Sandbox Isolation).  

Requirements:

- Enable controlled two-way communication between host page and widget.
- Support events like:
  - Initialization (`widgetReady`)
  - Data updates (`updateInput`, `updateState`)
  - User interactions (`submit`, `clickAction`)
  - Analytics / telemetry
- Prevent arbitrary messages from malicious hosts affecting widget behavior.

## Decision

### 1. Standardized Message Format
All messages use JSON objects with the following structure:

```json
{
  "type": "eventType",
  "payload": { "key": "value" },
  "widgetId": "uniqueWidgetId",
  "version": "1.0.0"
}
type: string — event name

payload: object — event data

widgetId: string — identifies the specific widget instance

version: string — widget version

### 2. Widget → Host Communication
Widgets send events only to window.parent.

Allowed events:

widgetReady

stateChange

formSubmit

analyticsEvent

Messages validated inside host page before processing.

### 3. Host → Widget Communication
Host page can send events to the widget iframe via postMessage.

Allowed events:

updateInput

resetState

setLocale

Widget validates origin (event.origin) and message structure.

### 4. Security & Validation
Only messages from trusted origins (allowlist) are accepted.

All incoming payloads are sanitized and type-checked.

Invalid messages are ignored and optionally logged.

### 5. Versioning & Backward Compatibility
version field allows:

Supporting multiple widget versions on the same page.

Conditional handling of new events while maintaining older integrations.

Breaking changes require major version bump and documented migration.

### 6. Event Handling Pattern
Widgets implement an internal EventBus to:

Queue messages before iframe fully loads

Ensure deterministic order of message processing

Emit and listen to specific event types

### 7. Analytics & Monitoring
Track message delivery and failures for debugging.

Do not expose sensitive data in messages.

Optional: acknowledge receipt of critical messages for reliability.

Consequences
Positive
Secure, isolated, and predictable communication channel between host page and widget.

Supports extensible event system for future features.

Compatible with multiple widget versions on the same page.

Negative
Requires strict validation and error handling.

Complexity increases slightly due to event queueing and version management.