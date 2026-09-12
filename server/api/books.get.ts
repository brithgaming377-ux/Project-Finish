import { readBooks } from '~/server/utils/books'

export default defineEventHandler(async () => {
  const books = await readBooks()
  return books
})
