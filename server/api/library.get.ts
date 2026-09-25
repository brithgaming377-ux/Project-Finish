import { readLibraryStateFile } from '~/server/utils/library-state'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = String(query.email || '').trim().toLowerCase()

  if (!email) { return { saved: [], borrowed: [] } }

  const state = await readLibraryStateFile()
  const current = state[email] || { saved: [], borrowed: [] }

  return {
    saved: Array.isArray(current.saved) ? current.saved : [],
    borrowed: Array.isArray(current.borrowed) ? current.borrowed : []
  }
})
