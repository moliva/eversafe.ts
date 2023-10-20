import { JSX, children as solidChildren, createEffect, createSignal, onCleanup, onMount } from "solid-js"

import styles from '../App.module.css'

export type NotesGridProps = {
  children: JSX.Element
}

export const NotesGrid = (props: NotesGridProps) => {
  const notesComponents = solidChildren(() => props.children)
  const [notesRef, setNotesRef] = createSignal<HTMLElement | undefined>()
  const [columnLength, setColumnLength] = createSignal<number | undefined>()
  const [noteMap, setNoteMap] = createSignal<Map<number, HTMLElement[]> | undefined>()

  const observer = new ResizeObserver(resize)

  const initializeNoteColumns = () => {
    const ref = notesRef()
    if (ref) {
      const width = ref.getBoundingClientRect().width
      const colLen = Math.floor(width / 425) // each note - 420 width gap - 5

      if (columnLength() === colLen) {
        // no changes to column size, skip the initialization
        return
      }

      setColumnLength(colLen)

      // remove all existing columns
      for (let i = 0; i < ref.children.length; ++i) {
        const column = ref.children.item(i)!
        column.remove()
      }

      // create new columns
      for (let i = 0; i < colLen; ++i) {
        const column = document.createElement("div")
        column.className = styles['notes-column']

        ref.appendChild(column)
      }
    }
  }

  createEffect(initializeNoteColumns)

  onMount(() => {
    window.addEventListener('resize', initializeNoteColumns)
  });

  onCleanup(() => {
    window.removeEventListener('resize', initializeNoteColumns)
  })

  const equalNotesLength = (c: HTMLElement[]): boolean => !!noteMap() && c.length === Array.from(noteMap()!.values()).reduce((a, i) => i.length + a, 0)

  function resize() {
    const notes = notesRef()

    if (notes) {
      const notesArray = notesComponents()! as HTMLElement[]

      const newMap = new Map<number, HTMLElement[]>()
      if (noteMap() && notesArray[0].getBoundingClientRect().height === 0 && equalNotesLength(notesArray)) {
        for (const key of noteMap()!.keys()) {
          newMap.set(key, [])
        }

        for (const child of notesArray) {
          const column = Array.from(noteMap()!.entries()).find(([, v]) => v.find((n) => n.id === child.id))!
          newMap.get(column[0])!.push(child)
        }
      } else {
        for (const column of [...Array(columnLength()).keys()]) {
          newMap.set(column, [])
        }

        const columnHeight = (column: number) => newMap.get(column)!.reduce((a, e) => e.getBoundingClientRect().height + a, 0)

        const minColumnHeight = () => {
          const entries = Array.from(newMap.entries())
          return entries.reduce((previous, current) => columnHeight(current[0]) < columnHeight(previous[0]) ? current : previous, entries.shift()!)
        }

        for (const child of notesArray) {
          const column = minColumnHeight()
          column[1].push(child)
        }

        setNoteMap(newMap)
      }

      for (let i = 0; i < notes.children.length; ++i) {
        const column = notes.children.item(i)!
        const newColumn = newMap.get(i)!
        for (let j = 0; j < column.children.length; ++j) {
          const item = column.children.item(j)! as HTMLElement
          if (!newColumn.find(i => i.id === item.id && i.innerHTML === item.innerHTML)) {
            column.removeChild(item)
          }
        }
        const childrenCollection = Array.from(column.children)
        for (const item of newColumn) {
          if (!childrenCollection.find(i => i.id === item.id && i.innerHTML === item.innerHTML)) {
            column.appendChild(item)
          }
        }
      }
    }
  }

  createEffect(() => {
    const notesArray = notesComponents()! as HTMLElement[]

    for (const child of notesArray) {
      observer.observe(child)
    }

    if (!equalNotesLength(notesArray)) {
      resize()
    }
  })

  return <div ref={setNotesRef} class={styles['note-content']} />
}
