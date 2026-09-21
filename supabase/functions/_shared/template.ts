// Builds a lesson with no model call: a general brief for the kind of place, plus the top phrases.
// Exists because the live site runs with the AI switch off, so this is the main path users see.
import type { Lesson } from './lessonSchema'
import type { CandidatePhrase } from './pickCandidates'

export interface TemplateInput {
  placeName: string
  placeType: string
  region: string
  firstStop: boolean
  phrases: CandidatePhrase[]
}

const BRIEFS: Record<string, { what: string; know: string[]; etiquette: string }> = {
  market: {
    what: 'A market is where prices are spoken, not printed. Sellers expect a greeting before any business, and a friendly back and forth over the price is normal.',
    know: ['Greet first, then ask the price.', 'A first price is an opening offer, not a final one.', 'Small notes and coins make paying easier.'],
    etiquette: 'Smile, take your time and keep bargaining light. Walking away politely is fine.',
  },
  restaurant: {
    what: 'Eating out is relaxed and unhurried. Meals are often shared, and the staff will appreciate a greeting and a thank you in Swahili.',
    know: ['Greet the staff when you arrive.', 'Ask what is fresh today.', 'Ask for the bill when you are ready. It is rarely brought unasked.'],
    etiquette: 'Wash your hands before eating if a basin is offered. Use your right hand for shared dishes.',
  },
  hotel: {
    what: 'Hotels and lodges are used to visitors, and the staff will usually speak English. A few words of Swahili still change the tone of every conversation.',
    know: ['Greet staff by name if you learn it.', 'Ask before taking photos of people.', 'Keep small notes for tips.'],
    etiquette: 'A warm greeting in the morning goes a long way. Patience is valued.',
  },
  park: {
    what: 'Parks and reserves are where Kenya is at its wildest. Your guide is the expert, and knowing the names of animals in Swahili makes the drive more fun.',
    know: ['Stay in the vehicle unless your guide says otherwise.', 'Mornings and late afternoons are best for animals.', 'Bring layers. It gets cold early and late.'],
    etiquette: 'Keep your voice low near animals. Tip your guide at the end of the visit.',
  },
  beach: {
    what: 'The coast has its own pace and its own Swahili, closer to the language\'s roots. Beach life is relaxed, and the towns nearby are more traditional.',
    know: ['Beach sellers will approach you. A friendly no is enough.', 'Tides change what you can do. Ask locally.', 'Sun is strong even when it is cloudy.'],
    etiquette: 'Cover shoulders and knees when you leave the beach. Many coastal towns are Muslim and modest dress is respectful.',
  },
  airport: {
    what: 'Airports are busy and mostly in English, but taxi drivers and porters will be glad of a greeting in Swahili.',
    know: ['Agree a taxi price before you get in, or use an app.', 'Keep your passport handy.', 'Have small notes ready for tips.'],
    etiquette: 'Greet before asking for anything. A thank you is always welcome.',
  },
  station: {
    what: 'Stations and stages are where you meet the real rhythm of travel in Kenya. Matatus and buses follow their own timing, and asking is the way to find out.',
    know: ['Ask the conductor where the vehicle is going.', 'Fares are usually fixed per route.', 'Keep valuables close in crowds.'],
    etiquette: 'Pass your fare forward and say thank you. Let others off before you get on.',
  },
  city: {
    what: 'Kenyan towns are lively and friendly. People will greet you on the street, and greeting back is the fastest way to feel at home.',
    know: ['Greetings come before every conversation.', 'Ask for directions freely. People help.', 'Carry a little cash. Not every place takes cards.'],
    etiquette: 'Take your time with greetings. Rushing straight to a question feels abrupt.',
  },
  religious_site: {
    what: 'Places of worship welcome visitors who show respect. Dress modestly and follow the lead of the people around you.',
    know: ['Cover shoulders and knees.', 'Remove shoes if others do.', 'Ask before taking photos.'],
    etiquette: 'Speak softly. Greet the caretaker or guide and thank them when you leave.',
  },
  museum: {
    what: 'Museums and landmarks tell Kenya\'s story from the coast to the highlands. Guides are often available and full of detail.',
    know: ['A guide adds a lot. Ask if one is available.', 'Ask before taking photos inside.', 'Check what the entry fee covers.'],
    etiquette: 'Greet the guide first and thank them at the end.',
  },
  other: {
    what: 'Wherever you are in Kenya, a greeting opens every door. Take your time with hello and how are you before you ask for anything.',
    know: ['Greet first, always.', 'Ask for help. People are generous with it.', 'Keep a little cash for small purchases.'],
    etiquette: 'Patience and warmth are noticed and returned.',
  },
}

const PRACTICAL: Record<string, string> = {
  coast: 'Dress modestly away from the beach. Cover shoulders and knees in towns and villages.',
  nairobi: 'Use ride apps or agree a taxi fare first. Keep phones out of sight on busy streets.',
  rift_valley_mara: 'Carry cash, since card machines and signal are unreliable. Bring warm layers for early mornings.',
  central_mt_kenya: 'Evenings are cool at altitude. Carry a light jacket and some cash.',
  western_lake: 'Carry cash and drink bottled or treated water.',
  north: 'Distances are long and services are sparse. Carry water, cash and a charged phone.',
}

const WHY: Array<[string, string]> = [
  ['greeting', 'Say this first, before anything else.'],
  ['bargaining', 'Use this when the first price feels high.'],
  ['numbers', 'You will hear prices said out loud.'],
  ['market', 'Useful with a seller.'],
  ['food', 'Useful when ordering or asking about a dish.'],
  ['drink', 'Useful when ordering something to drink.'],
  ['safari', 'Useful with your guide on the drive.'],
  ['animals', 'You will want to name what you see.'],
  ['transport', 'Useful with a driver or conductor.'],
  ['directions', 'Useful when you are not sure of the way.'],
  ['hotel', 'Useful with the staff where you are staying.'],
  ['help', 'Useful if you need a hand.'],
  ['coast', 'Common on the coast.'],
  ['coastal', 'Common on the coast.'],
  ['polite', 'A polite phrase that fits almost anywhere.'],
]

function whyHere(phrase: CandidatePhrase): string {
  for (const [tag, text] of WHY) {
    if (phrase.tags.includes(tag)) return text
  }
  return 'Useful here.'
}

export function buildTemplateLesson(input: TemplateInput): Lesson {
  const brief = BRIEFS[input.placeType] ?? BRIEFS.other
  const know = [...brief.know]
  if (input.firstStop) know.unshift('This is your first stop, so it starts with the greetings you will use everywhere.')
  return {
    place: { name: input.placeName, type: input.placeType },
    brief: {
      what_it_is: brief.what,
      know_today: know.slice(0, 4),
      etiquette: brief.etiquette,
      practical: PRACTICAL[input.region] ?? PRACTICAL.nairobi,
    },
    phrases: input.phrases.map((p) => ({ phrase_id: p.id, why_here: whyHere(p) })),
    new_phrases: [],
  }
}
