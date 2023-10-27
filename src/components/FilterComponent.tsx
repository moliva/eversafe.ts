import { Accessor } from 'solid-js'

import { faEraser, faRemove } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import appStyles from '../App.module.css'
import noteStyles from './NoteComponent.module.css'
import styles from './FilterComponent.module.css'

export type FilterProps = {
  value: Accessor<string>
  onChange(value: string): void
}

export const Filter = (props: FilterProps) => {
  const { value, onChange } = props

  return <div class={styles.filter}>
    <input class={styles['filter-input']} value={value()} placeholder="Filter..." onChange={(ev) => onChange(ev.target.value)} />
    <button class={`${appStyles.button} ${styles['filter-button']} ${noteStyles['delete-control']}`} onClick={() => onChange("")}><Fa icon={faEraser} /></button>
  </div>
}
