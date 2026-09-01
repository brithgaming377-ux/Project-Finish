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
  coverUrl?: string
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
  fileUrl?: string
  isbn: string
  fileSizeMb: number
  readingTimeHours: number
  addedDate: string
  edition: number
  price: number
  exchangeable: boolean
  requiresBorrow: boolean
  rating: number
  ratingsCount: number
  reviews: Review[]
  availability: Availability
  pdfUrl?: string
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

const subjectCovers: Record<string, string> = {
  Technology: '',
  Philosophy: '',
  Science: '',
  Leadership: '',
  Language: '',
  History: '',
  Other: ''
}

export function getCoverUrl(category: string): string {
  return subjectCovers[category] || subjectCovers.Other
}

// `books.json` is the single catalog source. Local covers keep the UI usable offline.
export const books = (raw as Book[]).map((book) => ({
  ...book,
  coverUrl: book.coverUrl || getCoverUrl(book.category),
  requiresBorrow: book.requiresBorrow ?? false,
  fileUrl: book.fileUrl || ''
}))

export function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : String(year)
}
