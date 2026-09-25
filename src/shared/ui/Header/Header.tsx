import clsx from 'clsx'
import styles from './Header.module.css'
import { skillCategories } from '../../lib/skillCategories'
import themeLogo from '../../../assets/images/themeLogo.svg'
import { Logo } from '../logo'
import { Button } from '@/shared/ui/Button'
import { SearchInput } from '@/shared/ui/SearchInput'
import { SkillsDropdown } from '@/shared/ui/SkillsDropdown'
import { useAboutProjectModal } from '@/features/filters/about-project/model/useAboutProjectModal'
import { AboutProjectModal } from '@/features/filters/about-project/ui/AboutProjectModal'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSearchValue } from '@/features/search'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants'

export const HeaderUI = () => {
  const { isOpen: isAboutOpen, open: openAbout, close: closeAbout } = useAboutProjectModal()
  const dispatch = useAppDispatch()
  const searchValue = useAppSelector((state) => state.search.value)

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchValue(e.target.value))
  }

  return (
    <>
      <header className={clsx(styles.header)}>
        <nav className={clsx(styles.nav)}>
          <Logo />
          <div className={clsx(styles.navGroup)}>
            <Button variant="tertiary" onClick={openAbout} className={clsx(styles.navLinkBtn)}>
              О проекте
            </Button>
            <SkillsDropdown sections={skillCategories} />
          </div>
        </nav>

        <SearchInput
          value={searchValue}
          onChange={handleChange}
          placeholder="Искать навык"
          className={clsx(styles.searchInputField)}
        />

        <div className={clsx(styles.actions)}>
          <Button variant="tertiary" aria-label="Переключить тему" className={clsx(styles.themeBtn)}>
            <img src={themeLogo} alt="" className={clsx(styles.icontheme)} aria-hidden="true" />
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.LOGIN)}>
            Войти
          </Button>
          <Button variant="primary" onClick={() => navigate(ROUTES.REGISTER)}>
            Регистрация
          </Button>
        </div>
      </header>

      <AboutProjectModal isOpen={isAboutOpen} onClose={closeAbout} />
    </>
  )
}