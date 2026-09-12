import { getRouterParam } from 'h3'
import { readAccounts, writeAccounts } from '~/server/utils/accounts'

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
  const accounts = await readAccounts()
  const isOwner = config.ownerEmail !== '' && approverEmail === config.ownerEmail.toLowerCase()
  const isSuperAdmin = accounts.some((account) => account.email.toLowerCase() === approverEmail && account.role === 'super-admin')
  const isAdmin = isOwner || isSuperAdmin || config.admins.map((admin) => admin.toLowerCase()).includes(approverEmail)

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can update accounts' })
  }

  const account = accounts.find((item) => item.email.toLowerCase() === email)
  if (!account) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }

  const isElevated = isOwner || isSuperAdmin
  if ((account.role === 'admin' || account.role === 'super-admin') && !isElevated) {
    throw createError({ statusCode: 403, statusMessage: 'Only a super-admin or owner can update administrator accounts' })
  }

  if (name) account.name = name
  account.role = role

  await writeAccounts(accounts)
  return { ok: true, account }
})
