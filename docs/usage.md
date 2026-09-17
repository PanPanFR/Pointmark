# Using Pointmark

This page explains everything Pointmark can do. It assumes you already installed it — see [install.md](install.md) if not.

Pointmark turns "this thing here" into text an AI assistant can act on: a short description with your instruction, ready to paste.

## Picking an element

Start picking in any of these ways:

- Press `Alt+A` on the page.
- Click the Pointmark icon in the toolbar, then the pick button.
- Use the browser shortcut `Toggle element picker` (it starts as `Alt+A`, and you can change it at `chrome://extensions/shortcuts`).

While picking, the element under the mouse is outlined. Click it to open the small box. Press `Esc`, or turn picking off, to stop.

## The small box (composer)

The box opens next to the element you picked.

| Field | What it does |
|---|---|
| Instruction | Free text about what should change. This is the first thing your AI reads. |
| Level | Short or Detailed — how much information about the element to include. |
| Add | Saves the note, puts a numbered marker on the element, and starts picking again so you can keep going. |
| Copy | Copies just this note and does not save it. |

The level you choose becomes the default for your next note.

## Short or Detailed

| What gets copied | Short | Detailed |
|---|---|---|
| Page address | yes | yes |
| The code that points to the element | yes | yes |
| Type of element and its visible text | yes | yes |
| The element's HTML | yes | yes |
| Its parent HTML (shortened) | yes | yes |
| Your instruction | yes | yes |
| Surrounding elements | no | yes |
| Nearest heading | no | yes |
| Styles in use | no | yes |
| Size and position on the page | no | yes |
| Page title | no | yes |
| Another way to find the element | no | yes |

Use **Short** when naming the element is enough. Use **Detailed** when you care about layout, spacing, or colors — the extra information shows what the page actually uses right now.

## Your list of notes

Click the Pointmark icon in the toolbar to open the list.

| Action | What happens |
|---|---|
| Tick box on a row | Marks the row for **Copy selected** |
| Copy icon on a row | Copies only that note |
| Delete icon on a row | Removes it and renumbers the markers on the page |
| Copy selected | Copies the ticked rows as one block of text |
| Copy all | Copies every row, whether ticked or not |
| Clear | Deletes every note |
| Minimize | Shrinks the list to a small bar |
| Pick | Turns picking on and off |

Copies go straight to your clipboard. Paste them into your AI chat, or into a file you are working on.

## Limits and where notes live

- Up to 100 notes. After that, Pointmark asks you to delete some first.
- Notes are saved in your browser, in the profile you are using. They do not follow you to another computer or another browser.
- Notes are not tied to a page: if you pick on a second website, the list still shows the notes from the first. Each note carries its own page address in the copied text.
- Nothing leaves your computer. There is no account and no syncing.

## What the copied text looks like

One note, Short level:

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

If you copy several notes, they come in one document, one note after another, each with its own heading. That way a single paste carries your whole review.
