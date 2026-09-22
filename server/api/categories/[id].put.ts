import { readCategories, writeCategories } from '~/server/utils/categories'
import { readBooks, writeBooks } from '~/server/utils/books'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const name = body && typeof body === 'object' ? String(body.name || '').trim() : ''
  const oldname = body && typeof body === 'object' ? String(body.oldName || '').trim() : ''
  if (!id || !name) throw createError({ statusCode: 400, statusMessage: 'Category name is required' })
  const categories = await readCategories()
  let category = categories.find((item) => item.id === id)
  if (!category && oldname) {
    category = { id, name: oldname, createdAt: '' }
    categories.push(category)
  }
  if (!category) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  if (categories.some((item) => item.id !== id && item.name.toLowerCase() === name.toLowerCase())) throw createError({ statusCode: 409, statusMessage: 'Category already exists' })
  const oldName = category.name
  category.name = name
  const books = await readBooks()
  await Promise.all([writeCategories(categories), writeBooks(books.map((book) => book.category === oldName ? { ...book, category: name } : book))])
  return category
})
