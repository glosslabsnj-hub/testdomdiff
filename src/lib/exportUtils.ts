import { toast } from "sonner";

/**
 * Trigger a file download in the browser.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape a value for CSV (wrap in quotes if it contains commas, quotes, or newlines).
 */
function csvEscape(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to CSV string and download it.
 */
export function downloadCSV(
  rows: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (rows.length === 0) {
    toast.info("No data to export");
    return;
  }

  const cols = columns || Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
  const header = cols.map((c) => csvEscape(c.label)).join(",");
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const val = row[c.key];
          if (Array.isArray(val)) return csvEscape(val.join("; "));
          return csvEscape(val);
        })
        .join(",")
    )
    .join("\n");

  const csv = `${header}\n${body}`;
  downloadFile(csv, filename.endsWith(".csv") ? filename : `${filename}.csv`, "text/csv");
  toast.success("CSV downloaded!");
}

/**
 * Download a formatted text file (for scripts, reports, etc.).
 */
export function downloadText(content: string, filename: string) {
  if (!content.trim()) {
    toast.info("No content to export");
    return;
  }
  downloadFile(content, filename.endsWith(".txt") ? filename : `${filename}.txt`, "text/plain");
  toast.success("File downloaded!");
}

/**
 * Format a script object into a readable text document.
 */
export function formatScriptAsText(script: {
  title?: string;
  platform?: string;
  content_type?: string;
  category?: string;
  created_at?: string;
  script_data?: any;
}): string {
  const sd = script.script_data;
  if (!sd) return `${script.title || "Untitled Script"}\n\nNo script data available.`;

  const lines: string[] = [];

  lines.push("═".repeat(50));
  lines.push(script.title || "Untitled Script");
  lines.push("═".repeat(50));
  lines.push("");

  if (script.platform || script.content_type || script.category) {
    const meta: string[] = [];
    if (script.platform) meta.push(`Platform: ${script.platform}`);
    if (script.content_type) meta.push(`Type: ${script.content_type}`);
    if (script.category) meta.push(`Category: ${script.category}`);
    if (script.created_at) meta.push(`Created: ${new Date(script.created_at).toLocaleDateString()}`);
    lines.push(meta.join(" | "));
    lines.push("");
  }

  if (sd.approach) {
    lines.push(`Approach: ${sd.approach}`);
    lines.push("");
  }

  if (sd.hook) {
    lines.push("─── THE HOOK ───");
    if (sd.hook.what_to_say) lines.push(`Say: "${sd.hook.what_to_say}"`);
    if (sd.hook.how_to_say_it) lines.push(`Delivery: ${sd.hook.how_to_say_it}`);
    if (sd.hook.camera_notes) lines.push(`Camera: ${sd.hook.camera_notes}`);
    if (sd.hook.duration) lines.push(`Duration: ${sd.hook.duration}`);
    lines.push("");
  }

  if (sd.body?.length > 0) {
    sd.body.forEach((section: any, i: number) => {
      lines.push(`─── ${(section.section || `SECTION ${i + 1}`).toUpperCase()} ───`);
      if (section.what_to_say) lines.push(`Script: ${section.what_to_say}`);
      if (section.how_to_say_it) lines.push(`Delivery: ${section.how_to_say_it}`);
      if (section.b_roll_notes) lines.push(`B-Roll: ${section.b_roll_notes}`);
      lines.push("");
    });
  }

  if (sd.cta) {
    lines.push("─── CALL TO ACTION ───");
    if (sd.cta.what_to_say) lines.push(`Say: "${sd.cta.what_to_say}"`);
    if (sd.cta.on_screen_text) lines.push(`On-screen: ${sd.cta.on_screen_text}`);
    lines.push("");
  }

  if (sd.caption) {
    lines.push("─── CAPTION ───");
    lines.push(sd.caption);
    lines.push("");
  }

  if (sd.hashtags?.length > 0) {
    lines.push("─── HASHTAGS ───");
    lines.push(sd.hashtags.map((h: string) => (h.startsWith("#") ? h : `#${h}`)).join(" "));
    lines.push("");
  }

  if (sd.thumbnail_idea) {
    lines.push("─── THUMBNAIL IDEA ───");
    lines.push(sd.thumbnail_idea);
    lines.push("");
  }

  if (sd.filming_checklist?.length > 0) {
    lines.push("─── FILMING CHECKLIST ───");
    sd.filming_checklist.forEach((item: string, i: number) => {
      lines.push(`  ${i + 1}. ${item}`);
    });
    lines.push("");
  }

  if (sd.total_duration || sd.equipment_needed) {
    lines.push("─── DETAILS ───");
    if (sd.total_duration) lines.push(`Duration: ${sd.total_duration}`);
    if (sd.equipment_needed) lines.push(`Equipment: ${sd.equipment_needed}`);
    lines.push("");
  }

  return lines.join("\n");
}
