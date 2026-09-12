import { readBooks, writeBooks } from '~/server/utils/books'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid book id' })
  }

  const books = await readBooks()
  const index = books.findIndex((b) => b.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Book not found' })
  }

  const deleted = books.splice(index, 1)[0]
  await writeBooks(books)
  return { ok: true, book: deleted }
})
