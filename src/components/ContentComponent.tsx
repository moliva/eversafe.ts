import { For, createSignal } from 'solid-js';

import { Content } from "../types"
import { copyToClipboard } from '../utils';

import styles from '../App.module.css';

export type ContentProps = {
  initial?: boolean
  content: Content
}

export const ContentComponent = (props: ContentProps) => {
  const { content, initial } = props

  return <div class={initial ? styles['content-initial'] : styles.content}>
    <For each={content}>{
      ([key, value]) => {
        let keyLabelRef: any

        const [showMenu, setShowMenu] = createSignal(false)
        const [blur, setBlur] = createSignal(!!key.blur)

        return <>
          <div class={styles['content-key']}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            {key.checkbox ? <input type="checkbox" checked={!!key.check} onClick={() => {
              // TODO - update the note content! - moliva - 2023/10/09
            }} /> : null}
            <p ref={keyLabelRef} class={blur() ? styles.blur : ''}>{key.line}</p>
            {showMenu() ? <>
              {key.blur ? <a class={styles['content-show-blur']} onClick={() => { setBlur(!blur()) }}>&#128065</a> : null}
              <a class={styles['content-show-blur']} onClick={() => { copyToClipboard(key.line!) }}>&#x1f4cb</a>
            </> : null}
          </div>
          <ContentComponent content={value} />
        </>
      }}</For>
  </div>
}
