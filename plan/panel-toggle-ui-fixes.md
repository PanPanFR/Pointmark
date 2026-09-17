# Follow-up: Panel Toggle + UI Polish + Coverage Notes

## Goal

1. Klik icon extension -> panel kanan langsung terbuka/toggle.
2. Jelaskan + kecilkan gap "tidak semua web bisa diambil".
3. Rapikan list panel (teks nabrak tombol Copy/Del).

## Changes

- `public/background.js` (baru, plain JS tanpa build): `chrome.action.onClicked` ->
  `tabs.sendMessage(tab.id, {type:"wea:toggle-panel"})`. Di URL restricted
  (`chrome://`, `edge://`, `about:`, web store, devtools) pasang badge `!` 2 detik.
  Worker bangun hanya saat diklik (event-based, no polling, no network).
- `public/manifest.json`: tambah `background.service_worker`, tambah match `file:///*`
  (user tetap harus aktifkan "Allow access to file URLs" di `chrome://extensions`).
- `src/content/main.ts`: listener `chrome.runtime.onMessage` toggle `panelOpen`.
- `src/content/theme.css`: root cause overlap = `.wea{all:initial}` bikin semua div
  `display:inline` sehingga label/snippet tidak truncate dan melebar di bawah tombol.
  Fix: `display:block` eksplisit di `.wea-label`, `.wea-input`, `.wea-panel-list`,
  `.wea-item-text`, `.wea-item-label`, `.wea-item-snippet`, `.wea-empty`;
  `flex-shrink:0` di actions + checkbox. Tambah empty-state.
- `src/content/ui-shell.ts`: empty-state saat list kosong, `title` di tombol row.

## Out

- Tidak ada popup page, tidak ada perm baru, tidak ada framework.
- `impeccable context` launcher tidak dijalankan (akan inventarisasi PRODUCT.md/
  DESIGN.md baru; plan melarang file docs baru) — refinement sempit di atas
  implementasi incumbent.

## Verify

```bash
npm run build   # dist/content.js tetap <= 80KB
rg -n "fetch|XMLHttpRequest|WebSocket|setInterval|MutationObserver" src/ public/background.js || echo clean
```

Manual: klik icon -> panel toggle; badge `!` di chrome://; Alt+A tetap picker;
list panjang tidak nabrak tombol; file:// butuh toggle akses.
