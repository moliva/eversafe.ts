import { For, JSX, children, createEffect, createSignal, onCleanup, onMount } from "solid-js"

import styles from '../App.module.css'

export type NotesGridProps = {
  children: JSX.Element
}

export const NotesGrid = (props: NotesGridProps) => {
  const l = children(() => props.children)
  const [notesRef, setNotesRef] = createSignal<HTMLElement | undefined>()
  const [columnLength, setColumnLength] = createSignal<number | undefined>()

  const observer = new ResizeObserver(resize)

  const handler = () => {
    if (notesRef()) {
      const width = notesRef()!.getBoundingClientRect().width
      console.log('width', width)
      const colLen = Math.floor(width / 425)

      console.log('columnLength', colLen)
      if (columnLength() === colLen) {
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

  function resize() {
    return () => {
      if (notesRef()) {
        const c = l()! as HTMLElement[]

debugger
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
          console.log('child.getBoundingClientRect()', child.getBoundingClientRect())

          column[1].push(child)
        }

        console.log('newMap', newMap)

        for (let i = 0; i < notesRef()!.children.length; ++i) {
          const column = notesRef()!.children.item(i)!
          const newColumn = newMap.get(i)!
          for (let j = 0; j < column.children.length; ++j) {
            const item = column.children.item(j)! as HTMLElement
            if (!newColumn.includes(item))
              column.removeChild(item)
          }

          console.log('column.children', JSON.stringify(column.children))
          for (const item of newMap.get(i)!) {
            // if (!column.includes(item  as HTMLElement))
            column.appendChild(item)
          }
          console.log('column.children', JSON.stringify(column.children))
        }
      }
    }
  }

  createEffect(() => {
    const c = l()! as HTMLElement[]

    console.log('c', c)

    for (const child of c) {
      observer.observe(child)
    }

    resize()()
    resize()()

  })





  // {columnNoteMap().size === 0 ? c : columnNoteMap().get(column)!}
  return <div ref={setNotesRef} class={styles['note-content']}>
  </div>
}
