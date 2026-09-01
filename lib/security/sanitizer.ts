/**
 * Input sanitization and XSS prevention utilities
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes characters to prevent HTML/XSS injection in rendered strings
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITY_MAP[char] || char);
}

/**
 * Strips dangerous control characters, null bytes, and normalizes unicode
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // control chars
    .trim()
    .slice(0, maxLength);
}

/**
 * Heuristic spam / header-injection detector for contact desk
 */
export function detectSpamOrInjection(params: {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
}): { isSpam: boolean; reason?: string } {
  // 1. Honeypot check (hidden field filled by bots)
  if (params.honeypot && params.honeypot.trim().length > 0) {
    return { isSpam: true, reason: "honeypot_triggered" };
  }

  const combined = `${params.name} ${params.email} ${params.message}`.toLowerCase();

  // 2. Email header injection check (\r\nTo:, \r\nBcc:, etc.)
  if (/(\r\n|\r|\n)(bcc:|to:|cc:|subject:)/i.test(params.email) || /(\r\n|\r|\n)(bcc:|to:|cc:|subject:)/i.test(params.name)) {
    return { isSpam: true, reason: "header_injection_detected" };
  }

  // 3. Known automated exploit strings
  if (
    combined.includes("<script") ||
    combined.includes("javascript:") ||
    combined.includes("data:text/html") ||
    combined.includes("onload=") ||
    combined.includes("onerror=")
  ) {
    return { isSpam: true, reason: "xss_payload_detected" };
  }

  return { isSpam: false };
}
