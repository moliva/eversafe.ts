import { Accessor } from 'solid-js'

import { faRemove } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import styles from './FilterComponent.module.css'
import appStyles from '../App.module.css'

export type FilterProps = {
  value: Accessor<string>
  onChange(value: string): void
}

export const Filter = (props: FilterProps) => {
  const { value, onChange } = props

  return <div class={styles.filter}>
    <input class={styles['filter-input']} value={value()} placeholder="Filter..." onChange={(ev) => onChange(ev.target.value)}></input>
    <button onClick={() => onChange("")} class={appStyles.button} style={{ "background-color": 'transparent' }}><Fa icon={faRemove} /></button>
  </div>
}
