# Using Pointmark

Audience: people who have Pointmark installed (see [install.md](install.md)).

Pointmark turns "this element here" into text an AI agent can act on: a Markdown block with the selector, the HTML, and your instruction.

## The picker

Start picking in any of three ways:

- Press `Alt+A` on the page
- Click the toolbar icon (opens the panel) → picker button
- Use the browser shortcut command `Toggle element picker` (default `Alt+A`; remappable at `chrome://extensions/shortcuts`)

While picking, the element under the cursor is outlined. Click it to open the composer. Press `Esc`, or toggle picking off, to stop.

## The composer

The composer opens next to the picked element.

| Field | What it does |
|---|---|
| Instruction | Free text describing what should change. This is what your agent reads first. |
| Level | `compact` or `standard` — how much element context to include |
| Add | Saves the annotation, drops a numbered marker on the element, and immediately starts picking again so you can chain annotations |
| Copy | Copies just this annotation to the clipboard without saving it to the list |

The level you pick becomes the default for the next annotation.

## Levels

| Field | compact | standard |
|---|---|---|
| Page URL | yes | yes |
| CSS selector, tag, text | yes | yes |
| Outer HTML | yes | yes |
| Direct parent HTML (truncated) | yes | yes |
| Instruction | yes | yes |
| Ancestor chain | — | yes |
| Nearest heading | — | yes |
| Computed styles | — | yes |
| Geometry (`x, y, width x height`) | — | yes |
| Page title | — | yes |
| XPath fallback | — | yes |

Use `compact` when the selector is enough. Use `standard` for layout, styling, or spacing requests, where computed values and geometry matter.

## The annotation list

Click the toolbar icon to open the panel.

| Action | Result |
|---|---|
| Checkbox per row | Marks the row as selected for **Copy selected** |
| Copy icon on a row | Copies only that annotation |
| Delete icon on a row | Removes it and renumbers the on-page markers |
| Copy selected | Copies the checked rows as one Markdown document |
| Copy all | Copies every row, ignoring checkboxes |
| Clear | Deletes the whole list |
| Minimize | Shrinks the panel to a small bar |
| Pick | Toggles picking on and off |

Copies go straight to the clipboard — paste them into your agent's chat, prompt box, or a file.

## Limits and storage

- Maximum 100 annotations; adding more is blocked with a "list full" warning.
- Annotations are stored in `chrome.storage.local` for that browser profile. They are not synced across devices and never leave your machine.
- Annotations are per browser profile, not per page: picking on a second page keeps the list from the first. The copied output labels each annotation with its own page URL.

## What the output looks like

Single annotation (`compact`):

````md
## Web Element Annotation

Page: https://example.com/pricing

Selector: `main > section:nth-of-type(2) > button.cta`

Tag: `button`

Text: `Start free trial`

HTML:

```html
<button class="cta" type="button">Start free trial</button>
```

Instruction:

Make this button full width on mobile.
````

Multiple annotations are wrapped in one document with an `## Annotation N` heading per row, so a single paste carries the whole review.
