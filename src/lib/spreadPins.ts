// Moves map pins that would sit on top of each other into a small ring, so every pin can be seen and clicked.
// Exists because several stops in one town share almost the same spot at country scale. Pure, so it is tested.

export interface Point {
  x: number
  y: number
}

export function spreadPins(points: Point[], minDistance: number): Point[] {
  const groups: number[][] = []
  points.forEach((point, index) => {
    const group = groups.find((g) => Math.hypot(points[g[0]].x - point.x, points[g[0]].y - point.y) < minDistance)
    if (group) group.push(index)
    else groups.push([index])
  })

  const result = points.map((p) => ({ ...p }))
  for (const group of groups) {
    if (group.length < 2) continue
    const centreX = group.reduce((sum, i) => sum + points[i].x, 0) / group.length
    const centreY = group.reduce((sum, i) => sum + points[i].y, 0) / group.length
    const radius = minDistance / 2 / Math.sin(Math.PI / group.length)
    group.forEach((pointIndex, k) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * k) / group.length
      result[pointIndex] = { x: centreX + radius * Math.cos(angle), y: centreY + radius * Math.sin(angle) }
    })
  }
  return result
}
