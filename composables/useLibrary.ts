import { getLibraryStorageKey, migrateLegacyLibraryState } from '~/utils/library-storage'

export interface BorrowRecord {
  bookId: number
  borrowedOn: string
  dueOn: string
}

export interface LibraryState {
  saved: number[]
  borrowed: BorrowRecord[]
}

async function loadLibraryState(email: string): Promise<LibraryState> {
  if (!import.meta.client || !email) return { saved: [], borrowed: [] }

  try {
    const data = await $fetch<{ saved?: number[]; borrowed?: BorrowRecord[] }>(`/api/library?email=${encodeURIComponent(email)}`)
    return {
      saved: Array.isArray(data.saved) ? data.saved : [],
      borrowed: Array.isArray(data.borrowed) ? data.borrowed : []
    }
  } catch {
    return { saved: [], borrowed: [] }
  }
}

async function persist(state: LibraryState, email: string) {
  if (!import.meta.client || !email) return

  try {
    await $fetch('/api/library', {
      method: 'POST',
      body: {
        email,
        saved: state.saved,
        borrowed: state.borrowed
      }
    })
  } catch {
    // ignore server sync failure
  }
}

function libraryState(email: string) {
  return useState<LibraryState>(`user-library:${email || 'guest'}`, () => ({ saved: [], borrowed: [] }))
}

let hydrated = false

async function hydrate(state: ReturnType<typeof libraryState>, email: string) {
  if (!import.meta.client || !email) return

  const nextState = await loadLibraryState(email)
  state.value = nextState
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function useLibrary() {
  const { user } = useAuth()

  const currentEmail = computed(() => user.value?.email?.trim().toLowerCase() || '')
  const state = libraryState(currentEmail.value)

  if (import.meta.client && currentEmail.value) {
    hydrate(state, currentEmail.value)
  }

  watch(currentEmail, async (email) => {
    if (!email) {
      state.value = { saved: [], borrowed: [] }
      return
    }

    state.value = await loadLibraryState(email)
  }, { immediate: true })

  const isSaved = (id: number) => state.value.saved.includes(id)
  const isBorrowed = (id: number) => state.value.borrowed.some((r) => r.bookId === id)

  async function syncState(nextState: LibraryState) {
    state.value = nextState
    if (currentEmail.value) await persist(nextState, currentEmail.value)
  }

  function toggleSave(id: number) {
    const nextState = {
      ...state.value,
      saved: isSaved(id)
        ? state.value.saved.filter((x) => x !== id)
        : [...state.value.saved, id]
    }
    syncState(nextState)
  }

  function borrow(id: number, days = 14) {
    if (isBorrowed(id)) return
    const today = new Date().toISOString().slice(0, 10)
    const nextState = {
      ...state.value,
      borrowed: [
        ...state.value.borrowed,
        { bookId: id, borrowedOn: today, dueOn: addDays(today, days) }
      ]
    }
    syncState(nextState)
  }

  function returnBook(id: number) {
    const nextState = {
      ...state.value,
      borrowed: state.value.borrowed.filter((r) => r.bookId !== id)
    }
    syncState(nextState)
  }

  /** Exchange: return one borrowed book and immediately borrow another in its place. */
  function exchange(currentId: number, newId: number) {
    returnBook(currentId)
    borrow(newId)
  }

  return {
    state,
    isSaved,
    isBorrowed,
    toggleSave,
    borrow,
    returnBook,
    exchange
  }
}
