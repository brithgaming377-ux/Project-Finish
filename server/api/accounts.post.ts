export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const name = String(body?.name || '').trim()
  const password = String(body?.password || '')

  if (!email.includes('@') || !name || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'email, name, and password (6+ chars) are required' })
  }

  const accounts = await readAccounts()
  if (accounts.some((account) => account.email === email)) {
    return { ok: true, already: true }
  }

  accounts.push({ name, email, password, role: 'user', createdOn: new Date().toISOString().slice(0, 10) })
  await writeAccounts(accounts)

  return { ok: true }
})
