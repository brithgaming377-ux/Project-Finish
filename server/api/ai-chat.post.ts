import { readBody } from 'h3'
import rawBooks from '~/data/books.json'
import {
  buildAiMessages,
  buildOfflineLibraryReply,
  isBookRequest,
  LIBRARY_ASSISTANT_PROMPT,
  normalizeAiReply,
  searchCatalogBooks
} from '~/server/utils/ai'
import { readBooks } from '~/server/utils/books'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({})) as {
    message?: string
    history?: Message[]
    currentBookId?: number
  }
  const userMessage = String(body?.message || '').trim()

  if (!userMessage) {
    throw createError({ statusCode: 400, statusMessage: 'message is required' })
  }

  const storedBooks = await readBooks()
  const sourceBooks = storedBooks.length ? storedBooks : (rawBooks as any[])
  const books = sourceBooks.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    level: book.level,
    description: book.description,
    longDescription: book.longDescription || [],
    tableOfContents: book.tableOfContents || [],
    tags: book.tags || [],
    subjects: book.subjects || [],
    keywords: (book as any).keywords || [],
    pages: book.pages,
    year: book.year,
    rating: book.rating,
    format: book.format
  }))

  const currentBook = Number.isInteger(body.currentBookId)
    ? books.find((book) => book.id === body.currentBookId) || null
    : null
  const matches = searchCatalogBooks(userMessage, books)

  if (isBookRequest(userMessage) && matches.length === 0 && !currentBook) {
    return { reply: buildOfflineLibraryReply(userMessage, books, currentBook) }
  }

  const apiKey = process.env.AI_API_KEY
  if (!apiKey) {
    return { reply: buildOfflineLibraryReply(userMessage, books, currentBook) }
  }

  const contextBooks = matches.length ? matches : books
  const currentBookContext = currentBook
    ? `\nCURRENT BOOK BEING READ:\n${JSON.stringify(currentBook, null, 2)}\n`
    : ''
  const catalogContext = `${LIBRARY_ASSISTANT_PROMPT}${currentBookContext}\nMATCHING CATALOG RECORDS:\n${JSON.stringify(contextBooks, null, 2)}`

  const history: Message[] = Array.isArray(body?.history) ? body.history.slice(-10) : []
  const messages: Message[] = [
    { role: 'system', content: catalogContext },
    ...buildAiMessages(history, userMessage).slice(1)
  ]

  try {
    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: {
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 800
      }
    }) as any

    const reply = normalizeAiReply(response?.choices?.[0]?.message?.content)

    return { reply }
  } catch (error: any) {
    const status = error?.statusCode || error?.response?.status || 500
    const message = error?.data?.statusMessage || error?.message || 'AI request failed.'
    throw createError({ statusCode: status, statusMessage: message })
  }
})
