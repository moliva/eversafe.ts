import type { Component } from 'solid-js';

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

const App: Component = () => {
  const notes = [
    { id: 1, name: 'Groceries', content: { 'banana': null, 'manzana': null } },
    {
      id: 2, name: 'Apple pie', content: {
        'ingredients': { 'apple': null, 'flour': null, 'butter': null, 'sugar': null },
        'steps': { '1- make dough': null, '2- prepare filling': null, '3- ???': null, '4- profit!': { 'yes': null, 'i love it': null } }
      }
    },
  ]

  return (
    <div class={styles.App}>
      <header class={styles.header}>
      </header>
      <main class={styles.main}>
        <section class={styles.notes}>
          <h2>Notes</h2>
          <div id="notes">
            {notes.map(note => (<div class={styles.note}>
              <strong>{note.name}</strong>
              <div>{formatContent(note.content)}</div>

            </div>))}
          </div>
        </section>
        <button>Create note</button>
      </main>
    </div>
  );
};

export default App;
