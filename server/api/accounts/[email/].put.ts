import { getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const email = String(getRouterParam(event, 'email') || '').trim().toLowerCase()
  const body = await readBody(event).catch(() => ({}))
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()
  const name = String(body?.name || '').trim()
  const role = body?.role === 'admin' ? 'admin' : 'user'
  const phone = String(body?.phone || '').trim()
  const gender = String(body?.gender || '').trim()
  const dateOfBirth = String(body?.dateOfBirth || '').trim()
  const address = String(body?.address || '').trim()
  const studentId = String(body?.studentId || '').trim()
  const major = String(body?.major || '').trim()
  const year = String(body?.year || '').trim()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()
  const isOwner = config.ownerEmail !== '' && approverEmail === config.ownerEmail.toLowerCase()
  const isAdmin = isOwner || config.admins.map((a) => a.toLowerCase()).includes(approverEmail)

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
  account.phone = phone
  account.gender = gender
  account.dateOfBirth = dateOfBirth
  account.address = address
  account.studentId = studentId
  account.major = major
  account.year = year

  await writeAccounts(accounts)
  return { ok: true, account }
})
