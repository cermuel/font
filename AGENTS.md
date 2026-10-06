# Repository rules

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- Use the shadcn-compatible registry configured in `components.json`.
- Prefer an appropriate component from the public beUI registry before creating a custom animated UI primitive.

## JavaScript and TypeScript

- Use modern ES6+ syntax.
- Declare functions and React components as `const name = () => {}`. Do not use function declarations.
- Keep strict TypeScript enabled. Avoid `any`; model domain data explicitly.
- Put shared helper functions in `src/utils/helpers.ts`. Do not create scattered `utils.ts` files.

## Structure

- Keep every source file at 200 lines or fewer. Split by responsibility before reaching the limit.
- Put registry-installed and base UI primitives in `src/components/ui`.
- Put reusable app-specific atoms in `src/components/shared`.
- Put workflow-specific code in `src/features/<feature>`.
- Keep pages and layouts thin; compose feature components rather than implementing workflows in routes.
- Default to Server Components. Add `"use client"` only at the smallest interactive boundary.

## Quality

- Preserve keyboard access, visible focus, semantic HTML, and reduced-motion behavior.
- Use semantic design tokens instead of one-off colors.
- Run `npm run check` and `npm run build` before handing off a change.
