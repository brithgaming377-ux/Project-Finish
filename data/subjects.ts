export interface Subject {
  slug: string
  name: string
  tagline: string
  description: string
  color: string
  icon: string // heroicon-style path data
}

export const subjects: Subject[] = [
  {
    slug: 'technology',
    name: 'Technology',
    tagline: 'Software, systems, and how to build things that last.',
    description: 'From software architecture to algorithms and distributed systems, this shelf covers the practical and theoretical sides of building technology — aimed at students and working engineers alike.',
    color: '#1B1F3B',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5'
  },
  {
    slug: 'philosophy',
    name: 'Philosophy',
    tagline: 'Questions about ethics, meaning, and how to live.',
    description: 'From Stoic emperors to Aristotle to Frankl, this shelf holds texts that ask what a good life looks like — classic and modern, dense and approachable.',
    color: '#4A4E69',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
  },
  {
    slug: 'science',
    name: 'Science',
    tagline: 'The universe, life, and the history of discovery.',
    description: 'Cosmology, biology, and environmental science, written for readers without a specialist background — from black holes to pesticides to the origin of species.',
    color: '#3F6C51',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c.251-.023.501-.05.75-.082m0 0a24.301 24.301 0 014.5 0m-4.5 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3'
  },
  {
    slug: 'leadership',
    name: 'Leadership',
    tagline: 'Managing people, teams, and organizations well.',
    description: 'Practical frameworks for leading teams and companies — from vulnerability and trust to disruptive innovation and the discipline that separates good companies from great ones.',
    color: '#C97F1E',
    icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z'
  },
  {
    slug: 'language',
    name: 'Language',
    tagline: 'Learning to speak, read, and write new languages.',
    description: 'Structured courses and reference guides for Khmer, Mandarin, and English — plus a memory-driven method for learning any language faster.',
    color: '#8C5E3C',
    icon: 'M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m6.334-12.138a24.65 24.65 0 015.454 3.66'
  },
  {
    slug: 'history',
    name: 'History',
    tagline: 'How we got here — empires, trade routes, and nations.',
    description: 'World and regional history, from the deep past to the twentieth century — including a dedicated shelf on Cambodian history alongside global surveys.',
    color: '#6B8F71',
    icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A8.959 8.959 0 013 12c0-1.605.42-3.113 1.157-4.418'
  },
  {
    slug: 'other',
    name: 'Other',
    tagline: 'Productivity, habits, writing, and everything else.',
    description: 'Books that do not fit neatly elsewhere — focus and productivity, habit formation, decision-making, and writing craft.',
    color: '#C9A227',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
  }
]

export function getSubjectBySlug(slug: string): Subject | undefined {
  return subjects.find(s => s.slug === slug)
}

export function getSubjectByName(name: string): Subject | undefined {
  return subjects.find(s => s.name === name)
}
