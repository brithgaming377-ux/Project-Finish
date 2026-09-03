export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const name = String(body?.name || '').trim()

  if (!email.includes('@') || !name) {
    throw createError({ statusCode: 400, statusMessage: 'email and name are required' })
  }

  const config = await readConfig()

  if (email === config.ownerEmail.toLowerCase() || config.superAdmins.map((admin) => admin.toLowerCase()).includes(email) || config.admins.map((admin) => admin.toLowerCase()).includes(email)) {
    throw createError({ statusCode: 409, statusMessage: 'This account is already an admin' })
  }

  if (config.requests.some((request) => request.email.toLowerCase() === email)) {
    throw createError({ statusCode: 409, statusMessage: 'An admin request from this account is already pending' })
  }

  config.requests.push({
    email,
    name,
    requestedOn: new Date().toISOString().slice(0, 10)
  })

  await writeConfig(config)

  return { ok: true }
})
