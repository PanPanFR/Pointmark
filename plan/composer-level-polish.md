# Follow-up: Level di Composer + Font Fix + Shortcut Add

1. Toggle Compact/Standard pindah dari panel ke composer (dipilih sebelum
   Copy/Add). `formatMany(list)` pakai level per-item (sudah tersimpan di
   tiap annotation); panel tidak lagi punya toggle global.
2. Font pill/btn/textarea Times — root: `font: inherit` di `.wea-pill`,
   `.wea-btn`, `.wea-input` mewarisi font page (all:initial mereset).
   Fix: stack mono eksplisit di ketiganya.
3. `.wea-x` + margin-left, hover bg (biru utk minimize, merah utk X via
   `:last-child`).
4. Shortcut Add to list: Alt+Enter di composer (+ hint diperbarui).
