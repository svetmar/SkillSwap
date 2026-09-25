import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Skill } from './types'
import { fetchUserSkills } from '@/api/userSkills'
import { GenderType, SkillType } from '@/shared/types'

export type TSkillFilters = {
  type: SkillType | null
  category: string[] | null
  subcategory: string[] | null
  gender: GenderType | null
  city: string[] | null
}

export type TSkillsState = {
  skills: Skill[]
  filters: TSkillFilters
  isLoading: boolean
  error: string | null
}

export const initialState: TSkillsState = {
  skills: [],
  filters: {
    type: null,
    category: null,
    subcategory: null,
    gender: null,
    city: null,
  },
  isLoading: false,
  error: null,
}

export const fetchSkillsThunk = createAsyncThunk<Skill[], void, { rejectValue: string }>(
  'skills/fetchSkills',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUserSkills()
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      } else {
        return rejectWithValue('Неизвестная ошибка при загрузке навыков')
      }
    }
  },
)

export const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setTypeFilter(state, action: PayloadAction<SkillType | null>) {
      state.filters.type = action.payload
    },
    setCategoryFilter(state, action: PayloadAction<string[] | null>) {
      state.filters.category = action.payload
    },
    setSubcategoryFilter(state, action: PayloadAction<string[] | null>) {
      state.filters.subcategory = action.payload
    },
    setGenderFilter(state, action: PayloadAction<GenderType | null>) {
      state.filters.gender = action.payload
    },
    setCityFilter(state, action: PayloadAction<string[] | null>) {
      state.filters.city = action.payload
    },
    resetFilters(state) {
      state.filters = initialState.filters
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkillsThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSkillsThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.skills = action.payload
      })
      .addCase(fetchSkillsThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error.message ?? 'Неизвестная ошибка'
      })
  },
})

export const {
  setTypeFilter,
  setCategoryFilter,
  setSubcategoryFilter,
  setGenderFilter,
  setCityFilter,
  resetFilters,
} = skillsSlice.actions

export default skillsSlice.reducer
