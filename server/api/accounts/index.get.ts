import { readAccounts } from '~/server/utils/accounts'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const approverEmail = String(query.approverEmail || '').trim().toLowerCase()

  if (!approverEmail.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()
  const accounts = await readAccounts()

  const isOwner = config.ownerEmail !== '' && approverEmail === config.ownerEmail.toLowerCase()
  const isSuperAdmin = accounts.some((a) => a.email === approverEmail && a.role === 'super-admin')
  const isAdmin = isOwner || isSuperAdmin || config.admins.map((a) => a.toLowerCase()).includes(approverEmail)

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can view accounts' })
  }

  return { ok: true, accounts }
})
