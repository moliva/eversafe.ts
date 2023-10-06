import { createSignal, type Component, For, onMount, Switch, Match, Show } from 'solid-js';
import styles from './App.module.css';

function formatContent(content: object): HTMLElement {
  const contentElement = document.createElement("div")
  for (const [key, value] of Object.entries(content)) {
    const keyElement = document.createElement("p")
    keyElement.innerText = key
    contentElement.appendChild(keyElement)

    if (value === null) {
      // do nothing
    } else if (typeof value === 'object') {
      const valueElement = formatContent(value)
      contentElement.appendChild(valueElement)
      valueElement.style.paddingLeft = '10px';
    }
  }

  return contentElement
}

function parseContent(value: string): object {
  const content = {}

  const lines = value.split("\n")
  for (const line of lines) {
    if (line.startsWith('  ')) {

    }
  }

  return content
}


type Note = {
  id: number;
  name: string;
  content: object;
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
  const [showCreateNote, setShowCreateNote] = createSignal(true);

  let newNoteName, newNoteContent

  onMount(async () => {
    // const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
    // setPhotos(await res.json());
    const notes = [
      { id: 1, name: 'Groceries', content: { 'banana': null, 'manzana': null } },
      {
        id: 2, name: 'Apple pie', content: {
          'ingredients': { 'apple': null, 'flour': null, 'butter': null, 'sugar': null },
          'steps': { '1- make dough': null, '2- prepare filling': null, '3- ???': null, '4- profit!': { 'yes': null, 'i love it': null } }
        }
      },
    ];
    setNotes(notes);
  });

  const showModal = () => { setShowCreateNote(true); };
  const createNote = () => {
    console.log(newNoteName!.value)
    console.log(newNoteContent!.value)
    const newNote = {
      name: newNoteName!.value,
      content: parseContent(newNoteContent!.value)
    }
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

