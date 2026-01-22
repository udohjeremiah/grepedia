# Schemas Folder

The `schemas` folder is for **data validation and type definitions** used across
your application. These schemas define the **shape, structure, and constraints**
of your data and can be used in routes, plugins, or utilities.

Typical use cases include:

- Request validation for routes
- Response validation for routes or services
- Database document validation
- Type-safe definitions for TypeScript
- Shared constants or enums for data structures

> **Key guideline:** Schemas should **not contain business logic** or depend on
> Fastify instances. They should describe data structure, constraints, and types
> only.

## When to add a file here

Add a file to `schemas` when it meets all of the following criteria:

1. It defines the shape or structure of an object or document.
2. It is intended for validation or type inference
   (e.g., Zod, Joi, Yup, or TypeScript types/interfaces).
3. It is reusable across routes, plugins, and services.

> Examples: `user-schema.ts`, `tool-schema.ts`, `product-schema.ts`, `response-schemas.ts`.

## If it doesn't fit here

If a file implements behaviour, side-effects, or interacts with Fastify, it
should go into the `plugins` folder. Examples:

- Database access decorators or helpers
- Authentication and authorization utilities
- Logging, caching, or service initializers

If a file contains pure helper functions that do not describe data structure, it
should go into the `utils` folder. Examples:

- `string-utils.ts`
- `array-helpers.ts`
- `date-utils.ts`

## How to use schemas

Schemas can be used for validation in routes or type inference in TypeScript:

```ts
import { z } from "zod";
import { userSchema } from "@/schemas/user-schema.js";

type User = z.infer<typeof userSchema>;

// Example usage in a route
fastify.route({
  method: "POST",
  url: "/users",
  schema: {
    body: userSchema,
    response: {
      201: userSchema,
    },
  },
  handler: async (request, reply) => {
    const user: User = request.body;
    // use validated and typed user object
  },
});
```
