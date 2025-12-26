# ADR-007: Isomorphic Calculation Engine

## Status
Accepted

## Context
The platform hosts multiple calculators, converters, and tools. Requirements include:
- Identical calculation results on server and client
- SEO-safe rendering (pre-render initial state)
- AI-friendly examples & content blocks
- Support for scalable, automated generation of examples
- Isolation from UI and browser APIs

Challenges:
- Avoiding logic duplication between server and client
- Preventing hydration mismatches in React
- Supporting both simple JSON engines and complex custom tools

## Decision
All business logic must be implemented as **pure TypeScript functions** that are completely independent of React, browser APIs, or UI components.

### 1. Structure
/core/engines/{tool}.ts

Each engine must export:
- `calculate(input: Input): Output`
- `validate(input: Input): ValidationResult`
- (Optional) `normalize(input: Input): Input`

**Rules:**
- No React hooks
- No DOM or browser APIs
- Stateless, deterministic functions
- Same code runs on both server and client

### 2. Rendering
- **Server**: pre-renders initial state for SEO and share links
- **Client**: hydrates and recalculates on input change
- Query parameters applied **only on client** except for pre-rendered share links

### 3. Example Generation
- Examples (`input → output`) must be generated using the engine:
  - At build time
  - During ISR
  - Admin preview
- No hardcoded values
- Used in:
  - SEO blocks
  - AI citation blocks
  - HTML content sections

### 4. Engine Types
#### A) JSON Engine
- Simple, mass-producible tools (unit converters, percentages, counters)
- Fully generic engine configuration

#### B) Custom Engine
- Complex tools with graphs, tables, simulations
- Requires dedicated TS functions per tool

### 5. Admin Integration
- Admin UI triggers engine validation for all inputs/outputs
- Conflict between engine output and example blocks flagged as **critical bug**

### 6. Deployment & CI/CD
- Engines compiled in TS → JS for both server/client
- Unit tests required for:
  - Calculation correctness
  - Validation rules
  - Example consistency

## Consequences
### Positive
- Guaranteed consistent results on server and client
- AI & SEO-friendly content blocks
- Simplifies testing and scaling
- Reduces risk of hydration mismatches

### Negative
- Initial overhead for defining engines
- Requires strict separation from UI

## Notes
- Engines should be versioned independently if logic changes
- Any breaking change in calculation logic must trigger example regeneration
- Supports horizontal scalability (1000+ tools) without adding UI complexity
