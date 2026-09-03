import { getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const email = String(getRouterParam(event, 'email') || '').trim().toLowerCase()
  const body = await readBody(event).catch(() => ({}))
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()
  const name = String(body?.name || '').trim()
  const role = body?.role === 'super-admin' ? 'super-admin' : body?.role === 'admin' ? 'admin' : 'user'

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()
  const isOwner = config.ownerEmail !== '' && approverEmail === config.ownerEmail.toLowerCase()
  const isSuperAdmin = config.superAdmins.map((a) => a.toLowerCase()).includes(approverEmail)
  const isAdmin = isOwner || isSuperAdmin || config.admins.map((a) => a.toLowerCase()).includes(approverEmail)

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can update accounts' })
  }

  const accounts = await readAccounts()
  const account = accounts.find((a) => a.email === email)
  if (!account) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  if (name) account.name = name
  account.role = role

  await writeAccounts(accounts)
  return { ok: true, account }
})
