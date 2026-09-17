# Implementation Plan: MVP Web Element Annotator

## Objective

Build a lightweight MV3 Chrome extension that lets a user press Alt+A, point at any element, add a one-line instruction, and copy structured Markdown context ready to paste into any AI agent. No backend, no AI calls, idle when off.

## Scope

In:

- Manifest V3, TypeScript + Vite, vanilla DOM + CSS, no framework.
- Element picker (Alt+A + icon click, hover outline + tag tooltip, click capture, Esc cancel).
- Element collector with hard caps (identity, text, allowlisted attrs, stable selector, HTML caps, 5 ancestors, 15 styles, rect, page URL/title).
- Markdown formatter with 2 levels: Compact (default) + Standard.
- Floating composer near target (Add to list / Copy).
- Floating right panel (checkbox list, Copy Selected / Copy All, delete one / clear all).
- `chrome.storage.local` persistence, Clipboard API + fallback.
- Catppuccin Mocha tokens, Shadow DOM isolation, measurable budgets.

Out (explicit, do NOT build):

- Screenshot, JSON/TXT export, groups, import, AI send-to-agent, MCP, backend, auth, sync, analytics.
- Deep Shadow DOM piercing, cross-origin iframe annotation, canvas annotation (show graceful "not supported" note only).
- `background/` service worker (not needed; commands handled via content + manifest), full `popup/` app (stub toggle only if manifest requires an action popup).

## Context

- Source PRD: `web-element-annotator-prd.md` (root, 33 sections, Draft). Repo is greenfield: no code, no `docs/`, no git repo yet.
- Product principles (from PRD, locked): Lightweight, Agent-agnostic, Context-rich-not-data-heavy, Local-first.
- Core workflow: Alt+A -> Select -> Annotate -> Add -> Select annotations -> Copy -> Paste to any agent.
- Stack decisions: TS + Vite + MV3 + vanilla DOM + CSS + `chrome.storage.local` + Clipboard API. No React (PRD section 26 agrees).
- Key constraint from user: "simpel, ringan". Every delta below serves that.

### Decisions & PRD Deltas (builder must follow, no re-deciding)

1. Single content-script entry (`src/content/main.ts`), zero background worker. Reason: no network, no alarms, no cross-tab messaging needed; background would add idle cost + review surface.
2. All overlay UI in ONE Shadow DOM root (`src/content/ui-shell.ts`). Reason: prevents site CSS collisions and layout shift (outline-only highlight).
3. Minimal permissions: `activeTab`, `scripting`, `storage` + `commands`. No `<all_urls>`, no `host_permissions: ["<all_urls>"]`. Content script injected on demand via `chrome.scripting` (or `activeTab`), not persistent content_scripts match-all. Reason: idle = zero DOM cost.
4. Output caps (PRD had none — this is the main weight fix):
   - `textContent` <= 300 chars, trimmed, whitespace-collapsed. Skip password/credit-card inputs (read `type=password` as `[redacted]`).
   - `outerHTML` <= 2000 chars, `parentHTML` <= 1500 chars. Truncate with `... [truncated]`.
   - classes <= 10, attributes allowlist only: `id, class, type, name, role, aria-*, data-testid, href, src, alt, title, placeholder, value (non-password), for, label`. Drop `style`, framework hashes, event attrs.
   - ancestors <= 5 (tag + id/class only), siblings <= 3 (same format). Nearest heading (`h1-h3`) captured if within 3 levels up.
   - styles = exactly 15 props: `display, position, width, height, margin, padding, gap, font-size, font-weight, line-height, color, background-color, border-radius, box-shadow, opacity`. No flex/grid dump unless `display` is flex/grid (then add 2 extra max).
   - storage key `wea.annotations.v1`, array cap 100 items. Oldest-kept, newest-pushed; over cap blocks Add with Yellow warning.
5. Two output levels only (PRD future section 30.2 pulled forward, trimmed): Compact = selector + tag + text + HTML + instruction + page URL. Standard = Compact + context tree + styles + rect + title + xpath fallback. Compact is default for Copy single; panel has one toggle Compact/Standard. No Detailed level in MVP.
6. XPath kept as data field, excluded from Compact output. Reason: agents navigate by selector + HTML + context; XPath adds tokens with low hit rate.
7. Selector algorithm (deterministic): try in order, verify `document.querySelectorAll(sel).length === 1`: `#id` (CSS-escaped) -> `[data-testid="x"]` -> unique class chain (max 3 classes, walk up max 3 levels) -> `tag + class + :nth-of-type` last resort. Never bare `body > div:nth-child(...)` chains longer than 4 segments.
8. Clipboard: `navigator.clipboard.writeText` primary; fallback hidden `textarea` + `execCommand('copy')` for non-secure contexts. Toast Green on success, Red on denial with manual-select fallback.
9. Budgets (measurable): `dist/` JS+CSS <= 80KB unpacked; picker open <= 100ms after Alt+A; collect+format <= 200ms on typical page; zero network requests; zero `setInterval`/MutationObserver polling (hover uses single `pointerover` listener removed on exit).

## Dependencies

- Node LTS + npm, Vite, TypeScript (dev-only, no runtime deps; zero production dependencies).
- Chromium for `Load unpacked` testing.
- No git repo exists yet — builder must `git init` first (see Git section).
- No sibling plans. Single-plan MVP; merge inline allowed.

## Files / Areas Likely Affected

Proposed minimal tree (5 source files + manifest, create all):

```text
web-element-annotator/
├── public/
│   └── manifest.json          # MV3, commands Alt+A, permissions, icons stub
├── src/
│   ├── content/
│   │   ├── main.ts            # entry: command/popup messages, mode state machine
│   │   ├── collect.ts         # pure DOM -> Annotation (caps enforced here)
│   │   ├── format.ts          # Annotation -> Markdown (compact/standard)
│   │   ├── ui-shell.ts        # ONE shadow root: picker tooltip, composer, panel, toasts, markers
│   │   └── theme.css          # Catppuccin Mocha CSS vars only (imported into shadow)
│   ├── storage/
│   │   └── annotations.ts     # load/save/delete/clear, schema v1, 100-cap
│   └── shared/
│       └── types.ts           # Annotation interface (PRD section 19 trimmed, see below)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Trimmed `Annotation` contract (frozen after Step 2; Steps 3-6 code against this):

```typescript
interface Annotation {
  id: string; url: string; title: string; timestamp: number;
  instruction: string; level: "compact" | "standard";
  element: {
    tag: string; id?: string; classes: string[]; text?: string;
    selector: string; xpath?: string;
    attributes: Record<string, string>;
    html: { outer: string; parent?: string };
    context?: { ancestors: string[]; siblings?: string[]; heading?: string };
    styles?: Record<string, string>;
    rect?: { x: number; y: number; width: number; height: number };
  };
}
```

## Implementation Steps

### Step 1 — Scaffold MV3 + Vite + manifest (no background, no popup app)

- Create `package.json` (scripts: `dev`, `build`), `tsconfig.json` (strict), `vite.config.ts` (single-entry `src/content/main.ts` -> `dist/content.js`, CSS inlined).
- Create `public/manifest.json`: `manifest_version: 3`, `action` (icon + title only, no default_popup OR 3-line stub), `permissions: ["activeTab","scripting","storage"]`, `commands: { toggle-picker: suggested_key Alt+A }`, icons stub (any 128px png; builder generates placeholder, no asset pipeline).
- Verify: `npm run build` emits `dist/content.js` + CSS <= 80KB combined.

### Step 2 — Types + storage contract

- Create `src/shared/types.ts` (interface above, verbatim).
- Create `src/storage/annotations.ts`: `load(): Promise<Annotation[]>`, `add(a)`, `remove(id)`, `clear()`, key `wea.annotations.v1`, try/catch quota (`chrome.runtime.lastError`), 100-cap with `{ok:false, reason:"cap"}` return.
- Verify: manual stub test via devtools console (save/load/remove round-trip). No test framework in MVP.

### Step 3 — Collector (`collect.ts`, pure, capped)

- Export `collectElement(el: Element): Annotation["element"]`. Implement in order: tag/id/classes -> accessible name (`aria-label` || text slice) -> text (300 cap) -> attributes (allowlist) -> selector (algorithm above, verified unique) -> xpath (string only, no verification) -> outerHTML (2000) + parentHTML (1500) -> context (5 ancestors `tag#id.cls`, 3 siblings, nearest h1-h3) -> 15 styles via `getComputedStyle` allowlist -> rect via `getBoundingClientRect` (rounded ints).
- Guards: `type=password` redaction, `script/style/noscript` targets rejected with warning, SVG root handled via tag + attrs only (no innerHTML explosion).
- Verify: run on 3 pages (simple form, Tailwind-heavy page, news article) — output JSON eyeball: no field over cap, selector resolves unique.

### Step 4 — Formatter (`format.ts`, pure)

- Export `formatOne(a): string`, `formatMany(list, level): string`. Compact template (single): `## Web Element Annotation / Page: URL / Selector / Tag / Text / HTML html-fence / Instruction`. Standard adds `Context tree / Styles / Geometry / Title / XPath fallback`. Escape backticks in HTML. `formatMany` numbers `## Annotation 1..n` with shared Page header once.
- Fix PRD sections 16-18 nesting bug: exactly one outer doc (pasted as chat text, not a code block), inner `html` fence only.
- Verify: paste sample outputs into a chat box + an LLM: renders readable, copy-paste round-trip exact.

### Step 5 — Picker overlay (Shadow DOM, event-safe)

- In `ui-shell.ts`: `enterPicker(onPick, onCancel)`: single `pointerover` (outline `2px solid #89b4fa`, `outline-offset:2px`, no layout change) + tooltip (`tag.classes + WxH`, flip near viewport edge) + `click` capture (`preventDefault/stopPropagation`, then `collectElement`) + `Esc` exits + `Alt+A` toggles. All listeners removed on exit. Outline applied via `WeakMap<Element,string>` restoring prior inline outline.
- Edge: cross-origin iframes catch + toast Yellow "iframe content not accessible"; page-level `Esc` conflicts: capture phase + stopPropagation.
- Verify: hover 20 elements no layout shift (DevTools Performance: no Layout events from extension), Esc exits clean (no leftover outline/tooltip).

### Step 6 — Composer + panel + markers (same shadow root, shared tokens)

- Composer: floating card near target rect (flip if near edge), shows `tag.classes` + textarea (placeholder per PRD) + `[+ Add to list] [Copy]`; focus textarea on open; `Ctrl+Enter` = Copy.
- Panel: fixed right sidebar (360px max, collapsible via action click), header `Annotations (n)`, rows: checkbox + `tag.classes` + instruction snippet + per-row Copy/Delete; footer `[Copy Selected] [Copy All] [Clear]` + Compact/Standard toggle. Markers: 4px Lavender dot on annotated elements (absolute, pointer-events none, removed on delete/clear/navigation).
- `theme.css`: Catppuccin Mocha vars only (Base #1e1e2e, Mantle #181825, Text #cdd6f4, Blue #89b4fa, Lavender #b4befe, Green #a6e3a1, Yellow #f9e2af, Red #f38ba8). Dark/compact, system font stack, no webfont download.
- Verify: full PRD DoD 12-step flow works with mouse + keyboard only.

### Step 7 — Wiring (`main.ts`): modes, commands, clipboard, action click

- State machine: `idle -> picking -> composing -> idle`, panel open/close independent. Handle `keydown Alt+A` + `chrome.action.onClicked` toggling via `chrome.scripting.executeScript` — pick ONE injection path in Step 1 and keep it; recommended: persistent lightweight content script gated behind `activeTab` so Alt+A works without extra clicks.
- Clipboard with fallback (see Decisions 8). Toasts: Green copied, Yellow capped/iframe, Red denied + manual-select textarea fallback.
- Page nav: markers cleared, annotations persist (URL stored per item, no auto-filter in MVP).
- Verify: reload extension, full flow on fresh profile, clipboard paste exact, no console errors from extension contexts.

### Step 8 — Budget + release check

- `npm run build`, record `dist/` bytes. Confirm: <= 80KB, zero deps in `package.json:dependencies`, zero fetch/XHR in source (`rg "fetch|XMLHttpRequest|WebSocket"` empty), zero timers (`setInterval` empty; `setTimeout` only for toast dismiss).
- Manual matrix: fresh Chrome profile x 3 sites, keyboard-only run, 10-annotation list run (checkbox/copy-selected/copy-all/delete/clear).
- Report numbers in builder handoff message. Do NOT add new docs files.

## Acceptance Criteria

1. Alt+A opens picker in <= 100ms; hover shows Lavender outline + `tag.class WxH` tooltip with zero layout shift.
2. Click captures element; composer opens near target with focused textarea.
3. Copy produces Markdown that pastes exactly and contains: selector (unique-verified), tag, text (<=300), HTML (<=2000, truncated marker if cut), instruction, page URL.
4. Standard level additionally contains context (<=5 ancestors), 15 styles, rect, title, xpath fallback.
5. Add to list -> panel row appears; checkbox Copy Selected copies only checked; Copy All copies all; per-row Copy/Delete and Clear work; 100-cap warns, never crashes.
6. Esc cancels picker with zero residue (no outline/tooltip/listeners).
7. Idle: no network, no polling, no console errors; `dist/` JS+CSS <= 80KB; `dependencies` empty.
8. Full PRD section 31 DoD 12-step completable in under ~60 seconds by a new user.

## Verification / Tests

No test framework in MVP (keeps it light).

```bash
npm run build
rg -n "fetch|XMLHttpRequest|WebSocket|setInterval" src/ || echo "clean"
```

Manual checklist (builder must run all, paste results in handoff):

1. `chrome://extensions` -> Load unpacked `dist/` -> no warnings/errors.
2. example.com + tailwind site + local form page: Alt+A, hover 20 els, click, write instruction, Copy -> paste to editor, exact match.
3. Add 3 -> uncheck middle -> Copy Selected has 1+3 only -> Copy All has 1-3 -> Delete 2 -> Clear -> panel empty.
4. Toggle Compact/Standard: Standard adds Context/Styles/Geometry, Compact does not.
5. Esc mid-picker; Alt+A twice (toggle off); reload page (markers gone, list kept).
6. DevTools Performance 5s hover: no extension-caused Layout; Network tab: 0 requests from extension.

## Git

Branch: `feature/mvp-web-element-annotator`. No repo exists yet, so:

```bash
git init && git add web-element-annotator-prd.md plan/ && git commit -m "docs: add PRD and MVP plan"
git checkout -b feature/mvp-web-element-annotator
```

Plan file itself must be committed to `main` before execution per planner workflow (builder does this on first run since repo is new).

## Integration Notes

- Single-plan MVP: no sibling plans, no merge order, no shared-file conflicts. Builder may merge inline to `main` when green (only sequential plan in flight).
- If later split (e.g. screenshot/export follow-ups), those become new plans depending on this one's `Annotation` contract + `format.ts` templates — record dependency in both plans then.

## Delegation Strategy

| Step | Owner | Parallel batch | Why |
|------|-------|----------------|-----|
| 1 Scaffold | builder | - | Inline: foundation everything imports; needs current context |
| 2 Types + storage | builder | - | Inline: 2 small files, contract freeze; blocks 3-6 |
| 3 Collector | builder | A | Pure logic, needs only Step 2 types; no shared files with Step 4 |
| 4 Formatter | builder | A | Pure function, needs only Step 2 types; parallel-safe with Step 3 |
| 5 Picker overlay | designer | B | UI/Shadow-DOM/focus work; needs only Step 2 contract, independent of Step 6 except theme vars (frozen first) |
| 6 Composer + panel | designer | B | UI work, parallel with Step 5 once token names frozen |
| 7 Wiring + clipboard | builder | - | Sequential: integrates 3-6, single `main.ts` owner avoids conflicts |
| 8 Budget + release check | tester + reviewer | - | tester runs build/matrix, reviewer read-only final pass; parallel, neither mutates |

Batch A = Steps 3+4 dispatched in ONE message. Batch B = Steps 5+6 in ONE message after tokens frozen. Batch C = tester + reviewer in ONE message. Dependencies: 1 -> 2 -> (A, then B) -> 7 -> C. Inline rationale: scaffold/contract/wiring stay with builder (shared entry + schema churn); isolated pure modules and UI go parallel to save wall-clock without file overlap.
