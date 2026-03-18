# `@workspace/transactional`

This is usually where you store transactional-related code of your application
to organize and simplify things.

This also allows for using the email templates you make anywhere on your
codebase by just installing with the monorepo setup.

This also uses the [react.email](https://react.email/) CLI for previewing and
compiling the email templates into HTML ones.

Using the CLI you can also preview your emails, see how they are going to look
and try sending them to yourself for testing purposes.

## Previewing Email Templates

First, install the dependencies:

```bash
pnpm install
```

Then, you can run the [react.email](https://react.email/) development server by
running:

```bash
pnpm dev
```

Open [localhost:3001](http://localhost:3001) with your browser to see the
result.

## Using Templates Outside React

If you want to send these emails from a non-React runtime (for example
Fastify/Node.js), use the `buildEmail` helper:

```ts
import { buildEmail } from "@workspace/transactional/build-email";
import VerificationEmail from "@workspace/transactional/emails/verification-email";

const html = await buildEmail({
  component: VerificationEmail,
  props: {
    fullName: "Ada Lovelace",
    logo: "https://example.com/logo.png",
    verificationLink: "https://example.com/verify",
  },
});
```

`buildEmail` returns only the rendered HTML string. Set `subject` and `text`
at the call site where you send the email.

---

See the [react.email docs](https://react.email/docs/introduction) for more
details.
