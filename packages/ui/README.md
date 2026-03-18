# `@workspace/ui`

Shared UI package for the workspace.

This workspace contains reusable UI components, hooks, styles, and utilities
used by apps in this monorepo.

## Important Notice

This monorepo follows shadcn/ui monorepo support with `components.json` in
each workspace that wants to use shadcn/ui.

Before adding or updating components, please read
<https://ui.shadcn.com/docs/monorepo>.

## Package Layout

- `src/components` - reusable UI components
- `src/hooks` - shared UI hooks
- `src/lib` - UI-focused helpers
- `src/utils` - utility functions (`cn`, etc.)
- `src/styles/globals.css` - shared Tailwind v4 styles

## Importing Components

Import components from `@workspace/ui` in app workspaces.

```tsx
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/utils/cn";
```

## Check For Updates Before Adding Components

Always check registry/component changes before installing or updating
components:

```bash
pnpm dlx shadcn@latest diff
```

If there are differences, review them and decide whether to apply them.

## Adding Components

Run shadcn from the path of the app you are working in, so aliases and imports
resolve correctly.

Example (`apps/web`):

```bash
cd apps/web && pnpm dlx shadcn@latest add <component>
```

## Verify Configuration

To inspect what shadcn resolves for this workspace:

```bash
pnpm dlx shadcn@latest info --cwd packages/ui
```

This helps confirm aliases and resolved paths before generating files.
