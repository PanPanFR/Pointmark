# Follow-up: Panel Minimize + Drag

## Goal

1. Tombol minimize di panel list -> jadi pill kecil `Annotations (n)`, klik pill restore.
2. Panel bisa digeser via drag header, tidak stuck kanan.

## Changes

- `src/content/ui-shell.ts`: `PanelState` + `minimized/onMinimize/onRestore`;
  pill saat minimized; `makeDraggable(panel, head)` pointer-based (capture,
  clamp viewport); posisi drag disimpan di `panelPos` modul agar survive re-render.
- `src/content/theme.css`: `.wea-pill`, header `cursor:grab + touch-action:none +
  user-select:none`, `display:block` eksplisit (aturan `all:initial`).
- `src/content/main.ts`: state `panelMinimized`; icon toggle selalu restore penuh.
- Refinement sempit incumbent (ruling impeccable-minimal seperti plan sebelumnya).

## Verify

tsc + build <=80KB + rg bersih. Manual: minimize->pill->restore; drag header
pindah + clamp tepi; tambah/hapus item tidak reset posisi.
