import { createSignal, type Component, onMount, Switch, Match, Show, createEffect, onCleanup } from 'solid-js'

import { handleAuth } from '@moliva/auth.ts'

import { IdentityState, INITIAL_STATE, Note } from './types'
import { deleteNote, fetchNote, fetchNotes, fetchTags, postNote, putNote } from './services'

import { EditNote } from './components/EditNoteComponent'
import { Nav } from './components/NavComponent'
import { NotesBoard } from './components/NotesBoard'
import { Tags } from './components/Tags'
import { Login } from './components/Login'

import styles from './App.module.css'

const MAX_TAG_LENGTH = 700

export const App: Component = () => {
  const [identity, setIdentity] = createSignal<IdentityState>(INITIAL_STATE)

  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined)
  const [filter, setFilter] = createSignal('')
  const [filteredNotes, setFilteredNotes] = createSignal<Note[]>([])

  const [appRef, setAppRef] = createSignal<HTMLElement | undefined>()

  const [topTagLength, setTopTagLength] = createSignal(MAX_TAG_LENGTH) // approx size per note
  const [tags, setTags] = createSignal<string[] | undefined>(undefined)

  const [showNoteModal, setShowNoteModal] = createSignal(false)
  const [currentNote, setCurrentNote] = createSignal<Note | undefined>(undefined)

  const refreshTags = async () => {
    const currentIdentity = identity().identity

    const tags = currentIdentity ? await fetchTags(currentIdentity) : undefined
    setTags(tags)
  }

  const refreshNote = async (note: Note) => {
    const currentIdentity = identity().identity

    const updated = currentIdentity ? await fetchNote(currentIdentity, note) : undefined
    if (!updated)
      // could not fetch note
      return

    setNotes(notes()!.map(n => (updated.id === n.id ? updated : n)))
  }

  const refreshNotes = async () => {
    const currentIdentity = identity().identity

    const notes = currentIdentity ? await fetchNotes(currentIdentity) : undefined
    setNotes(notes)
  }

  const refreshContent = async () => {
    return Promise.all([refreshNotes(), refreshTags()])
  }

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (showNoteModal()) {
        // if edit modal is currently on, discard it
        setShowNoteModal(false)
      } else if (filter().length > 0) {
        // if filter is set, unset it
        setFilter('')
      }
      return false
    }
  }

  const updateTopTagLength = () => {
    const ref = appRef()

    if (!ref)
      // do nothing
      return

    const width = ref.getBoundingClientRect().width
    const newTopTagLength = Math.min(MAX_TAG_LENGTH, width) // each note = (400 content + 20 horizontal padding + 5 gap) width
    setTopTagLength(newTopTagLength)
  }

  onMount(async () => {
    refreshContent()

    window.addEventListener('keydown', handleAppKeydown, true)
    window.addEventListener('resize', updateTopTagLength)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
    window.removeEventListener('resize', updateTopTagLength)
  })

  // handle auth
  handleAuth(identity, setIdentity)

  const showModal = (note: Note | undefined) => {
    setCurrentNote(note)
    setShowNoteModal(true)
  }

  const onModifiedNote = (note: Note) => {
    const promise = putNote(note, identity().identity!)

    promise
      // don't refresh for now
      // .then(() => refreshNote(note))
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const createNote = (note: Note) => {
    const promise = note.id ? putNote(note, identity().identity!) : postNote(note, identity()!)

    promise.then(refreshContent).catch(() => {
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

    setFilter(currentFilter === tag ? '' : tag)
  }

  createEffect(() => {
    const lowered = filter().toLowerCase()
    const filtered = (notes() ?? []).filter(
      note => note.name.toLowerCase().includes(lowered) || note.tags.some(tag => tag.includes(lowered))
    )

    setFilteredNotes(filtered)
  })

  return (
    <div ref={setAppRef} class={styles.App}>
      <Switch fallback={<Login />}>
        <Match when={typeof identity().identity !== 'undefined'}>
          <header class={styles.header}>
            <Nav
              identity={identity().identity!}
              filter={filter}
              onFilterChange={setFilter}
              onNewNoteClicked={() => showModal(undefined)}
            />
            <Switch>
              <Match when={typeof tags() === 'object'}>
                <Tags tags={tags} topTagLength={topTagLength} activeTag={filter} onTagClicked={onTagClicked} />
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
                  <NotesBoard
                    notes={filteredNotes}
                    onDelete={onDeleteNote}
                    onEdit={showModal}
                    onModified={onModifiedNote}
                    onTagClicked={onTagClicked}
                  />
                </Match>
              </Switch>
            </section>
          </main>
        </Match>
      </Switch>
    </div>
  )
}
