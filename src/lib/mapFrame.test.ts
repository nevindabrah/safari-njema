// Tests for the recentre maths.
// Exists so the button always frames the whole trip, and never zooms to nowhere when a stop has no coordinates.
import { describe, expect, it } from 'vitest'
import { frameFor, nextZoom } from './mapFrame'

const kenya = { lat: 0.2, lng: 37.9 }

describe('frameFor', () => {
  it('goes back to the country when there is nothing to show', () => {
    expect(frameFor([], kenya)).toEqual({ kind: 'point', center: kenya, zoom: 6 })
    expect(frameFor([{ lat: NaN, lng: 36 }], kenya)).toEqual({ kind: 'point', center: kenya, zoom: 6 })
  })
  it('centres on a single stop', () => {
    expect(frameFor([{ lat: -1.28, lng: 36.82 }], kenya)).toEqual({ kind: 'point', center: { lat: -1.28, lng: 36.82 }, zoom: 13 })
  })
  it('fits a box around every stop', () => {
    const frame = frameFor([{ lat: -1.28, lng: 36.82 }, { lat: -4.28, lng: 39.59 }, { lat: -1.49, lng: 35.14 }], kenya)
    expect(frame).toEqual({ kind: 'box', box: { north: -1.28, south: -4.28, east: 39.59, west: 35.14 } })
  })
  it('treats stops at almost the same spot as one point', () => {
    const frame = frameFor([{ lat: -1.2800, lng: 36.8200 }, { lat: -1.2805, lng: 36.8203 }], kenya)
    expect(frame.kind).toBe('point')
  })
})

describe('nextZoom', () => {
  it('steps within the limits', () => {
    expect(nextZoom(12, 1)).toBe(13)
    expect(nextZoom(19, 1)).toBe(19)
    expect(nextZoom(4, -1)).toBe(4)
    expect(nextZoom(undefined, 1)).toBe(7)
  })
})
