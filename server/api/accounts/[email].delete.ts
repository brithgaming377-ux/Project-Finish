import { getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const email = String(getRouterParam(event, 'email') || '').trim().toLowerCase()
  const body = await readBody(event).catch(() => ({}))
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()
  const accounts = await readAccounts()
  const approver = accounts.find((account) => account.email.toLowerCase() === approverEmail)
  const target = accounts.find((account) => account.email.toLowerCase() === email)
  const elevatedEmails = new Set([
    config.ownerEmail.toLowerCase(),
    ...config.superAdmins.map((admin) => admin.toLowerCase())
  ])
  const isElevated = elevatedEmails.has(approverEmail) || approver?.role === 'super-admin'

  if (!approver || !target || approverEmail === email) {
    throw createError({ statusCode: 403, statusMessage: 'You cannot delete this account' })
  }
  if (target.role === 'super-admin' || (target.role === 'admin' && !isElevated)) {
    throw createError({ statusCode: 403, statusMessage: 'Only a super-admin can delete administrator accounts' })
  }

  const next = accounts.filter((account) => account.email.toLowerCase() !== email)
  await writeAccounts(next)
  return { ok: true, removed: true }
})