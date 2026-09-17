import type { Annotation } from "../shared/types";

type Level = "compact" | "standard";

const fenceFor = (s: string): string => (s.includes("```") ? "````" : "```");

function body(a: Annotation, level: Level): string[] {
  const e = a.element;
  const fence = fenceFor(e.html.outer);
  const out = [
    `Selector: \`${e.selector}\``,
    ``,
    `Tag: \`${e.tag}\``,
    ``,
  ];
  if (e.text) out.push(`Text: \`${e.text}\``, ``);
  out.push(`HTML:`, ``, `${fence}html`, e.html.outer, fence, ``);
  if (e.html.parent) out.push(`Parent: \`${e.html.parent.slice(0, 120)}\``, ``);
  if (level === "standard") {
    if (e.context?.ancestors.length) {
      out.push(`Context:`, ``, `${fence}`, e.context.ancestors.join("\n"), fence, ``);
    }
    if (e.context?.heading) out.push(`Nearest heading: \`${e.context.heading}\``, ``);
    if (e.styles) {
      out.push(
        `Styles:`,
        ``,
        `${fence}`,
        Object.entries(e.styles).map(([k, v]) => `${k}: ${v}`).join("\n"),
        fence,
        ``,
      );
    }
    if (e.rect) {
      out.push(`Geometry: \`x=${e.rect.x}, y=${e.rect.y}, ${e.rect.width}x${e.rect.height}\``, ``);
    }
    out.push(`Title: \`${a.title}\``, ``);
    if (e.xpath) out.push(`XPath (fallback): \`${e.xpath}\``, ``);
  }
  out.push(`Instruction:`, ``, a.instruction || "(no instruction)", ``);
  return out;
}

export function formatOne(a: Annotation): string {
  return [
    `## Web Element Annotation`,
    ``,
    `Page: ${a.url}`,
    ``,
    ...body(a, a.level),
  ].join("\n");
}

export function formatMany(list: Annotation[], level: Level): string {
  if (list.length === 0) return "";
  if (list.length === 1) return formatOne({ ...list[0], level });
  const head = [`# Web Element Annotations`, ``, `Page: ${list[0].url}`, ``];
  list.forEach((a, i) => {
    const e = a.element;
    const fence = fenceFor(e.html.outer);
    head.push(`## Annotation ${i + 1}`, ``);
    if (a.url !== list[0].url) head.push(`Page: ${a.url}`, ``);
    head.push(`Element: \`${e.selector}\``, ``);
    if (e.text) head.push(`Text: \`${e.text}\``, ``);
    head.push(`HTML:`, ``, `${fence}html`, e.html.outer, fence, ``);
    if (level === "standard") {
      if (e.context?.ancestors.length) {
        head.push(`Context:`, ``, `${fence}`, e.context.ancestors.join("\n"), fence, ``);
      }
      if (e.context?.heading) head.push(`Nearest heading: \`${e.context.heading}\``, ``);
      if (e.styles) {
        head.push(
          `Styles:`, ``, `${fence}`,
          Object.entries(e.styles).map(([k, v]) => `${k}: ${v}`).join("\n"),
          fence, ``,
        );
      }
      if (e.rect) head.push(`Geometry: \`x=${e.rect.x}, y=${e.rect.y}, ${e.rect.width}x${e.rect.height}\``, ``);
      head.push(`Title: \`${a.title}\``, ``);
      if (e.xpath) head.push(`XPath (fallback): \`${e.xpath}\``, ``);
    }
    head.push(`Instruction: ${a.instruction || "(no instruction)"}`, ``);
  });
  return head.join("\n");
}
