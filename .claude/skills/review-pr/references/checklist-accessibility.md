# Accessibility Checklist

## Established Patterns (Maintain Consistency)

- **`aria-invalid`**: Form fields with validation errors use `aria-invalid={true}`
- **`role="alert"`**: Validation error messages use `role="alert"` for screen reader announcement
- **`role="group"`**: Related form field groups use `role="group"` with `aria-labelledby`
- **`htmlFor`**: All `<label>` elements linked to inputs via `htmlFor`
- **`data-slot`**: Shadcn-style components use `data-slot` for Tailwind styling hooks

## Radix UI Integration

- **Don't override built-in ARIA**: Radix primitives (Dialog, Select, DropdownMenu, etc.) provide correct ARIA by default — don't add redundant or conflicting attributes
- **Use Radix's accessibility props**: Prefer Radix's built-in `asChild`, `onOpenChange`, focus trap, etc. over custom implementations

## Semantic HTML

- **`<button>` for actions**: Use `<button>` for clickable actions, not `<div onClick>`
- **`<Link>` for navigation**: Use TanStack Router `<Link>` for internal navigation, `<a>` for external links
- **Heading hierarchy**: `h1` in `PageHeader`, `h3` in cards — maintain the established heading levels

## Interactive Elements

- **Icon-only buttons**: Must have `aria-label` describing the action
- **External links**: Use `target="_blank"` with `rel="noopener noreferrer"`
- **Keyboard navigation**: All interactive elements reachable via Tab; custom widgets support expected keys
- **Focus management**: Focus moves logically after delete operations, modal close, and route changes
- **Touch targets**: Interactive elements at least 44x44px on touch devices

## Forms

- **Visible labels**: Every input has a visible `<label>` or `aria-label` if visually hidden
- **Error association**: Error messages linked via `aria-describedby`
- **Color contrast**: Don't rely on color alone to indicate errors or state

## Media

- **Alt text**: All `<img>` elements have meaningful `alt` (or `alt=""` for decorative)
- **Motion**: Respect `prefers-reduced-motion` for animations
