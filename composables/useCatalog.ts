import { books as seedBooks, getCoverUrl, normalizeFileUrl, type Book } from '~/data/books'

export interface DeletedBook {
  book: Book
  deletedAt: string
}

export interface NewBookInput {
  title: string
  author: string
  category: string
  level: Book['level']
  pages: number
  year: number
  format: string
  publisher: string
  language: string
  description: string
  spineColor: string
  coverUrl?: string
  fileUrl?: string
  exchangeable: boolean
  requiresBorrow: boolean
}

function normalize(book: Book): Book {
  return {
    ...book,
    coverUrl: book.coverUrl || getCoverUrl(book.category),
    requiresBorrow: book.requiresBorrow ?? false,
    fileUrl: normalizeFileUrl(book.fileUrl)
  }
}

function catalogState() {
  return useState<Book[]>('catalog-books', () => JSON.parse(JSON.stringify(seedBooks)))
}

function deletedBooksState() {
  return useState<DeletedBook[]>('deleted-catalog-books', () => [])
}

const STORAGE_KEY = 'marginalia:catalog'

const categoryPrefixes: Record<string, string> = {
  Technology: 'QA76',
  Philosophy: 'B',
  Science: 'Q',
  Leadership: 'HD',
  Language: 'P',
  History: 'D',
  Other: 'BF'
}

let clientHydrated = false
let clientHydrationPromise: Promise<void> | null = null
let catalogRefreshTimer: ReturnType<typeof setInterval> | undefined

function isBookArray(value: unknown): value is Book[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'id' in value[0] && 'title' in value[0]
}

function readStoredBooks(raw: string): Book[] | null {
  try {
    const stored = JSON.parse(raw)
    if (isBookArray(stored)) {
      return stored.map((book) => normalize(book))
    }
    if (stored && Array.isArray(stored.books)) {
      return stored.books.map((book) => normalize(book))
    }
  } catch {
    // ignore
  }
  return null
}

function persistClientBooks(books: Book[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
  } catch {
    // ignore
  }
}

export function useCatalog() {
  const books = catalogState()
  const deletedBooks = deletedBooksState()

  async function refresh() {
    if (!import.meta.client) return
    const remote = await $fetch<Book[]>('/api/books')
    books.value = remote.map((book) => normalize(book))
    persistClientBooks(books.value)
  }

  if (import.meta.client && !clientHydrated) {
    clientHydrated = true
    clientHydrationPromise = (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const remote = await $fetch<Book[]>('/api/books').catch(() => null)
        if (remote) {
          books.value = remote.map((book) => normalize(book))
          persistClientBooks(books.value)
          return
        }
        if (raw) {
          const storedBooks = readStoredBooks(raw)
          if (storedBooks) {
            books.value = storedBooks
          }
        }
      } catch {
        // ignore
      }
    })()
    // The catalog is shared by every administrator using this server.
    catalogRefreshTimer = setInterval(() => refresh().catch(() => undefined), 10_000)
  }

  if (import.meta.server) {
    if (!books.value.length) {
      books.value = JSON.parse(JSON.stringify(seedBooks))
    }
    ;(async () => {
      try {
        const { readBooks } = await import('~/server/utils/books')
        const fileBooks = await readBooks()
        if (fileBooks.length) {
          books.value = fileBooks.map((book) => normalize(book))
        }
      } catch {
        // keep seed data if file read fails
      }
    })()
  }

  async function waitForHydration() {
    if (import.meta.client && clientHydrationPromise) {
      await clientHydrationPromise
    }
  }

  function getById(id: number): Book | undefined {
    if (import.meta.server && !books.value.length) {
      books.value = JSON.parse(JSON.stringify(seedBooks))
    }
    return books.value.find((b) => b.id === id)
  }

  function getAvailableCopies(book: Book): number {
    return Math.max(0, book.availability.digitalCopies - book.availability.checkedOut)
  }

  function nextId(): number {
    return books.value.reduce((max, b) => Math.max(max, b.id), 0) + 1
  }

  async function addBook(input: NewBookInput): Promise<Book> {
    await waitForHydration()
    const id = nextId()
    const prefix = categoryPrefixes[input.category] || 'Z'
    const book: Book = {
      id,
      title: input.title,
      author: input.author,
      category: input.category,
      pages: input.pages,
      year: input.year,
      spineColor: input.spineColor,
      coverUrl: input.coverUrl || getCoverUrl(input.category),
      description: input.description,
      longDescription: [input.description],
      tableOfContents: ['Introduction', 'Main Content', 'Conclusion'],
      tags: [input.category.toLowerCase()],
      subjects: [input.category],
      callNumber: `${prefix}${100 + ((id * 7) % 800)}.${String.fromCharCode(65 + (id % 26))}${id}`,
      level: input.level,
      publisher: input.publisher,
      language: input.language,
      format: input.format,
      fileUrl: input.fileUrl,
      isbn: `978-${(1000000000 + id * 7654321).toString().slice(0, 9)}-${id % 10}`,
      fileSizeMb: Math.round((input.pages / 90) * 10) / 10,
      readingTimeHours: Math.round((input.pages / 45) * 10) / 10,
      addedDate: new Date().toISOString().slice(0, 10),
      edition: 1,
      exchangeable: input.exchangeable,
      requiresBorrow: input.requiresBorrow,
      rating: 4,
      ratingsCount: 0,
      reviews: [],
      availability: { digitalCopies: 5, checkedOut: 0 }
    }

    let saved = book
    if (import.meta.client) {
      try {
        saved = await $fetch<Book>('/api/books', {
          method: 'POST',
          body: book
        })
      } catch {
        // keep local book if API fails
      }
    } else {
      const { writeBooks } = await import('~/server/utils/books')
      await writeBooks([...books.value, book])
      saved = book
    }

    const existing = books.value.find((b) => b.id === saved.id)
    if (existing) {
      books.value = books.value.map((b) => (b.id === saved.id ? saved : b))
    } else {
      books.value = [...books.value, saved]
    }
    persistClientBooks(books.value)
    return saved
  }

  async function updateBook(id: number, patch: Partial<Book>) {
    await waitForHydration()
    const updated = books.value.map((b) => (b.id === id ? { ...b, ...patch } : b))

    if (import.meta.client) {
      try {
        const saved = await $fetch<Book>(`/api/books/${id}`, {
          method: 'PUT',
          body: { ...patch, id }
        })
        books.value = books.value.map((b) => (b.id === id ? saved : b))
      } catch {
        books.value = updated
      }
    } else {
      const { writeBooks } = await import('~/server/utils/books')
      await writeBooks(updated)
      books.value = updated
    }

    persistClientBooks(books.value)
  }

  async function deleteBook(id: number): Promise<Book | undefined> {
    await waitForHydration()
    const deleted = books.value.find((b) => b.id === id)
    const remaining = books.value.filter((b) => b.id !== id)

    if (import.meta.client) {
      await $fetch(`/api/books/${id}`, { method: 'DELETE' })
    } else {
      const { writeBooks } = await import('~/server/utils/books')
      await writeBooks(remaining)
    }

    books.value = remaining
    persistClientBooks(books.value)
    if (deleted) {
      deletedBooks.value = [
        { book: deleted, deletedAt: new Date().toISOString() },
        ...deletedBooks.value.filter((item) => item.book.id !== deleted.id)
      ]
    }
    return deleted
  }

  async function restoreBook(book: Book) {
    await waitForHydration()
    if (books.value.some((current) => current.id === book.id)) return
    const restored = [...books.value, book].sort((a, b) => a.id - b.id)

    if (import.meta.client) {
      await $fetch('/api/books', {
        method: 'POST',
        body: book
      })
    } else {
      const { writeBooks } = await import('~/server/utils/books')
      await writeBooks(restored)
    }

    books.value = restored
    persistClientBooks(books.value)
    deletedBooks.value = deletedBooks.value.filter((item) => item.book.id !== book.id)
  }

  async function importBooks(incoming: Book[]) {
    await waitForHydration()
    const valid = incoming.filter(
      (book) => book && typeof book.title === 'string' && typeof book.id === 'number'
    )
    const merged = [...books.value]
    valid.forEach((book) => {
      const position = merged.findIndex((current) => current.id === book.id)
      const normalized = normalize(book)
      if (position >= 0) merged[position] = normalized
      else merged.push(normalized)
    })

    if (import.meta.client) {
      for (const book of merged) {
        const exists = books.value.find((b) => b.id === book.id)
        if (exists) {
          await $fetch(`/api/books/${book.id}`, { method: 'PUT', body: book })
        } else {
          await $fetch('/api/books', { method: 'POST', body: book })
        }
      }
    } else {
      const { writeBooks } = await import('~/server/utils/books')
      await writeBooks(merged)
    }

    books.value = merged
    persistClientBooks(books.value)
    return valid.length
  }

  return {
    books,
    deletedBooks,
    refresh,
    waitForHydration,
    getById,
    getAvailableCopies,
    addBook,
    updateBook,
    deleteBook,
    restoreBook,
    importBooks
  }
}
