import { createSignal, For, onMount, createEffect, onCleanup, Accessor } from 'solid-js'

import { Note } from '../types'
import { wrappedNoteSize } from '../utils'

import { NoteComponent } from './NoteComponent'

import styles from './NotesBoard.module.css'

export type NotesBoardProps = {
  notes: Accessor<Note[]>

  onDelete(note: Note): void
  onEdit(note: Note): void
  onModified(note: Note): void
  onTagClicked(tag: string): void
}

export function NotesBoard(props: NotesBoardProps) {
  const { notes, onDelete, onEdit, onModified, onTagClicked } = props

  const [notesBoardRef, setNotesBoardRef] = createSignal<HTMLElement | undefined>()
  const [columnLength, setColumnLength] = createSignal<number | undefined>()
  const [columns, setColumns] = createSignal<Map<number, Note[]> | undefined>()

  const computeColumns = () => {
    const nRef = notesBoardRef()
    if (nRef) {
      const width = nRef.getBoundingClientRect().width
      const columns = Math.floor(width / 425) // each note 420 width + gap 5

      setColumnLength(columns)
    }

  }

  const assignColumns = () => {
    const colLen = columnLength()

    if (!notes || !colLen)
      // only assign columns when notes and column length are already set
      return

    const columnSize: number[] = []
    const columns = new Map()
    for (let col = 0; col < colLen; ++col) {
      columnSize.push(0)
      columns.set(col, [])
    }

    const minColumnHeight = () => {
      return columnSize.reduce((previous, current, index) => current < previous[1] ? [index, current] : previous, [Infinity, Infinity])[0]
    }

    for (const note of notes()) {
      const column = minColumnHeight()
      const size = wrappedNoteSize(note)
      columnSize[column] += size
      columns.get(column)!.push(note)


    }
    setColumns(columns)

  }

  createEffect(computeColumns)
  createEffect(assignColumns)

  function isColumn(column: number) {
    return function(v: Note) {
      if (!columns() || columns()!.size <= column) {
        return true
      }
      return columns()!.get(column)!.includes(v)
    }
  }

  onMount(() => {
    window.addEventListener('resize', computeColumns)
  });

  onCleanup(() => {
    window.removeEventListener('resize', computeColumns)
  })

  return <div ref={setNotesBoardRef} class={styles['notes-board']}>
    <For each={[...Array(columnLength()).keys()]}>{
      (column) => <div class={styles['notes-column']}>
        <For each={notes().filter(isColumn(column))}>{
          (note) => <NoteComponent note={note} onEdit={onEdit} onDelete={onDelete} onModified={onModified} onTagClicked={onTagClicked} />
        }</For>
      </div>
    }</For>
  </div>
}
