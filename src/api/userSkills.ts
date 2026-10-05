import type { Skill } from '@/shared/types'

const BASE_URL = `${import.meta.env.BASE_URL}db`

export async function fetchUserSkills(): Promise<Skill[]> {
  const response = await fetch(`${BASE_URL}/userSkills.json`)
  if (!response.ok) throw new Error('Failed to fetch skills')
  return response.json()
}

export async function fetchUserSkillById(id: string): Promise<Skill | undefined> {
  const skills = await fetchUserSkills()
  return skills.find((skill) => skill.id === id)
}
