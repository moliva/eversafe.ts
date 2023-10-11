import { createSignal, type Component, For, onMount, Switch, Match, Show } from 'solid-js';

import { NoteComponent } from './components/NoteComponent';
import { EditNote } from './components/EditNoteComponent';

import { Note } from './types';

import styles from './App.module.css';

const API_HOST = "http://localhost:9000";

async function fetchNotes() {
  return await fetch(`${API_HOST}/notes`)
}

async function putNote(note: Note) {
  return await fetch(`${API_HOST}/notes/${note.id}`, { method: 'PUT', body: JSON.stringify(note), headers: { "Content-Type": "application/json" } })
}

async function postNote(note: Note) {
  return await fetch(`${API_HOST}/notes`, { method: 'POST', body: JSON.stringify(note), headers: { "Content-Type": "application/json" } })
}

async function deleteNote(note: Note) {
  return await fetch(`${API_HOST}/notes/${note.id}`, { method: 'DELETE' })
}

export const App: Component = () => {

  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined);
  const [showCreateNote, setShowCreateNote] = createSignal(false);
  const [currentNote, setCurrentNote] = createSignal<Note | undefined>(undefined);


  const refreshNotes = async () => {

    const res = await fetchNotes()
    const notes = await res.json() as Note[]

    setNotes(notes);
  }

  onMount(async () => {
    await refreshNotes()
  })

  const showModal = (note: Note | undefined) => {
    setCurrentNote(note)
    setShowCreateNote(true)
  }

  const createNote = (note: Note) => {
    const promise = note.id ? putNote(note) : postNote(note)

    promise
      .then((response) => {
        // update state
        if (response.ok) {
          refreshNotes()
        }
      })
      .catch(() => {
        // show error
      })

    setShowCreateNote(false)
  }

  const onDeleteNote = (note: Note): void => {
    deleteNote(note)
      .then((response) => {
        // update state
        if (response.ok) {
          refreshNotes()
        }
      })
      .catch(() => {
        // show error
      })
  }

  const [filter, setFilter] = createSignal("")

  const onFilterChange = (value: string) => {
    setFilter(value)
  }

  return (
    <div class={styles.App}>
      <header class={styles.header}>
      </header>
      <main class={styles.main}>
        <Show when={showCreateNote()}>
          <EditNote note={currentNote()} onDiscard={() => setShowCreateNote(false)} onConfirm={createNote} />
        </Show>
        <section class={styles.notes}>
          <div style={{ display: 'flex', "align-items": 'center', "margin-bottom": '10px' }}>
            <input class={styles['filter-input']} value={filter()} placeholder="Filter..." onChange={(ev) => onFilterChange(ev.target.value)}></input>
            <button onClick={() => setFilter("")} class={styles.button} style={{ "background-color": 'transparent' }}>❌</button>
          </div>
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
        <button onClick={() => showModal(undefined)}>New</button>
      </main>
    </div >
  );
};
