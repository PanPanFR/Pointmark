# Follow-up: Panel Polish 2 (font, header, pick toggle, level hints)

## Changes (uncommitted — shell terkunci saat edit, belum build/commit)

- `theme.css`: font global -> `"JetBrainsMono Nerd Font", "JetBrains Mono",
  ui-monospace, ...` (pakai font lokal user bila terinstal; TANPA download,
  budget zero-network dipertahankan). `.wea-panel-head > div { flex:1 }` agar
  tombol minimize nempel di kiri X (sebelumnya space-between menyebar 3 item).
  `.wea-hint` + `aria-pressed` untuk tombol pick.
- `ui-shell.ts`: `PanelState.picking`; tombol pick 2-arah ("+ Pick element" /
  "■ Stop picking" + pressed style); toggle Compact/Standard dapat title +
  hint baris ("Short: ..." / "Full: ...").
- `main.ts`: `onPick` toggle pick/stop; `startPicking/stopAll/onCancel`
  refresh panel agar label tombol sinkron dengan Alt+A juga.

## Belum: `npm run build`, smoke, commit, merge (butuh shell).

## Susulan (disetujui user, ikut batch ini)

- a. Marker titik -> badge nomor (#1, #2, ...), renumber saat hapus
  (`setMarkerLabel`, `.wea-dot` jadi pill).
- b. Composer: hint "Ctrl+Enter = Copy · Esc = close".
- c. Toast copy sebut jumlah ("3 annotations copied — ...").
- d/e: skip / nanti.
