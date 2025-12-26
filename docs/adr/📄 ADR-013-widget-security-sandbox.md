# ADR-014: Widget Security & Sandbox Isolation

## Status
Accepted

## Context
Embedded widgets run on third-party websites. Risks include:

- Malicious or buggy host page scripts interfering with widget behavior.
- Cross-site scripting (XSS) or data leaks from widget to host page or vice versa.
- Widgets executing unauthorized actions (e.g., network calls, localStorage access).
- Potential conflicts with host site CSS or JS.

Requirements:

- Isolate widget execution from host page.
- Prevent widget code from accessing unrelated host page data.
- Maintain ability to communicate with widget (e.g., postMessage API) safely.
- Ensure secure loading of external assets (JS/CSS/images).

## Decision
### 1. Iframe Isolation
- All widgets served via `<iframe>` with:
  - `sandbox="allow-scripts allow-same-origin allow-popups"` (adjusted per feature).
  - `allow="clipboard-read; clipboard-write"` if clipboard features needed.
- Widgets cannot access host DOM directly.
- `postMessage` used for controlled communication between host page and widget.

### 2. CSP & Subresource Security
- Serve widget assets with strict Content Security Policy (CSP):
  - Only allow scripts/styles/images from trusted domains (`self` + CDN).
- Optional: Subresource Integrity (SRI) on critical JS/CSS files.
- Avoid inline scripts/styles in embeds.

### 3. JS Execution Environment
- Widget JS executes only inside iframe.
- Avoid access to `window.parent` except via controlled `postMessage`.
- Validate and sanitize all incoming messages from host page.

### 4. CSS Isolation
- Use Shadow DOM for component-level isolation inside iframe.
- Prevent CSS leakage to/from host page.

### 5. Data & Analytics
- Do not store sensitive user data inside embeds.
- Use consented analytics only.
- Rate-limit any external requests to prevent abuse.

### 6. Deployment & Versioning
- Combine with ADR-013: Versioned widget URLs.
- Security patches require minor/patch version increment.
- Major security fixes may require immediate redeployment and notification.

### 7. Monitoring & Alerts
- Monitor for unusual network calls or error spikes in widgets.
- Log failures for investigation without exposing host page data.

## Consequences
### Positive
- Widgets safely isolated from host page and other widgets.
- Reduced risk of XSS, CSS/JS conflicts, or data leakage.
- Secure environment allows embedding on any third-party site.

### Negative
- Slight increase in complexity for communication (postMessage).
- Styling may need additional adjustments due to iframe isolation.
- Shadow DOM may limit certain global CSS inheritance patterns.
