import { For, createSignal } from 'solid-js'
import { deepCopy } from "deep-copy-ts"

import { Note } from '../types'
import { contentToString, copyToClipboard, noteSize } from '../utils'

import { ContentComponent } from './ContentComponent'

import styles from '../App.module.css'

export type NoteProps = {
  note: Note

  onDelete(note: Note): void
  onEdit(note: Note): void
  onModified(note: Note): void
  onTagClicked(tag: string): void
}

export const NoteComponent = (props: NoteProps) => {
  const { note } = props

  const [collapsed, setCollapsed] = createSignal(false)
  const [showingMore, setShowingMore] = createSignal(false)

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

  const isLarge = noteSize(note) > 18

  return <div class={styles.note} style={{ "background-color": note.color }}>
    <div class={styles['note-header']}>
      <div class={styles['note-label']}>
        <i class={`${styles.button} ${styles.arrow} ${collapsed() ? styles.right : styles.down}`} style={{ 'margin-right': '5px' }} onClick={toggleNote} />
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
        (tag) => <label class={`${styles['note-tag']} ${styles['button']}`} onClick={() => props.onTagClicked(tag)}>{tag}</label>
      }</For>
    </div>
    {collapsed() ? null : <>
      {isLarge && !showingMore()
        ? <div class={styles['note-constrain']} style={{ '--note-color': note.color }}><ContentComponent content={note.content} initial onCheckToggle={onCheckToggle} /></div>
        : <ContentComponent content={note.content} initial onCheckToggle={onCheckToggle} />
      }
      {isLarge ? <span class={`${styles['note-expand-control']} ${styles.button}`} onClick={() => setShowingMore(!showingMore())}>{showingMore() ? 'Show less' : 'Show more'}</span> : null}
    </>}
  </div>
}
