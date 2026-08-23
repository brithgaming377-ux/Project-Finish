export interface Book {
  id: number
  title: string
  author: string
  category: string
  pages: number
  year: number
  spineColor: string
  description: string
}

export const categories = [
  'Technology',
  'Philosophy',
  'Science',
  'Leadership',
  'Language',
  'History',
  'Other'
] as const

const spineColors = ['#1B1F3B', '#6B8F71', '#C97F1E', '#4A4E69', '#8C5E3C', '#3F6C51']

export const books: Book[] = [
  { id: 1, title: 'Clean Architecture', author: 'R. C. Martin', category: 'Technology', pages: 432, year: 2017, spineColor: spineColors[0],
    description: 'A guide to structuring software systems so that business logic stays independent of frameworks, databases, and delivery mechanisms — built around the idea that good architecture keeps options open for as long as possible.' },
  { id: 2, title: 'The Pragmatic Programmer', author: 'D. Thomas & A. Hunt', category: 'Technology', pages: 352, year: 1999, spineColor: spineColors[1],
    description: 'A collection of practical habits and principles for working programmers, covering everything from debugging and testing to communication and career growth.' },
  { id: 3, title: 'Networks, Crowds & Markets', author: 'Easley & Kleinberg', category: 'Technology', pages: 512, year: 2010, spineColor: spineColors[2],
    description: 'An introduction to the mathematics behind connected systems — how networks, incentives, and information spread shape everything from social platforms to financial markets.' },
  { id: 4, title: 'Meditations', author: 'Marcus Aurelius', category: 'Philosophy', pages: 254, year: 180, spineColor: spineColors[3],
    description: 'The private journal of a Roman emperor reflecting on duty, mortality, and self-discipline — one of the foundational texts of Stoic philosophy.' },
  { id: 5, title: 'Beyond Good and Evil', author: 'F. Nietzsche', category: 'Philosophy', pages: 297, year: 1886, spineColor: spineColors[4],
    description: 'A critique of traditional morality and philosophy, arguing for a reevaluation of values beyond simple notions of good and evil.' },
  { id: 6, title: 'The Republic', author: 'Plato', category: 'Philosophy', pages: 416, year: -375, spineColor: spineColors[5],
    description: 'A Socratic dialogue examining justice, the ideal state, and the nature of a well-ordered soul.' },
  { id: 7, title: 'A Brief History of Time', author: 'S. Hawking', category: 'Science', pages: 256, year: 1988, spineColor: spineColors[0],
    description: 'An accessible tour of cosmology — from the Big Bang to black holes — written for readers without a physics background.' },
  { id: 8, title: 'The Selfish Gene', author: 'R. Dawkins', category: 'Science', pages: 384, year: 1976, spineColor: spineColors[1],
    description: 'A gene-centered view of evolution, arguing that genes, not individuals or species, are the primary unit of natural selection.' },
  { id: 9, title: 'Cosmos', author: 'C. Sagan', category: 'Science', pages: 396, year: 1980, spineColor: spineColors[2],
    description: 'A sweeping journey through astronomy, biology, and the history of scientific discovery, written to make the universe feel within reach.' },
  { id: 10, title: 'Dare to Lead', author: 'B. Brown', category: 'Leadership', pages: 320, year: 2018, spineColor: spineColors[3],
    description: 'A framework for leading with courage and vulnerability, drawn from research on what separates brave leaders from the rest.' },
  { id: 11, title: 'Good to Great', author: 'J. Collins', category: 'Leadership', pages: 300, year: 2001, spineColor: spineColors[4],
    description: 'A research-based look at what allows some companies to make the leap from average performance to sustained excellence.' },
  { id: 12, title: 'The Five Dysfunctions of a Team', author: 'P. Lencioni', category: 'Leadership', pages: 229, year: 2002, spineColor: spineColors[5],
    description: 'A leadership fable illustrating the common breakdowns — from lack of trust to inattention to results — that keep teams from performing.' },
  { id: 13, title: 'Fluent Forever', author: 'G. Wyner', category: 'Language', pages: 336, year: 2014, spineColor: spineColors[0],
    description: 'A practical method for learning any language quickly, using memory techniques, pronunciation training, and spaced repetition.' },
  { id: 14, title: 'The Elements of Style', author: 'Strunk & White', category: 'Language', pages: 105, year: 1959, spineColor: spineColors[1],
    description: 'A compact, enduring guide to clear and correct English writing, covering grammar, usage, and composition principles.' },
  { id: 15, title: 'Khmer for Beginners', author: 'R. K. Headley', category: 'Language', pages: 288, year: 1997, spineColor: spineColors[2],
    description: 'An introductory course in spoken and written Khmer, covering script, pronunciation, and everyday vocabulary.' },
  { id: 16, title: 'Sapiens', author: 'Y. N. Harari', category: 'History', pages: 443, year: 2011, spineColor: spineColors[3],
    description: 'A sweeping account of human history, from the cognitive revolution to the present, exploring how shared myths shaped civilization.' },
  { id: 17, title: 'Guns, Germs and Steel', author: 'J. Diamond', category: 'History', pages: 480, year: 1997, spineColor: spineColors[4],
    description: 'An argument for how geography and environment, rather than inherent differences between peoples, shaped the course of world history.' },
  { id: 18, title: 'A History of Cambodia', author: 'D. Chandler', category: 'History', pages: 328, year: 1983, spineColor: spineColors[5],
    description: 'A comprehensive survey of Cambodian history, from the Angkor era through the twentieth century.' },
  { id: 19, title: 'Deep Work', author: 'C. Newport', category: 'Other', pages: 296, year: 2016, spineColor: spineColors[0],
    description: 'An argument for the value of focused, undistracted effort in a world of constant interruption, with strategies for cultivating it.' },
  { id: 20, title: 'Atomic Habits', author: 'J. Clear', category: 'Other', pages: 320, year: 2018, spineColor: spineColors[1],
    description: 'A practical framework for building good habits and breaking bad ones, built around small, compounding changes.' },
  { id: 21, title: 'On Writing Well', author: 'W. Zinsser', category: 'Other', pages: 336, year: 1976, spineColor: spineColors[2],
    description: 'A classic guide to writing clear, simple nonfiction prose, covering everything from technique to attitude.' }
]

export function getBookById(id: number): Book | undefined {
  return books.find(b => b.id === id)
}

export function getRelatedBooks(book: Book, limit = 4): Book[] {
  return books.filter(b => b.category === book.category && b.id !== book.id).slice(0, limit)
}
