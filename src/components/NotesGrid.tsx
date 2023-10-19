import { For, JSX, children, createEffect, createSignal, onCleanup, onMount } from "solid-js"

import styles from '../App.module.css'

export type NotesGridProps = {
  children: JSX.Element
}

export const NotesGrid = (props: NotesGridProps) => {
  const [notesRef, setNotesRef] = createSignal<HTMLElement | undefined>()
  const [columnLength, setColumnLength] = createSignal<number | undefined>()

  function isColumn(column: number) {
    return function(v: any, i: number, array: any) { return i % columnLength()! === column }
  }

  const handler = () => {
    if (notesRef()) {
      const width = notesRef()!.getBoundingClientRect().width
      console.log('width', width)
      const columns = Math.floor(width / 425)

      console.log('columnLength', columns)
      setColumnLength(columns)
    }

    // each note - 420 width
    // gap - 5
  }

  createEffect(() => {
    handler()
  })

  onMount(() => {
    window.addEventListener('resize', handler)
  });

  onCleanup(() => {
    window.removeEventListener('resize', handler)
  })

  const c = children(() => props.children)   .toArray() as HTMLElement[]

  const [columnNoteMap, setColumnNoteMap] = createSignal(new Map<number, HTMLElement[]>())

  const observer = new ResizeObserver(() => {
    const newMap = new Map<number, HTMLElement[]>()
    for (const column of [...Array(columnLength()).keys()]) {
      newMap.set(column, [])
    }

    const columnHeight = (column: number) => newMap.get(column)!.reduce((a, e) => e.getBoundingClientRect().height + a, 0)

    const minColumnHeight = () => {
      const entries = Array.from(newMap.entries())
      return entries.reduce((previous, current) => columnHeight(current[0]) < columnHeight(previous[0]) ? current : previous, entries.pop()!)
    }

    for (const child of c) {
      const column = minColumnHeight()

      column[1].push(child)
    }

    console.log('newMap', newMap)
    setColumnNoteMap(newMap)
  })

  for (const child of c) {
    observer.observe(child)
  }



        // {columnNoteMap().size === 0 ? c : columnNoteMap().get(column)!}
  return <div ref={setNotesRef} class={styles['note-content']}>
    <For each={[...Array(columnLength()).keys()]}>{
      (column) => <div class={styles['notes-column']}>
        {c.slice()}
      </div>
    }</For>
  </div>
}
