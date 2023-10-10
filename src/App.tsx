import { createSignal, type Component, For, onMount, Switch, Match, Show } from 'solid-js';

import { NoteComponent } from './NoteComponent';
import { Content, LineFormat, Note } from './types';

import styles from './App.module.css';

const API_HOST = "http://localhost:9000";

async function fetchNotes() {
  return await fetch(`${API_HOST}/notes`)
}

async function postNote(note: Note) {
  return await fetch(`${API_HOST}/notes`, { method: 'POST', body: JSON.stringify(note), headers: { "Content-Type": "application/json" } })
}

function parseContent(value: string): Content {
  const content: Content = []

  const lines = value.split("\n")
  for (let line of lines) {
    // check parent node of current line
    let at = content
    while (line.startsWith('  ')) {
      at = at[at.length - 1]![1]
      line = line.substring(2)
    }

    const value: LineFormat = {}

    // check format
    // 1- checkbox
    if (line.startsWith('[ ]')) {
      value.checkbox = true
      value.check = false
      line = line.substring(3)
    } else if (line.startsWith('[x]')) {
      value.checkbox = true
      value.check = true
      line = line.substring(3)
    }

    // 2- blur
    if (line.startsWith('[!]')) {
      value.blur = true
      line = line.substring(3)
    }

    value.line = line

    if (line.length)
      at.push([value, []])
  }

  return content
}

export const App: Component = () => {

  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined);
  const [showCreateNote, setShowCreateNote] = createSignal(false);

  let newNoteName, newNoteContent

  const refreshNotes = async () => {

    const res = await fetchNotes()
    const notes = await res.json() as Note[]

    setNotes(notes);
  }

  onMount(async () => {
    await refreshNotes()
  });

  const showModal = () => { setShowCreateNote(true); };
  const createNote = () => {
    const newNote = {
      name: newNoteName!.value,
      content: parseContent(newNoteContent!.value)
    } as Note

    postNote(newNote)
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
          <div class={styles.modal}>
            <div class={styles["modal-content"]}>
              <input ref={newNoteName} id="new-note-name" placeholder="Note name"></input>
              <textarea ref={newNoteContent} id="new-note-content" placeholder="Stuff..." rows="10"></textarea>
              <div class={styles['modal-controls']}>
                <button class={styles.primary} onClick={createNote}>Create</button>
                <button onClick={() => setShowCreateNote(false)}>Discard</button>
              </div>
            </div>
          </div>
        </Show>
        <section class={styles.notes}>
          <div style={{ display: 'flex', "align-items": 'center', "margin-bottom": '10px' }}>
            <input class={styles['filter-input']} value={filter()} placeholder="Filter..." onChange={(ev) => onFilterChange(ev.target.value)}></input>
            <button onClick={() => setFilter("")} class={styles.button} style={{ "background-color": 'transparent' }}>❌</button>
          </div>
          <div id="notes">
            <Switch fallback={<p>Loading...</p>}>
              <Match when={typeof notes() === 'object'}>
                <For each={notes()!.filter((note) => note.name.toLowerCase().includes(filter().toLowerCase()))}>{(note) => <NoteComponent note={note}></NoteComponent>}</For>
              </Match>
            </Switch>
          </div>
        </section>
        <button onClick={showModal}>New</button>
      </main>
    </div>
  );
};
