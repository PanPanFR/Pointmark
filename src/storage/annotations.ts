import { Annotation, MAX_ITEMS, STORAGE_KEY } from "../shared/types";

type AddResult = { ok: true } | { ok: false; reason: "cap" | "quota" | "reload" };

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

type PersistResult = { ok: true } | { ok: false; reason: "quota" | "reload" };

// "reload" = extension context invalidated (tab dibuka sebelum extension
// di-Reload/update; semua chrome.* di tab itu mati). Satu-satunya cara pulih: F5.
function deadContext(): boolean {
  try {
    return typeof chrome === "undefined" || chrome?.runtime?.id === undefined;
  } catch {
    return true;
  }
}

async function persist(items: Annotation[]): Promise<PersistResult> {
  const a = area();
  if (!a) {
    mem.items = items;
    return { ok: true };
  }
  try {
    await a.set({ [STORAGE_KEY]: items });
    return { ok: true };
  } catch {
    return { ok: false, reason: deadContext() ? "reload" : "quota" };
  }
}

export async function add(item: Annotation): Promise<AddResult> {
  const cur = await load();
  if (cur.length >= MAX_ITEMS) return { ok: false, reason: "cap" };
  const res = await persist([...cur, item]);
  return res.ok ? { ok: true } : res;
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
