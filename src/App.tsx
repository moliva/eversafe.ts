import { createSignal, type Component, onMount, Switch, Match, Show, createEffect, onCleanup } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { IdentityState, Note } from './types'
import { deleteNote, fetchNotes, fetchTags, postNote, putNote } from './services'

import { EditNote } from './components/EditNoteComponent'
import { Nav } from './components/NavComponent'
import { NotesBoard } from './components/NotesBoard'
import { Tags } from './components/Tags'
import { Login } from './components/Login'

import styles from './App.module.css'

export const App: Component = () => {
  const [identity, setIdentity] = createSignal<IdentityState>(undefined)

  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined)
  const [filter, setFilter] = createSignal("")
  const [filteredNotes, setFilteredNotes] = createSignal<Note[]>([])

  const [tags, setTags] = createSignal<string[] | undefined>(undefined)

  const [showNoteModal, setShowNoteModal] = createSignal(false)
  const [currentNote, setCurrentNote] = createSignal<Note | undefined>(undefined)

  const navigate = useNavigate()

  const refreshTags = async () => {
    const currentIdentity = identity()

    const tags = currentIdentity ? await fetchTags(currentIdentity) : undefined
    setTags(tags)
  }

  const refreshNotes = async () => {
    const currentIdentity = identity()

    const notes = currentIdentity ? await fetchNotes(currentIdentity) : undefined
    setNotes(notes)
  }

  const refreshContent = async () => {
    refreshNotes()
    refreshTags()
  }

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (showNoteModal()) {
        // if edit modal is currently on, discard it
        setShowNoteModal(false)
      } else if (filter().length > 0) {
        // if filter is set, unset it
        setFilter("")
      }
      return false
    }
  }

  onMount(async () => {
    refreshContent()

    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
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
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const createNote = (note: Note) => {
    const promise = note.id ? putNote(note, identity()!) : postNote(note, identity()!)

    promise
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowNoteModal(false)
  }

  const onDeleteNote = (note: Note): void => {
    deleteNote(note, identity()!)
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const onTagClicked = (tag: string): void => {
    const currentFilter = filter()

    setFilter(currentFilter === tag ? "" : tag)
  }

  createEffect(() => {
    const lowered = filter().toLowerCase()
    const filtered = (notes() ?? []).filter(note => note.name.toLowerCase().includes(lowered) || note.tags.some(tag => tag.includes(lowered)))

    setFilteredNotes(filtered)
  })

  return (
    <div class={styles.App}>
      <Switch fallback={<Login />}>
        <Match when={typeof identity() !== 'undefined'}>
          <header class={styles.header}>
            <Nav identity={identity()} filter={filter} onFilterChange={setFilter} onNewNoteClicked={() => showModal(undefined)} />
            <Switch fallback={<p>Loading...</p>}>
              <Match when={typeof tags() === 'object'}>
                <Tags tags={tags} onTagClicked={onTagClicked} />
              </Match>
            </Switch>
          </header>
          <main class={styles.main}>
            <Show when={showNoteModal()}>
              <EditNote note={currentNote()} onDiscard={() => setShowNoteModal(false)} onConfirm={createNote} />
            </Show>
            <section class={styles.content}>
              <Switch fallback={<p>Loading...</p>}>
                <Match when={typeof notes() === 'object'}>
                  <NotesBoard notes={filteredNotes} onDelete={onDeleteNote} onEdit={showModal} onModified={onModifiedNote} onTagClicked={onTagClicked} />
                </Match>
              </Switch>
            </section>
          </main>
        </Match>
      </Switch>
    </div>
  )
}
