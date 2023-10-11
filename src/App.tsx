import { createSignal, type Component, For, onMount, Switch, Match, Show } from 'solid-js';

import { Note } from './types';

import { NoteComponent } from './components/NoteComponent';
import { EditNote } from './components/EditNoteComponent';
import { Filter } from './components/FilterComponent';

import { deleteNote, fetchNotes, postNote, putNote } from './services';

import styles from './App.module.css';

export const App: Component = () => {
  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined);
  const [showCreateNote, setShowCreateNote] = createSignal(false);
  const [currentNote, setCurrentNote] = createSignal<Note | undefined>(undefined);

  const refreshNotes = async () => {
    const notes = await fetchNotes()

    setNotes(notes);
  }

  onMount(async () => {
    await refreshNotes()

    window.addEventListener('keyup', function(e) {
      if (e.key == 'Escape' || e.key == 'Esc') {
        setShowCreateNote(false)
        return false;
      }
    }, true);
  })

  const showModal = (note: Note | undefined) => {
    setCurrentNote(note)
    setShowCreateNote(true)
  }

  const createNote = (note: Note) => {
    const promise = note.id ? putNote(note) : postNote(note)

    promise
      .then(refreshNotes)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowCreateNote(false)
  }

  const onDeleteNote = (note: Note): void => {
    deleteNote(note)
      .then(refreshNotes)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const [filter, setFilter] = createSignal("")

  return (
    <div class={styles.App}>
      <header class={styles.header}>
      </header>
      <main class={styles.main}>
        <Show when={showCreateNote()}>
          <EditNote note={currentNote()} onDiscard={() => setShowCreateNote(false)} onConfirm={createNote} />
        </Show>
        <section class={styles.notes}>
          <Filter value={filter()} onChange={setFilter} />
          <div id="notes">
            <Switch fallback={<p>Loading...</p>}>
              <Match when={typeof notes() === 'object'}>
                <For each={notes()!.filter((note) => note.name.toLowerCase().includes(filter().toLowerCase()))}>{
                  (note) => <NoteComponent note={note} onEdit={showModal} onDelete={onDeleteNote} />
                }</For>
              </Match>
            </Switch>
          </div>
        </section>
        <button class={styles.primary} onClick={() => showModal(undefined)}>New</button>
      </main>
    </div >
  );
}

