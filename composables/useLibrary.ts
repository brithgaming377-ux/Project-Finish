export interface BorrowRecord {
  bookId: number
  borrowedOn: string
  dueOn: string
}

export interface LibraryState {
  saved: number[]
  borrowed: BorrowRecord[]
  purchased: number[]
}

const STORAGE_KEY = 'marginalia:library'

function libraryState() {
  return useState<LibraryState>('user-library', () => ({ saved: [], borrowed: [], purchased: [] }))
}

function persist(state: LibraryState) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

let hydrated = false

function hydrate(state: ReturnType<typeof libraryState>) {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) state.value = JSON.parse(raw)
  } catch {
    // ignore corrupt storage
  }
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function useLibrary() {
  const state = libraryState()

  if (import.meta.client && !hydrated) {
    hydrated = true
    hydrate(state)
  }

  const isSaved = (id: number) => state.value.saved.includes(id)
  const isBorrowed = (id: number) => state.value.borrowed.some(r => r.bookId === id)
  const isPurchased = (id: number) => state.value.purchased.includes(id)

  function toggleSave(id: number) {
    state.value.saved = isSaved(id)
      ? state.value.saved.filter(x => x !== id)
      : [...state.value.saved, id]
    persist(state.value)
  }

  function borrow(id: number, days = 14) {
    if (isBorrowed(id)) return
    const today = new Date().toISOString().slice(0, 10)
    state.value.borrowed = [...state.value.borrowed, { bookId: id, borrowedOn: today, dueOn: addDays(today, days) }]
    persist(state.value)
  }

  function returnBook(id: number) {
    state.value.borrowed = state.value.borrowed.filter(r => r.bookId !== id)
    persist(state.value)
  }

  function purchase(id: number) {
    if (isPurchased(id)) return
    state.value.purchased = [...state.value.purchased, id]
    persist(state.value)
  }

  /** Exchange: return one borrowed book and immediately borrow another in its place. */
  function exchange(currentId: number, newId: number) {
    returnBook(currentId)
    borrow(newId)
  }

  return { state, isSaved, isBorrowed, isPurchased, toggleSave, borrow, returnBook, purchase, exchange }
}
