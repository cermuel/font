# Phase 1: product and technical specification

## MVP outcome

A user can create a font in the first section of one workspace page and immediately use that font in the typing section below it. Both sections operate on the same in-memory project and locally persisted draft.

## Route map

| Route | Timing | Purpose |
| --- | --- | --- |
| `/` | MVP | Single font-building and typing workspace |
| `/fonts` | Later | Saved-font library after accounts and database persistence exist |
| `/fonts/[id]` | Later | Reopen, preview, and edit one saved font |

The MVP must not introduce routing abstractions for the future pages. The root layout will eventually own the shared navbar so it can naturally span all three routes.

## Workspace structure

1. **Shared navbar**
   - Product identity at the leading edge.
   - `Build` and `Write` anchor links to the two page sections.
   - Project status and future account actions at the trailing edge.
   - Sticky only if testing shows it improves movement between the long sections.
2. **Build your font** (`#build`)
   - Current-character heading and overall completion count.
   - Drawing canvas with typographic guides.
   - Undo, clear, previous, and next actions.
   - Character grid for A–Z, a–z, and 0–9.
   - Live sample showing the generated font as glyphs become available.
3. **Write with your font** (`#write`)
   - Editable writing surface using the generated font.
   - Clear fallback state for characters that have not been drawn.
   - MVP controls for size, color, line height, letter spacing, and word spacing.
   - Export actions arrive only after the drawing-to-preview loop is stable.

Both sections remain in normal top-to-bottom reading order. Navigation scrolls to a section; it does not hide either section behind tabs.

## Responsive behavior

- Use one shared content width and alignment edge for the navbar and both sections.
- On wide layouts, the drawing canvas and character grid may sit side by side.
- Collapse the build section to canvas first, then controls, then the character grid when that composition stops fitting.
- Keep the writing section below the complete build section at every width.
- Allow control groups to wrap. Do not horizontally clip primary actions.
- Account for safe-area insets if the navbar becomes sticky on mobile.

## State ownership

`FontBuilderWorkspace` will own the active project and provide narrow state/actions to each section. Canvas pointer state stays local to the canvas component. Generated font data is derived from glyph strokes and must not become a second source of truth.

```text
FontBuilderWorkspace
  ├─ WorkspaceNavbar
  ├─ GlyphEditorSection
  │   ├─ GlyphCanvas
  │   ├─ GlyphActions
  │   └─ CharacterGrid
  └─ WritingEditorSection
      ├─ FormattingToolbar
      ├─ WritingSurface
      └─ MissingGlyphNotice
```

## Storage and font generation

- Put browser persistence behind an adapter even though the MVP uses `localStorage`.
- Store normalized strokes and editor settings, never a generated object URL.
- Version the stored project shape from the first implementation.
- Generate the font in the browser; move outline work into a Web Worker before expanding beyond the first vertical slice.
- Revoke replaced object URLs and remove replaced `FontFace` instances.

## Initial component inventory

Use source-owned primitives only when the related feature is implemented:

- beUI `button` for primary and secondary actions.
- beUI `tooltip` for unfamiliar icon-only actions.
- beUI `range-slider` for numeric writing controls.
- beUI `color-selector` for a small accessible color palette.
- beUI `animated-toast-stack` for save, export, and recoverable-error feedback.

Do not use tabs for the two main sections. Avoid decorative motion in the canvas and typing loops; these are high-frequency interactions.

## Acceptance criteria for Phase 2

- The root page composition and state boundary match this specification.
- Drawing works with mouse, touch, and pen through pointer events.
- A refresh restores a versioned local draft.
- Keyboard users can choose a glyph and operate every drawing action.
- The implementation starts with one lowercase `a` vertical slice before the full grid is enabled.
