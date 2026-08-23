export interface Book {
  id: number
  title: string
  author: string
  category: string
  pages: number
  spineColor: string
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
  { id: 1, title: 'Clean Architecture', author: 'R. C. Martin', category: 'Technology', pages: 432, spineColor: spineColors[0] },
  { id: 2, title: 'The Pragmatic Programmer', author: 'D. Thomas & A. Hunt', category: 'Technology', pages: 352, spineColor: spineColors[1] },
  { id: 3, title: 'Networks, Crowds & Markets', author: 'Easley & Kleinberg', category: 'Technology', pages: 512, spineColor: spineColors[2] },
  { id: 4, title: 'Meditations', author: 'Marcus Aurelius', category: 'Philosophy', pages: 254, spineColor: spineColors[3] },
  { id: 5, title: 'Beyond Good and Evil', author: 'F. Nietzsche', category: 'Philosophy', pages: 297, spineColor: spineColors[4] },
  { id: 6, title: 'The Republic', author: 'Plato', category: 'Philosophy', pages: 416, spineColor: spineColors[5] },
  { id: 7, title: 'A Brief History of Time', author: 'S. Hawking', category: 'Science', pages: 256, spineColor: spineColors[0] },
  { id: 8, title: 'The Selfish Gene', author: 'R. Dawkins', category: 'Science', pages: 384, spineColor: spineColors[1] },
  { id: 9, title: 'Cosmos', author: 'C. Sagan', category: 'Science', pages: 396, spineColor: spineColors[2] },
  { id: 10, title: 'Dare to Lead', author: 'B. Brown', category: 'Leadership', pages: 320, spineColor: spineColors[3] },
  { id: 11, title: 'Good to Great', author: 'J. Collins', category: 'Leadership', pages: 300, spineColor: spineColors[4] },
  { id: 12, title: 'The Five Dysfunctions of a Team', author: 'P. Lencioni', category: 'Leadership', pages: 229, spineColor: spineColors[5] },
  { id: 13, title: 'Fluent Forever', author: 'G. Wyner', category: 'Language', pages: 336, spineColor: spineColors[0] },
  { id: 14, title: 'The Elements of Style', author: 'Strunk & White', category: 'Language', pages: 105, spineColor: spineColors[1] },
  { id: 15, title: 'Khmer for Beginners', author: 'R. K. Headley', category: 'Language', pages: 288, spineColor: spineColors[2] },
  { id: 16, title: 'Sapiens', author: 'Y. N. Harari', category: 'History', pages: 443, spineColor: spineColors[3] },
  { id: 17, title: 'Guns, Germs and Steel', author: 'J. Diamond', category: 'History', pages: 480, spineColor: spineColors[4] },
  { id: 18, title: 'A History of Cambodia', author: 'D. Chandler', category: 'History', pages: 328, spineColor: spineColors[5] },
  { id: 19, title: 'Deep Work', author: 'C. Newport', category: 'Other', pages: 296, spineColor: spineColors[0] },
  { id: 20, title: 'Atomic Habits', author: 'J. Clear', category: 'Other', pages: 320, spineColor: spineColors[1] },
  { id: 21, title: 'On Writing Well', author: 'W. Zinsser', category: 'Other', pages: 336, spineColor: spineColors[2] }
]
