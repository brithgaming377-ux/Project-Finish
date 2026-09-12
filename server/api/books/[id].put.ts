import { readBooks, writeBooks } from '~/server/utils/books'
import type { Book } from '~/data/books'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book id' })
  }

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book data' })
  }

  const books = await readBooks()
  const index = books.findIndex((b) => b.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Book not found' })
  }

  const updated: Book = { ...books[index], ...body, id }
  books[index] = updated
  await writeBooks(books)
  return updated
})
