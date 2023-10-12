import { Note } from "./types";

export const API_HOST = "http://localhost:9000";

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API_HOST}/notes`)
  const notes = await res.json() as Note[]

  return notes
}

export async function putNote(note: Note): Promise<void> {
  const response = await fetch(`${API_HOST}/notes/${note.id}`, { method: 'PUT', body: JSON.stringify(note), headers: { "Content-Type": "application/json" } })
  if (!response.ok) {
    throw response
  }
}

export async function postNote(note: Note): Promise<void> {
  const response = await fetch(`${API_HOST}/notes`, { method: 'POST', body: JSON.stringify(note), headers: { "Content-Type": "application/json" } })
  if (!response.ok) {
    throw response
  }
}

export async function deleteNote(note: Note) {
  const response = await fetch(`${API_HOST}/notes/${note.id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}
