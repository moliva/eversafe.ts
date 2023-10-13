import { For, createSignal } from 'solid-js'
import { deepCopy } from "deep-copy-ts"

import { Note } from '../types'
import { contentToString, copyToClipboard } from '../utils'

import styles from '../App.module.css'
import { ContentComponent } from './ContentComponent'

export type NoteProps = {
  onDelete(note: Note): void
  onEdit(note: Note): void
  onModified(note: Note): void
  note: Note
}

export const NoteComponent = (props: NoteProps) => {
  const { note } = props

  const [collapsed, setCollapsed] = createSignal(false)

  const toggleNote = () => {
    setCollapsed(!collapsed())
  }

  const onCheckToggle = (indices: number[]) => {
    const copy = deepCopy(note)
    let check = copy.content
    let last
    for (const index of indices) {
      last = check[index]
      check = last[1]
    }

    last = (last as any)[0]
    last.check = !last.check

    props.onModified(copy)
  }

  return <div class={styles.note} style={{ "background-color": note.color }}>
    <div class={styles['note-header']}>
      <div class={styles['note-label']}>
        <i class={`${styles.button} ${styles.arrow} ${collapsed() ? styles.right : styles.down}`} onClick={toggleNote} />
        <strong class={styles['note-name']}>{note.name}</strong>
      </div>
      <div class={styles['note-controls']}>
        <a class={styles.button} onClick={() => props.onEdit(note)}>✏️</a>
        <a class={styles.button} onClick={() => props.onDelete(note)}>❌</a>
        <a class={styles.button} onClick={() => copyToClipboard(contentToString(note.content))}>📋</a>
      </div>
    </div>
    <div class={styles['note-tags']}>
      <For each={note.tags}>{
        (tag) => <label class={styles['note-tag']}>{tag}</label>
      }</For>
    </div>
    {collapsed() ? null : <ContentComponent content={note.content} initial onCheckToggle={onCheckToggle} />}
  </div>
}
