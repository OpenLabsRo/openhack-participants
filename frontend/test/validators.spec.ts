import { describe, it, expect } from 'vitest'
import {
  trimString,
  sanitizeText,
  isEmail,
  isUrl,
} from '../src/lib/validators'

describe('validators', () => {
  it('trimString collapses spaces and trims', () => {
    expect(trimString('  a   b  ')).toBe('a b')
    expect(trimString(null)).toBe('')
    expect(trimString(123)).toBe('123')
  })

  it('sanitizeText removes script and tags', () => {
    const input =
      'Hello <b>bold</b> <script>alert(1)</script><img src=1> world'
    expect(sanitizeText(input)).toBe('Hello bold  world')
  })

  it('isEmail basic checks', () => {
    expect(isEmail('a@b.com')).toBe(true)
    expect(isEmail('invalid@com')).toBe(false)
    expect(isEmail('   spaced @ a')).toBe(false)
  })

  it('isUrl basic checks', () => {
    expect(isUrl('https://example.com/path')).toBe(true)
    expect(isUrl('ftp://example.com')).toBe(false)
    expect(isUrl('not a url')).toBe(false)
  })
})
