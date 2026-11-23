import { describe, it, expect } from 'vitest'
import { shapeArabic, visualArabicWord } from '@/lib/arabicShape'

const codes = (s: string) => [...s].map((c) => c.codePointAt(0)!.toString(16))

describe('shapeArabic', () => {
  it('joins letters into initial, medial and final forms', () => {
    // أحمد: alef-hamza (no join forward), then ح initial, م medial, د final
    expect(codes(shapeArabic('أحمد'))).toEqual(['fe83', 'fea3', 'fee4', 'feaa'])
  })

  it('makes lam-alef ligatures', () => {
    // لا on its own, and joined to a previous letter (سلام)
    expect(codes(shapeArabic('لا'))).toEqual(['fefb'])
    expect(codes(shapeArabic('سلام'))).toEqual(['feb3', 'fefc', 'fee1'])
  })

  it('leaves other text alone', () => {
    expect(shapeArabic('Next.js 16')).toBe('Next.js 16')
  })
})

describe('visualArabicWord', () => {
  it('reverses joined letters and drops vowel marks', () => {
    expect(codes(visualArabicWord('بُعد'))).toEqual(['feaa', 'fecc', 'fe91'])
  })

  it('keeps Latin words as they are', () => {
    expect(visualArabicWord('React')).toBe('React')
  })
})
