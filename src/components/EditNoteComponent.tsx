import { Note } from "../types";

import { contentToString, parseContent } from "../utils";

import styles from '../App.module.css';

export type EditNoteProps = {
  note: Note | undefined;
  onConfirm(note: Note): void;
  onDiscard(): void;
}

export const EditNote = (props: EditNoteProps) => {
  const { note } = props

  let newNoteName, newNoteContent

  const newNote = () => ({
    id: note?.id,
    name: newNoteName!.value,
    content: parseContent(newNoteContent!.value)
  } as Note)

  return <div class={styles.modal}>
    <div class={styles["modal-content"]}>
      <input ref={newNoteName} id="new-note-name" class={styles['modal-name']} placeholder="Note name" value={note?.name ?? ''}></input>
      <textarea ref={newNoteContent} id="new-note-content" placeholder="Stuff..." rows="10">{note ? contentToString(note?.content).join('\n') : ''}</textarea>
      <div class={styles['modal-controls']}>
        <button class={styles.primary} onClick={() => props.onConfirm(newNote())}>{note ? 'Edit' : 'Create'}</button>
        <button onClick={props.onDiscard}>Discard</button>
      </div>
    </div>
  </div>
}

