// The food page: the dishes a traveller meets in Kenya, with a photo, how to eat each one and the phrase to order it.
// Exists because the first meal is where most travellers first need their Swahili, and knowing the plate takes the fear out of it.
import { useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { Footer } from '../../components/Footer'
import { LeaveButton } from '../../components/LeaveButton'
import { SearchBox } from '../../components/SearchBox'
import { DISHES } from './dishes'
import { DishCard } from './DishCard'

export function FoodScreen() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = DISHES.filter((d) => q === '' || `${d.name} ${d.english} ${d.what} ${d.where}`.toLowerCase().includes(q))

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-28 min-[700px]:pb-10">
        <LeaveButton kind="back" label="Back" to="/" showLabel className="mb-3" />
        <h1 lang="sw" className="text-4xl sm:text-5xl">Chakula</h1>
        <p className="text-muted mt-2 max-w-2xl">The dishes you will meet in Kenya: how to say each name, what it is, and how people eat it. The notes are in English and have not been reviewed by the Swahili teacher.</p>
        <SearchBox id="dish-search" label="Search dishes" placeholder="Search dishes, or try beans or coast" value={query} onChange={setQuery} className="mt-5 max-w-xl" />
        {shown.length === 0 && <p className="text-muted mt-6">Nothing matches that. Try a plainer word, like rice or bread.</p>}
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((dish) => <DishCard key={dish.id} dish={dish} />)}
        </ul>
        <Footer />
      </main>
    </div>
  )
}
