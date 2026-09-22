// Maps Kenya's 47 counties to six regions, and reads the county from a Google address.
// Exists so a coast stop gets coastal phrases and a Mara stop gets wildlife words.
import type { Region } from '../../lib/types'

const countyToRegion: Record<string, Region> = {
  nairobi: 'nairobi',
  mombasa: 'coast', kwale: 'coast', kilifi: 'coast', 'tana river': 'coast', lamu: 'coast', 'taita taveta': 'coast',
  narok: 'rift_valley_mara', kajiado: 'rift_valley_mara', nakuru: 'rift_valley_mara', baringo: 'rift_valley_mara',
  kericho: 'rift_valley_mara', bomet: 'rift_valley_mara', nandi: 'rift_valley_mara', 'uasin gishu': 'rift_valley_mara',
  'elgeyo marakwet': 'rift_valley_mara', 'trans nzoia': 'rift_valley_mara', 'west pokot': 'rift_valley_mara',
  kiambu: 'central_mt_kenya', muranga: 'central_mt_kenya', nyeri: 'central_mt_kenya', kirinyaga: 'central_mt_kenya',
  nyandarua: 'central_mt_kenya', laikipia: 'central_mt_kenya', meru: 'central_mt_kenya', 'tharaka nithi': 'central_mt_kenya',
  embu: 'central_mt_kenya', machakos: 'central_mt_kenya', makueni: 'central_mt_kenya', kitui: 'central_mt_kenya',
  kisumu: 'western_lake', siaya: 'western_lake', 'homa bay': 'western_lake', migori: 'western_lake', kisii: 'western_lake',
  nyamira: 'western_lake', kakamega: 'western_lake', vihiga: 'western_lake', bungoma: 'western_lake', busia: 'western_lake',
  turkana: 'north', samburu: 'north', marsabit: 'north', isiolo: 'north', mandera: 'north', wajir: 'north', garissa: 'north',
}

export const REGION_LABEL: Record<Region, string> = {
  nairobi: 'Nairobi',
  coast: 'The Coast',
  rift_valley_mara: 'Rift Valley and the Mara',
  central_mt_kenya: 'Central and Mount Kenya',
  western_lake: 'Western and Lake Victoria',
  north: 'The North',
}

export function normaliseCounty(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bcounty\b/g, '')
    .replace(/['’]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function regionFromCounty(county: string | null): Region | null {
  if (!county) return null
  return countyToRegion[normaliseCounty(county)] ?? null
}

export function regionFromLatLng(lat: number, lng: number): Region {
  if (Math.abs(lat + 1.29) < 0.35 && Math.abs(lng - 36.82) < 0.35) return 'nairobi'
  if (lng > 38.6 && lat < 0) return 'coast'
  if (lat > 1.5 || lng > 38.6) return 'north'
  if (lng < 35.2 && lat > -1.2) return 'western_lake'
  if (lng > 36.9 && lat > -1.5) return 'central_mt_kenya'
  return 'rift_valley_mara'
}

interface AddressComponentLike {
  longText: string | null
  types: string[]
}

export function countyFromAddress(components: AddressComponentLike[] | null | undefined): string | null {
  if (!components) return null
  const county = components.find((c) => c.types.includes('administrative_area_level_1'))
  return county?.longText ?? null
}
