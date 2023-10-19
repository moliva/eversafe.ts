import { createSignal, type Component, For, onMount, Switch, Match, Show, createEffect, onCleanup } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { IdentityState, Note } from './types'

import { NoteComponent } from './components/NoteComponent'
import { EditNote } from './components/EditNoteComponent'
import { Filter } from './components/FilterComponent'
import { Nav } from './components/NavComponent'

import { API_HOST, deleteNote, fetchNotes, postNote, putNote } from './services'

import styles from './App.module.css'

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

  const filteredNotes = () => notes()!.filter((note) => {
    const lowered = filter().toLowerCase()

    return note.name.toLowerCase().includes(lowered) || note.tags.some((tag) => tag.includes(lowered))
  })

  const [notesRef, setNotesRef] = createSignal<HTMLElement | undefined>()
  const [columns, setColumns] = createSignal<number | undefined>()

  const handler = () => {
    if (notesRef()) {
      const width = notesRef()!.getBoundingClientRect().width
      console.log('width', width)
      const columns = Math.floor(width / 425)

      console.log('columns', columns)
      setColumns(columns)
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

  function isColumn(column: number) {
    return function(v: any, i: number, array: any) { return i % columns()! === column }
  }

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <Nav identity={identity()} />
      </header>
      <main class={styles.main}>
        <Show when={showNoteModal()}>
          <EditNote note={currentNote()} onDiscard={() => setShowNoteModal(false)} onConfirm={createNote} />
        </Show>
        <section style={{ width: '100%' }}>
          <div class={styles.notes}>
            <Switch fallback={<p>Loading...</p>}>
              <Match when={typeof identity() === 'undefined'}>
                <a href={`${API_HOST}/login`} class={`${styles.button} ${styles.tiny} ${styles.link}`}><h1>Login</h1></a>
              </Match>
              <Match when={typeof notes() === 'object'}>
                <Filter value={filter} onChange={setFilter} />
                <div ref={setNotesRef} class={styles['note-content']}>
                  <For each={[...Array(columns()).keys()]}>{
                    (column) => <div class={styles['notes-column']}>
                                            <For each={filteredNotes().filter(isColumn(column))}>{
                                              (note) => <NoteComponent note={note} onEdit={showModal} onDelete={onDeleteNote} onModified={onModifiedNote} onTagClicked={setFilter} />
                                            }</For>
                                          </div>
                                        }</For>
                </div>
                <button style={{ "margin-bottom": "10px" }} class={styles.primary} onClick={() => showModal(undefined)}>New</button>
              </Match>
            </Switch>
          </div>
        </section >
      </main >
    </div >
  )
}

