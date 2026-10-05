import type { City } from '@/shared/types'

const BASE_URL = `${import.meta.env.BASE_URL}db`

export async function fetchCities(): Promise<City[]> {
  const response = await fetch(`${BASE_URL}/cities.json`)
  if (!response.ok) throw new Error('Failed to fetch cities')
  return response.json()
}
