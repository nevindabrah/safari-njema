// The table of Google's detailed place types and what each one adds to a lesson: a noun, a practical note, and extra phrase tags and slots.
// Exists as data on its own so the list can grow without the lookup around it growing too.

export interface PlaceFlavour {
  noun: string
  what?: string
  know: string[]
  tags: string[]
  slots: string[]
  avoid?: string[]
  replacesKind?: boolean
}

export const FLAVOURS: Array<{ types: string[]; flavour: PlaceFlavour }> = [
  { types: ['pharmacy', 'drugstore'], flavour: {
    noun: 'a pharmacy',
    what: 'A pharmacy here advises as well as sells. Many medicines need no prescription, and the pharmacist will ask before handing anything over.',
    know: ['Describe the problem simply and let the pharmacist ask the questions.'],
    tags: ['help', 'polite', 'numbers'], slots: ['help', 'polite'] } },
  { types: ['university', 'college'], flavour: {
    noun: 'a university',
    know: ['Students will switch to English to help you, so offer your Swahili first.'],
    tags: ['introductions', 'questions', 'polite'], slots: ['introductions', 'questions'] } },
  { types: ['library'], flavour: {
    noun: 'a library',
    what: 'A quiet room where the person at the desk knows where everything is. Greet them before you ask.',
    know: ['Keep your voice low, and ask before taking photographs.'],
    tags: ['polite', 'questions'], slots: ['polite', 'questions'] } },
  { types: ['atm'], flavour: {
    noun: 'a cash machine',
    what: 'A cash machine gives notes in hundreds and thousands, so the numbers are worth knowing before you reach the front of the queue.',
    know: ['Shield the keypad, and put the cash away before you step back.'],
    tags: ['cash', 'numbers', 'price'], slots: ['numbers', 'cash'], replacesKind: true } },
  { types: ['embassy', 'consulate'], flavour: {
    noun: 'an embassy',
    know: ['Take your passport and a printed copy. Phones are often left at the door.'],
    tags: ['introductions', 'polite', 'questions'], slots: ['introductions', 'polite'] } },
  { types: ['post_office'], flavour: {
    noun: 'a post office',
    know: ['Parcels are weighed and priced at the counter, so numbers and patience both help.'],
    tags: ['numbers', 'polite', 'questions'], slots: ['numbers', 'polite'] } },
  { types: ['police'], flavour: {
    noun: 'a police station',
    know: ['Stay calm and polite, ask for the officer on duty, and expect a report to take time.'],
    tags: ['polite', 'help', 'questions'], slots: ['polite', 'help'] } },
  { types: ['coffee_shop', 'cafe', 'tea_house'], flavour: {
    noun: 'a coffee house',
    what: 'Cafes are where people meet, work and wait out the afternoon. Service is at the table and nobody minds how long you stay.',
    know: ['Tea is usually boiled with milk, so say if you want it black.', 'Pay at the table when you are ready rather than at a till.'],
    tags: ['drink', 'ordering', 'paying'], slots: ['drink', 'ordering'] } },
  { types: ['night_club'], flavour: {
    noun: 'a night club',
    what: 'Night spots get going late and stay open until the early hours. The music is loud and the crowd is friendly.',
    know: ['Music starts late, often well after midnight.', 'Agree how you are getting home before you go in.'],
    tags: ['drink', 'polite', 'fare'], slots: ['drink', 'fare'] } },
  { types: ['bar', 'pub'], flavour: {
    noun: 'a bar',
    what: 'Bars here are relaxed and sociable, and a greeting to the person beside you is normal.',
    know: ['Drinks are usually paid for round by round rather than at the end.'],
    tags: ['drink', 'paying', 'numbers'], slots: ['drink', 'paying'] } },
  { types: ['bakery', 'ice_cream_shop'], flavour: {
    noun: 'a bakery',
    what: 'A counter where you point, pay and take away. There is no table service and the queue moves fast.',
    know: ['Fresh bread and pastries sell out early in the day.'],
    tags: ['food', 'paying', 'numbers'], slots: ['paying', 'numbers'] } },
  { types: ['fast_food_restaurant', 'meal_takeaway'], flavour: {
    noun: 'a takeaway',
    what: 'Order and pay at the counter, then wait for your number. Quick, busy and mostly conducted in English.',
    know: ['A greeting before you order still changes the tone of the whole exchange.'],
    tags: ['food', 'ordering', 'paying'], slots: ['ordering', 'paying'] } },
  { types: ['seafood_restaurant'], flavour: {
    noun: 'a seafood restaurant',
    know: ['Fish is often chosen fresh and priced by weight, so ask the price before it is cooked.'],
    tags: ['food', 'price', 'numbers'], slots: ['price', 'food'] } },
  { types: ['barbecue_restaurant'], flavour: {
    noun: 'a grill house',
    know: ['Grilled meat is ordered by weight for the table to share.'],
    tags: ['food', 'ordering', 'numbers'], slots: ['ordering', 'numbers'] } },
  { types: ['african_restaurant'], flavour: {
    noun: 'a Kenyan restaurant',
    know: ['Dishes are often served to share, and many are eaten with the right hand rather than cutlery.'],
    tags: ['food', 'ordering'], slots: ['food', 'ordering'] } },
  { types: ['indian_restaurant'], flavour: {
    noun: 'an Indian restaurant',
    know: ['Indian cooking has been part of Kenyan food for over a century, especially on the coast.'],
    tags: ['food', 'ordering'], slots: ['food', 'ordering'] } },
  { types: ['shopping_mall', 'department_store'], flavour: {
    noun: 'a shopping centre',
    what: 'A shopping centre works much as it does at home: fixed prices, tills and receipts. The Swahili that matters here is greeting, numbers and paying.',
    know: ['Prices are printed and fixed, so this is a place to read numbers rather than bargain.', 'Greet whoever serves you. It is noticed here as much as anywhere.', 'Card and phone payments are normal, and cash is fine too.'],
    tags: ['price', 'paying', 'numbers'], slots: ['price', 'paying', 'numbers'], avoid: ['bargaining'], replacesKind: true } },
  { types: ['supermarket', 'grocery_store', 'convenience_store'], flavour: {
    noun: 'a supermarket',
    what: 'A supermarket works the same way it does at home, with printed prices and a till at the door.',
    know: ['Greet the person at the till. It is the easiest Swahili you will use all day.', 'Fresh produce is often sold by weight, so numbers still help.', 'Card and phone payments are normal, and cash is fine too.'],
    tags: ['price', 'paying', 'numbers'], slots: ['paying', 'numbers'], avoid: ['bargaining'], replacesKind: true } },
  { types: ['gift_shop', 'clothing_store', 'jewelry_store'], flavour: {
    noun: 'a craft shop',
    know: ['Much of what is sold is handmade, so ask about the maker before you talk about the price.'],
    tags: ['bargaining', 'price', 'numbers'], slots: ['bargaining', 'price'] } },
  { types: ['national_park'], flavour: {
    noun: 'a national park',
    know: ['Park fees are paid at the gate, usually by card or phone rather than cash.', 'Your guide will name the animals in Swahili before anyone else does.'],
    tags: ['animals', 'guide', 'safari'], slots: ['animals', 'guide'] } },
  { types: ['wildlife_park', 'wildlife_refuge'], flavour: {
    noun: 'a wildlife conservancy',
    know: ['Conservancies are privately run, so the gate fee and the rules differ from a national park.'],
    tags: ['animals', 'guide', 'safari'], slots: ['animals', 'guide'] } },
  { types: ['zoo', 'aquarium'], flavour: {
    noun: 'a wildlife sanctuary',
    know: ['The keepers here are used to questions, and asking one in Swahili gets a warm answer.'],
    tags: ['animals', 'questions'], slots: ['animals', 'questions'] } },
  { types: ['hiking_area'], flavour: {
    noun: 'a hiking area',
    know: ['Start early. Afternoons cloud over, and some trails need a guide from the gate.'],
    tags: ['directions', 'guide', 'help'], slots: ['directions', 'guide'] } },
  { types: ['garden', 'botanical_garden'], flavour: {
    noun: 'a garden',
    know: ['Gate fees are small and usually paid in cash.'],
    tags: ['polite', 'numbers'], slots: ['numbers', 'polite'] } },
  { types: ['campground'], flavour: {
    noun: 'a campsite',
    know: ['Book ahead and bring cash. Sites are simple and the staff are local.'],
    tags: ['help', 'polite', 'cash'], slots: ['help', 'polite'] } },
  { types: ['resort_hotel'], flavour: {
    noun: 'a resort',
    know: ['Resort prices often include meals. Tipping the staff who help you is normal.'],
    tags: ['hotel', 'polite', 'numbers'], slots: ['hotel', 'polite'] } },
  { types: ['hostel', 'guest_house', 'bed_and_breakfast', 'motel'], flavour: {
    noun: 'a guest house',
    know: ['Small guest houses are family run, so greetings and introductions matter more than at a big hotel.'],
    tags: ['introductions', 'polite', 'hotel'], slots: ['introductions', 'polite'] } },
  { types: ['train_station', 'light_rail_station'], flavour: {
    noun: 'a train station',
    know: ['Train seats are booked ahead and numbered. Arrive an hour early for the security check.'],
    tags: ['transport', 'questions', 'fare'], slots: ['transport', 'questions'] } },
  { types: ['bus_station', 'bus_stop', 'transit_station'], flavour: {
    noun: 'a bus stage',
    know: ['Matatus and buses leave when they are full rather than at a set time.'],
    tags: ['transport', 'fare', 'directions'], slots: ['fare', 'directions'] } },
  { types: ['ferry_terminal'], flavour: {
    noun: 'a ferry terminal',
    what: 'A ferry crossing is part of the daily commute here, short and very full. Everyone boards on foot together.',
    know: ['Ferries fill quickly and the crowd is close. Keep your bag in front of you.'],
    tags: ['transport', 'fare', 'coast'], slots: ['fare', 'transport'] } },
  { types: ['taxi_stand'], flavour: {
    noun: 'a taxi stand',
    know: ['Agree the fare before you get in, or use a ride app and pay its price.'],
    tags: ['fare', 'transport', 'price'], slots: ['fare', 'price'] } },
  { types: ['mosque'], flavour: {
    noun: 'a mosque',
    know: ['Visitors are welcome outside prayer times. Take your shoes off, and cover your head if you are a woman.'],
    tags: ['respect', 'polite', 'coastal'], slots: ['respect', 'polite'] } },
  { types: ['church'], flavour: {
    noun: 'a church',
    know: ['Services are long and full of singing, and visitors are welcome. People dress smartly.'],
    tags: ['respect', 'polite'], slots: ['respect', 'polite'] } },
  { types: ['hindu_temple', 'synagogue'], flavour: {
    noun: 'a temple',
    know: ['Take your shoes off at the door and ask before taking photographs.'],
    tags: ['respect', 'polite'], slots: ['respect', 'polite'] } },
  { types: ['art_gallery'], flavour: {
    noun: 'an art gallery',
    know: ['Galleries here are small and the artist is often in the room. Ask about the work.'],
    tags: ['questions', 'polite'], slots: ['questions', 'polite'] } },
  { types: ['historical_landmark', 'historical_place', 'monument'], flavour: {
    noun: 'a historic site',
    know: ['A guide at the gate will know far more than any sign. Agreeing the price first is normal.'],
    tags: ['guide', 'questions', 'price'], slots: ['guide', 'questions'] } },
  { types: ['cultural_landmark'], flavour: {
    noun: 'a cultural centre',
    know: ['Performances run to a timetable, so check the times when you arrive.'],
    tags: ['questions', 'guide', 'polite'], slots: ['questions', 'guide'] } },
  { types: ['international_airport'], flavour: {
    noun: 'an international airport',
    know: ['Taxis and ride apps wait outside arrivals. Agree the fare or take the price the app gives.'],
    tags: ['airport', 'transport', 'fare'], slots: ['airport', 'fare'] } },
  { types: ['marina'], flavour: {
    noun: 'a marina',
    know: ['Boat trips are arranged on the day and the price is agreed before you board.'],
    tags: ['coast', 'price', 'fare'], slots: ['price', 'coast'] } },
  { types: ['neighborhood', 'sublocality'], flavour: {
    noun: 'a neighbourhood',
    know: ['Neighbours greet each other in the street here, and greeting back is the whole trick.'],
    tags: ['greeting', 'polite', 'directions'], slots: ['polite', 'directions'] } },
]
