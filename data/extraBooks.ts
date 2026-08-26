import type { Book } from './books'

const titles = [
  ['Refactoring', 'M. Fowler', 'Technology'], ['You Don’t Know JS Yet', 'K. Simpson', 'Technology'], ['Code Complete', 'S. McConnell', 'Technology'], ['The Mythical Man-Month', 'F. P. Brooks', 'Technology'], ['Grokking Algorithms', 'A. Bhargava', 'Technology'], ['The Phoenix Project', 'G. Kim', 'Technology'], ['Python Crash Course', 'E. Matthes', 'Technology'], ['The Design of Everyday Things', 'D. Norman', 'Technology'],
  ['The Art of Happiness', 'Dalai Lama', 'Philosophy'], ['Letters from a Stoic', 'Seneca', 'Philosophy'], ['The Myth of Sisyphus', 'A. Camus', 'Philosophy'], ['Justice', 'M. Sandel', 'Philosophy'], ['The Consolation of Philosophy', 'Boethius', 'Philosophy'], ['How to Be a Stoic', 'M. Pigliucci', 'Philosophy'],
  ['The Gene', 'S. Mukherjee', 'Science'], ['The Hidden Life of Trees', 'P. Wohlleben', 'Science'], ['The Body', 'B. Bryson', 'Science'], ['Astrophysics for People in a Hurry', 'N. deGrasse Tyson', 'Science'], ['The Sixth Extinction', 'E. Kolbert', 'Science'], ['Why We Sleep', 'M. Walker', 'Science'], ['The Immortal Life of Henrietta Lacks', 'R. Skloot', 'Science'],
  ['Leaders Eat Last', 'S. Sinek', 'Leadership'], ['Start with Why', 'S. Sinek', 'Leadership'], ['The Culture Code', 'D. Coyle', 'Leadership'], ['Radical Candor', 'K. Scott', 'Leadership'], ['Measure What Matters', 'J. Doerr', 'Leadership'], ['The Making of a Manager', 'J. Zhuo', 'Leadership'], ['Drive', 'D. Pink', 'Leadership'],
  ['English Grammar in Use', 'R. Murphy', 'Language'], ['The Writer’s Journey', 'C. Vogler', 'Language'], ['Word Power Made Easy', 'N. Lewis', 'Language'], ['The Little Prince', 'A. de Saint-Exupéry', 'Language'], ['Writing Tools', 'R. Clark', 'Language'], ['Khmer Phrasebook', 'Lonely Planet', 'Language'],
  ['A People’s History of the World', 'C. Harman', 'History'], ['The Lessons of History', 'W. & A. Durant', 'History'], ['Angkor and the Khmer Civilization', 'M. Freeman', 'History'], ['The Rise and Fall of the Third Reich', 'W. Shirer', 'History'], ['The Diary of a Young Girl', 'A. Frank', 'History'], ['The Wright Brothers', 'D. McCullough', 'History'],
  ['The Psychology of Money', 'M. Housel', 'Other'], ['Essentialism', 'G. McKeown', 'Other'], ['Show Your Work!', 'A. Kleon', 'Other'], ['The 7 Habits of Highly Effective People', 'S. Covey', 'Other'], ['Make Time', 'J. Knapp & J. Zeratsky', 'Other'], ['The Almanack of Naval Ravikant', 'E. Jorgenson', 'Other'], ['Mindset', 'C. Dweck', 'Other']
] as const

const colors: Record<string, string> = { Technology: '#1B1F3B', Philosophy: '#514A68', Science: '#236B67', Leadership: '#C97F1E', Language: '#7A4E36', History: '#6B5B3E', Other: '#6558A6' }
const covers: Record<string, string> = { Technology: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=82', Philosophy: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=82', Science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=82', Leadership: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=82', Language: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=82', History: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=900&q=82', Other: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=82' }

export const extraBooks: Book[] = titles.map(([title, author, category], index) => {
  const id = index + 31
  const level: Book['level'] = index % 3 === 0 ? 'Beginner' : index % 3 === 1 ? 'Intermediate' : 'Advanced'
  const pages = 180 + (index * 29) % 390
  const copies = 3 + (index % 7)
  return {
    id, title, author, category, pages, year: 2002 + (index % 24), spineColor: colors[category], coverUrl: `${covers[category]}&sig=${id}`,
    description: `An accessible ETEC Library selection on ${category.toLowerCase()}, chosen to support classroom learning and independent study.`,
    longDescription: [`This edition gives learners a clear foundation in ${category.toLowerCase()} through memorable examples and practical ideas.`, 'Use it as a course companion or as a focused starting point for your next project.'],
    tableOfContents: ['Overview', 'Core ideas', 'Practice and reflection', 'Further reading'], tags: [category.toLowerCase(), 'student learning'], subjects: [category],
    callNumber: `ETEC ${category.slice(0, 2).toUpperCase()} ${id}.${String.fromCharCode(65 + id % 26)}`, level, publisher: 'ETEC Learning Collection', language: 'English', format: index % 2 ? 'PDF' : 'EPUB', isbn: `978-1-55555-${String(100 + id).slice(-3)}-${id % 10}`, fileSizeMb: Math.round(pages / 75 * 10) / 10, readingTimeHours: Math.round(pages / 42 * 10) / 10, addedDate: `2026-08-${String((index % 24) + 1).padStart(2, '0')}`, edition: 1 + index % 3, price: 8 + index % 17, exchangeable: index % 4 !== 0, rating: 3.8 + (index % 12) / 10, ratingsCount: 18 + index * 5, reviews: [], availability: { digitalCopies: copies, checkedOut: index % copies }
  }
})
