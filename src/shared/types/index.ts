// ─── Skill ───────────────────────────────────────────────
export type SkillType = 'teach' | 'learn'

export interface Skill {
  id: string
  title: string
  description: string
  type: SkillType
  category: string
  subcategory: string
  tags: string
  imageUrl: string | null
  photos?: string[]
  authorId: string
  createdAt: string
}

// ─── User ────────────────────────────────────────────────
export type GenderType = 'male' | 'female'
export interface User {
  id: string
  name: string
  email: string
  /** Пароль демо-аккаунта: моки заменяют бэкенд, вход сверяется с этим полем */
  password: string
  avatarUrl: string | null
  createdAt: string
  city: string
  age: number
  /** Дата рождения в формате YYYY-MM-DD, согласована с age */
  birthDate: string
  gender: GenderType
  likes: number
  about: string
}

// ─── Request ─────────────────────────────────────────────
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'inProgress' | 'done'

export interface SwapRequest {
  id: string
  skillId: string
  fromUserId: string
  toUserId: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
}

// ─── City ────────────────────────────────────────────────
export interface City {
  id: number
  name: string
}

// ─── Auth ────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  token: string
  avatarUrl: string | null
  city?: string
  birthDate?: string
  gender?: GenderType
  about?: string
  password?: string
}

// ─── Skill Categories and Subcategories ─────────────────────────────────────────────
export type SkillCategory = {
  id: SkillCategoryId
  name: string
  subcategories: SkillSubcategory[]
}

export type SkillSubcategory = {
  id: string
  name: string
}

export type SkillCategoryId = 'business' | 'art' | 'languages' | 'education' | 'health' | 'home'