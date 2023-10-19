import { createSignal } from "solid-js"
import { LineFormat } from "../types"

import { copyToClipboard } from '../utils'

import styles from '../App.module.css'

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
    {showMenu() ? <>
      {key.blur ? <a class={styles['content-show-blur']} onClick={() => { setBlur(!blur()) }}>&#128065</a> : null}
      <a class={styles['content-show-blur']} onClick={() => { copyToClipboard(key.line!) }}>&#x1f4cb</a>
    </> : null}
  </div>
}
