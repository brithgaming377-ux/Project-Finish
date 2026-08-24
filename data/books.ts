import raw from './books.json'

export interface Review {
  name: string
  rating: number
  date: string
  comment: string
}

export interface Availability {
  digitalCopies: number
  checkedOut: number
}

export interface Book {
  id: number
  title: string
  author: string
  category: string
  pages: number
  year: number
  spineColor: string
  description: string
  longDescription: string[]
  tableOfContents: string[]
  tags: string[]
  subjects: string[]
  callNumber: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  publisher: string
  language: string
  format: string
  isbn: string
  fileSizeMb: number
  readingTimeHours: number
  addedDate: string
  edition: number
  rating: number
  ratingsCount: number
  reviews: Review[]
  availability: Availability
}

export const categories = [
  'Technology',
  'Philosophy',
  'Science',
  'Leadership',
  'Language',
  'History',
  'Other'
] as const

export const books = raw as Book[]

export function getBookById(id: number): Book | undefined {
  return books.find(b => b.id === id)
}

export function getRelatedBooks(book: Book, limit = 4): Book[] {
  return books.filter(b => b.category === book.category && b.id !== book.id).slice(0, limit)
}

export function availableCopies(book: Book): number {
  return Math.max(book.availability.digitalCopies - book.availability.checkedOut, 0)
}

export function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : String(year)
}
