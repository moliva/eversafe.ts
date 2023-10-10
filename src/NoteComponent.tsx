import { createSignal } from 'solid-js';

import { Content, Note } from './types';

import styles from './App.module.css';

export type NoteProps = {
  note: Note;
}

export const NoteComponent = (props: NoteProps) => {
  const { note } = props;
  const [collapsed, setCollapsed] = createSignal(false);

  const toggleNote = () => {
    setCollapsed(!collapsed());
  };

  return <div class={styles.note}>
    <div class={styles['note-header']}>
      <div class={styles['note-label']}>
        <i class={`${styles.button} ${styles.arrow} ${collapsed() ? styles.right : styles.down}`} onClick={toggleNote} />
        <strong class={styles['note-name']}>{note.name}</strong>
      </div>
      <div class={styles['note-controls']}>
        <a class={styles.button} onClick={() => { }}>✏️</a>
        <a class={styles.button} onClick={() => { }}>❌</a>
        <a class={styles.button} onClick={() => copyToClipboard(contentToString(note.content).join('\n'))}>📋</a>
      </div>
    </div>
    {collapsed() ? null : formatContent(note.content)}
  </div>;
};

export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

export function contentToString(content: Content, indent: string = '', acc: string[] = []): string[] {
  for (const [key, value] of content) {
    let line = indent

    if (key.checkbox) {
      line += key.check ? '[x]' : '[ ]'
    }

    if (key.blur) {
      line += '[!]'
    }

    line += key.line

    acc.push(line)

    contentToString(value, indent + '  ', acc)
  }
  return acc
}

export function formatContent(content: Content): HTMLElement {
  const contentElement = document.createElement("div")
  contentElement.style.paddingLeft = '15px'

  for (const [key, value] of content) {
    const keyElement = document.createElement("div")
    keyElement.style.display = 'flex'
    keyElement.style.alignItems = 'center'
    keyElement.style.height = '30px'
    keyElement.style.cursor = 'pointer'

    if (key.checkbox) {
      const check = document.createElement("input")
      check.type = 'checkbox'
      check.checked = !!key.check

      check.onclick = () => {
        // TODO - update the note content! - moliva - 2023/10/09
      }

      keyElement.appendChild(check)
    }

    const keyLabel = document.createElement("p")
    keyLabel.innerText = key.line!
    keyElement.appendChild(keyLabel)

    // add controls for blur
    if (key.blur) {
      keyLabel.className = ` ${styles.blur}`

      const showButton = document.createElement("a")
      showButton.innerHTML = '&#128065'
      showButton.style.paddingLeft = '3px'
      showButton.onclick = (ev) => {
        if (keyLabel.className.includes(styles.blur)) {
          keyLabel.className = keyLabel.className.replaceAll(styles.blur, '')
        } else {
          keyLabel.className = ` ${styles.blur}`
        }
      }
      keyElement.appendChild(showButton)
    }

    const clipLabel = document.createElement("a")
    clipLabel.style.paddingLeft = '3px'
    clipLabel.onclick = (ev) => { copyToClipboard(key.line!) }
    clipLabel.innerHTML = '&#x1f4cb'

    keyElement.appendChild(clipLabel)

    contentElement.appendChild(keyElement)

    const valueElement = formatContent(value)
    contentElement.appendChild(valueElement)
    valueElement.style.paddingLeft = '10px';
  }

  return contentElement
}
