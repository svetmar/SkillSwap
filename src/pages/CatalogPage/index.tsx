import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiltersSidebar, type FiltersSidebarValue } from '@/features/filters'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUsersThunk } from '@/entities/user/model/usersSlice'
import { selectUsers } from '@/entities/user/model/selectors'
import { fetchSkillsThunk } from '@/entities/skill/model/skillsSlice'
import { selectSkills, selectSkillsLoading } from '@/entities/skill/model/selectors'
import {
  setTypeFilter,
  setCategoryFilter,
  setSubcategoryFilter,
  setGenderFilter,
  setCityFilter,
} from '@/entities/skill/model/skillsSlice'
import { UserSection } from '@/shared/ui/Section'
import { UsersGrid } from '@/shared/ui/UsersGrid'
import { useInfiniteScroll } from '@/shared/ui/InfiniteScroll/useInfiniteScroll'
import { Tag } from '@/shared/ui/Tag'
import { skillCategories } from '@/shared/lib/skillCategories'
import { ROUTES } from '@/shared/lib/constants'
import type { UserCardProps } from '@/entities/user/ui/UserCard'
import type { SkillItem } from '@/shared/ui/SkillList'
import type { Skill } from '@/shared/types'
import styles from './CatalogPage.module.css'
import { useFavorites } from '@/entities/favorite/model/useFavorites'

const INITIAL_RECOMMENDED = 9
const LOAD_MORE_COUNT = 6

export default function CatalogPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const users = useAppSelector(selectUsers)

  const skills = useAppSelector(selectSkills)
  const isLoading = useAppSelector(selectSkillsLoading)
  const [recommendedCount, setRecommendedCount] = useState(INITIAL_RECOMMENDED)

  const { toggleFavorite, isFavorite } = useFavorites()

  const isAuth = useAppSelector((state) => state.auth.isAuth)

  const filterType = useAppSelector((state) => state.skills.filters.type)
  const filterCategory = useAppSelector((state) => state.skills.filters.category)
  const filterSubcategory = useAppSelector((state) => state.skills.filters.subcategory)
  const filterGender = useAppSelector((state) => state.skills.filters.gender)
  const filterCity = useAppSelector((state) => state.skills.filters.city)

  const filters = useMemo(
    () => ({
      type: filterType,
      category: filterCategory,
      subcategory: filterSubcategory,
      gender: filterGender,
      city: filterCity,
    }),
    [filterType, filterCategory, filterSubcategory, filterGender, filterCity],
  )

  const searchValue = useAppSelector((state) => state.search.value)

  useEffect(() => {
    if (users.length === 0) dispatch(fetchUsersThunk())
    if (skills.length === 0) dispatch(fetchSkillsThunk())
  }, [dispatch, users.length, skills.length])

  useEffect(() => {
    setRecommendedCount(INITIAL_RECOMMENDED)
  }, [filters.type, filters.subcategory, filters.gender, filters.city])

  const filteredSkills = useMemo(() => {
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    return skills.filter((skill) => {
      const user = userMap[skill.authorId]
      if (!user) return false
      if (filters.type && skill.type !== filters.type) return false
      if (filters.category?.length && !filters.category.includes(skill.category)) return false
      if (filters.subcategory?.length && !filters.subcategory.includes(skill.subcategory))
        return false
      if (filters.gender && user.gender !== filters.gender) return false
      if (filters.city?.length && !filters.city.includes(user.city)) return false
      return true
    })
  }, [skills, users, filters])

  const allCards: UserCardProps[] = useMemo(() => {
    const uniqueUsers = new Map<string, UserCardProps>()

    filteredSkills.forEach((skill) => {
      const user = users.find((u) => u.id === skill.authorId)
      if (!user || uniqueUsers.has(user.id)) return

      const userSkills = skills.filter((s) => s.authorId === user.id)
      const canTeach = userSkills.filter((s) => s.type === 'teach').map(toSkillItem)
      const wantsToLearn = userSkills.filter((s) => s.type === 'learn').map(toSkillItem)

      uniqueUsers.set(user.id, {
        id: user.id,
        name: user.name,
        city: user.city,
        age: user.age,
        avatarUrl: user.avatarUrl,
        canTeach,
        wantsToLearn,
        liked: isAuth && isFavorite(user.id),
        onToggleLike: () => {
          if (!isAuth) return
          toggleFavorite(user.id)
        },
        likesCount: user.likes + (isFavorite(user.id) ? 1 : 0),
        onDetailsClick: () => {
          const firstSkill = skills.find((s) => s.authorId === user.id)
          if (firstSkill) {
            navigate(ROUTES.SKILL.replace(':id', firstSkill.id))
          }
        },
      })
    })

    const result = Array.from(uniqueUsers.values())

    if (searchValue.trim()) {
      const query = searchValue.toLowerCase()
      return result.filter(
        (card) =>
          card.canTeach.some((s) => s.title.toLowerCase().includes(query)) ||
          card.wantsToLearn.some((s) => s.title.toLowerCase().includes(query)),
      )
    }

    return result
  }, [filteredSkills, users, skills, searchValue, isFavorite, toggleFavorite, isAuth, navigate])

  const popularCards = useMemo(
    () => [...allCards].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)),
    [allCards],
  )

  const newCards = useMemo(() => {
    const getCreatedAt = (card: UserCardProps): number => {
      const authorSkills = skills.filter((s) => s.authorId === card.id)
      if (authorSkills.length === 0) return 0
      return Math.max(...authorSkills.map((s) => new Date(s.createdAt).getTime()))
    }
    return [...allCards].sort((a, b) => getCreatedAt(b) - getCreatedAt(a))
  }, [allCards, skills])

  const hasMore = recommendedCount < allCards.length

  const loadMore = useCallback(() => {
    if (!hasMore) return
    setRecommendedCount((prev) => prev + LOAD_MORE_COUNT)
  }, [hasMore])

  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore, isEnabled: true })

  const hasActiveFilters =
    filters.type !== null ||
    (filters.subcategory?.length ?? 0) > 0 ||
    filters.gender !== null ||
    (filters.city?.length ?? 0) > 0 ||
    searchValue.trim() !== ''

  const activeFiltersList = useMemo(() => {
    const list: { id: string; label: string }[] = []
    if (filters.type) {
      list.push({
        id: filters.type,
        label: filters.type === 'teach' ? 'Могу научить' : 'Хочу научиться',
      })
    }
    filters.subcategory?.forEach((id) => {
      const category = skillCategories.find((c) => c.subcategories.some((s) => s.id === id))
      const subcategory = category?.subcategories.find((s) => s.id === id)
      list.push({ id, label: subcategory?.name || id })
    })
    if (filters.gender) {
      list.push({ id: filters.gender, label: filters.gender === 'male' ? 'Мужской' : 'Женский' })
    }
    filters.city?.forEach((id) => list.push({ id, label: id }))
    return list
  }, [filters])

  const sidebarValue: FiltersSidebarValue = {
    skillType: filters.type ?? 'all',
    categories: filters.category ?? [],
    subcategories: filters.subcategory ?? [],
    gender: filters.gender ?? 'any',
    cities: filters.city ?? [],
  }

  const handleFilterChange = (next: FiltersSidebarValue) => {
    dispatch(setTypeFilter(next.skillType === 'all' ? null : next.skillType))
    dispatch(setCategoryFilter(next.categories.length ? next.categories : null))
    dispatch(setSubcategoryFilter(next.subcategories.length ? next.subcategories : null))
    dispatch(setGenderFilter(next.gender === 'any' ? null : next.gender))
    dispatch(setCityFilter(next.cities.length ? next.cities : null))
  }

  const handleRemoveFilter = (id: string) => {
    switch (id) {
      case 'teach':
      case 'learn':
        dispatch(setTypeFilter(null))
        break
      case 'male':
      case 'female':
        dispatch(setGenderFilter(null))
        break
      default:
        if (filters.subcategory?.includes(id)) {
          const next = filters.subcategory.filter((s) => s !== id)
          dispatch(setSubcategoryFilter(next.length ? next : null))
        } else if (filters.city?.includes(id)) {
          const next = filters.city.filter((c) => c !== id)
          dispatch(setCityFilter(next.length ? next : null))
        }
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Загрузка...</p>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <FiltersSidebar value={sidebarValue} onChange={handleFilterChange} />
      <div className={styles.content}>
        {hasActiveFilters ? (
          <>
            {activeFiltersList.length > 0 && (
              <div className={styles.activeTags}>
                {activeFiltersList.map((filter) => (
                  <Tag
                    key={filter.id}
                    label={filter.label}
                    onRemove={() => handleRemoveFilter(filter.id)}
                  />
                ))}
              </div>
            )}
            <h2 className={styles.sectionTitle}>Подходящие предложения ({allCards.length})</h2>
            <UsersGrid users={allCards} />
          </>
        ) : (
          <>
            <UserSection title="Популярное" users={popularCards} />
            <UserSection title="Новое" users={newCards} />
            <h2 className={styles.sectionTitle}>Рекомендуемые</h2>
            <UsersGrid users={allCards.slice(0, recommendedCount)} />
            {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
          </>
        )}
      </div>
    </main>
  )
}

function toSkillItem(skill: Skill): SkillItem {
  return { title: skill.title, category: skill.category as SkillItem['category'] }
}
