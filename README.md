# Font

A Next.js app where people draw their own glyphs, generate a usable browser font, write with it, and save multiple fonts to the cloud.

## Font sizing and fallback

Every drawn glyph is automatically fitted to the correct vertical zone while preserving its proportions and the font's shared stroke weight.

Downloaded font files contain only the glyphs you draw; a font file cannot bundle a fallback. In your app, use a fallback stack such as `"My Hand Font", "FallbackFace", sans-serif` and define `FallbackFace` with `size-adjust: 83.8%` using Arial, Helvetica Neue, Helvetica, Roboto, Segoe UI, and Liberation Sans as local sources.

Anonymous drafts stay in the browser. Better Auth provides Google and email-code sign-in, while Neon Postgres stores authenticated font projects through Drizzle ORM.

## Local development

Copy `.env.example` to `.env` and provide a Neon connection string, a Better Auth secret, Google OAuth credentials, and Resend credentials. Configure Google's authorized callback URL as:

```text
http://localhost:3000/api/auth/callback/google
```

Apply the committed database migrations:

```bash
npm run db:migrate
```

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run check
npm test
npm run build
```

Project conventions are enforced and documented in [AGENTS.md](./AGENTS.md).
