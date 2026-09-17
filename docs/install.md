# Install Pointmark

Audience: people who want to use the extension. No build tools needed.

Pointmark is not on the Chrome Web Store. It is distributed as a zip on the [Releases page](../../releases) and installed as an unpacked extension.

## Requirements

- Chrome or another Chromium browser (Edge, Brave, Arc, Vivaldi) with Manifest V3 support
- Ability to enable **Developer mode** — available on regular desktop Chrome

## Steps

1. **Download** — open [Releases](../../releases) and download the newest `pointmark-vX.Y.Z.zip`.
2. **Extract** — unzip it to a folder you will keep, for example `C:\Pointmark` or `~/pointmark`.
   Chrome reads the extension from this folder on every start, so do not delete or move it while the extension is installed.
   The folder must contain `manifest.json` directly — if you see a nested `dist` or `pointmark-v0.1.0` folder, go one level in.
3. **Open the extensions page** — type `chrome://extensions` in the address bar.
4. **Enable Developer mode** — toggle in the top right corner.
5. **Load** — click **Load unpacked**, select the extracted folder, confirm.
6. **Pin it** — click the puzzle-piece icon in the toolbar and pin **Pointmark**.
7. **Try it** — open any website and press `Alt+A`, or click the Pointmark icon.

## Verify it works

1. Press `Alt+A` — the page cursor turns into a picker and elements highlight on hover.
2. Click any element — the composer opens next to it.
3. Type a short instruction and click **Add** — a numbered marker appears on the element.
4. Click the toolbar icon — the panel lists your annotation. Click **Copy all**, paste into an editor: the Markdown block should be there.

## Updating

There is no auto-update for unpacked extensions.

1. Download the new zip from [Releases](../../releases).
2. Extract it over the same folder (replace existing files).
3. Open `chrome://extensions` and click **Reload** on the Pointmark card.

Your annotations are kept — they live in `chrome.storage.local` for the extension, and the unpacked extension ID stays the same as long as the folder path does not change.

## Uninstalling

Open `chrome://extensions`, click **Remove** on the Pointmark card. This also deletes the stored annotations. You can then delete the folder.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Toolbar badge shows `!` | The page is restricted: `chrome://`, the Web Store, the new tab page, devtools | Open a normal `http(s)` page |
| Toolbar badge shows `F5` | The tab was open before the extension was installed, reloaded, or updated, so it has no live content script | Refresh the page (F5) |
| Toast "extension updated — refresh page (F5)" | Same as above, triggered while adding an annotation | Refresh the page, then annotate again |
| Nothing happens on `Alt+A` | Another extension or the page itself uses that shortcut, or the page swallowed the key event | Use the toolbar icon → picker button instead |
| Toast "copy denied — select + Ctrl+C" | The page denied clipboard write access | Use the manual copy box that appears: select the text and press `Ctrl+C` |
| Toast "list full (100)" | The 100-annotation cap was reached | Delete annotations you no longer need |
| Annotations disappeared after reloading the extension | The folder path changed (browser counts it as a different extension) | Keep the extension in a fixed folder |
