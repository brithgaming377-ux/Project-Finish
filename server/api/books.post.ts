import { readBooks, writeBooks } from '~/server/utils/books'
import type { Book } from '~/data/books'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || typeof body !== 'object' || !body.title) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book data' })
  }

  const books = await readBooks()
  const maxId = books.reduce((max, b) => Math.max(max, b.id), 0)
  const newBook: Book = {
    id: maxId + 1,
    title: String(body.title),
    author: String(body.author || ''),
    category: String(body.category || 'Other'),
    pages: Number(body.pages || 200),
    year: Number(body.year || new Date().getFullYear()),
    spineColor: String(body.spineColor || '#1B1F3B'),
    coverUrl: body.coverUrl === undefined ? undefined : String(body.coverUrl),
    description: String(body.description || ''),
    longDescription: [String(body.description || '')],
    tableOfContents: ['Introduction', 'Main Content', 'Conclusion'],
    tags: [String(body.category || 'other').toLowerCase()],
    subjects: [String(body.category || 'Other')],
    callNumber: String(body.callNumber || ''),
    level: ['Beginner', 'Intermediate', 'Advanced'].includes(body.level) ? body.level : 'Beginner',
    publisher: String(body.publisher || ''),
    language: String(body.language || 'English'),
    format: ['PDF', 'EPUB'].includes(body.format) ? body.format : 'PDF',
    fileUrl: body.fileUrl === undefined ? undefined : String(body.fileUrl),
    isbn: String(body.isbn || ''),
    fileSizeMb: Number(body.fileSizeMb || 0),
    readingTimeHours: Number(body.readingTimeHours || 0),
    addedDate: new Date().toISOString().slice(0, 10),
    edition: Number(body.edition || 1),
    exchangeable: body.exchangeable !== false,
    requiresBorrow: body.requiresBorrow === true,
    rating: Number(body.rating || 0),
    ratingsCount: Number(body.ratingsCount || 0),
    reviews: Array.isArray(body.reviews) ? body.reviews : [],
    availability: {
      digitalCopies: Number(body.availability?.digitalCopies || 1),
      checkedOut: Number(body.availability?.checkedOut || 0)
    }
  }

  books.push(newBook)
  await writeBooks(books)
  return newBook
})
