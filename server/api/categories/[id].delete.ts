import { readCategories, writeCategories } from '~/server/utils/categories'
import { readBooks } from '~/server/utils/books'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const categories = await readCategories()
  const category = categories.find((item) => item.id === id)
  if (!category) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  const books = await readBooks()
  if (books.some((book) => book.category === category.name)) throw createError({ statusCode: 409, statusMessage: 'Move or delete books in this category first' })
  await writeCategories(categories.filter((item) => item.id !== id))
  return { ok: true }
})
