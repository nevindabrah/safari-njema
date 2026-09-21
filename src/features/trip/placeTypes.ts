// Maps Google's place types to our short list of eleven, plus a label for each. The icon for a place type is drawn by components/icons.
// Exists so the lesson generator and the UI agree on what kind of place a stop is.
import type { PlaceType } from '../../lib/types'

// Checked in order. The first group with a matching Google type wins.
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

export const PLACE_TYPE_INFO: Record<PlaceType, { label: string }> = {
  city: { label: 'City or town' },
  park: { label: 'Park or reserve' },
  beach: { label: 'Beach' },
  market: { label: 'Market or shop' },
  restaurant: { label: 'Restaurant or cafe' },
  hotel: { label: 'Hotel or lodge' },
  airport: { label: 'Airport' },
  station: { label: 'Station' },
  religious_site: { label: 'Place of worship' },
  museum: { label: 'Museum or landmark' },
  other: { label: 'Place' },
}
