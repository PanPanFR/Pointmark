import cssText from "./theme.css?inline";

export type ToastKind = "ok" | "warn" | "err";

export interface ComposerCallbacks {
  onAdd: (instruction: string) => void;
  onCopy: (instruction: string) => void;
  onClose: () => void;
}

export interface PanelRow {
  id: string;
  label: string;
  snippet: string;
  checked: boolean;
}

export interface PanelState {
  open: boolean;
  rows: PanelRow[];
  level: "compact" | "standard";
  onToggle: (id: string, checked: boolean) => void;
  onCopyRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
  onCopySelected: () => void;
  onCopyAll: () => void;
  onClear: () => void;
  onLevel: (l: "compact" | "standard") => void;
  onClose: () => void;
}

let host: HTMLElement | null = null;
let root: ShadowRoot | null = null;

function ensureRoot(): ShadowRoot {
  if (root) return root;
  host = document.createElement("div");
  host.id = "wea-host";
  host.setAttribute("style", "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;");
  root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = cssText;
  root.appendChild(style);
  document.documentElement.appendChild(host);
  return root;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls: string, parent: ParentNode,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  n.className = `wea ${cls}`;
  (n as HTMLElement).style.pointerEvents = "auto";
  parent.appendChild(n);
  return n;
}

// ---------- clipboard ----------

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch { /* fallback below */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("style", "position:fixed;opacity:0;pointer-events:none;");
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function showManualCopy(text: string, onClose: () => void): void {
  const r = ensureRoot();
  hideComposer();
  const card = el("div", "wea-card wea-manual", r);
  card.dataset.wea = "manual";
  const x = el("button", "wea-x", card);
  x.textContent = "×";
  x.onclick = () => { card.remove(); onClose(); };
  const ta = el("textarea", "wea-input", card) as HTMLTextAreaElement;
  ta.readOnly = true;
  ta.value = text;
  ta.onclick = () => ta.select();
  ta.focus();
  ta.select();
}

// ---------- toasts ----------

export function toast(msg: string, kind: ToastKind = "ok"): void {
  const r = ensureRoot();
  let box = r.querySelector(".wea-toasts") as HTMLElement | null;
  if (!box) {
    box = el("div", "wea-toasts", r);
    box.style.pointerEvents = "none";
  }
  const t = el("div", `wea-toast${kind === "warn" ? " wea-warn" : kind === "err" ? " wea-err" : ""}`, box);
  t.textContent = msg;
  setTimeout(() => t.remove(), 2600);
}

// ---------- picker ----------

const savedOutline = new WeakMap<Element, string>();
let picking = false;
let hoverEl: Element | null = null;
let tip: HTMLElement | null = null;
let pickCb: ((el: Element) => void) | null = null;
let cancelCb: (() => void) | null = null;

export function isPicking(): boolean {
  return picking;
}

function label(el_: Element): string {
  const h = el_ as HTMLElement;
  const cls = [...el_.classList].slice(0, 3).map((c) => `.${c}`).join("");
  return `${el_.tagName.toLowerCase()}${h.id ? `#${h.id}` : ""}${cls}`;
}

function unhighlight(): void {
  if (hoverEl) {
    (hoverEl as HTMLElement).style.outline = savedOutline.get(hoverEl) ?? "";
    (hoverEl as HTMLElement).style.outlineOffset = "";
    hoverEl = null;
  }
  tip?.remove();
  tip = null;
}

function onOver(e: Event): void {
  const t = e.target as Element;
  if (!t || t === host || host?.contains(t) || !(t instanceof Element)) return;
  if (t === hoverEl) return;
  unhighlight();
  hoverEl = t;
  const h = t as HTMLElement;
  savedOutline.set(t, h.style.outline);
  h.style.outline = "2px solid #89b4fa";
  h.style.outlineOffset = "2px";
  const r = ensureRoot();
  tip = el("div", "wea-tip", r);
  tip.style.pointerEvents = "none";
  const rect = t.getBoundingClientRect();
  tip.textContent = `${label(t)}  ${Math.round(rect.width)}×${Math.round(rect.height)}`;
  const me = e as MouseEvent;
  tip.style.left = `${Math.min(me.clientX + 12, window.innerWidth - 180)}px`;
  tip.style.top = `${Math.min(me.clientY + 16, window.innerHeight - 40)}px`;
}

function onClick(e: Event): void {
  if (!picking) return;
  const t = e.target as Element;
  if (!t || t === host || host?.contains(t)) return;
  e.preventDefault();
  e.stopPropagation();
  const found = t instanceof Element ? t : hoverEl instanceof Element ? hoverEl : null;
  const cb = pickCb;
  exitPicker();
  if (found && cb) cb(found);
  else toast("iframe content not accessible", "warn");
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    e.stopPropagation();
    const cb = cancelCb;
    exitPicker();
    cb?.();
  }
}

export function enterPicker(
  onPick: (el: Element) => void,
  onCancel: () => void,
): void {
  ensureRoot();
  if (picking) exitPicker();
  picking = true;
  pickCb = onPick;
  cancelCb = onCancel;
  document.addEventListener("pointerover", onOver);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);
}

export function exitPicker(): void {
  picking = false;
  pickCb = null;
  cancelCb = null;
  document.removeEventListener("pointerover", onOver);
  document.removeEventListener("click", onClick, true);
  document.removeEventListener("keydown", onKey, true);
  unhighlight();
}

// ---------- composer ----------

export function showComposer(
  title: string, x: number, y: number, cb: ComposerCallbacks,
): void {
  const r = ensureRoot();
  hideComposer();
  const card = el("div", "wea-card", r);
  card.dataset.wea = "composer";
  const w = 324;
  const h = 220;
  card.style.left = `${Math.max(8, Math.min(x, window.innerWidth - w))}px`;
  card.style.top = y + h > window.innerHeight
    ? `${Math.max(8, y - h)}px`
    : `${y + 12}px`;
  const top = el("div", "wea-row", card);
  (top as HTMLElement).style.marginTop = "0";
  (top as HTMLElement).style.alignItems = "center";
  const lab = el("div", "wea-label", top);
  (lab as HTMLElement).style.flex = "1";
  (lab as HTMLElement).style.marginBottom = "0";
  lab.textContent = title;
  lab.title = title;
  const xBtn = el("button", "wea-x", top);
  xBtn.textContent = "×";
  xBtn.onclick = () => { hideComposer(); cb.onClose(); };
  const ta = el("textarea", "wea-input", card) as HTMLTextAreaElement;
  ta.placeholder = "Describe the change or ask about this element...";
  ta.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      cb.onCopy(ta.value);
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      hideComposer();
      cb.onClose();
    }
  };
  const row = el("div", "wea-row", card);
  const add = el("button", "wea-btn", row);
  add.textContent = "+ Add to list";
  add.onclick = () => cb.onAdd(ta.value);
  const copy = el("button", "wea-btn wea-primary", row);
  copy.textContent = "Copy";
  copy.onclick = () => cb.onCopy(ta.value);
  ta.focus();
}

export function hideComposer(): void {
  root?.querySelector('[data-wea="composer"]')?.remove();
  root?.querySelector('[data-wea="manual"]')?.remove();
}

// ---------- panel ----------

export function renderPanel(s: PanelState): void {
  const r = ensureRoot();
  r.querySelector('[data-wea="panel"]')?.remove();
  if (!s.open) return;
  const p = el("div", "wea-panel", r);
  p.dataset.wea = "panel";
  const head = el("div", "wea-panel-head", p);
  const title = el("div", "", head);
  title.textContent = `Annotations (${s.rows.length})`;
  const x = el("button", "wea-x", head);
  x.textContent = "×";
  x.onclick = () => s.onClose();
  const list = el("div", "wea-panel-list", p);
  if (s.rows.length === 0) {
    const empty = el("div", "wea-empty", list);
    empty.textContent = "No annotations yet — press Alt+A and pick an element.";
  }
  s.rows.forEach((row, i) => {
    const item = el("div", "wea-item", list);
    const cb = el("input", "", item) as HTMLInputElement;
    cb.type = "checkbox";
    cb.checked = row.checked;
    cb.setAttribute("aria-label", `Select annotation ${i + 1}`);
    cb.onchange = () => s.onToggle(row.id, cb.checked);
    const txt = el("div", "wea-item-text", item);
    const lab = el("div", "wea-item-label", txt);
    lab.textContent = `${i + 1}  ${row.label}`;
    const snip = el("div", "wea-item-snippet", txt);
    snip.textContent = row.snippet || "(no instruction)";
    const acts = el("div", "wea-item-actions", item);
    const c = el("button", "wea-mini", acts);
    c.textContent = "Copy";
    c.title = `Copy annotation ${i + 1}`;
    c.onclick = () => s.onCopyRow(row.id);
    const d = el("button", "wea-mini", acts);
    d.textContent = "Del";
    d.title = `Delete annotation ${i + 1}`;
    d.onclick = () => s.onDeleteRow(row.id);
  });
  const foot = el("div", "wea-panel-foot", p);
  const tog = el("div", "wea-toggle", foot);
  for (const lv of ["compact", "standard"] as const) {
    const b = el("button", "wea-mini", tog);
    b.textContent = lv[0].toUpperCase() + lv.slice(1);
    b.setAttribute("aria-pressed", String(s.level === lv));
    b.onclick = () => s.onLevel(lv);
  }
  const btns = el("div", "wea-row", foot);
  (btns as HTMLElement).style.marginTop = "0";
  const sel = el("button", "wea-btn", btns);
  sel.textContent = "Copy Selected";
  sel.onclick = () => s.onCopySelected();
  const all = el("button", "wea-btn", btns);
  all.textContent = "Copy All";
  all.onclick = () => s.onCopyAll();
  const clr = el("button", "wea-btn wea-danger", btns);
  clr.textContent = "Clear";
  clr.onclick = () => s.onClear();
}

// ---------- markers ----------

const markerEls = new Map<string, { target: Element; dot: HTMLElement }>();
let markerSync = false;

function syncMarkers(): void {
  for (const [id, m] of markerEls) {
    if (!m.target.isConnected) {
      m.dot.remove();
      markerEls.delete(id);
      continue;
    }
    const r = m.target.getBoundingClientRect();
    m.dot.style.left = `${r.right - 10}px`;
    m.dot.style.top = `${r.top - 4}px`;
  }
  if (markerEls.size === 0 && markerSync) {
    window.removeEventListener("scroll", syncMarkers, true);
    window.removeEventListener("resize", syncMarkers);
    markerSync = false;
  }
}

export function addMarker(id: string, target: Element): void {
  const r = ensureRoot();
  removeMarker(id);
  const dot = el("div", "wea-dot", r);
  (dot as HTMLElement).style.pointerEvents = "none";
  markerEls.set(id, { target, dot });
  if (!markerSync) {
    window.addEventListener("scroll", syncMarkers, true);
    window.addEventListener("resize", syncMarkers);
    markerSync = true;
  }
  syncMarkers();
}

export function removeMarker(id: string): void {
  markerEls.get(id)?.dot.remove();
  markerEls.delete(id);
}

export function clearMarkers(): void {
  for (const m of markerEls.values()) m.dot.remove();
  markerEls.clear();
}
