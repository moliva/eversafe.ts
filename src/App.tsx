import { createSignal, type Component, For, onMount, Switch, Match, Show, createEffect, onCleanup } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { IdentityState, Note } from './types'

import { NoteComponent } from './components/NoteComponent'
import { EditNote } from './components/EditNoteComponent'
import { Nav } from './components/NavComponent'

import { API_HOST, deleteNote, fetchNotes, postNote, putNote } from './services'
import { wrappedNoteSize } from './utils'

import styles from './App.module.css'
import navStyles from './components/NavComponent.module.css'

export const App: Component = () => {
  const [identity, setIdentity] = createSignal<IdentityState>(undefined)

  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined)

  const [showNoteModal, setShowNoteModal] = createSignal(false)
  const [currentNote, setCurrentNote] = createSignal<Note | undefined>(undefined)

  const [filter, setFilter] = createSignal("")

  const navigate = useNavigate()

  const refreshNotes = async () => {
    const currentIdentity = identity()

    const notes = currentIdentity ? await fetchNotes(currentIdentity) : undefined
    setNotes(notes)
  }

  onMount(async () => {
    await refreshNotes()

    window.addEventListener('keyup', function(e) {
      if (e.key == 'Escape' || e.key == 'Esc') {
        setShowNoteModal(false)
        return false
      }
    }, true)
  })

  // handle auth
  const [searchParams] = useSearchParams()

  const token = searchParams.login_success
  if (!identity() && typeof token === "string") {
    const idToken = token.split(".")[1]
    const decoded = atob(idToken)
    const identity = JSON.parse(decoded)

    setIdentity({ identity, token })
    navigate(import.meta.env.BASE_URL)
  }

  const showModal = (note: Note | undefined) => {
    setCurrentNote(note)
    setShowNoteModal(true)
  }

  const onModifiedNote = (note: Note) => {
    const promise = putNote(note, identity()!)

    promise
      .then(refreshNotes)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const createNote = (note: Note) => {
    const promise = note.id ? putNote(note, identity()!) : postNote(note, identity()!)

    promise
      .then(refreshNotes)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowNoteModal(false)
  }

  const onDeleteNote = (note: Note): void => {
    deleteNote(note, identity()!)
      .then(refreshNotes)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const filteredNotes = () => notes()?.filter((note) => {
    const lowered = filter().toLowerCase()

    return note.name.toLowerCase().includes(lowered) || note.tags.some((tag) => tag.includes(lowered))
  })

  const [notesRef, setNotesRef] = createSignal<HTMLElement | undefined>()
  const [columnLength, setColumnLength] = createSignal<number | undefined>()
  const [columns, setColumns] = createSignal<Map<number, Note[]> | undefined>()

  const computeColumns = () => {
    const nRef = notesRef()
    if (nRef) {
      const width = nRef.getBoundingClientRect().width
      const columns = Math.floor(width / 425) // each note 420 width + gap 5

      setColumnLength(columns)
    }

  }

  const assignColumns = () => {
    const notes = filteredNotes()
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

    for (const note of notes) {
      const column = minColumnHeight()
      const size = wrappedNoteSize(note)
      columnSize[column] += size
      columns.get(column)!.push(note)


    }
    setColumns(columns)

  }

  createEffect(computeColumns)
  createEffect(assignColumns)

  onMount(() => {
    window.addEventListener('resize', computeColumns)
  });

  onCleanup(() => {
    window.removeEventListener('resize', computeColumns)
  })

  function isColumn(column: number) {
    return function(v: Note) {
      if (!columns() || columns()!.size <= column) {
        return true
      }
      return columns()!.get(column)!.includes(v)
    }
  }

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <Nav identity={identity()} filter={filter} onFilterChange={setFilter} onNewNoteClicked={() => showModal(undefined)} />
      </header>
      <main class={styles.main}>
        <Show when={showNoteModal()}>
          <EditNote note={currentNote()} onDiscard={() => setShowNoteModal(false)} onConfirm={createNote} />
        </Show>
        <section style={{ width: '100%' }}>
          <div class={styles.notes}>
            <Switch fallback={<p>Loading...</p>}>
              <Match when={typeof identity() === 'undefined'}>
                <a href={`${API_HOST}/login`} class={`${styles.button} ${navStyles.tiny} ${styles.link} ${navStyles.login}`}><h1>Login</h1></a>
              </Match>
              <Match when={typeof notes() === 'object'}>
                <div ref={setNotesRef} class={styles['note-content']}>
                  <For each={[...Array(columnLength()).keys()]}>{
                    (column) => <div class={styles['notes-column']}>
                      <For each={notes() ? filteredNotes()!.filter(isColumn(column)) : []}>{
                        (note) => <NoteComponent note={note} onEdit={showModal} onDelete={onDeleteNote} onModified={onModifiedNote} onTagClicked={setFilter} />
                      }</For>
                    </div>
                  }</For>
                </div>
              </Match>
            </Switch>
          </div>
        </section>
      </main>
    </div>
  )
}

