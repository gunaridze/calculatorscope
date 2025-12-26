# ADR-020: Widget Theming & Custom Styles

## Status
Proposed

## Context
The CalculatorScope platform provides embeddable widgets that must fit seamlessly into diverse publisher websites. Publishers may require custom visual styles (colors, fonts, spacing) to match their brand identity while maintaining accessibility, performance, and SEO/AI-safe requirements.

The widgets are loaded via iframe or script injection (`<script src="..."></script>`), and the platform enforces functional isolation. Any theming must not compromise:

- Calculation engine integrity
- Embed security (sandboxed iframes)
- Performance (CLS, FCP, LCP)
- Accessibility (contrast, font sizing)
- AI-friendly structured content and metadata

## Decision

### 1. CSS Variables

- Expose a limited set of CSS variables for theming:
  ```css
  --cs-bg-color
  --cs-text-color
  --cs-primary-color
  --cs-font-family
  --cs-border-radius
  --cs-spacing-unit
Default values correspond to the platform branding:

--cs-bg-color: #FFFFFF
--cs-text-color: #000000
--cs-primary-color: #1814E6
--cs-font-family: 'Geist', sans-serif
--cs-border-radius: 4px
--cs-spacing-unit: 8px

### 2. Theme Configuration

Publishers can define a JSON configuration object:

window.CS_WIDGET_THEME = {
  bgColor: "#f0f0f0",
  textColor: "#333333",
  primaryColor: "#1814E6",
  fontFamily: "Arial, sans-serif",
  borderRadius: "6px",
  spacingUnit: "10px"
};


The widget script reads this object before render and applies styles using CSS variables.

### 3. Scoped Styles

All custom styles are applied inside the widget iframe.
No global CSS leakage; parent page styles cannot override widget internals.
Shadow DOM usage optional for additional encapsulation.

### 4. Dynamic Theming

Widgets can dynamically update their theme if window.CS_WIDGET_THEME changes before widget.render() call.
Post-initialization updates are not allowed to prevent CLS or layout shift issues.

### 5. Brand Colors

Use platform palette for default and fallback:
Black: #000000
Blue: #1814E6
Gray: #9A9898
Publishers may override but must maintain WCAG AA contrast ratios.

### 6. Font Handling

Use platform-optimized web fonts (Geist) by default.
Custom fonts allowed via fontFamily, must be web-safe or loaded by publisher.
Ensure fallback fonts in case custom fonts fail to load.

### 7. Developer API

CS_Widget.render(targetElement, config) supports optional theme parameter.
No inline <style> injection into parent page.
No JavaScript modifications allowed to calculation engine.

### 8. Validation & Safety

- Validate all theme parameters:
-- Colors: valid HEX / RGB / HSL
-- Font: non-empty string
-- Spacing / border-radius: CSS unit (px, rem, em)

- Ignore invalid entries, fallback to defaults.
- Prevent CSS injection or script execution.

### 9. Accessibility & SEO

- Maintain text contrast for readability.
- Keep aria-labels and structured HTML intact.
- No SEO impact: iframe content is sandboxed but AI-friendly metadata remains.

Consequences
- Publishers can match widget appearance to their branding safely.
- Platform retains control over core functionality and security.
- Isolated theming prevents CLS, FCP, and AI-content degradation.
- Any violations of theme specification fallback to default styles.