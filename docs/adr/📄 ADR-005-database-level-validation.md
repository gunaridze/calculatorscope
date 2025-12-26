# ADR-005: Database-Level Validation

## Status
Accepted

## Context
Relying solely on application-level validation
allows invalid data to enter the system via:
- Admin panels
- Imports
- Migrations
- External integrations

This creates long-term data integrity risks.

## Decision
Critical invariants MUST be enforced at database level.

Example:
- `tools.type` is validated using a CHECK constraint

Application validation is supplementary,
not a replacement for database guarantees.

## Consequences
### Positive
- Strong data integrity
- Early failure on invalid writes
- Safer long-term evolution

### Negative
- Slightly more complex migrations
- Requires DDL coordination

## Notes
If documentation promises a constraint,
the database MUST enforce it.
