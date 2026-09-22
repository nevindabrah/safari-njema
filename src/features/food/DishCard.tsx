// One dish: its photo, its name, what it is, how to eat it, where it turns up, and the phrase to say when ordering.
// Exists so FoodScreen is a list and this file owns one card.
import { Icon } from '../../components/icons'
import { SpeakButton } from '../audio/SpeakButton'
import { dishPhotoFor, dishSrcSet } from './dishPhotoData'
import type { Dish } from './dishes'

export function DishCard({ dish }: { dish: Dish }) {
  const photo = dishPhotoFor(dish.id)
  return (
    <li className="bg-surface rounded-card shadow-soft overflow-hidden flex flex-col">
      {photo ? (
        <img src={photo.medium} srcSet={dishSrcSet(photo)} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" alt={dish.name} loading="lazy" className="w-full h-52 object-cover" />
      ) : (
        <div className="w-full h-52 bg-tint flex items-center justify-center" aria-hidden="true"><Icon name="restaurant" size={48} /></div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h2 lang="sw" className="text-2xl">{dish.name}</h2>
          <p className="text-sm text-muted">{dish.english}</p>
        </div>
        <p>{dish.what}</p>
        <div>
          <p className="text-xs uppercase tracking-wide font-bold text-muted mb-1">How to eat it</p>
          <p>{dish.howToEat}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide font-bold text-muted mb-1">Where you will meet it</p>
          <p className="text-muted">{dish.where}</p>
        </div>
        <div className="mt-auto pt-2 flex items-center gap-3 rounded-input bg-tint px-3 py-2">
          <SpeakButton swahili={dish.say} />
          <p className="text-sm"><span className="text-muted">To order, say </span><b lang="sw">{dish.say}</b></p>
        </div>
        {photo && <p className="text-[11px] text-muted leading-snug">Photo by {photo.author}, <a href={photo.licenceUrl ?? photo.filePage} target="_blank" rel="noreferrer" className="underline">{photo.licence}</a>, via <a href={photo.filePage} target="_blank" rel="noreferrer" className="underline">Wikimedia Commons</a></p>}
      </div>
    </li>
  )
}
