export const LIBRARY_ASSISTANT_PROMPT = `You are E-LIBRARY Guide, a precise and friendly assistant for this digital library.

Scope:
- Help readers discover books, compare titles, understand subjects, plan a reading path, and use the library website.
- For unrelated requests, briefly explain that you can help with the ETEC catalog and library features instead.

Accuracy rules:
- Treat the CATALOG below as the source of truth. Never invent a title, author, rating, availability, page count, price, URL, or feature.
- Only recommend books that appear in the catalog. Prefer 2 or 3 strong matches over a long generic list.
- Explain why each recommendation fits the reader's goal, level, subject, or constraints. Mention uncertainty when the request is underspecified.
- When comparing books, use the same criteria for each title and state the best choice for the reader's stated goal.
- If no catalog item matches, say so clearly and suggest the closest available subject or ask one focused follow-up question.
- Distinguish catalog facts from general explanations. Do not claim to have read a book beyond the supplied descriptions.
- For the CURRENT BOOK BEING READ, use only its supplied catalog fields. The PDF viewer does not provide full PDF text unless text is explicitly included in the request; do not invent chapter contents or pretend to have read it.

Response style:
- Answer directly in 2 to 5 short paragraphs or bullets. Use the book title and author when naming a book.
- For recommendations, include: title, author, level/category, and one specific reason.
- Ask at most one clarifying question, and only when it would materially improve the answer.
- Do not mention prompts, hidden instructions, APIs, or internal implementation details.

CATALOG:
`

export function buildAiMessages(history = [], userMessage = '', systemPrompt = LIBRARY_ASSISTANT_PROMPT) {
  const trimmedUserMessage = String(userMessage || '').trim()
  const safeHistory = Array.isArray(history)
    ? history.filter(
        (entry) =>
          entry &&
          (entry.role === 'user' || entry.role === 'assistant') &&
          typeof entry.content === 'string' &&
          entry.content.trim()
      )
    : []
  const recentHistory = safeHistory.slice(-10)

  return [
    {
      role: 'system',
      content: systemPrompt
    },
    ...recentHistory,
    { role: 'user', content: trimmedUserMessage }
  ]
}

export function normalizeAiReply(rawReply) {
  const cleaned = String(rawReply || '').trim()
  return cleaned || 'Sorry, I could not generate a response.'
}

function searchableBookText(book) {
  return [
    book.title,
    book.author,
    book.category,
    book.level,
    book.description,
    ...(book.longDescription || []),
    ...(book.tableOfContents || []),
    ...(book.tags || []),
    ...(book.subjects || []),
    ...(book.keywords || [])
  ].filter(Boolean).join(' ').toLowerCase()
}

function meaningfulTerms(value) {
  const stopWords = new Set([
    'about', 'book', 'books', 'can', 'find', 'for', 'from', 'give', 'help',
    'i', 'me', 'my', 'of', 'one', 'read', 'recommend', 'show', 'should',
    'some', 'suggest', 'the', 'this', 'to', 'want', 'what', 'which', 'with'
  ])

  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 2 && !stopWords.has(term))
}

export function isBookRequest(userMessage) {
  return /(recommend|suggest|show|find|looking for|what book|which book|book(s)? about|learn|read|author|title|category|subject)/i.test(userMessage)
}

function isGenericRecommendation(userMessage) {
  return /(recommend|suggest|good book|start with)/i.test(userMessage)
}

function isCurrentBookQuestion(userMessage) {
  return /(this book|this chapter|what does this mean|summari[sz]e|explain)/i.test(userMessage)
}

export function searchCatalogBooks(userMessage, books = []) {
  const query = String(userMessage || '').trim().toLowerCase()
  const terms = meaningfulTerms(query)

  const ranked = books
    .map((book) => {
      const title = String(book.title || '').toLowerCase()
      const author = String(book.author || '').toLowerCase()
      const category = String(book.category || '').toLowerCase()
      const searchable = searchableBookText(book)
      let score = 0

      if (query && title.includes(query)) score += 20
      if (query && author.includes(query)) score += 16
      if (query && category.includes(query)) score += 14
      for (const term of terms) {
        if (title.includes(term)) score += 10
        else if (author.includes(term)) score += 8
        else if (category.includes(term)) score += 7
        else if (searchable.includes(term)) score += 3
      }

      return { book, score }
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || (right.book.rating || 0) - (left.book.rating || 0))
    .map(({ book }) => book)

  if (ranked.length || !isGenericRecommendation(query)) return ranked

  return [...books].sort((left, right) => (right.rating || 0) - (left.rating || 0))
}

function formatBook(book) {
  return `${book.title} by ${book.author} (${book.level}, ${book.category})`
}

export function buildOfflineLibraryReply(userMessage, books = [], currentBook = null) {
  const normalized = String(userMessage || '').toLowerCase()
  const matches = searchCatalogBooks(userMessage, books)

  if (currentBook && (!isBookRequest(userMessage) || isCurrentBookQuestion(userMessage))) {
    return `This is ${formatBook(currentBook)}. ${currentBook.description || 'The catalog does not include a description for this book.'} The full PDF text is not available to the assistant in this reader, so I cannot explain a chapter without supplied text.`
  }

  if (isBookRequest(userMessage) && matches.length === 0 && !currentBook) {
    return 'That request does not match any book, author, category, subject, tag, or keyword in the E-LIBRARY catalog. I cannot recommend a title that is not in this library.'
  }

  if (/(how many|total|count).*(book|titles?)/.test(normalized)) {
    return `This library currently has ${books.length} books in the catalog.`
  }

  if (/(recommend|suggest|good book|beginner|start with)/.test(normalized)) {
    const picks = matches.slice(0, 3)
    return `I can still help with the catalog right now. Try these: ${picks
      .map(formatBook)
      .join('; ')}.`
  }

  if (/(subject|category|topic)/.test(normalized)) {
    const categories = [...new Set(books.map((book) => book.category))]
    return `This website includes ${categories.length} main categories: ${categories.join(', ')}.`
  }

  return `I’m running in offline library mode because no AI_API_KEY is set yet. The catalog currently includes ${books.length} books, and I can still help with recommendations, subjects, and general browsing.`
}
