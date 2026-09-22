import { promises as fs } from 'fs'
import { join } from 'path'

export interface StoredCategory { id: string; name: string; createdAt: string }
const CATEGORIES_PATH = join(process.cwd(), 'data', 'categories.json')

export async function readCategories(): Promise<StoredCategory[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(CATEGORIES_PATH, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}
export async function writeCategories(categories: StoredCategory[]) {
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(categories, null, 2), 'utf8')
}
