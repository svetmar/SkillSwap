import type { SkillCategory } from '@/shared/types'
import { assetUrl } from '@/shared/lib/helpers'

const BASE_URL = assetUrl('/db')

/** Дерево категорий и подкатегорий навыков — справочник для фильтров и форм */
export async function fetchCategories(): Promise<SkillCategory[]> {
  const response = await fetch(`${BASE_URL}/categories.json`)
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}
