# Font

A Next.js foundation for an app where people draw their own glyphs, generate a usable browser font, and write with it.

## Font sizing and fallback

Every drawn glyph is automatically fitted to the correct vertical zone while preserving its proportions and the font's shared stroke weight.

Downloaded font files contain only the glyphs you draw; a font file cannot bundle a fallback. In your app, use a fallback stack such as `"My Hand Font", "FallbackFace", sans-serif` and define `FallbackFace` with `size-adjust: 83.8%` using Arial, Helvetica Neue, Helvetica, Roboto, Segoe UI, and Liberation Sans as local sources.

The product UI and font-building behavior are intentionally not implemented yet. See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the agreed sequence.

## Local development

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run check
npm run build
```

Project conventions are enforced and documented in [AGENTS.md](./AGENTS.md).
