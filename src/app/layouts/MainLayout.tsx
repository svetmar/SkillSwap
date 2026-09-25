import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { HeaderUI } from '@/shared/ui/Header/Header'
import { Header } from '@/widgets/Header'
import { Footer } from '@/widgets/Footer'
import { Outlet } from 'react-router-dom'
import { fetchUsersThunk } from '@/entities/user/model/usersSlice'
import { fetchSkillsThunk } from '@/entities/skill/model/skillsSlice'

export const MainLayout = () => {
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector((state) => state.auth.isAuth)
  const usersCount = useAppSelector((state) => state.users.users.length)
  const skillsCount = useAppSelector((state) => state.skills.skills.length)

  // Пользователи и навыки нужны всем страницам основного лейаута, грузим их один раз
  useEffect(() => {
    if (usersCount === 0) dispatch(fetchUsersThunk())
    if (skillsCount === 0) dispatch(fetchSkillsThunk())
  }, [dispatch, usersCount, skillsCount])

  return (
    <>
      {isAuth ? <Header /> : <HeaderUI />}
      <Outlet />
      <Footer />
    </>
  )
}
