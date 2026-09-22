// Tests for turning a failed write into a sentence.
// Exists so the messages stay plain and the codes that matter keep their meaning.
import { describe, expect, it } from 'vitest'
import { writeProblem } from './writeResult'

describe('writeProblem', () => {
  it('is null when the write went through', () => {
    expect(writeProblem({ error: null })).toBeNull()
  })

  it('names a refused rule, a duplicate, a bad value and a dropped connection', () => {
    expect(writeProblem({ error: { message: 'new row violates row-level security policy', code: '42501' } })).toBe('You are not allowed to change that.')
    expect(writeProblem({ error: { message: 'duplicate key', code: '23505' } })).toBe('That already exists.')
    expect(writeProblem({ error: { message: 'check constraint', code: '23514' } })).toBe('That value is not allowed.')
    expect(writeProblem({ error: { message: 'TypeError: Failed to fetch' } })).toBe('Could not reach the server. Your change was not saved.')
  })

  it('passes anything else through unchanged', () => {
    expect(writeProblem({ error: { message: 'something odd' } })).toBe('something odd')
  })
})
