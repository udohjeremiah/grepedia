# Utils Folder

The `utils` folder is for **generic, reusable helper functions** that can be
used across your entire application. These functions are **pure or stateless**,
meaning they do not rely on the Fastify instance, lifecycle hooks, or any
side-effects.

Typical use cases include:

- Data transformation (e.g., `omitKeys`, `flattenObject`)
- String manipulation (e.g., `slugify`, `capitalize`)
- Date or number formatting
- Generic validation helpers
- Any other functions that can be reused without needing Fastify context

> **Key guideline:** If the function needs access to Fastify
> (e.g., `fastify.log`, `fastify.db`, `fastify.decorate`, hooks), it does not
> belong in `utils`. Those should be implemented as a **plugin** in the
> `plugins` folder.

## When to add a file here

Add a file to `utils` when it meets all of the following criteria:

1. The functionality is generic and independent of Fastify.
2. It does not need initialization hooks or decorators.
3. It is intended to be reused in routes, plugins, or other parts of the app.

> Examples: `array-helpers.ts`, `string-utils.ts`, `date-utils.ts`, `math-helpers.ts`.

## If it doesn't fit here

If a piece of functionality requires Fastify context or lifecycle hooks, it
should go into the `plugins` folder. Examples:

- Database access helpers (`fastify.db`)
- Authentication utilities (`fastify.authenticate`)
- Service initializers (e.g., ML models, API clients)
- Logging or caching decorators

If a functionality is a data schema, validation, or type definition, it belongs
in the `schemas` folder. Examples:

- User, product, or content schemas
- Zod, Joi, or TypeScript type definitions
- Any model validation logic

## How to use utils

Import and use the function directly wherever needed:

```ts
import { omitKeys } from "@/utils/omit-keys.js";

const data = { a: 1, b: 2, c: 3 };
const sanitized = omitKeys(data, ["b", "c"]);
// sanitized = { a: 1 }
```
