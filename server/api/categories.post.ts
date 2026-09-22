import { readCategories, writeCategories, type StoredCategory } from '~/server/utils/categories'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = body && typeof body === 'object' ? String(body.name || '').trim() : ''
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Category name is required' })
  const categories = await readCategories()
  if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) throw createError({ statusCode: 409, statusMessage: 'Category already exists' })
  const category: StoredCategory = { id: `cat-${Date.now()}`, name, createdAt: new Date().toISOString().slice(0, 10) }
  categories.push(category)
  await writeCategories(categories)
  return category
})
