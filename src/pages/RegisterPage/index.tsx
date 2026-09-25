import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Logo } from '@/shared/ui/logo'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { StepIndicator } from '@/shared/ui/StepIndicator'
import { AvatarUpload } from '@/shared/ui/AvatarUpload'
import { DatePicker } from '@/shared/ui/DatePicker'
import { Autocomplete, type AutocompleteOption } from '@/shared/ui/Autocomplete'
import { MultiSelect, type MultiSelectOption } from '@/shared/ui/MultiSelect'
import { SingleSelect, type SingleSelectOption } from '@/shared/ui/SingleSelect'
import { Textarea } from '@/shared/ui/Textarea'
import { SkillImageUpload } from '@/features/skill-image-upload'
import { setUser } from '@/features/auth/model/authSlice'
import { saveAuthUser, saveRegisteredUser } from '@/features/auth/model/authUtils'
import { RegistrationSuccessModal } from '@/features/auth/ui/RegistrationSuccessModal'
import { WelcomeModal } from '@/features/auth/ui/WelcomeModal'
import { ROUTES } from '@/shared/lib/constants'
import type { City, GenderType, SkillCategory } from '@/shared/types'
import { useAppDispatch } from '@/store/hooks'
import lampImg from '@/assets/images/lamp.svg'
import userImg from '@/assets/images/user.svg'
import boardImg from '@/assets/images/schoolBoard.svg'
import { CrossIcon } from '../RegistrationStep1Page/icons/CrossIcon'
import { EyeIcon } from '../RegistrationStep1Page/icons/EyeIcon'
import styles from './RegisterPage.module.css'
import { fetchCities } from '@/api/cities'
import { fetchCategories } from '@/api/categories'

type Step = 1 | 2 | 3

type RegisterForm = {
  email: string
  password: string
  name: string
  birthDate: string
  gender: string
  city: string
  avatarPreview: string | null
  learnCategories: string[]
  learnSubcategories: string[]
  skillTitle: string
  teachCategories: string[]
  teachSubcategories: string[]
  description: string
  skillImageName: string
  skillImagePreview: string | null
}

const initialForm: RegisterForm = {
  email: '',
  password: '',
  name: '',
  birthDate: '',
  gender: '',
  city: '',
  avatarPreview: null,
  learnCategories: [],
  learnSubcategories: [],
  skillTitle: '',
  teachCategories: [],
  teachSubcategories: [],
  description: '',
  skillImageName: '',
  skillImagePreview: null,
}

const genderOptions: SingleSelectOption[] = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
]

const updateSelectedSubcategories = (
  currentValues: string[],
  categories: SkillCategory[],
  selectedCategories: string[],
) => {
  const allowedSubcategoryIds = new Set(
    categories
      .filter((category) => selectedCategories.includes(category.id))
      .flatMap((category) => category.subcategories.map((subcategory) => subcategory.id)),
  )

  return currentValues.filter((value) => allowedSubcategoryIds.has(value))
}

const getSelectedLabels = (options: MultiSelectOption[], selectedValues: string[]) =>
  selectedValues
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean)
    .join(', ')

export default function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<RegisterForm>(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    fetchCities()
      .then((data: City[]) => setCities(data))
      .catch(() => setCities([]))
  }, [])

  useEffect(() => {
    fetchCategories()
      .then((data: SkillCategory[]) => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    return () => {
      if (form.skillImagePreview) {
        URL.revokeObjectURL(form.skillImagePreview)
      }
    }
  }, [form.skillImagePreview])

  const cityOptions: AutocompleteOption[] = useMemo(
    () => cities.map((city) => ({ value: String(city.id), label: city.name })),
    [cities],
  )

  const categoryOptions: MultiSelectOption[] = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  )

  const learnSubcategoryOptions: MultiSelectOption[] = useMemo(
    () =>
      categories
        .filter((category) => form.learnCategories.includes(category.id))
        .flatMap((category) =>
          category.subcategories.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
          })),
        ),
    [categories, form.learnCategories],
  )

  const teachSubcategoryOptions: MultiSelectOption[] = useMemo(
    () =>
      categories
        .filter((category) => form.teachCategories.includes(category.id))
        .flatMap((category) =>
          category.subcategories.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
          })),
        ),
    [categories, form.teachCategories],
  )

  const setField = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const handleLearnCategoriesChange = (values: string[]) => {
    setForm((currentForm) => ({
      ...currentForm,
      learnCategories: values,
      learnSubcategories: updateSelectedSubcategories(
        currentForm.learnSubcategories,
        categories,
        values,
      ),
    }))
  }

  const handleTeachCategoriesChange = (values: string[]) => {
    setForm((currentForm) => ({
      ...currentForm,
      teachCategories: values,
      teachSubcategories: updateSelectedSubcategories(
        currentForm.teachSubcategories,
        categories,
        values,
      ),
    }))
  }

  const handleSkillImageSelect = (file: File) => {
    setForm((currentForm) => ({
      ...currentForm,
      skillImageName: file.name,
      skillImagePreview: URL.createObjectURL(file),
    }))
  }

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (step === 1) {
      if (!validateEmail(form.email)) {
        setEmailError('Введите корректный email (например, user@example.com)')
        return
      }
      if (form.password.length < 8) {
        setPasswordError('Пароль должен содержать не менее 8 знаков')
        return
      }
      setEmailError('')
      setPasswordError('')
      setStep(2)
      return
    }

    if (step === 2) {
      setStep(3)
      return
    }

    setIsProposalModalOpen(true)
  }

  const handleReady = () => {
    setIsProposalModalOpen(false)
    setIsWelcomeModalOpen(true)
  }

  const handleWelcomeDone = () => {
    const authUser = saveAuthUser({
      id: 'registered-user',
      name: form.name || 'Мария',
      email: form.email,
      password: form.password,
      avatarUrl: form.avatarPreview,
      city: form.city,
      birthDate: form.birthDate,
      gender:
        form.gender === 'male' || form.gender === 'female' ? (form.gender as GenderType) : undefined,
      about: form.description,
    })

    saveRegisteredUser({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      password: form.password,
      avatarUrl: authUser.avatarUrl,
      city: authUser.city,
      birthDate: authUser.birthDate,
      gender: authUser.gender,
      about: authUser.about,
    })

    dispatch(setUser(authUser))
    setIsWelcomeModalOpen(false)
    navigate(ROUTES.PROFILE, { replace: true })
  }

  const handleEditProposal = () => {
    setIsProposalModalOpen(false)
    setStep(3)
  }

  const selectedTeachCategoryLabels =
    getSelectedLabels(categoryOptions, form.teachCategories) || 'Не указано'
  const selectedTeachSubcategoryLabels =
    getSelectedLabels(teachSubcategoryOptions, form.teachSubcategories) || 'Не указано'

  const asideByStep = {
    1: {
      image: lampImg,
      title: 'Добро пожаловать в SkillSwap!',
      text: 'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми',
    },
    2: {
      image: userImg,
      title: 'Расскажите немного о себе',
      text: 'Это поможет другим людям лучше вас узнать, чтобы выбрать для обмена',
    },
    3: {
      image: boardImg,
      title: 'Укажите, чем вы готовы поделиться',
      text: 'Так другие люди смогут увидеть ваше предложение и предложить вам обмен',
    },
  }[step]

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <Button className={styles.closeButton} variant="tertiary" onClick={() => navigate(ROUTES.HOME)}>
          Закрыть <CrossIcon />
        </Button>
      </header>

      <div className={styles.stepper}>
        <StepIndicator stepsQuantity={3} activeStep={step} />
      </div>

      <div className={styles.content}>
        <section className={clsx(styles.card, styles.formCard)}>
          <form className={styles.form} onSubmit={handleNext}>
            {step === 1 && (
              <>
                <Input
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="Введите email"
                  label="Email"
                  helperText={emailError || undefined}
                  error={!!emailError}
                />
                <Input
                  value={form.password}
                  onChange={(event) => setField('password', event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  helperText={passwordError || undefined}
                  error={!!passwordError}
                  rightIcon={
                    <EyeIcon
                      className={styles.eyeIcon}
                      onClick={() => setShowPassword((currentValue) => !currentValue)}
                    />
                  }
                  placeholder="Придумайте надёжный пароль"
                  label="Пароль"
                />
                <Button className={styles.fullButton} variant="primary" type="submit">
                  Далее
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <AvatarUpload
                  value={form.avatarPreview}
                  onChange={(_, previewUrl) => setField('avatarPreview', previewUrl)}
                />
                <Input
                  value={form.name}
                  onChange={(event) => setField('name', event.target.value)}
                  placeholder="Введите ваше имя"
                  label="Имя"
                />
                <div className={styles.row}>
                  <DatePicker value={form.birthDate} onChange={(value) => setField('birthDate', value)} />
                  <SingleSelect
                    options={genderOptions}
                    value={form.gender}
                    onChange={(value) => setField('gender', value)}
                    label="Пол"
                    placeholder="Не указан"
                  />
                </div>
                <Autocomplete
                  options={cityOptions}
                  value={form.city}
                  onChange={(value) => setField('city', value)}
                  label="Город"
                  placeholder="Не указан"
                  showChevron
                />
                <MultiSelect
                  options={categoryOptions}
                  selectedValues={form.learnCategories}
                  onChange={handleLearnCategoriesChange}
                  placeholder="Выберите категорию"
                  label="Категория навыка, которому хотите научиться"
                />
                <MultiSelect
                  options={learnSubcategoryOptions}
                  selectedValues={form.learnSubcategories}
                  onChange={(values) => setField('learnSubcategories', values)}
                  placeholder="Выберите подкатегорию"
                  label="Подкатегория навыка, которому хотите научиться"
                />
                <div className={styles.buttons}>
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Назад
                  </Button>
                  <Button variant="primary" type="submit">
                    Продолжить
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Input
                  value={form.skillTitle}
                  onChange={(event) => setField('skillTitle', event.target.value)}
                  label="Название навыка"
                  placeholder="Введите название вашего навыка"
                />
                <MultiSelect
                  options={categoryOptions}
                  selectedValues={form.teachCategories}
                  onChange={handleTeachCategoriesChange}
                  placeholder="Выберите категорию навыка"
                  label="Категория навыка"
                />
                <MultiSelect
                  options={teachSubcategoryOptions}
                  selectedValues={form.teachSubcategories}
                  onChange={(values) => setField('teachSubcategories', values)}
                  placeholder="Выберите подкатегорию навыка"
                  label="Подкатегория навыка"
                />
                <Textarea
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                  label="Описание"
                  placeholder="Коротко опишите, чему можете научить"
                />
                <SkillImageUpload
                  onFileSelect={handleSkillImageSelect}
                  label="Выберите изображения навыка"
                />
                <div className={styles.buttons}>
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    Назад
                  </Button>
                  <Button variant="primary" type="submit">
                    Продолжить
                  </Button>
                </div>
              </>
            )}
          </form>
        </section>

        <aside className={clsx(styles.card, styles.asideCard)}>
          <img src={asideByStep.image} alt="" className={styles.image} />
          <h2 className={styles.asideTitle}>{asideByStep.title}</h2>
          <p className={styles.asideText}>{asideByStep.text}</p>
        </aside>
      </div>

      <RegistrationSuccessModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onEdit={handleEditProposal}
        onContinue={handleReady}
        userName={form.name}
        skillTitle={form.skillTitle || 'Не указано'}
        skillCategory={selectedTeachCategoryLabels}
        skillSubcategory={selectedTeachSubcategoryLabels}
        skillDescription={form.description || 'Описание не заполнено'}
        photos={form.skillImagePreview ? [form.skillImagePreview] : []}
      />

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleWelcomeDone}
        userName={form.name}
      />
    </main>
  )
}