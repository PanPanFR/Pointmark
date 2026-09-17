import type { Annotation } from "../shared/types";

type El = Annotation["element"];

const TEXT_CAP = 300;
const OUTER_CAP = 2000;
const PARENT_CAP = 1500;
const CLASS_CAP = 10;
const ATTR_CAP = 300;

const ATTR_ALLOW = new Set([
  "id", "class", "type", "name", "role", "data-testid",
  "href", "src", "alt", "title", "placeholder", "value", "for", "label",
]);

const STYLE_ALLOW = [
  "display", "position", "width", "height", "margin", "padding", "gap",
  "font-size", "font-weight", "line-height", "color", "background-color",
  "border-radius", "box-shadow", "opacity",
] as const;

const STYLE_EXTRA = ["justify-content", "align-items"] as const;

const esc = (s: string): string =>
  typeof (globalThis as any).CSS?.escape === "function"
    ? (globalThis as any).CSS.escape(s)
    : s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);

const trunc = (s: string, cap: number): string =>
  s.length > cap ? s.slice(0, cap) + "... [truncated]" : s;

const collapse = (s: string): string => s.replace(/\s+/g, " ").trim();

function fmtNode(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = (el as HTMLElement).id ? `#${esc((el as HTMLElement).id)}` : "";
  const cls = [...el.classList].slice(0, 3).map((c) => `.${esc(c)}`).join("");
  return `${tag}${id}${cls}`;
}

function unique(sel: string): boolean {
  try {
    return document.querySelectorAll(sel).length === 1;
  } catch {
    return false;
  }
}

function buildSelector(el: Element): string {
  const htmlEl = el as HTMLElement;
  if (htmlEl.id && unique(`#${esc(htmlEl.id)}`)) return `#${esc(htmlEl.id)}`;
  const testid = el.getAttribute("data-testid");
  if (testid) {
    const q = testid.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    if (unique(`[data-testid="${q}"]`)) return `[data-testid="${q}"]`;
  }

  const classes = [...el.classList].slice(0, 3);
  for (let n = 1; n <= classes.length; n++) {
    const sel = classes.slice(0, n).map((c) => `.${esc(c)}`).join("");
    if (unique(sel)) return sel;
  }
  // walk up max 3 levels with class chains
  let chain = el.tagName.toLowerCase();
  let node: Element | null = el;
  for (let depth = 0; depth < 3; depth++) {
    node = node?.parentElement ?? null;
    if (!node || node === document.documentElement) break;
    const seg = fmtNode(node);
    chain = `${seg} ${chain}`;
    if (unique(chain)) return chain;
  }
  // last resort: tag + class + :nth-of-type, max 4 segments
  const segs: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.body && segs.length < 4) {
    let seg = cur.tagName.toLowerCase();
    const first = cur.classList[0];
    if ((cur as HTMLElement).id) seg += `#${esc((cur as HTMLElement).id)}`;
    else if (first) seg += `.${esc(first)}`;
    else {
      const sibs = cur.parentElement
        ? [...cur.parentElement.children].filter((s) => s.tagName === cur!.tagName)
        : [];
      if (sibs.length > 1) seg += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
    }
    segs.unshift(seg);
    cur = cur.parentElement;
  }
  const fallback = segs.join(" > ");
  return unique(fallback) ? fallback : chain;
}

function buildXPath(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur.nodeType === 1 && parts.length < 12) {
    const tag = cur.tagName.toLowerCase();
    let idx = 1;
    let sib = cur.previousElementSibling;
    while (sib) {
      if (sib.tagName === cur.tagName) idx++;
      sib = sib.previousElementSibling;
    }
    parts.unshift(`${tag}[${idx}]`);
    cur = cur.parentElement;
  }
  return `/${parts.join("/")}`;
}

function nearestHeading(el: Element): string | undefined {
  let node = el.parentElement;
  for (let d = 0; d < 3 && node; d++) {
    if (/^H[1-3]$/.test(node.tagName)) return collapse(node.textContent ?? "").slice(0, 120) || undefined;
    const prev = node.previousElementSibling;
    if (prev && /^H[1-3]$/.test(prev.tagName)) {
      return collapse(prev.textContent ?? "").slice(0, 120) || undefined;
    }
    node = node.parentElement;
  }
  return undefined;
}

export function collectElement(el: Element): El {
  const tag = el.tagName.toLowerCase();
  if (["script", "style", "noscript", "canvas"].includes(tag)) {
    throw new Error(`[wea] cannot annotate <${tag}>`);
  }
  const htmlEl = el as HTMLElement & { type?: string; value?: string };
  const typeAttr = String(htmlEl.type ?? el.getAttribute("type") ?? "").toLowerCase();
  const isSensitive =
    typeAttr === "password" ||
    (el.getAttribute("autocomplete") ?? "").toLowerCase().startsWith("cc-");

  const id = htmlEl.id || undefined;
  const classes = [...el.classList].slice(0, CLASS_CAP);

  const aria = el.getAttribute("aria-label")?.trim();
  const rawText = isSensitive ? "[redacted]" : aria || collapse(el.textContent ?? "");
  const text = rawText ? trunc(rawText, TEXT_CAP) : undefined;

  const attributes: Record<string, string> = {};
  for (const name of el.getAttributeNames()) {
    const low = name.toLowerCase();
    const allowed =
      ATTR_ALLOW.has(low) || low.startsWith("aria-");
    if (!allowed || low === "style" || low.startsWith("on")) continue;
    if (low === "value" && isSensitive) {
      attributes[low] = "[redacted]";
      continue;
    }
    attributes[low] = trunc(el.getAttribute(name) ?? "", ATTR_CAP);
  }

  const selector = buildSelector(el);
  const xpath = buildXPath(el);

  const scrub = (h: string): string =>
    isSensitive ? h.replace(/(\svalue\s*=\s*)("[^"]*"|'[^']*')/gi, '$1"[redacted]"') : h;
  const outer = trunc(scrub(el.outerHTML), OUTER_CAP);
  const parent = el.parentElement
    ? trunc(scrub(el.parentElement.outerHTML.slice(0, PARENT_CAP + 64)), PARENT_CAP)
    : undefined;

  const ancestors: string[] = [];
  let anc = el.parentElement;
  while (anc && anc !== document.documentElement && ancestors.length < 5) {
    ancestors.unshift(fmtNode(anc));
    anc = anc.parentElement;
  }
  const siblings = el.parentElement
    ? [...el.parentElement.children]
        .filter((s) => s !== el)
        .slice(0, 3)
        .map(fmtNode)
    : undefined;
  const heading = nearestHeading(el);

  const cs = getComputedStyle(el);
  const styles: Record<string, string> = {};
  for (const p of STYLE_ALLOW) styles[p] = cs.getPropertyValue(p);
  const display = styles["display"] ?? "";
  if (display.includes("flex") || display.includes("grid")) {
    for (const p of STYLE_EXTRA) styles[p] = cs.getPropertyValue(p);
  }

  const r = el.getBoundingClientRect();
  const rect = {
    x: Math.round(r.x),
    y: Math.round(r.y),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };

  return {
    tag, id, classes, text, selector, xpath, attributes,
    html: parent ? { outer, parent } : { outer },
    context: { ancestors, siblings, heading },
    styles, rect,
  };
}
