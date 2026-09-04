import { books as seedBooks, getCoverUrl, type Book } from '~/data/books'

const STORAGE_KEY = 'marginalia:catalog'
const DELETED_STORAGE_KEY = 'marginalia:deleted-books'
const SOURCE_SIGNATURE = JSON.stringify(seedBooks)

export interface DeletedBook {
  book: Book
  deletedAt: string
}

interface StoredCatalog {
  sourceSignature: string
  books: Book[]
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

function catalogState() {
  return useState<Book[]>('catalog-books', () => JSON.parse(JSON.stringify(seedBooks)))
}

function deletedBooksState() {
  return useState<DeletedBook[]>('deleted-catalog-books', () => [])
}

function persist(list: Book[]) {
  if (!import.meta.client) return
  try {
    const stored: StoredCatalog = { sourceSignature: SOURCE_SIGNATURE, books: list }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // ignore storage errors
  }
}

function persistDeleted(list: DeletedBook[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore storage errors
  }
}

function normalizeBook(book: Book): Book {
  const seedBook = seedBooks.find((item) => item.id === book.id)
  const defaultCover = getCoverUrl(book.category)
  const savedCoverIsDefault = !book.coverUrl || book.coverUrl === defaultCover
  const seedCover = seedBook?.coverUrl || getCoverUrl(seedBook?.category || book.category)

  // Pick up cover URLs added to books.json, but keep an image chosen in Admin.
  const coverUrl = savedCoverIsDefault ? seedCover : book.coverUrl

  return { ...book, coverUrl }
}

function cloneSeedBooks(): Book[] {
  return JSON.parse(JSON.stringify(seedBooks)) as Book[]
}

function isStoredCatalog(value: unknown): value is StoredCatalog {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'sourceSignature' in value &&
      'books' in value &&
      typeof (value as StoredCatalog).sourceSignature === 'string' &&
      Array.isArray((value as StoredCatalog).books)
  )
}

function hydrate(list: ReturnType<typeof catalogState>) {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const stored: unknown = JSON.parse(raw)
    if (!isStoredCatalog(stored)) {
      // Old browser data used a different shape, so refresh it from books.json.
      list.value = cloneSeedBooks()
      persist(list.value)
      return
    }

    if (stored.sourceSignature === SOURCE_SIGNATURE) {
      list.value = stored.books.map(normalizeBook)
      return
    }

    // books.json changed: use its latest records and retain only Admin-added books.
    const seedIds = new Set(seedBooks.map((book) => book.id))
    const adminAddedBooks = stored.books.filter((book) => !seedIds.has(book.id)).map(normalizeBook)
    list.value = [...cloneSeedBooks(), ...adminAddedBooks].sort((a, b) => a.id - b.id)
    persist(list.value)
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
}

function hydrateDeleted(list: ReturnType<typeof deletedBooksState>) {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY)
    if (raw) list.value = JSON.parse(raw) as DeletedBook[]
  } catch {
    // ignore corrupt storage
  }
}

let hydrated = false
let deletedHydrated = false

const categoryPrefixes: Record<string, string> = {
  Technology: 'QA76',
  Philosophy: 'B',
  Science: 'Q',
  Leadership: 'HD',
  Language: 'P',
  History: 'D',
  Other: 'BF'
}

export function useCatalog() {
  const books = catalogState()
  const deletedBooks = deletedBooksState()

  if (import.meta.client && !hydrated) {
    hydrated = true
    hydrate(books)
  }
  if (import.meta.client && !deletedHydrated) {
    deletedHydrated = true
    hydrateDeleted(deletedBooks)
  }

  function getById(id: number): Book | undefined {
    return books.value.find((b) => b.id === id)
  }

  function getAvailableCopies(book: Book): number {
    return Math.max(0, book.availability.digitalCopies - book.availability.checkedOut)
  }

  function nextId(): number {
    return books.value.reduce((max, b) => Math.max(max, b.id), 0) + 1
  }

  function addBook(input: NewBookInput): Book {
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
    books.value = [...books.value, book]
    persist(books.value)
    return book
  }

  function updateBook(id: number, patch: Partial<Book>) {
    books.value = books.value.map((b) => (b.id === id ? { ...b, ...patch } : b))
    persist(books.value)
  }

  function deleteBook(id: number): Book | undefined {
    const deleted = books.value.find((b) => b.id === id)
    books.value = books.value.filter((b) => b.id !== id)
    persist(books.value)
    if (deleted) {
      deletedBooks.value = [
        { book: deleted, deletedAt: new Date().toISOString() },
        ...deletedBooks.value.filter((item) => item.book.id !== deleted.id)
      ]
      persistDeleted(deletedBooks.value)
    }
    return deleted
  }

  function restoreBook(book: Book) {
    if (books.value.some((current) => current.id === book.id)) return
    books.value = [...books.value, book].sort((a, b) => a.id - b.id)
    persist(books.value)
    deletedBooks.value = deletedBooks.value.filter((item) => item.book.id !== book.id)
    persistDeleted(deletedBooks.value)
  }

  function importBooks(incoming: Book[]) {
    const valid = incoming.filter(
      (book) => book && typeof book.title === 'string' && typeof book.id === 'number'
    )
    const merged = [...books.value]
    valid.forEach((book) => {
      const position = merged.findIndex((current) => current.id === book.id)
      const normalized = normalizeBook(book)
      if (position >= 0) merged[position] = normalized
      else merged.push(normalized)
    })
    books.value = merged
    persist(books.value)
    return valid.length
  }

  return {
    books,
    deletedBooks,
    getById,
    getAvailableCopies,
    addBook,
    updateBook,
    deleteBook,
    restoreBook,
    importBooks
  }
}
