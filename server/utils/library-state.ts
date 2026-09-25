import { promises as fs } from 'fs'
import { join } from 'path'

export interface BorrowRecord {
  bookId: number
  borrowedOn: string
  dueOn: string
}

export interface LibraryState {
  saved: number[]
  borrowed: BorrowRecord[]
}

const LIBRARY_PATH = join(process.cwd(), 'data', 'library-state.json')

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase()
}

export async function readLibraryStateFile(): Promise<Record<string, LibraryState>> {
  try {
    const raw = await fs.readFile(LIBRARY_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export async function writeLibraryStateFile(state: Record<string, LibraryState>): Promise<void> {
  await fs.writeFile(LIBRARY_PATH, JSON.stringify(state, null, 2), 'utf8')
}

export async function readUserLibraryState(email: string): Promise<LibraryState> {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return { saved: [], borrowed: [] }

  const state = await readLibraryStateFile()
  const data = state[normalizedEmail]
  if (!data) return { saved: [], borrowed: [] }

  return {
    saved: Array.isArray(data.saved) ? data.saved : [],
    borrowed: Array.isArray(data.borrowed) ? data.borrowed : []
  }
}

export async function writeUserLibraryState(email: string, value: LibraryState): Promise<LibraryState> {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return { saved: [], borrowed: [] }

  const state = await readLibraryStateFile()
  state[normalizedEmail] = {
    saved: Array.isArray(value.saved) ? value.saved : [],
    borrowed: Array.isArray(value.borrowed) ? value.borrowed : []
  }

  await writeLibraryStateFile(state)
  return state[normalizedEmail]
}
