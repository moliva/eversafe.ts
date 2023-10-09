import { createSignal, type Component, For, onMount, Switch, Match, Show } from 'solid-js';

import styles from './App.module.css';

const API_HOST = "http://localhost:9000";

async function fetchNotes() {
  return await fetch(`${API_HOST}/notes`)
}

async function postNote(note: Note) {
  return await fetch(`${API_HOST}/notes`, { method: 'POST', body: JSON.stringify(note), headers: { "Content-Type": "application/json" } })
}

function formatContent(content: Content): HTMLElement {
  const contentElement = document.createElement("div")
  for (const [key, value] of content) {
    const keyElement = document.createElement("div")
    keyElement.style.display = 'flex'
    keyElement.style.alignItems = 'center'
    keyElement.style.height = '30px'
    keyElement.style.cursor = 'pointer'

    const keyLabel = document.createElement("p")
    keyLabel.innerText = key
    // keyLabel.className = ` ${styles.blur}`
    keyElement.appendChild(keyLabel)

    const clipLabel = document.createElement("a")
    clipLabel.style.paddingLeft = '3px'
    clipLabel.onclick = (ev) => { navigator.clipboard.writeText(key) }
    clipLabel.innerHTML = '&#x1f4cb'

    keyElement.appendChild(clipLabel)

    contentElement.appendChild(keyElement)

    const valueElement = formatContent(value)
    contentElement.appendChild(valueElement)
    valueElement.style.paddingLeft = '10px';
  }

  return contentElement
}

function parseContent(value: string): Content {
  const content: Content = []

  const lines = value.split("\n")
  for (let line of lines) {
    let at = content
    while (line.startsWith('  ')) {
      at = at[at.length - 1]![1]
      line = line.substring(2)
    }

    if (line.length)
      at.push([line, []])
  }

  return content
}

type Content = [string, Content][]

type Note = {
  id: number;
  name: string;
  content: Content;
}

const NoteComponent = (props: { note: Note }) => {
  const { note } = props;

  return <div class={styles.note}>
    <strong>{note.name}</strong>
    {formatContent(note.content)}
  </div>
}

export const App: Component = () => {

  const [notes, setNotes] = createSignal<Note[] | undefined>(undefined);
  const [showCreateNote, setShowCreateNote] = createSignal(false);

  let newNoteName, newNoteContent

  const refreshNotes = async () => {

    const res = await fetchNotes()
    const notes = await res.json()

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
      .catch((e) => {
        // show error
      })

    setShowCreateNote(false)
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
              <div class={styles.controls}>
                <button class={styles.primary} onClick={createNote}>Create</button>
                <button onClick={() => setShowCreateNote(false)}>Discard</button>
              </div>
            </div>
          </div>
        </Show>
        <section class={styles.notes}>
          <h2>Notes</h2>
          <div id="notes">
            <Switch fallback={<p>Loading...</p>}>
              <Match when={typeof notes() === 'object'}>
                <For each={notes()}>{(note) => <NoteComponent note={note}></NoteComponent>}</For>
              </Match>
            </Switch>
          </div>
        </section>
        <button onClick={showModal}>Create note</button>
      </main>
    </div>
  );
};

