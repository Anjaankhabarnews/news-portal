/**
 * News-tip validation shared by the browser (instant feedback) and the server
 * (authoritative — never trust the client).
 */

export const tipCategories = [
  "Breaking / emergency",
  "Civic issue",
  "Crime & safety",
  "Politics & governance",
  "Business & jobs",
  "Education",
  "Health",
  "Sports",
  "Other",
] as const;

export const TIP_LIMITS = {
  maxFiles: 3,
  maxFileBytes: 50 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "video/mp4", "video/quicktime"],
  descriptionMin: 20,
  descriptionMax: 5000,
} as const;

export interface TipFields {
  name: string;
  phone: string;
  location: string;
  category: string;
  description: string;
}

export type TipErrors = Partial<Record<keyof TipFields | "files" | "consent", string>>;

/** Strips control characters and trims; content is stored and rendered as plain text only. */
export function cleanText(v: unknown, max: number) {
  return String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

/** Accepts Indian mobile numbers: 10 digits starting 6–9, optional +91 / 0 prefix, spaces or dashes. */
export function normalisePhone(v: string) {
  const digits = v.replace(/[\s-]/g, "").replace(/^(\+91|0091|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export function validateTip(f: TipFields, consent: boolean): TipErrors {
  const e: TipErrors = {};
  if (!normalisePhone(f.phone)) e.phone = "Enter a valid 10-digit Indian mobile number.";
  if (f.location.length < 2) e.location = "Tell us where this happened.";
  if (f.category && !(tipCategories as readonly string[]).includes(f.category)) e.category = "Choose a category from the list.";
  if (f.description.length < TIP_LIMITS.descriptionMin)
    e.description = `Please describe what happened in at least ${TIP_LIMITS.descriptionMin} characters.`;
  if (!consent) e.consent = "Please confirm before sending.";
  return e;
}

export function validateFiles(files: Array<{ type: string; size: number }>): string | null {
  if (files.length > TIP_LIMITS.maxFiles) return `You can attach up to ${TIP_LIMITS.maxFiles} files.`;
  for (const f of files) {
    if (!(TIP_LIMITS.allowedTypes as readonly string[]).includes(f.type)) return "Only JPG, PNG, WebP, HEIC photos and MP4/MOV videos are accepted.";
    if (f.size > TIP_LIMITS.maxFileBytes) return "Each file must be under 50 MB. Larger videos can be sent on WhatsApp.";
  }
  return null;
}

/** WhatsApp fallback message built from what the reader already typed. */
export function tipToWhatsappText(f: TipFields) {
  const lines = ["News tip for Anjaan Khabar"];
  if (f.name) lines.push(`Name: ${f.name}`);
  lines.push(`Location: ${f.location}`);
  if (f.category) lines.push(`Category: ${f.category}`);
  lines.push("", f.description);
  return lines.join("\n");
}
