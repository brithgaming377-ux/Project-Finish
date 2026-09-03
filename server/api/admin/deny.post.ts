import { readAccounts } from '~/server/utils/accounts'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()
  const email = String(body?.email || '').trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()
  const accounts = await readAccounts()
  const isOwner = config.ownerEmail.toLowerCase() === approverEmail
  const isSuperAdmin = accounts.some((a) => a.email === approverEmail && a.role === 'super-admin')

  if (!isOwner && !isSuperAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner or super-admin can manage admin requests' })
  }

  config.requests = config.requests.filter((request) => request.email.toLowerCase() !== email)

  await writeConfig(config)
  return { ok: true, requests: config.requests }
})
