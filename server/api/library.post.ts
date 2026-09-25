import { writeUserLibraryState } from '~/server/utils/library-state'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const saved = Array.isArray(body?.saved) ? body.saved : []
  const borrowed = Array.isArray(body?.borrowed) ? body.borrowed : []

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const state = await writeUserLibraryState(email, { saved, borrowed })
  return state
})
