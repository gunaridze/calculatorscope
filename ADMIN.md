# Admin & Content Management

This document defines rules for admin-managed content.

---

## JSON Schema Versioning

All structured JSON content MUST include a schema version.

Applies to:
- Inputs
- Outputs
- Examples
- FAQ

### Requirement
- Each JSON block includes `schema_version`
- Admin UI supports backward compatibility
- Old content remains editable after schema updates

### Example

```json
{
  "schema_version": "1.0",
  "type": "array",
  "items": {
    "name": "amount",
    "type": "number"
  }
}
