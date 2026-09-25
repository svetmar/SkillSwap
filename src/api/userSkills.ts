import type { Skill } from '@/shared/types'
import { assetUrl } from '@/shared/lib/helpers'

const BASE_URL = assetUrl('/db')

/** Пути к изображениям в моках записаны от корня, приводим их к базовому пути сборки */
function withResolvedImages(skill: Skill): Skill {
  return {
    ...skill,
    imageUrl: skill.imageUrl ? assetUrl(skill.imageUrl) : null,
    photos: skill.photos?.map(assetUrl),
  }
}

export async function fetchUserSkills(): Promise<Skill[]> {
  const response = await fetch(`${BASE_URL}/userSkills.json`)
  if (!response.ok) throw new Error('Failed to fetch skills')
  const skills: Skill[] = await response.json()
  return skills.map(withResolvedImages)
}

export async function fetchUserSkillById(id: string): Promise<Skill | undefined> {
  const skills = await fetchUserSkills()
  return skills.find((skill) => skill.id === id)
}
