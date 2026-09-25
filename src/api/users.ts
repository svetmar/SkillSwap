import type { User } from '@/shared/types'
import { assetUrl } from '@/shared/lib/helpers'

const BASE_URL = assetUrl('/db')

/** Пути к аватарам в моках записаны от корня, приводим их к базовому пути сборки */
function withResolvedAvatar(user: User): User {
  return { ...user, avatarUrl: user.avatarUrl ? assetUrl(user.avatarUrl) : null }
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/users.json`)
  if (!response.ok) throw new Error('Failed to fetch users')
  const users: User[] = await response.json()
  return users.map(withResolvedAvatar)
}

export async function fetchUserById(id: string): Promise<User | undefined> {
  const users = await fetchUsers()
  return users.find((user) => user.id === id)
}

/** Ищет демо-пользователя из моков по email — используется при входе */
export async function fetchUserByEmail(email: string): Promise<User | undefined> {
  const users = await fetchUsers()
  const normalizedEmail = email.trim().toLowerCase()
  return users.find((user) => user.email.toLowerCase() === normalizedEmail)
}
