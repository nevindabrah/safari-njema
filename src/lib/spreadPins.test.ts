// Tests for the pin spreading.
// Exists so stacked pins always end up far enough apart to click, and lone pins never move.
import { describe, expect, it } from 'vitest'
import { spreadPins } from './spreadPins'

function minGap(points: Array<{ x: number; y: number }>): number {
  let smallest = Infinity
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) smallest = Math.min(smallest, Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y))
  }
  return smallest
}

describe('spreadPins', () => {
  it('leaves pins that are far apart where they are', () => {
    const points = [{ x: 36.8, y: 1.3 }, { x: 39.6, y: 4.3 }, { x: 35.1, y: 1.5 }]
    expect(spreadPins(points, 0.8)).toEqual(points)
  })

  it('separates three pins on the same spot by at least the minimum distance', () => {
    const stacked = [{ x: 36.82, y: 1.29 }, { x: 36.82, y: 1.28 }, { x: 36.82, y: 1.28 }]
    expect(minGap(spreadPins(stacked, 0.8))).toBeGreaterThanOrEqual(0.799)
  })

  it('keeps a spread group centred on where it was', () => {
    const spread = spreadPins([{ x: 10, y: 10 }, { x: 10, y: 10 }], 1)
    expect((spread[0].x + spread[1].x) / 2).toBeCloseTo(10)
    expect((spread[0].y + spread[1].y) / 2).toBeCloseTo(10)
  })

  it('only moves the pins that collide', () => {
    const spread = spreadPins([{ x: 0, y: 0 }, { x: 0.1, y: 0 }, { x: 5, y: 5 }], 1)
    expect(spread[2]).toEqual({ x: 5, y: 5 })
    expect(spread[0]).not.toEqual({ x: 0, y: 0 })
  })

  it('keeps ten stacked pins clickable', () => {
    const stacked = Array.from({ length: 10 }, () => ({ x: 1, y: 1 }))
    expect(minGap(spreadPins(stacked, 0.8))).toBeGreaterThanOrEqual(0.799)
  })
})
