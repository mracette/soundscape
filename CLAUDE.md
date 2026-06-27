# Soundscape

## Conventions

- Compose `className` values with the `cx` helper (`src/utils/cx.ts`), including
  the conditional case — `cx(base, isActive && activeClass)` — rather than
  template literals or manual string concatenation.
