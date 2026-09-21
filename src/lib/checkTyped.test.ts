// Tests for typed answer checking.
// Exists so a missing question mark is never marked wrong, and a different word is never marked right.
import { describe, expect, it } from 'vitest'
import { checkTyped, editDistance, normalise } from './checkTyped'

describe('normalise', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(normalise('  Habari? ')).toBe('habari')
    expect(normalise('Punguza bei,  tafadhali')).toBe('punguza bei tafadhali')
    expect(normalise('M-Pesa')).toBe('mpesa')
  })
})

describe('editDistance', () => {
  it('counts single letter changes', () => {
    expect(editDistance('simba', 'simba')).toBe(0)
    expect(editDistance('simba', 'simpa')).toBe(1)
    expect(editDistance('twiga', 'tiga')).toBe(1)
    expect(editDistance('', 'abc')).toBe(3)
  })
})

describe('checkTyped', () => {
  it('accepts the exact answer however it is written', () => {
    expect(checkTyped('Habari?', 'habari')).toBe('right')
    expect(checkTyped('Asante sana', 'ASANTE  SANA')).toBe('right')
  })
  it('calls one typo in a longer word close', () => {
    expect(checkTyped('Tafadhali', 'tafadali')).toBe('close')
    expect(checkTyped('Asante sana', 'asante sanna')).toBe('close')
  })
  it('wants short words exact', () => {
    expect(checkTyped('Sawa', 'sewa')).toBe('wrong')
    expect(checkTyped('Pole', 'poa')).toBe('wrong')
  })
  it('rejects a different word and an empty answer', () => {
    expect(checkTyped('Simba', 'tembo')).toBe('wrong')
    expect(checkTyped('Simba', '   ')).toBe('wrong')
  })
})
