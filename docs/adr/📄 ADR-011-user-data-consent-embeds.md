# ADR-011: User Data Handling & Consent in Embeds

## Status
Accepted

## Context
Embedded widgets on third-party websites may collect user data (inputs, analytics, cookies). Key requirements:

- Compliance with GDPR, CCPA, and other privacy regulations.
- Users must provide explicit consent for tracking cookies and analytics.
- No personal data should be transmitted to third parties without consent.
- Embedded widgets must respect the host site’s cookie and privacy settings.
- Default behavior: minimal functionality without collecting personal data until consent is granted.

Problems:
- Embeds can bypass main site consent mechanisms.
- Collecting analytics without consent could lead to legal issues.
- Users may be unaware their data is transmitted to the platform from third-party sites.

## Decision
### 1. Consent Handling
- Embeds must integrate with the host site’s consent management platform (CMP) if available.
- If CMP unavailable, embed shows minimal consent prompt for data collection.
- Functional operation of the widget is possible without consent; advanced tracking or analytics require explicit approval.
- Consent recorded and stored securely on the platform side.

### 2. Data Types & Collection
- **Allowed without consent:** non-identifiable inputs used only for calculation/display.
- **Requires consent:** cookies, IP addresses, analytics events, usage statistics.
- **Never collected:** sensitive personal data (SSN, payment info, health data) unless explicitly consented via secure channel.

### 3. Data Transmission
- All embed requests over HTTPS.
- Data sent to canonical platform URL.
- Personal data anonymized where possible (e.g., hashed IP addresses).

### 4. Cookie Policy
- Embed sets only essential cookies by default (`no tracking`).
- Optional analytics cookies loaded only after user consent.
- Embed respects “Do Not Track” headers from browsers.

### 5. User Interface
- Consent prompt or banner lightweight and mobile-friendly.
- Clear description of what data is collected and why.
- Option to revoke consent at any time.

### 6. Operational Guidelines
- Embed developers must ensure CMP integration or local consent prompt is present.
- Regular audit of embeds to ensure no unauthorized data collection.
- Documentation for third-party sites explaining consent and data handling requirements.

## Consequences
### Positive
- Full GDPR/CCPA compliance for embedded widgets.
- Users aware of data usage; can opt-in or opt-out.
- Avoids legal risks associated with unauthorized tracking.

### Negative
- Slightly more complex embed implementation.
- Consent prompts may reduce initial engagement on third-party sites.
- Additional effort for auditing and monitoring embed compliance.

## Notes
- Consent records must be stored for at least 6 months.
- Widgets must degrade gracefully if consent is denied (calculation works, analytics disabled).
- Future updates to privacy regulations may require embed adjustments.
