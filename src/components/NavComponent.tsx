import { faKey, faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons"
import Fa from "solid-fa"

import { API_HOST } from "../services"
import { IdentityState } from "../types"

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: IdentityState
}

export const Nav = (props: NavProps) => {
  const identity = props.identity

  return <nav class={styles.nav}>
    <div class={styles['profile-card']}>
      <div style={{ width: "100%", "flex-grow": 1 }}></div>
      {identity ? (
        <>
          <a class={`${appStyles.button} ${appStyles.link}`} href={`/`} ><Fa icon={faUnlockKeyhole} /></a>
          <img
            class={`${styles['profile-picture']} ${styles.tiny}`}
            src={identity.identity.picture}
            title={identity.identity.name}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            alt="profile"
          />
        </>
      ) : (<a href={`${API_HOST}/login`} class={`${appStyles.button} ${styles.tiny} ${appStyles.link}`}><Fa icon={faKey} /></a>)}
    </div>
  </nav>

}

