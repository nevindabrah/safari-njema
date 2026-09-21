// Well known places in Kenya for test mode's search, used only when there is no Google Maps key.
// Exists so search, add and learn can be tried for every kind of place with no Google account. Coordinates are approximate.
import type { PickedPlace } from '../trip/usePlaceSearch'

export const SAMPLE_PLACES: PickedPlace[] = [
  { googlePlaceId: 'sample-maasai-market', name: 'Maasai Market', lat: -1.2864, lng: 36.8172, googleTypes: ['market'], placeType: 'market', region: 'nairobi', county: 'Nairobi County', address: 'Nairobi' },
  { googlePlaceId: 'sample-maasai-mara', name: 'Maasai Mara National Reserve', lat: -1.49, lng: 35.1439, googleTypes: ['national_park'], placeType: 'park', region: 'rift_valley_mara', county: 'Narok County', address: 'Narok' },
  { googlePlaceId: 'sample-diani', name: 'Diani Beach', lat: -4.2797, lng: 39.5947, googleTypes: ['beach'], placeType: 'beach', region: 'coast', county: 'Kwale County', address: 'Kwale' },
  { googlePlaceId: 'sample-lamu', name: 'Lamu Old Town', lat: -2.2696, lng: 40.9006, googleTypes: ['locality'], placeType: 'city', region: 'coast', county: 'Lamu County', address: 'Lamu' },
  { googlePlaceId: 'sample-fort-jesus', name: 'Fort Jesus', lat: -4.0626, lng: 39.6796, googleTypes: ['museum'], placeType: 'museum', region: 'coast', county: 'Mombasa County', address: 'Mombasa' },
  { googlePlaceId: 'sample-nairobi-np', name: 'Nairobi National Park', lat: -1.3733, lng: 36.858, googleTypes: ['national_park'], placeType: 'park', region: 'nairobi', county: 'Nairobi County', address: 'Nairobi' },
  { googlePlaceId: 'sample-giraffe-centre', name: 'Giraffe Centre', lat: -1.376, lng: 36.7446, googleTypes: ['zoo'], placeType: 'park', region: 'nairobi', county: 'Nairobi County', address: 'Langata, Nairobi' },
  { googlePlaceId: 'sample-karura', name: 'Karura Forest', lat: -1.2381, lng: 36.834, googleTypes: ['park'], placeType: 'park', region: 'nairobi', county: 'Nairobi County', address: 'Nairobi' },
  { googlePlaceId: 'sample-amboseli', name: 'Amboseli National Park', lat: -2.6527, lng: 37.2606, googleTypes: ['national_park'], placeType: 'park', region: 'rift_valley_mara', county: 'Kajiado County', address: 'Kajiado' },
  { googlePlaceId: 'sample-lake-nakuru', name: 'Lake Nakuru National Park', lat: -0.3667, lng: 36.0833, googleTypes: ['national_park'], placeType: 'park', region: 'rift_valley_mara', county: 'Nakuru County', address: 'Nakuru' },
  { googlePlaceId: 'sample-hells-gate', name: "Hell's Gate National Park", lat: -0.9167, lng: 36.3167, googleTypes: ['national_park'], placeType: 'park', region: 'rift_valley_mara', county: 'Nakuru County', address: 'Naivasha' },
  { googlePlaceId: 'sample-mount-kenya', name: 'Mount Kenya National Park', lat: -0.1521, lng: 37.3084, googleTypes: ['national_park'], placeType: 'park', region: 'central_mt_kenya', county: 'Nyeri County', address: 'Nyeri' },
  { googlePlaceId: 'sample-watamu', name: 'Watamu Beach', lat: -3.354, lng: 40.024, googleTypes: ['beach'], placeType: 'beach', region: 'coast', county: 'Kilifi County', address: 'Kilifi' },
  { googlePlaceId: 'sample-malindi', name: 'Malindi', lat: -3.2192, lng: 40.1169, googleTypes: ['locality'], placeType: 'city', region: 'coast', county: 'Kilifi County', address: 'Kilifi' },
  { googlePlaceId: 'sample-kisumu', name: 'Kisumu', lat: -0.0917, lng: 34.768, googleTypes: ['locality'], placeType: 'city', region: 'western_lake', county: 'Kisumu County', address: 'Kisumu' },
  { googlePlaceId: 'sample-nairobi-cbd', name: 'Nairobi CBD', lat: -1.2841, lng: 36.8233, googleTypes: ['neighborhood'], placeType: 'city', region: 'nairobi', county: 'Nairobi County', address: 'Nairobi' },
  { googlePlaceId: 'sample-jkia', name: 'Jomo Kenyatta International Airport', lat: -1.3192, lng: 36.9278, googleTypes: ['airport'], placeType: 'airport', region: 'nairobi', county: 'Nairobi County', address: 'Embakasi, Nairobi' },
  { googlePlaceId: 'sample-sgr', name: 'Nairobi Terminus, Madaraka Express', lat: -1.347, lng: 36.902, googleTypes: ['train_station'], placeType: 'station', region: 'nairobi', county: 'Nairobi County', address: 'Syokimau' },
  { googlePlaceId: 'sample-carnivore', name: 'Carnivore Restaurant', lat: -1.329, lng: 36.801, googleTypes: ['restaurant'], placeType: 'restaurant', region: 'nairobi', county: 'Nairobi County', address: 'Langata, Nairobi' },
  { googlePlaceId: 'sample-hotel', name: 'Sarova Stanley Hotel', lat: -1.2833, lng: 36.8219, googleTypes: ['lodging'], placeType: 'hotel', region: 'nairobi', county: 'Nairobi County', address: 'Nairobi' },
  { googlePlaceId: 'sample-jamia', name: 'Jamia Mosque', lat: -1.2835, lng: 36.8206, googleTypes: ['mosque'], placeType: 'religious_site', region: 'nairobi', county: 'Nairobi County', address: 'Nairobi' },
]

// Matches the start of any word, so "mara" finds the Maasai Mara and "beach" finds both beaches.
export function searchSamplePlaces(query: string): PickedPlace[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return SAMPLE_PLACES.filter((place) =>
    `${place.name} ${place.address}`.toLowerCase().split(/[\s,]+/).some((word) => word.startsWith(q)) ||
    place.name.toLowerCase().includes(q),
  )
}
