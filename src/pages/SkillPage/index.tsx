import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchUserSkillById, fetchUserSkills } from '@/api/userSkills'
import { fetchUsers } from '@/api/users'
import { ExtendedUserCard } from '@/entities/user/ui/ExtendedUserCard'
import { UserCard, UserCardProps } from '@/entities/user/ui/UserCard'
import { Carousel } from '@/shared/ui/Carousel'
import type { SkillItem } from '@/shared/ui/SkillList'
import { skillCategories } from '@/shared/lib/skillCategories'
import { ROUTES } from '@/shared/lib/constants'
import { SkillCard } from '@/shared/ui/SkillCard'
import type { Skill, User } from '@/shared/types'
import styles from './index.module.css'

function toSkillItems(skills: Skill[], authorId: string, type: Skill['type']): SkillItem[] {
  return skills
    .filter((skill) => skill.authorId === authorId && skill.type === type)
    .map((skill) => ({ title: skill.title, category: skill.category as SkillItem['category'] }))
}

function normalizeAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return avatarUrl
  return avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl.replace(/^public\//, '')}`
}

export default function SkillPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [skill, setSkill] = useState<Skill | null>(null)
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)

    Promise.all([fetchUserSkillById(id), fetchUserSkills(), fetchUsers()]).then(
      ([foundSkill, skills, allUsers]) => {
        if (cancelled) return
        setSkill(foundSkill ?? null)
        setAllSkills(skills)
        setUsers(allUsers)
        setIsLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [id])

  const author = useMemo(
    () => (skill ? users.find((user) => user.id === skill.authorId) : undefined),
    [skill, users],
  )

  const category = useMemo(
    () => skillCategories.find((item) => item.id === skill?.category),
    [skill],
  )
  const subcategory = useMemo(
    () => category?.subcategories.find((item) => item.id === skill?.subcategory),
    [category, skill],
  )

  const skillImages = useMemo(() => {
    if (!skill) return []
    if (skill.photos?.length) return skill.photos
    return skill.imageUrl ? [skill.imageUrl] : []
  }, [skill])

  const similarUsers = useMemo<UserCardProps[]>(() => {
    if (!skill) return []

    const similarAuthorIds = Array.from(
      new Set(
        allSkills
          .filter(
            (item) =>
              item.id !== skill.id &&
              item.category === skill.category &&
              item.authorId !== skill.authorId,
          )
          .map((item) => item.authorId),
      ),
    )

    return similarAuthorIds
      .map((authorId) => users.find((user) => user.id === authorId))
      .filter((user): user is User => Boolean(user))
      .map((user) => {
        const teachSkill = allSkills.find(
          (item) => item.authorId === user.id && item.type === 'teach',
        )

        return {
          id: user.id,
          name: user.name,
          city: user.city,
          age: user.age,
          avatarUrl: normalizeAvatarUrl(user.avatarUrl),
          canTeach: toSkillItems(allSkills, user.id, 'teach'),
          wantsToLearn: toSkillItems(allSkills, user.id, 'learn'),
          liked: likedIds.has(user.id),
          onToggleLike: () =>
            setLikedIds((prev) => {
              const next = new Set(prev)
              if (next.has(user.id)) {
                next.delete(user.id)
              } else {
                next.add(user.id)
              }
              return next
            }),
          likesCount: user.likes + (likedIds.has(user.id) ? 1 : 0),
          onDetailsClick: () => teachSkill && navigate(ROUTES.SKILL.replace(':id', teachSkill.id)),
        }
      })
  }, [skill, allSkills, users, likedIds, navigate])

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p>Загрузка...</p>
        </div>
      </main>
    )
  }

  if (!skill || !author) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p>Навык не найден</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <ExtendedUserCard
            id={author.id}
            name={author.name}
            city={author.city}
            age={author.age}
            about={author.about}
            avatarUrl={normalizeAvatarUrl(author.avatarUrl)}
            canTeach={toSkillItems(allSkills, author.id, 'teach')}
            wantsToLearn={toSkillItems(allSkills, author.id, 'learn')}
            className={styles.userCard}
          />

          <SkillCard
            skillId={skill.id}
            authorId={author.id}
            authorName={author.name}
            title={skill.title}
            category={category?.name ?? ''}
            subcategory={subcategory?.name ?? ''}
            description={skill.description}
            images={skillImages}
            liked={false}
            onToggleLike={() => {}}
          />
        </div>

        {similarUsers.length > 0 && (
          <section className={styles.similar}>
            <h2 className={styles.similarTitle}>Похожие предложения</h2>
            <Carousel>
              {similarUsers.map((user) => (
                <div
                  key={user.id}
                  style={{ flex: '0 0 320px', scrollSnapAlign: 'start' }}
                >
                  <UserCard {...user} />
                </div>
              ))}
            </Carousel>
          </section>
        )}
      </div>
    </main>
  )
}