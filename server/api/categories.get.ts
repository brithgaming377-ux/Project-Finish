import { readCategories } from '~/server/utils/categories'
import { readBooks } from '~/server/utils/books'

export default defineEventHandler(async () => {
  const [stored, books] = await Promise.all([readCategories(), readBooks()])
  const existing = new Set(stored.map((category) => category.name.toLowerCase()))
  const fromBooks = [...new Set(books.map((book) => book.category))]
    .filter((name) => !existing.has(name.toLowerCase()))
    .map((name, index) => ({ id: `book-category-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, createdAt: '' }))
  return [...stored, ...fromBooks]
})
