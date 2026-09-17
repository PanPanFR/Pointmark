import { collectElement } from "./collect";
import { formatMany, formatOne } from "./format";
import {
  addMarker,
  clearMarkers,
  copyText,
  enterPicker,
  exitPicker,
  hideComposer,
  isPicking,
  removeMarker,
  renderPanel,
  showComposer,
  showManualCopy,
  toast,
} from "./ui-shell";
import { add, clear, load, remove } from "../storage/annotations";
import type { Annotation } from "../shared/types";

// Single injection guard (StrictMode / double-execute safe).
if (!(globalThis as any).__wea_loaded) {
  (globalThis as any).__wea_loaded = true;

  type Mode = "idle" | "picking" | "composing";
  let mode: Mode = "idle";
  let level: "compact" | "standard" = "compact";
  let panelOpen = false;
  let pending: Annotation | null = null;
  let pendingTarget: Element | null = null;
  const checked = new Set<string>();

  const uid = (): string =>
    `wea-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const shortLabel = (a: Annotation): string => {
    const e = a.element;
    return `<${e.tag}${e.id ? `#${e.id}` : ""}${e.classes.slice(0, 2).map((c) => `.${c}`).join("")}>`;
  };

  async function refreshPanel(): Promise<void> {
    const rows = await load();
    for (const a of rows) if (!checked.has(a.id)) checked.add(a.id);
    renderPanel({
      open: panelOpen,
      rows: rows.map((a) => ({
        id: a.id,
        label: shortLabel(a),
        snippet: a.instruction.slice(0, 60),
        checked: checked.has(a.id),
      })),
      level,
      onToggle: (id, on) => {
        if (on) checked.add(id);
        else checked.delete(id);
        void refreshPanel();
      },
      onCopyRow: (id) => void copyOne(id),
      onDeleteRow: (id) => void deleteOne(id),
      onCopySelected: () => void copyList(true),
      onCopyAll: () => void copyList(false),
      onClear: () => void clearAll(),
      onPick: () => startPicking(),
      onLevel: (l) => {
        level = l;
        void refreshPanel();
      },
      onClose: () => {
        panelOpen = false;
        void refreshPanel();
      },
    });
  }

  async function copyOne(id: string): Promise<void> {
    const rows = await load();
    const a = rows.find((x) => x.id === id);
    if (!a) return;
    await place(await formatOne({ ...a, level }));
  }

  async function copyList(selectedOnly: boolean): Promise<void> {
    const rows = await load();
    const list = selectedOnly ? rows.filter((a) => checked.has(a.id)) : rows;
    if (list.length === 0) {
      toast(selectedOnly ? "nothing selected" : "list is empty", "warn");
      return;
    }
    await place(formatMany(list, level));
  }

  async function place(text: string): Promise<void> {
    const ok = await copyText(text);
    if (ok) toast("copied — paste to your agent");
    else {
      toast("copy denied — select + Ctrl+C", "err");
      showManualCopy(text, () => undefined);
    }
  }

  async function deleteOne(id: string): Promise<void> {
    await remove(id);
    checked.delete(id);
    removeMarker(id);
    await refreshPanel();
  }

  async function clearAll(): Promise<void> {
    await clear();
    checked.clear();
    clearMarkers();
    await refreshPanel();
  }

  function startPicking(): void {
    hideComposer();
    pending = null;
    mode = "picking";
    enterPicker(onPick, onCancel);
  }

  function stopAll(): void {
    exitPicker();
    hideComposer();
    pending = null;
    mode = "idle";
  }

  function onCancel(): void {
    mode = "idle";
    pending = null;
  }

  function onPick(target: Element): void {
    let collected: Annotation["element"];
    try {
      collected = collectElement(target);
    } catch {
      toast("cannot annotate this element", "warn");
      mode = "idle";
      return;
    }
    pending = {
      id: uid(),
      url: location.href,
      title: document.title,
      timestamp: Date.now(),
      instruction: "",
      level,
      element: collected,
    };
    pendingTarget = target;
    mode = "composing";
    const r = target.getBoundingClientRect();
    showComposer(shortLabel(pending), r.left, r.bottom, {
      onAdd: (instruction) => void addPending(instruction),
      onCopy: (instruction) => void copyPending(instruction),
      onClose: () => {
        mode = "idle";
        pending = null;
      },
    });
  }

  async function addPending(instruction: string): Promise<void> {
    if (!pending) return;
    const item: Annotation = { ...pending, instruction, level };
    const res = await add(item);
    if (!res.ok) {
      if (res.reason === "cap") toast("list full (100) — delete some first", "warn");
      else if (res.reason === "reload") toast("extension updated — refresh page (F5), then retry", "err");
      else toast("storage full", "warn");
      return;
    }
    checked.add(item.id);
    if (pendingTarget) addMarker(item.id, pendingTarget);
    pending = null;
    hideComposer();
    panelOpen = true;
    await refreshPanel();
    toast("added to list");
    startPicking(); // keep annotating
  }

  async function copyPending(instruction: string): Promise<void> {
    if (!pending) return;
    await place(formatOne({ ...pending, instruction, level }));
    pending = null;
    hideComposer();
    mode = "idle";
  }

  // Alt+A toggles picker from anywhere in the page.
  document.addEventListener(
    "keydown",
    (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key !== "a" && e.key !== "A") return;
      e.preventDefault();
      e.stopPropagation();
      if (isPicking()) stopAll();
      else startPicking();
    },
    true,
  );

  // Toolbar icon click (via background worker) toggles the panel.
  // Browser-level command (via background worker) toggles the picker —
  // fires even on sites that swallow the Alt+A keydown.
  try {
    chrome?.runtime?.onMessage?.addListener((msg: any) => {
      if (msg?.type === "wea:toggle-panel") {
        panelOpen = !panelOpen;
        void refreshPanel();
      }
      if (msg?.type === "wea:toggle-picker") {
        if (isPicking()) stopAll();
        else startPicking();
      }
    });
  } catch {
    /* ignore */
  }

  void refreshPanel();
}
