import { authentifiedFetch, setApiHost } from '@moliva/auth.ts'

import { Identity, Note } from './types'

export const API_HOST = import.meta.env.VITE_API_URL
setApiHost(API_HOST)

export async function fetchTags(identity: Identity): Promise<string[]> {
  const res = await authentifiedFetch(`${API_HOST}/tags`)

  return (await res.json()) as string[]
}

export async function fetchNote(identity: Identity, note: Note): Promise<Note> {
  const res = await authentifiedFetch(`${API_HOST}/notes/${note.id}`)

  return (await res.json()) as Note
}

export async function fetchNotes(identity: Identity): Promise<Note[]> {
  const res = await authentifiedFetch(`${API_HOST}/notes`)

  const notes = (await res.json()) as Note[]

  return notes
}

export async function putNote(note: Note, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/notes/${note.id}`, {
    method: 'PUT',
    body: JSON.stringify(note),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postNote(note: Note, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/notes`, {
    method: 'POST',
    body: JSON.stringify(note),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteNote(note: Note, identity: Identity) {
  const response = await authentifiedFetch(`${API_HOST}/notes/${note.id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}
