import raw from './books.json'
import { extraBooks } from './extraBooks'

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
  isbn: string
  fileSizeMb: number
  readingTimeHours: number
  addedDate: string
  edition: number
  price: number
  exchangeable: boolean
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

const subjectCovers: Record<string, string> = {
  Technology: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=82',
  Philosophy: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=82',
  Science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=82',
  Leadership: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=82',
  Language: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=82',
  History: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=900&q=82',
  Other: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=82'
}

export const books = ([...raw, ...extraBooks] as Book[]).map(book => ({
  ...book,
  coverUrl: book.coverUrl || subjectCovers[book.category] || subjectCovers.Other
}))

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
