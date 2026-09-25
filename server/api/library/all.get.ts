import { readLibraryStateFile } from '~/server/utils/library-state'

export default defineEventHandler(async () => {
  const state = await readLibraryStateFile()
  const total = Object.values(state).reduce((sum, item) => sum + (Array.isArray(item.saved) ? item.saved.length : 0), 0)

  return { total }
})
