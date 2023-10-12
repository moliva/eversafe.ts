import { API_HOST } from "../services";

import styles from '../App.module.css';
import { IdentityState } from "../types";

export type NavProps = {
  identity: IdentityState;
}

export const Nav = (props: NavProps) => {
  const identity = props.identity;

  return (
    <nav class={styles.nav}>
      <div class={styles['profile-card']}>
        <div style={{ width: "100%", "flex-grow": 1 }}></div>
        {identity ? (
          <>
            <a class={`${styles.button} ${styles.link}`} href={`/`} >🔓</a>
            <img
              class={`${styles['profile-picture']} ${styles.tiny}`}
              src={identity.identity.picture}
              title={identity.identity.name}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              alt="profile"
            />
          </>
        ) : (<a href={`${API_HOST}/login`} class={`${styles.button} ${styles.tiny} ${styles.link}`}>🔑</a>)
        }
      </div >
    </nav >
  )
}

