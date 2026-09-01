import { getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const email = String(getRouterParam(event, 'email') || '').trim().toLowerCase()
  const body = await readBody(event).catch(() => ({}))
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()
  if (config.ownerEmail.toLowerCase() !== approverEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can delete accounts' })
  }

  const accounts = await readAccounts()
  const next = accounts.filter((account) => account.email !== email)
  if (next.length === accounts.length) {
    return { ok: true, removed: false }
  }

  await writeAccounts(next)
  return { ok: true, removed: true }
})
