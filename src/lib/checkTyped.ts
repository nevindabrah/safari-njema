// Checks a typed answer against the expected Swahili, forgiving case, punctuation and one small typo.
// Exists so typing exercises feel fair on a phone keyboard. Pure, so it is tested.

export type TypedResult = 'right' | 'close' | 'wrong'

// Lowercase, no punctuation, single spaces. "Habari?" and "habari" are the same answer.
export function normalise(text: string): string {
  return text.toLowerCase().replace(/[?!.,'’"-]/g, '').replace(/\s+/g, ' ').trim()
}

// The classic edit distance: how many single letter changes turn one string into the other.
export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]
}

// "close" still counts as right, with a note to check the spelling. Short words must be exact.
export function checkTyped(expected: string, typed: string): TypedResult {
  const want = normalise(expected)
  const got = normalise(typed)
  if (got === want) return 'right'
  if (got.length === 0) return 'wrong'
  const allowed = want.length >= 12 ? 2 : want.length >= 5 ? 1 : 0
  return editDistance(want, got) <= allowed ? 'close' : 'wrong'
}
