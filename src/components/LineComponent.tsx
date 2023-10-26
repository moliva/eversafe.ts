import { createSignal } from "solid-js"
import { LineFormat } from "../types"

import { copyToClipboard } from '../utils'

import styles from '../App.module.css'
import Fa from "solid-fa"
import { faClipboard, faEye } from "@fortawesome/free-solid-svg-icons"

export type LineProps = {
  key: LineFormat

  onCheckToggle(): void
}

export const LineComponent = (props: LineProps) => {
  const { key, onCheckToggle } = props

  const [showMenu, setShowMenu] = createSignal(false)
  const [blur, setBlur] = createSignal(!!key.blur)

  const keyLine = key.link || key.line?.startsWith('http://') || key.line?.startsWith('https://')
    ? <a classList={{ [styles.blur]: blur() }} href={key.link ?? key.line} target="_blank" class={styles.link}>{key.line}</a>
    : <p classList={{ [styles.blur]: blur() }}>{key.line}</p>

  return <div class={styles['content-key']} onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
    {key.checkbox ? <input type="checkbox" checked={!!key.check} onClick={onCheckToggle} /> : null}
    {keyLine}
    {showMenu() ? <div class={styles['content-controls']}>
      {key.blur ? <a class={`${styles['content-control']} ${styles['blur-control']}`} onClick={() => { setBlur(!blur()) }}><Fa icon={faEye} /></a> : null}
      <a class={`${styles['content-control']} ${styles['copy-control']}`} onClick={() => { copyToClipboard(key.line!) }}><Fa icon={faClipboard} /></a>
    </div> : null
    }
  </div >
}
