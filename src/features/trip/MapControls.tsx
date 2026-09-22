// The map's own zoom in, zoom out and recentre buttons, drawn in the app's style because Google's default controls are switched off.
// Exists so the map can be moved with one hand on a phone and brought back to the whole trip in one tap.
import { useMap } from '@vis.gl/react-google-maps'
import { Icon } from '../../components/icons'
import { frameFor, nextZoom, type MapPoint } from '../../lib/mapFrame'

interface MapControlsProps {
  points: MapPoint[]
  home: MapPoint
}

export function MapControls({ points, home }: MapControlsProps) {
  const map = useMap()

  function zoom(step: number) {
    if (map) map.setZoom(nextZoom(map.getZoom(), step))
  }

  function recentre() {
    if (!map) return
    const frame = frameFor(points, home)
    if (frame.kind === 'point') {
      map.setCenter(frame.center)
      map.setZoom(frame.zoom)
      return
    }
    map.fitBounds(frame.box, 64)
  }

  const button = 'w-11 h-11 rounded-pill bg-surface text-text shadow-lift cursor-pointer flex items-center justify-center'

  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
      <button type="button" onClick={() => zoom(1)} aria-label="Zoom in" className={button}><Icon name="plus" size={20} /></button>
      <button type="button" onClick={() => zoom(-1)} aria-label="Zoom out" className={button}><Icon name="minus" size={20} /></button>
      <button type="button" onClick={recentre} aria-label={points.length > 0 ? 'Show the whole trip' : 'Show all of Kenya'} className={button}><Icon name="target" size={19} /></button>
    </div>
  )
}
