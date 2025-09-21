// Simple, well-tested validators and sanitizers for frontend input handling.

// trimString(s)
// - trims whitespace and collapses multiple spaces
export function trimString(s: unknown): string {
  if (s == null) return ''
  const str = String(s)
  return str.replace(/\s+/g, ' ').trim()
}

// sanitizeText(s)
// - minimal sanitizer: removes script tags and angle-bracketed tags to avoid
//   accidental injection when rendering into innerHTML (we still prefer
//   rendering as text). This is intentionally conservative; the UI should
//   not call innerHTML with user-provided content.
export function sanitizeText(s: unknown): string {
  const t = trimString(s)
  // remove <script>..</script> blocks
  let out = t.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  // remove other HTML tags
  out = out.replace(/<[^>]+>/g, '')
  return out
}

// isEmail(s)
// - simple RFC-lite email validation suitable for client-side UX checks
export function isEmail(s: unknown): boolean {
  if (s == null) return false
  const str = String(s).trim()
  // reasonable client-side regex: local@domain.tld
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

// isUrl(s)
// - lightweight URL checker (accepts http/https)
export function isUrl(s: unknown): boolean {
  if (s == null) return false
  const str = String(s).trim()
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch (e) {
    return false
  }
}
