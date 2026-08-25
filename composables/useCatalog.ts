import { books as seedBooks, type Book } from '~/data/books'

const STORAGE_KEY = 'marginalia:catalog'

export interface NewBookInput {
  title: string
  author: string
  category: string
  level: Book['level']
  pages: number
  year: number
  price: number
  format: string
  publisher: string
  language: string
  description: string
  spineColor: string
  exchangeable: boolean
}

function catalogState() {
  return useState<Book[]>('catalog-books', () => JSON.parse(JSON.stringify(seedBooks)))
}

function persist(list: Book[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore storage errors
  }
}

function hydrate(list: ReturnType<typeof catalogState>) {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) list.value = JSON.parse(raw)
  } catch {
    // ignore corrupt storage, fall back to seed data
  }
}

let hydrated = false

const categoryPrefixes: Record<string, string> = {
  Technology: 'QA76', Philosophy: 'B', Science: 'Q', Leadership: 'HD', Language: 'P', History: 'D', Other: 'BF'
}

export function useCatalog() {
  const books = catalogState()

  if (import.meta.client && !hydrated) {
    hydrated = true
    hydrate(books)
  }

  function getById(id: number): Book | undefined {
    return books.value.find(b => b.id === id)
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
      description: input.description,
      longDescription: [input.description],
      tableOfContents: ['Introduction', 'Main Content', 'Conclusion'],
      tags: [input.category.toLowerCase()],
      subjects: [input.category],
      callNumber: `${prefix}${100 + (id * 7) % 800}.${String.fromCharCode(65 + (id % 26))}${id}`,
      level: input.level,
      publisher: input.publisher,
      language: input.language,
      format: input.format,
      isbn: `978-${(1000000000 + id * 7654321).toString().slice(0, 9)}-${id % 10}`,
      fileSizeMb: Math.round((input.pages / 90) * 10) / 10,
      readingTimeHours: Math.round((input.pages / 45) * 10) / 10,
      addedDate: new Date().toISOString().slice(0, 10),
      edition: 1,
      price: input.price,
      exchangeable: input.exchangeable,
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
    books.value = books.value.map(b => (b.id === id ? { ...b, ...patch } : b))
    persist(books.value)
  }

  function deleteBook(id: number) {
    books.value = books.value.filter(b => b.id !== id)
    persist(books.value)
  }

  function resetToSeed() {
    books.value = JSON.parse(JSON.stringify(seedBooks))
    persist(books.value)
  }

  return { books, getById, addBook, updateBook, deleteBook, resetToSeed }
}
