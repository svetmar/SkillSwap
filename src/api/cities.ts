import type { City } from '@/shared/types'
import { assetUrl } from '@/shared/lib/helpers'

const BASE_URL = assetUrl('/db')

export async function fetchCities(): Promise<City[]> {
  const response = await fetch(`${BASE_URL}/cities.json`)
  if (!response.ok) throw new Error('Failed to fetch cities')
  return response.json()
}