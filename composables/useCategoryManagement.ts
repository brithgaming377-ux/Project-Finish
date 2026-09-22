export interface Category { id: string; name: string; createdAt: string; booksCount?: number; borrowedCount?: number; availableCount?: number }

const categoryState = () => useState<Category[]>('categories', () => [])
let hydrated = false
let refreshTimer: ReturnType<typeof setInterval> | undefined

export function useCategoryManagement() {
  const categories = categoryState()
  const { books } = useCatalog()

  async function refresh() {
    if (!import.meta.client) return
    categories.value = await $fetch<Category[]>('/api/categories')
  }

  if (import.meta.client && !hydrated) {
    hydrated = true
    refresh().catch(() => undefined)
    refreshTimer = setInterval(() => refresh().catch(() => undefined), 10_000)
  }

  function getCategoryStats(categoryName: string) {
    const booksInCategory = books.value.filter((book) => book.category === categoryName)
    return {
      booksCount: booksInCategory.length,
      borrowedCount: booksInCategory.reduce((sum, book) => sum + book.availability.checkedOut, 0),
      availableCount: booksInCategory.reduce((sum, book) => sum + Math.max(book.availability.digitalCopies - book.availability.checkedOut, 0), 0)
    }
  }

  const categoriesWithStats = computed(() => categories.value.map((category) => ({ ...category, ...getCategoryStats(category.name) })))

  async function addCategory(name: string) {
    const category = await $fetch<Category>('/api/categories', { method: 'POST', body: { name } })
    categories.value = [...categories.value, category]
    return category
  }

  async function updateCategory(id: string, name: string) {
    const previousName = categories.value.find((item) => item.id === id)?.name
    const category = await $fetch<Category>(`/api/categories/${id}`, { method: 'PUT', body: { name, oldName: previousName } })
    categories.value = categories.value.map((item) => item.id === id ? category : item)
    // The server also renamed matching books; update this device immediately.
    if (previousName) books.value = books.value.map((book) => book.category === previousName ? { ...book, category: category.name } : book)
    return category
  }

  async function deleteCategory(id: string) {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    categories.value = categories.value.filter((category) => category.id !== id)
  }

  return { categories: categoriesWithStats, refresh, addCategory, updateCategory, deleteCategory }
}
