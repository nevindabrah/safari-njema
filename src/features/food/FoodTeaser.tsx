// A short card that points to the food page.
// Exists so the dishes can be found from the home page and the phrasebook.
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'

export function FoodTeaser() {
  return (
    <section aria-labelledby="food-teaser-title" className="rounded-card bg-surface shadow-soft p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
      <div>
        <h2 id="food-teaser-title" className="text-2xl sm:text-3xl mb-2">Know the plate before it arrives</h2>
        <p className="max-w-2xl text-muted">Ugali, nyama choma, chapati, chai. What each dish is, how people eat it, and the words to order it.</p>
      </div>
      <Link to="/food"><Button variant="accent" tabIndex={-1}><Icon name="restaurant" size={18} />See the dishes</Button></Link>
    </section>
  )
}
