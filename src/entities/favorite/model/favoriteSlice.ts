import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'

const FAVORITES_STORAGE_KEY = LOCAL_STORAGE_KEYS.FAVORITES

export interface FavoriteState {
  userIds: string[]
}

const loadFavorites = (): string[] => {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const initialState: FavoriteState = {
  userIds: loadFavorites(),
}

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,

  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      const index = state.userIds.indexOf(userId)

      if (index === -1) {
        state.userIds.push(userId)
      } else {
        state.userIds.splice(index, 1)
      }

      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.userIds))
    },

    clearFavorites: (state) => {
      state.userIds = []
      localStorage.removeItem(FAVORITES_STORAGE_KEY)
    },
  },
})

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions

export default favoritesSlice.reducer
