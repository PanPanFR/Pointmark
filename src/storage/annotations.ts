import { Annotation, MAX_ITEMS, STORAGE_KEY } from "../shared/types";

type AddResult = { ok: true } | { ok: false; reason: "cap" | "quota" };

function area(): any | null {
  try {
    return typeof chrome !== "undefined" && chrome?.storage?.local
      ? chrome.storage.local
      : null;
  } catch {
    return null;
  }
}

// ponytail: in-memory fallback only for devtools stub test, not a second store
const mem: { items: Annotation[] } = { items: [] };

export async function load(): Promise<Annotation[]> {
  const a = area();
  if (!a) return [...mem.items];
  try {
    const out = await a.get(STORAGE_KEY);
    const v = out?.[STORAGE_KEY];
    return Array.isArray(v) ? (v as Annotation[]) : [];
  } catch {
    return [];
  }
}

async function persist(items: Annotation[]): Promise<boolean> {
  const a = area();
  if (!a) {
    mem.items = items;
    return true;
  }
  try {
    await a.set({ [STORAGE_KEY]: items });
    if (chrome?.runtime?.lastError) return false;
    return true;
  } catch {
    return false;
  }
}

export async function add(item: Annotation): Promise<AddResult> {
  const cur = await load();
  if (cur.length >= MAX_ITEMS) return { ok: false, reason: "cap" };
  const ok = await persist([...cur, item]);
  return ok ? { ok: true } : { ok: false, reason: "quota" };
}

export async function remove(id: string): Promise<Annotation[]> {
  const cur = await load();
  const next = cur.filter((x) => x.id !== id);
  await persist(next);
  return next;
}

export async function clear(): Promise<void> {
  await persist([]);
}
