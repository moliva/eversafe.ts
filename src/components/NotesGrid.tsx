import { JSX, children, createEffect, createSignal, onCleanup, onMount } from "solid-js"

import styles from '../App.module.css'

export type NotesGridProps = {
  children: JSX.Element
}

export const NotesGrid = (props: NotesGridProps) => {
  const l = children(() => props.children)
  const [notesRef, setNotesRef] = createSignal<HTMLElement | undefined>()
  const [columnLength, setColumnLength] = createSignal<number | undefined>()
  const [noteMap, setNoteMap] = createSignal<Map<number, HTMLElement[]> | undefined>()

  const observer = new ResizeObserver(resize)

  const handler = () => {
    if (notesRef()) {
      const width = notesRef()!.getBoundingClientRect().width
      const colLen = Math.floor(width / 425) // each note - 420 width gap - 5

      if (columnLength() === colLen) {
        // no changes to column size, skip the initialization
        return
      }

      setColumnLength(colLen)

      for (let i = 0; i < notesRef()!.children.length; ++i) {
        const column = notesRef()!.children.item(i)!
        column.remove()
      }

      for (let i = 0; i < colLen; ++i) {
        const column = document.createElement("div")
        column.className = styles['notes-column']

        notesRef()?.appendChild(column)
      }
    }
  }

  createEffect(handler)

  onMount(() => {
    window.addEventListener('resize', handler)
  });

  onCleanup(() => {
    window.removeEventListener('resize', handler)
  })

  const equalNotesLength = (c: HTMLElement[]): boolean => !!noteMap() && c.length === Array.from(noteMap()!.values()).reduce((a, i) => i.length + a, 0)

  function resize() {
    const notes = notesRef()
    if (notes) {
      const c = l()! as HTMLElement[]

      let newMap1: Map<number, HTMLElement[]>
      if (noteMap() && c[0].getBoundingClientRect().height === 0 && equalNotesLength(c)) {
        const newMap = new Map()
        for (const key of noteMap()!.keys()) {
          newMap.set(key, [])
        }
        for (const child of c) {
          const column = Array.from(noteMap()!.entries()).find(([, v]) => v.find((n) => n.id === child.id))!
          newMap.get(column[0]).push(child)
        }
        newMap1 = newMap
      } else {
        const newMap = new Map<number, HTMLElement[]>()
        for (const column of [...Array(columnLength()).keys()]) {
          newMap.set(column, [])
        }

        const columnHeight = (column: number) => newMap.get(column)!.reduce((a, e) => e.getBoundingClientRect().height + a, 0)

        const minColumnHeight = () => {
          const entries = Array.from(newMap.entries())
          return entries.reduce((previous, current) => columnHeight(current[0]) < columnHeight(previous[0]) ? current : previous, entries.shift()!)
        }

        for (const child of c) {
          const column = minColumnHeight()
          column[1].push(child)
        }

        setNoteMap(newMap)
        newMap1 = newMap
      }

      for (let i = 0; i < notes.children.length; ++i) {
        const column = notes.children.item(i)!
        const newColumn = newMap1.get(i)!
        for (let j = 0; j < column.children.length; ++j) {
          const item = column.children.item(j)! as HTMLElement
          // if (!newColumn.includes(item)) {
          column.removeChild(item)
          // }
        }
        const childrenCollection = Array.from(column.children)
        for (const item of newColumn) {
          // if (!childrenCollection.includes(item as HTMLElement))
          column.appendChild(item)
        }
      }
    }
  }

  createEffect(() => {
    const c = l()! as HTMLElement[]

    for (const child of c) {
      observer.observe(child)
    }

    if (!equalNotesLength(c)) {
      resize()
    }
  })

  return <div ref={setNotesRef} class={styles['note-content']} />
}
