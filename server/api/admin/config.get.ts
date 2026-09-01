export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = String(query.email || '').trim().toLowerCase()
  const config = await readConfig()

  const isOwner = config.ownerEmail !== '' && email === config.ownerEmail.toLowerCase()
  const isAdmin = isOwner || config.admins.map((admin) => admin.toLowerCase()).includes(email)
  const hasPendingRequest = config.requests.some((request) => request.email.toLowerCase() === email)

  return {
    configured: config.ownerEmail !== '',
    isOwner,
    isAdmin,
    hasPendingRequest,
    // Pending requests and admin list are only exposed to the verified owner.
    requests: isOwner ? config.requests : [],
    admins: isOwner ? config.admins : []
  }
})
