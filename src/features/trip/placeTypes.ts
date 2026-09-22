// Maps Google's place types to our short list of eleven, plus a label for each. The icon for a place type is drawn by components/icons.
// Exists so the lesson generator and the UI agree on what kind of place a stop is.
import type { PlaceType } from '../../lib/types'

const rules: Array<{ type: PlaceType; googleTypes: string[] }> = [
  { type: 'airport', googleTypes: ['airport', 'international_airport', 'airstrip'] },
  { type: 'station', googleTypes: ['train_station', 'bus_station', 'transit_station', 'bus_stop', 'ferry_terminal', 'light_rail_station'] },
  { type: 'hotel', googleTypes: ['lodging', 'hotel', 'resort_hotel', 'guest_house', 'hostel', 'bed_and_breakfast', 'campground', 'motel', 'extended_stay_hotel'] },
  { type: 'restaurant', googleTypes: ['restaurant', 'cafe', 'bar', 'coffee_shop', 'food', 'meal_takeaway', 'bakery', 'fast_food_restaurant', 'pub'] },
  { type: 'market', googleTypes: ['market', 'shopping_mall', 'store', 'grocery_store', 'supermarket', 'clothing_store', 'gift_shop', 'jewelry_store'] },
  { type: 'beach', googleTypes: ['beach', 'marina'] },
  { type: 'museum', googleTypes: ['museum', 'art_gallery', 'historical_landmark', 'monument', 'historical_place', 'cultural_landmark'] },
  { type: 'religious_site', googleTypes: ['church', 'mosque', 'hindu_temple', 'place_of_worship', 'synagogue'] },
  { type: 'park', googleTypes: ['national_park', 'park', 'zoo', 'wildlife_park', 'wildlife_refuge', 'natural_feature', 'hiking_area', 'state_park', 'garden', 'botanical_garden'] },
  { type: 'city', googleTypes: ['locality', 'sublocality', 'neighborhood', 'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3', 'postal_town'] },
]

export function toPlaceType(googleTypes: string[]): PlaceType {
  for (const rule of rules) {
    if (googleTypes.some((t) => rule.googleTypes.includes(t))) return rule.type
  }
  return 'other'
}

export const PLACE_TYPE_INFO: Record<PlaceType, { label: string; about: string }> = {
  city: { label: 'City or town', about: 'A town or city in Kenya. Towns mix matatu stages, markets and offices, and a Swahili greeting opens every conversation.' },
  park: { label: 'Park or reserve', about: 'A park or reserve. Kenya\'s parks protect wildlife and landscapes, and most are visited by vehicle with a guide.' },
  beach: { label: 'Beach', about: 'A beach on Kenya\'s Indian Ocean coast, the region where Swahili has its roots and is spoken most fully.' },
  market: { label: 'Market or shop', about: 'A market or shop. At markets prices are spoken rather than printed, and a greeting comes before any business.' },
  restaurant: { label: 'Restaurant or cafe', about: 'A restaurant or cafe. Kenyan menus mix coastal, upcountry and Indian cooking, and most dishes are named in Swahili.' },
  hotel: { label: 'Hotel or lodge', about: 'A hotel or lodge. Staff usually speak English, and a greeting in Swahili is warmly received.' },
  airport: { label: 'Airport', about: 'An airport. Signs are in English and Swahili, and it is often the first place a visitor hears Swahili spoken.' },
  station: { label: 'Station', about: 'A station or terminus. Kenya\'s trains and buses run on set routes, and asking about times is a good first use of Swahili.' },
  religious_site: { label: 'Place of worship', about: 'A place of worship. Dress modestly, keep your voice low, and ask before taking photographs.' },
  museum: { label: 'Museum or landmark', about: 'A museum or historic site. Many tell the story of Kenya before and after independence in 1963.' },
  other: { label: 'Place', about: 'A place in Kenya.' },
}
