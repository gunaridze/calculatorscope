# ADR-012: Embed Versioning & Cache Strategy

## Status
Accepted

## Context
Embedded widgets are served on third-party websites. Requirements:

- Ensure updates to widget code do not break existing embeds.
- Avoid CDN/edge cache issues when releasing new widget versions.
- Maintain backward compatibility for older embeds.
- Balance performance (fast load via cache) with flexibility (ability to update).
- Embed URLs may be cached at browser, CDN, or host site level.

Problems:

- Hard-to-control caching on third-party domains may serve outdated widget versions.
- Updating JS/CSS may break existing embeds if not versioned.
- Frequent updates could invalidate CDN caches and impact performance.

## Decision
### 1. Versioning Scheme
- Each widget release gets a semantic version: `v{major}.{minor}.{patch}`.
- Embed script URLs include version number:
<script src="https://cdn.calculatorscope.com/widget/v1.2.0/widget.js"></script>
- Minor/patch updates are backward-compatible.
- Major updates may include breaking changes; documentation required.

### 2. URL Strategy
- Versioned URLs for all static assets: JS, CSS, images.
- Latest version redirect (`/widget/latest/widget.js`) allowed for new embeds only.
- Legacy embeds continue using fixed version URL.

### 3. Cache Control
- CDN: long TTL for versioned assets (`1 year`) with immutable headers.
- CDN: short TTL (`5 min`) for `latest` alias to allow rapid updates.
- Browser cache: respect `Cache-Control: immutable` for versioned assets.
- Avoid query string versioning to prevent inconsistent caching on some CDNs.

### 4. Deployment Process
- Release pipeline automatically increments patch version.
- Minor/major releases require regression testing.
- Update `latest` pointer after successful deployment.
- Communicate breaking changes for major versions to partners.

### 5. Embed Integrity
- Optional: Subresource Integrity (SRI) hash for additional security.
- Ensure CORS headers allow third-party sites to load widget safely.

### 6. Monitoring & Rollback
- Track embed load success via analytics (if consented).
- Rollback: point `latest` alias to previous stable version.
- Deprecated versions remain available for at least 12 months.

## Consequences
### Positive
- Safe and predictable updates of widgets.
- Backward compatibility for existing embeds.
- Improved CDN caching and load performance.

### Negative
- Slightly more complex release/deployment process.
- Third-party sites need to use correct version URLs.
- Major updates may require communication and documentation for partners.
