export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()

  if (!email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()

  if (config.ownerEmail) {
    throw createError({ statusCode: 409, statusMessage: 'Ownership has already been claimed' })
  }

  config.ownerEmail = email
  await writeConfig(config)

  return { ok: true, ownerEmail: email }
})
