import { useState, useEffect, FormEvent } from 'react'
import styles from './RegistrationStep2Page.module.css'
import { Logo } from '@/shared/ui/logo'
import { Button } from '@/shared/ui/Button'
import { StepIndicator } from '@/shared/ui/StepIndicator'
import { Input } from '@/shared/ui/Input'
import { AvatarUpload } from '@/shared/ui/AvatarUpload'
import { DatePicker } from '@/shared/ui/DatePicker'
import { MultiSelect, MultiSelectOption } from '@/shared/ui/MultiSelect'
import { SingleSelect, SingleSelectOption } from '@/shared/ui/SingleSelect'
import type { SkillCategory, City } from '@/shared/types'
import { CrossIcon } from './icons/CrossIcon'
import userimg from '@/assets/images/user.svg'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants'
import { fetchCities } from '@/api/cities'
import { fetchCategories } from '@/api/categories'

const REGISTRATION_KEY = 'skillswap_registration'

function getRegistrationData() {
  try {
    const raw = localStorage.getItem(REGISTRATION_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveRegistrationData(data: Record<string, unknown>) {
  localStorage.setItem(REGISTRATION_KEY, JSON.stringify({ ...getRegistrationData(), ...data }))
}

export default function RegistrationStep2Page() {
  const stored = getRegistrationData()
  const [, setAvatar] = useState<File | null>(null)
  const [name, setName] = useState(stored.name ?? '')
  const [birthDate, setBirthDate] = useState(stored.birthDate ?? '')
  const [gender, setGender] = useState(stored.gender ?? '')
  const [cities, setCities] = useState<City[]>([])
  const [cityId, setCityId] = useState(stored.cityId ?? '')
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [selectedCategoriesLearn, setSelectedCategoriesLearn] = useState<string[]>(stored.categoriesLearn ?? [])
  const [selectedSubcategoriesLearn, setSelectedSubcategoriesLearn] = useState<string[]>(stored.subcategoriesLearn ?? [])

  const genderOptions: SingleSelectOption[] = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
  ]

  useEffect(() => {
    fetchCities()
      .then((data: City[]) => setCities(data))
      .catch(() => setCities([]))
  }, [])

  const CityOptions: SingleSelectOption[] = cities.map(city => ({ value: String(city.id), label: city.name }))

  useEffect(() => {
    fetchCategories()
      .then((data: SkillCategory[]) => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  const categoryOptions: MultiSelectOption[] = categories.map(category => ({
    value: category.id,
    label: category.name,
  }))

  const selectedCategoryObjects = categories.filter(category => selectedCategoriesLearn.includes(category.id))
  const subcategoryOptions: MultiSelectOption[] = selectedCategoryObjects.flatMap(category =>
    category.subcategories.map(subcategory => ({ value: subcategory.id, label: subcategory.name })),
  )

  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    saveRegistrationData({
      name,
      birthDate,
      gender,
      cityId,
      categoriesLearn: selectedCategoriesLearn,
      subcategoriesLearn: selectedSubcategoriesLearn,
    })
    navigate(ROUTES.REGISTRATION_STEP_3)
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Logo />
        <Button variant="tertiary">
          <span className={styles.buttonContent} onClick={() => navigate('/')}>
            Закрыть
            <CrossIcon />
          </span>
        </Button>
      </div>
      <div className={styles.stepper}>
        <StepIndicator stepsQuantity={3} activeStep={2} />
      </div>
      <div className={styles.content}>
        <div className={styles.formCard}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <AvatarUpload onChange={(file) => setAvatar(file)} />
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='Введите ваше имя' label='Имя' />
            <div className={styles.birthdateGenderWrapper}>
              <div className={styles.birthdate}>
                <DatePicker value={birthDate} onChange={setBirthDate} />
              </div>
              <div className={styles.selectGendertWrapper}>
                <SingleSelect options={genderOptions} value={gender} onChange={setGender} label='Пол' placeholder='Не указан' />
              </div>
            </div>
            <div className={styles.selectCitytWrapper}>
              <SingleSelect options={CityOptions} value={cityId} onChange={setCityId} label='Город' placeholder='Не указан' />
            </div>
            <MultiSelect options={categoryOptions} selectedValues={selectedCategoriesLearn} onChange={setSelectedCategoriesLearn} placeholder='Выберите категорию' label='Категория навыка, которому хотите научиться' />
            <MultiSelect options={subcategoryOptions} selectedValues={selectedSubcategoriesLearn} onChange={setSelectedSubcategoriesLearn} placeholder='Выберите подкатегорию' label='Подкатегория навыка, которому хотите научиться' />
            <div className={styles.buttonsWrapper}>
              <Button variant='secondary' className={styles.button} onClick={() => navigate(ROUTES.REGISTRATION_STEP_1)}>Назад</Button>
              <Button variant='primary' type="submit" className={styles.button}>Продолжить</Button>
            </div>
          </form>
        </div>
        <div className={styles.formCard}>
          <img src={userimg} alt="пользователь" className={styles.image} />
          <h2 className={styles.cardHeader}>Расскажите немного о себе</h2>
          <span className={styles.cardText}>Это поможет другим людям лучше вас узнать, чтобы выбрать для обмена</span>
        </div>
      </div>
    </main>
  )
}