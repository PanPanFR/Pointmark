export interface Annotation {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  instruction: string;
  level: "compact" | "standard";
  element: {
    tag: string;
    id?: string;
    classes: string[];
    text?: string;
    selector: string;
    xpath?: string;
    attributes: Record<string, string>;
    html: { outer: string; parent?: string };
    context?: { ancestors: string[]; siblings?: string[]; heading?: string };
    styles?: Record<string, string>;
    rect?: { x: number; y: number; width: number; height: number };
  };
}

export const STORAGE_KEY = "wea.annotations.v1";
export const MAX_ITEMS = 100;
