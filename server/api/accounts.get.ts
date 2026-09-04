export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = String(query.email || '').trim().toLowerCase()

  const config = await readConfig()
  const accounts = await readAccounts()
  const account = accounts.find((item) => item.email.toLowerCase() === email)
  const isOwner = config.ownerEmail !== '' && email === config.ownerEmail.toLowerCase()
  const isSuperAdmin = config.superAdmins.map((admin) => admin.toLowerCase()).includes(email)
  const isAdmin = isOwner || isSuperAdmin || account?.role === 'admin' || account?.role === 'super-admin' || config.admins.map((admin) => admin.toLowerCase()).includes(email)

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Only administrators can view accounts' })
  }

  return { accounts, count: accounts.length }
})
