# Pointmark

Point at any element on a page, annotate it, and copy structured context — selector, HTML, text, styles — as Markdown you can paste into any AI coding agent.

Chrome extension (Manifest V3). Vanilla TypeScript + Vite, no runtime dependencies. Everything stays on your machine.

## Features

- **Element picker** — `Alt+A`, the toolbar icon, or the picker button in the panel
- **Instruction per annotation** — say what should change, not just which element
- **Two detail levels** — `compact` (selector, tag, text, HTML, parent) or `standard` (adds ancestors, nearest heading, computed styles, geometry, page title, XPath fallback)
- **Annotation list** — check the rows you want, then copy one row, the selected rows, or everything
- **On-page markers** — numbered badges stay on the elements you already annotated
- **Local only** — annotations live in `chrome.storage.local` (max 100), nothing is sent anywhere

## Install (users)

1. Open [Releases](../../releases) and download the latest `pointmark-vX.Y.Z.zip`
2. Extract it to a folder you will keep — Chrome loads the extension from that folder, so do not delete it
3. Go to `chrome://extensions`, turn on **Developer mode** (top right)
4. Click **Load unpacked** and select the extracted folder (the one containing `manifest.json`)
5. Pin Pointmark to the toolbar, then press `Alt+A` on any page

Details, updates, and troubleshooting: [docs/install.md](docs/install.md)

> There is no auto-update. To update, download the new zip, replace the folder contents, then click **Reload** on `chrome://extensions`.

## Usage

1. Press `Alt+A` (or click the toolbar icon → picker button) to start picking
2. Move the mouse — the element under the cursor is highlighted
3. Click it. The composer opens next to the element
4. Type the instruction ("make this button full width"), pick a level, then **Add** to keep annotating or **Copy** to copy just this one
5. The toolbar icon opens the list: check rows, **Copy selected** / **Copy all**, delete single rows or clear everything

Full walkthrough: [docs/usage.md](docs/usage.md)

### What the copied text looks like

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

The `standard` level adds the ancestor chain, nearest heading, computed styles, geometry, page title, and an XPath fallback.

## Permissions and privacy

| Permission | Why it is needed |
|---|---|
| `activeTab` | Send the toggle message when you click the toolbar icon |
| `storage` | Save the annotation list locally |
| `commands` | Register the `Alt+A` shortcut |
| Content script on `http`, `https`, `file` | Draw the highlight, composer, markers, and panel on the page |

Nothing is uploaded. No analytics, no network calls.

## Development

```sh
npm install
npm run dev      # Vite watch build into dist/
npm run build    # type-check + production build into dist/
```

Then load `dist/` via **Load unpacked** (steps 3–4 above).

After changing `public/manifest.json` or `public/background.js`, run `npm run build` and click **Reload** on `chrome://extensions`.

## Releasing

1. Update [CHANGELOG.md](CHANGELOG.md)
2. Bump `version` in `public/manifest.json` and `package.json`
3. Commit, then tag and push: `git tag v0.1.1 && git push origin v0.1.1`
4. [.github/workflows/release.yml](.github/workflows/release.yml) builds, zips, and publishes a GitHub Release with `pointmark-v0.1.1.zip` attached

Versions follow [Semantic Versioning](https://semver.org/); every user-visible change gets a [CHANGELOG](CHANGELOG.md) entry.
