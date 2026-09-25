import type { User } from '@/shared/types'
import reducer, { fetchUsersThunk, initialState } from './usersSlice'
import { test, expect } from 'vitest'

const mockUsers: User[] = [
  {
    id: 'user_001',
    name: 'Иван',
    email: 'ivan34@mail.ru',
    password: 'Demo1234!',
    avatarUrl: '/images/users/user-02.jpg',
    createdAt: '2021-01-14T08:21:00Z',
    city: 'Казань',
    age: 34,
    birthDate: '1992-05-14',
    gender: 'male',
    about: 'Привет! Люблю ритм, кофе по утрам и людей, которые не боятся пробовать новое',
    likes: 34,
  },
  {
    id: 'user_002',
    name: 'Алексей',
    email: 'alexey22@mail.ru',
    password: 'Demo1234!',
    avatarUrl: '/images/users/user-03.jpg',
    createdAt: '2021-02-27T15:43:00Z',
    city: 'Москва',
    age: 29,
    birthDate: '1997-05-14',
    gender: 'male',
    about: 'Люблю путешествия, спорт и хорошие разговоры за чашкой кофе',
    likes: 56,
  },
  {
    id: 'user_003',
    name: 'Мария',
    email: 'maria88@mail.ru',
    password: 'Demo1234!',
    avatarUrl: '/images/users/user-04.jpg',
    createdAt: '2021-03-09T11:18:00Z',
    city: 'Санкт-Петербург',
    age: 27,
    birthDate: '1999-05-14',
    gender: 'female',
    about: 'Фотография, книги и вечерние прогулки — мои маленькие радости',
    likes: 78,
  },
  {
    id: 'user_004',
    name: 'Дмитрий',
    email: 'dmitry91@mail.ru',
    password: 'Demo1234!',
    avatarUrl: '/images/users/user-05.jpg',
    createdAt: '2021-04-22T19:55:00Z',
    city: 'Новосибирск',
    age: 31,
    birthDate: '1995-05-14',
    gender: 'male',
    about: 'Разработчик, люблю технологии и активный отдых',
    likes: 41,
  },
  {
    id: 'user_005',
    name: 'Анна',
    email: 'anna95@mail.ru',
    password: 'Demo1234!',
    avatarUrl: '/images/users/user-06.jpg',
    createdAt: '2021-05-30T07:40:00Z',
    city: 'Казань',
    age: 26,
    birthDate: '2000-05-14',
    gender: 'female',
    about: 'Музыка, танцы и новые знакомства вдохновляют меня каждый день',
    likes: 92,
  },
]

test('pending: должен установить isLoading в true и сбросить error', () => {
  const state = { ...initialState }

  const nextState = reducer(state, fetchUsersThunk.pending(''))
  expect(nextState).toEqual({ ...state, isLoading: true, error: null })
})

test('fulfilled: должен загрузить пользователей, установить isLoading в false и сбросить error', () => {
  const state = { ...initialState, isLoading: true }

  const nextState = reducer(state, fetchUsersThunk.fulfilled(mockUsers, ''))

  expect(nextState).toEqual({
    ...state,
    isLoading: false,
    users: mockUsers,
  })
})

test('rejected: должен установить isLoading в false и установить сообщение об ошибке', () => {
  const errorMessage = 'Ошибка загрузки'

  const state = { ...initialState, isLoading: true }
  const nextState = reducer(state, fetchUsersThunk.rejected(new Error(errorMessage), ''))
  expect(nextState).toEqual({
    ...state,
    isLoading: false,
    error: errorMessage,
  })
})

test('должен вернуть initialState при неизвестном экшене', () => {
  const state = reducer(undefined, { type: 'UNKNOWN' })
  expect(state).toEqual(initialState)
})
