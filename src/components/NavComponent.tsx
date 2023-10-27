import { Accessor } from "solid-js"

import { faKey, faPlusSquare, faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons"
import Fa from "solid-fa"

import { API_HOST } from "../services"
import { IdentityState } from "../types"

import { Filter } from "./FilterComponent"

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: IdentityState
  filter: Accessor<string>

  onFilterChange(filter: string): void
  onNewNoteClicked(): void
}

export const Nav = (props: NavProps) => {
  const { identity, filter, onFilterChange, onNewNoteClicked } = props

  return <nav class={styles.nav}>
    <div class={styles['profile-card']}>
      {identity ? (
        <>
          <div class={styles['nav-app-controls']}>
            <Filter value={filter} onChange={onFilterChange} />
            <a class={`${appStyles.button} ${appStyles.link} ${styles['new-note']}`} onClick={onNewNoteClicked} ><Fa class={styles['nav-icon']} icon={faPlusSquare} /></a>
          </div>
          <div class={styles['nav-auth-controls']}>
            <a class={`${appStyles.button} ${appStyles.link} ${styles['logout']}`} href={import.meta.env.BASE_URL} ><Fa class={styles['nav-icon']} icon={faUnlockKeyhole} /></a>
            <img
              class={`${styles['profile-picture']} ${styles.tiny}`}
              src={identity.identity.picture}
              title={identity.identity.name}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              alt="profile"
            />
          </div>
        </>
      ) : (<a href={`${API_HOST}/login`} class={`${appStyles.button} ${styles.tiny} ${appStyles.link} ${styles['login']}`}><Fa class={styles['nav-icon']} icon={faKey} /></a>)}
    </div>
  </nav>

}

