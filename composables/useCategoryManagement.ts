import { categories as seedCategories } from '~/data/books'

const CATEGORIES_STORAGE_KEY = 'marginalia:categories'

export interface Category {
  id: string
  name: string
  createdAt: string
  booksCount?: number
  borrowedCount?: number
  availableCount?: number
}

function categoriesState() {
  return useState<Category[]>('categories', () => {
    return seedCategories.map((name, index) => ({
      id: `cat-${index}`,
      name,
      createdAt: new Date().toISOString().slice(0, 10)
    }))
  })
}

function persist(list: Category[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore storage errors
  }
}

function hydrate(list: ReturnType<typeof categoriesState>) {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as Category[]
      list.value = stored
    }
  } catch {
    // ignore corrupt storage
  }
}

let hydrated = false

export function useCategoryManagement() {
  const categories = categoriesState()
  const { books } = useCatalog()

  if (import.meta.client && !hydrated) {
    hydrated = true
    hydrate(categories)
  }

  // Get category statistics
  function getCategoryStats(categoryName: string) {
    const booksInCategory = books.value.filter(b => b.category === categoryName)
    const borrowedCount = booksInCategory.reduce((sum, b) => sum + b.availability.checkedOut, 0)
    const availableCount = booksInCategory.reduce((sum, b) => 
      sum + Math.max(b.availability.digitalCopies - b.availability.checkedOut, 0), 0
    )
    return {
      booksCount: booksInCategory.length,
      borrowedCount,
      availableCount
    }
  }

  function getCategories() {
    return categories.value.map(cat => ({
      ...cat,
      ...getCategoryStats(cat.name)
    }))
  }

  function addCategory(name: string) {
    if (!name.trim()) throw new Error('Category name is required')
    if (categories.value.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Category already exists')
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    }

    categories.value = [...categories.value, newCategory]
    persist(categories.value)
    return newCategory
  }

  function updateCategory(id: string, name: string) {
    if (!name.trim()) throw new Error('Category name is required')

    const category = categories.value.find(c => c.id === id)
    if (!category) throw new Error('Category not found')

    if (categories.value.some(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Category name already exists')
    }

    // Update books with the old category name to the new name
    books.value = books.value.map(book => 
      book.category === category.name 
        ? { ...book, category: name.trim() }
        : book
    )

    category.name = name.trim()
    categories.value = [...categories.value]
    persist(categories.value)
    return category
  }

  function deleteCategory(id: string) {
    const category = categories.value.find(c => c.id === id)
    if (!category) throw new Error('Category not found')

    const booksInCategory = books.value.filter(b => b.category === category.name)
    if (booksInCategory.length > 0) {
      throw new Error(`Cannot delete category with ${booksInCategory.length} book(s). Move or delete the books first.`)
    }

    categories.value = categories.value.filter(c => c.id !== id)
    persist(categories.value)
  }

  return {
    categories: computed(() => getCategories()),
    addCategory,
    updateCategory,
    deleteCategory
  }
}
