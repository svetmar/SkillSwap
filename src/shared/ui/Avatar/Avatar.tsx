import { useState } from 'react'
import { getAvatarColor } from './getAvatarColor'
import styles from './Avatar.module.css'

export type AvatarSize = 'sm' | 'lg'

export interface AvatarProps {
  /** Ссылка на изображение. Если не задано пользователем — показывается цветная заглушка */
  src?: string | null
  /** Имя пользователя: используется для alt */
  name?: string
  /** Уникальный идентификатор (user.id) — используется как источник цвета заглушки. Сделал обязательным,
   * чтобы разные пользователи с одинаковым именем не получали один и тот же цвет */
  seed: string
  size?: AvatarSize
  className?: string
}

export function Avatar({ src, name = '', seed, size = 'sm', className }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(src) && !imageFailed

  const classNames = [styles.avatar, styles[size], className].filter(Boolean).join(' ')

  return (
    <div
      className={classNames}
      style={showImage ? undefined : { backgroundColor: getAvatarColor(seed) }}
    >
      {showImage && (
        <img
          className={styles.image}
          src={src ? `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}` : undefined}
          alt={name}
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  )
}
