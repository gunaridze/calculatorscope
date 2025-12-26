# Database Design

This document describes database-level guarantees and constraints.

---

## Tools Table

### tools.type

Although `tools.type` is stored as VARCHAR,
database-level validation is REQUIRED.

### Allowed values
- calculator
- converter
- text_tool
- generator
- checker

### Enforcement

A CHECK constraint MUST be applied:

```sql
ALTER TABLE tools
ADD CONSTRAINT tools_type_check
CHECK (type IN (
  'calculator',
  'converter',
  'text_tool',
  'generator',
  'checker'
));
