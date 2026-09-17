import { readAccounts, writeAccounts } from '~/server/utils/accounts'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const name = String(body?.name || '').trim()
  const password = String(body?.password || '')
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()
  const requestedRole = body?.role === 'super-admin' ? 'super-admin' : body?.role === 'admin' ? 'admin' : 'user'

  if (!email.includes('@') || !name || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'email, name, and password (6+ chars) are required' })
  }

  const config = await readConfig()
  const accounts = await readAccounts()
  const isPublicRegistration = !approverEmail

  if (!isPublicRegistration) {
    const approver = accounts.find((account) => account.email.toLowerCase() === approverEmail)
    const isOwner = config.ownerEmail !== '' && approverEmail === config.ownerEmail.toLowerCase()
    const isSuperAdmin = approver?.role === 'super-admin' || config.superAdmins.map((admin) => admin.toLowerCase()).includes(approverEmail)
    const isAdmin = isOwner || isSuperAdmin || config.admins.map((admin) => admin.toLowerCase()).includes(approverEmail)

    if (!isAdmin) {
      throw createError({ statusCode: 403, statusMessage: 'Only administrators can create accounts' })
    }

    if (requestedRole !== 'user' && !isOwner && !isSuperAdmin) {
      throw createError({ statusCode: 403, statusMessage: 'Only the owner or super-admin can create admin accounts' })
    }
  } else if (requestedRole !== 'user') {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner or super-admin can create admin accounts' })
  }

  if (accounts.some((account) => account.email === email)) {
    return { ok: true, already: true }
  }

  accounts.push({ name, email, password, role: requestedRole, createdOn: new Date().toISOString().slice(0, 10) })
  await writeAccounts(accounts)

  return { ok: true }
})
