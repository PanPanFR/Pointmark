# Follow-up: Truthful Entry Errors (icon mati + "storage full")

## Root cause (systematic-debugging Phase 1-3)

Dua gejala, satu akar: **tab basi (stale) sesudah Reload extension**.

- Toast "storage full" muncul saat `persist()` false = `chrome.storage.local.set()`
  melempar. Kuota asli mustahil (cap 100 item x ~8KB « 5MB, data plain JSON).
  Satu-satunya jalur throw = extension context invalidated: tab yang sudah terbuka
  SEBELUM user menekan Reload di `chrome://extensions` masih menjalankan content
  script lama yang semua panggilan `chrome.*`-nya reject.
- Ikon mati di tab yang sama: `sendMessage` background (versi baru) tidak punya
  receiving end hidup (listener konteks lama mati) -> catch diam-diam -> nihil.
- Perubahan pemicu: background worker baru -> user diminta Reload -> invalidation.
  Timeline cocok; tab fresh tidak terdampak.

## Ruling: tanpa auto-inject

`scripting.executeScript` di tab basi akan mendaftarkan listener DOM kedua
bersamaan dengan instance mati (duplikat picker/tooltip) + butuh perm baru.
Dipilih sinyal jujur: toast bedakan reload vs quota, badge `F5` = refresh tab.
Refresh tab sekali sesudah Reload = perilaku standar dev extension.

## Changes

- `src/storage/annotations.ts`: `persist()` kembalikan reason
  `cap | quota | reload` (`chrome.runtime.id === undefined` = konteks mati);
  hapus cek `lastError` mati (promise API tidak pernah set).
- `src/content/main.ts`: toast `reload` -> "extension updated — refresh page (F5),
  then retry" (err); handler pesan `wea:toggle-picker`; panel dapat `onPick`.
- `src/content/ui-shell.ts`: `PanelState.onPick` + tombol "+ Pick element" di footer
  (jalan keluar saat situs menelan Alt+A).
- `public/background.js`: kirim gagal -> badge `F5` 2 detik; `commands.onCommand`
  -> pesan `wea:toggle-picker` (browser-level, tidak bisa ditelan page).
- Tanpa perm baru, tanpa polling.

## Verify

tsc + build (<=80KB) + rg bersih + smoke `persist()` reasons via chrome mock.
Manual: tab basi -> badge F5 + toast refresh; tab fresh -> semua hijau.
