import { createSignal, type Component, For, onMount, Switch, Match, Show, createEffect } from 'solid-js';

import styles from './App.module.css';

const API_HOST = "http://localhost:9000";

async function fetchNotes() {
  return await fetch(`${API_HOST}/notes`)
}

async function postNote(note: Note) {
  return await fetch(`${API_HOST}/notes`, { method: 'POST', body: JSON.stringify(note), headers: { "Content-Type": "application/json" } })
}

function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

function contentToString(content: Content, indent: string = '', acc: string[] = []): string[] {
  for (const [key, value] of content) {
    let line = indent

    if (key.checkbox) {
      line += key.check ? '[x]' : '[ ]'
    }

    if (key.blur) {
      line += '[!]'
    }

    line += key.line

    acc.push(line)

    contentToString(value, indent + '  ', acc)
  }
  return acc
}

function formatContent(content: Content): HTMLElement {
  const contentElement = document.createElement("div")
  contentElement.style.paddingLeft = '15px'

  for (const [key, value] of content) {
    const keyElement = document.createElement("div")
    keyElement.style.display = 'flex'
    keyElement.style.alignItems = 'center'
    keyElement.style.height = '30px'
    keyElement.style.cursor = 'pointer'

    if (key.checkbox) {
      const check = document.createElement("input")
      check.type = 'checkbox'
      check.checked = !!key.check

      check.onclick = () => {
        // TODO - update the note content! - moliva - 2023/10/09
      }

      keyElement.appendChild(check)
    }

    const keyLabel = document.createElement("p")
    keyLabel.innerText = key.line!
    keyElement.appendChild(keyLabel)

    // add controls for blur
    if (key.blur) {
      keyLabel.className = ` ${styles.blur}`

      const showButton = document.createElement("a")
      showButton.innerHTML = '&#128065'
      showButton.style.paddingLeft = '3px'
      showButton.onclick = (ev) => {
        if (keyLabel.className.includes(styles.blur)) {
          keyLabel.className = keyLabel.className.replaceAll(styles.blur, '')
        } else {
          keyLabel.className = ` ${styles.blur}`
        }
      }
      keyElement.appendChild(showButton)
    }

    const clipLabel = document.createElement("a")
    clipLabel.style.paddingLeft = '3px'
    clipLabel.onclick = (ev) => { copyToClipboard(key.line!) }
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

type LineFormat = {
  line?: string;
  checkbox?: boolean;
  check?: boolean;
  blur?: boolean;
}

type Content = [LineFormat, Content][]

type Note = {
  id: number;
  name: string;
  content: Content;
}

const NoteComponent = (props: { note: Note }) => {
  const { note } = props;
  const [collapsed, setCollapsed] = createSignal(false)

  const toggleNote = () => {
    setCollapsed(!collapsed())
  }

  return <div class={styles.note}>
    <div class={styles['note-header']}>
      <div class={styles['note-label']}>
        <i class={`${styles.button} ${styles.arrow} ${collapsed() ? styles.right : styles.down}`} onClick={toggleNote} />
        <strong class={styles['note-name']}>{note.name}</strong>
      </div>
      <div class={styles['note-controls']}>
        <a class={styles.button} onClick={() => { }}>✏️</a>
        <a class={styles.button} onClick={() => {/*deleteNote(note)*/ }}>❌</a>
        <a class={styles.button} onClick={() => copyToClipboard(contentToString(note.content).join('\n'))}>📋</a>
      </div>
    </div>
    {collapsed() ? null : formatContent(note.content)}
  </div >
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
      .catch((e) => {
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
        <button onClick={showModal}>Create note</button>
      </main>
    </div>
  );
};
