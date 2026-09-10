// Safe markdown-lite renderer for DB content (no dependencies).
// Supports: ## / ### headings, - lists, 1. lists, **bold**, `code`,
// ```blocks, > quotes, [text](url), paragraphs. All HTML is escaped first.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  let out = escapeHtml(s);
  out = out.replace(
    /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

export function renderRich(text: string): string {
  if (!text) return "";
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let listMode: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listMode) {
      html.push(listMode === "ul" ? "</ul>" : "</ol>");
      listMode = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }
    const t = line.trim();
    if (!t) {
      closeList();
      continue;
    }
    if (t.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inline(t.slice(4))}</h3>`);
      continue;
    }
    if (t.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inline(t.slice(3))}</h2>`);
      continue;
    }
    if (t.startsWith("> ")) {
      closeList();
      html.push(`<blockquote>${inline(t.slice(2))}</blockquote>`);
      continue;
    }
    const olMatch = t.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      if (listMode !== "ol") {
        closeList();
        html.push("<ol>");
        listMode = "ol";
      }
      html.push(`<li>${inline(olMatch[1])}</li>`);
      continue;
    }
    if (t.startsWith("- ")) {
      if (listMode !== "ul") {
        closeList();
        html.push("<ul>");
        listMode = "ul";
      }
      html.push(`<li>${inline(t.slice(2))}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inline(t)}</p>`);
  }
  closeList();
  if (inCode) html.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  return html.join("\n");
}

export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim().replace(/^-\s*/, ""))
    .filter(Boolean);
}

export function excerptOf(text: string, max = 160): string {
  const oneLine = text.replace(/[#>*`]/g, "").replace(/\s+/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}
