import { promises as fs } from 'fs'
import { join } from 'path'
import type { Book } from '~/data/books'

const BOOKS_PATH = join(process.cwd(), 'data', 'books.json')

export async function readBooks(): Promise<Book[]> {
  try {
    const raw = await fs.readFile(BOOKS_PATH, 'utf8')
    return JSON.parse(raw) as Book[]
  } catch {
    return []
  }
}

export async function writeBooks(books: Book[]): Promise<void> {
  await fs.writeFile(BOOKS_PATH, JSON.stringify(books, null, 2), 'utf8')
}
