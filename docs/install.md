# Install Pointmark

This page is for people who want to use Pointmark. You do not need to know how to code.

Pointmark is not in the Chrome Web Store. You download a zip file and add it to your browser by hand.

## Before you start

- A Chromium browser: Chrome, Edge, Brave, Arc, or Vivaldi. On a computer, not a phone.
- Two minutes.

## Steps

1. **Download.** Open the [Releases](../../releases) page and download the newest `pointmark-vX.Y.Z.zip`.
2. **Unzip it into a folder you will keep.** For example `C:\Pointmark` or `~/pointmark`.
   Chrome reads the add-on from this folder every time it starts, so do not delete or move the folder while Pointmark is installed.
   The folder must contain a file called `manifest.json` directly. If all you see is another folder inside, open that folder one level and use it instead.
3. **Open the add-ons page.** Type `chrome://extensions` in the address bar and press Enter.
4. **Turn on Developer mode.** The switch is in the top right corner.
5. **Install the folder.** Click **Load unpacked**, choose the folder from step 2, and confirm. The button name sounds odd, but it only means "install the folder I downloaded".
6. **Pin it.** Click the puzzle-piece icon in the toolbar and pin **Pointmark**.
7. **Try it.** Open any website and press `Alt+A`, or click the Pointmark icon.

## Check that it works

1. Press `Alt+A`. Elements get outlined as you move the mouse.
2. Click any element. A small box opens next to it.
3. Type a short instruction and click **Add**. A numbered marker appears on the element.
4. Click the Pointmark icon in the toolbar. Your note is in the list. Click **Copy all** and paste into a text editor: the description should be there.

## Updating

Pointmark does not update itself.

1. Download the new zip from [Releases](../../releases).
2. Unzip it into the same folder and let it replace the old files.
3. Open `chrome://extensions` and click **Reload** on the Pointmark card.

Your notes are kept, as long as the folder stays in the same place.

## Uninstalling

Open `chrome://extensions` and click **Remove** on the Pointmark card. This also deletes your saved notes. After that you can delete the folder.

## Common problems

| What you see | Why | What to do |
|---|---|---|
| The toolbar badge shows `!` | The page is a browser page, such as settings, a new tab, or the add-on store. Add-ons cannot run there. | Open a normal website |
| The toolbar badge shows `F5` | The tab was already open before you installed or updated Pointmark, so it does not know about the add-on yet | Refresh the page |
| The message "extension updated — refresh page (F5)" | Same reason, and it appeared while you were saving a note | Refresh the page and try again |
| `Alt+A` does nothing | Another add-on or the page itself already uses that shortcut, or the page blocked the key | Use the Pointmark icon in the toolbar, then the pick button |
| The message "copy denied — select + Ctrl+C" | The page did not allow copying for you | A box with the text appears. Select the text and press `Ctrl+C` |
| The message "list full (100)" | You reached the limit of 100 notes | Delete notes you no longer need |
| Notes disappeared after reloading Pointmark | The folder was moved, so the browser sees it as a different add-on | Keep Pointmark in a folder that does not move |
