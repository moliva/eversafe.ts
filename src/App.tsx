import { createSignal, type Component, For, onMount, Switch, Match, Show } from 'solid-js';

import { Note } from './types';

import { NoteComponent } from './components/NoteComponent';
import { EditNote } from './components/EditNoteComponent';
import { Filter } from './components/FilterComponent';

import { deleteNote, fetchNotes, postNote, putNote } from './services';

import styles from './App.module.css';

export const App: Component = () => {
  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined);

  const [showNoteModal, setShowNoteModal] = createSignal(false);
  const [currentNote, setCurrentNote] = createSignal<Note | undefined>(undefined);

  const [filter, setFilter] = createSignal("")

  const refreshNotes = async () => {
    const notes = await fetchNotes()

    setNotes(notes);
  }

  onMount(async () => {
    await refreshNotes()

    window.addEventListener('keyup', function(e) {
      if (e.key == 'Escape' || e.key == 'Esc') {
        setShowNoteModal(false)
        return false;
      }
    }, true);
  })

  const showModal = (note: Note | undefined) => {
    setCurrentNote(note)
    setShowNoteModal(true)
  }

  const createNote = (note: Note) => {
    const promise = note.id ? putNote(note) : postNote(note)

    promise
      .then(refreshNotes)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowNoteModal(false)
  }

  const onDeleteNote = (note: Note): void => {
    deleteNote(note)
      .then(refreshNotes)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const filteredNotes = () => notes()!.filter((note) => note.name.toLowerCase().includes(filter().toLowerCase()))

  return (
    <div class={styles.App}>
      <header class={styles.header}>
      </header>
      <main class={styles.main}>
        <Show when={showNoteModal()}>
          <EditNote note={currentNote()} onDiscard={() => setShowNoteModal(false)} onConfirm={createNote} />
        </Show>
        <section class={styles.notes}>
          <Filter value={filter()} onChange={setFilter} />
          <div id="notes">
            <Switch fallback={<p>Loading...</p>}>
              <Match when={typeof notes() === 'object'}>
                <For each={filteredNotes()}>{
                  (note) => <NoteComponent note={note} onEdit={showModal} onDelete={onDeleteNote} />
                }</For>
              </Match>
            </Switch>
          </div>
        </section>
        <button class={styles.primary} onClick={() => showModal(undefined)}>New</button>
      </main>
    </div>
  )
}

