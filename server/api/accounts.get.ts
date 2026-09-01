export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = String(query.email || '').trim().toLowerCase()

  const config = await readConfig()
  const isOwner = config.ownerEmail !== '' && email === config.ownerEmail.toLowerCase()
  const isAdmin = isOwner || config.admins.map((admin) => admin.toLowerCase()).includes(email)

  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can view accounts' })
  }

  const accounts = await readAccounts()
  return { accounts, count: accounts.length }
})
