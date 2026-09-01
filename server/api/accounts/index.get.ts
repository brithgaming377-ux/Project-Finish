export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const approverEmail = String(query.approverEmail || '').trim().toLowerCase()

  const config = await readConfig()
  if (config.ownerEmail.toLowerCase() !== approverEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can view accounts' })
  }

  const accounts = await readAccounts()
  return { ok: true, accounts }
})
