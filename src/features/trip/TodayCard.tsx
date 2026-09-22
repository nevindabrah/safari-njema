// The card at the top of the itinerary that says what today holds: the stops, the next one coming, or how far off the trip is.
// Exists so a traveller opening the app on the bus sees today's lesson first, and a review nudge when phrases are due.
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'
import { todayIso } from '../../lib/calendar'
import { todayPlan } from '../../lib/todayPlan'
import type { StopRow, Trip } from '../../lib/types'

interface TodayCardProps {
  trip: Trip
  stops: StopRow[]
  dueCount: number
  onSelect: (stopId: string) => void
}

export function TodayCard({ trip, stops, dueCount, onSelect }: TodayCardProps) {
  const plan = todayPlan(stops, trip.start_date, trip.end_date, todayIso())
  if (plan.kind === 'no_dates' && dueCount === 0) return null
  const lessonOf = (stop: StopRow) => stop.user_lessons[0]?.id

  return (
    <section aria-labelledby="today-title" className="mx-2 mb-5 rounded-card p-4 sm:p-5" style={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>
      <p id="today-title" className="text-xs uppercase tracking-wide font-bold opacity-80">Today</p>
      {plan.kind === 'before' && <p className="text-lg font-bold mt-1">{plan.daysUntil === 1 ? 'Your trip starts tomorrow.' : `Your trip starts in ${plan.daysUntil} days.`}{plan.first ? ` First stop: ${plan.first.place.name}.` : ''}</p>}
      {plan.kind === 'after' && <p className="text-lg font-bold mt-1">Your trip is over. Safari njema, and karibu tena.</p>}
      {plan.kind === 'between' && <p className="text-lg font-bold mt-1">A free day. {plan.daysUntil === 1 ? 'Tomorrow' : `In ${plan.daysUntil} days`}: {plan.next.place.name}.</p>}
      {plan.kind === 'today' && plan.stops.length === 0 && <p className="text-lg font-bold mt-1">No stop planned for today.</p>}
      {plan.kind === 'today' && plan.stops.map((stop) => (
        <div key={stop.id} className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-lg font-bold flex-1 min-w-[10rem] flex items-center gap-2"><Icon name={stop.place.place_type} size={18} />{stop.place.name}</p>
          {lessonOf(stop) ? <Link to={`/lesson/${lessonOf(stop)}`}><Button variant="accent" tabIndex={-1} className="!min-h-[44px]">{stop.user_lessons[0]?.status === 'completed' ? 'Review lesson' : 'Start lesson'}</Button></Link> : <Button variant="soft" className="!min-h-[44px]" onClick={() => onSelect(stop.id)}>Show on map</Button>}
        </div>
      ))}
      {dueCount > 0 && (
        <div className="mt-3 pt-3 flex flex-wrap items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="flex-1 min-w-[10rem]">{dueCount} phrase{dueCount === 1 ? '' : 's'} from earlier stops {dueCount === 1 ? 'is' : 'are'} due for review.</p>
          <Link to="/review"><Button variant="onHero" tabIndex={-1} className="!min-h-[44px]">Review now</Button></Link>
        </div>
      )}
    </section>
  )
}
