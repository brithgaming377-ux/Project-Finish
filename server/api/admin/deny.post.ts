export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()
  const email = String(body?.email || '').trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()

  if (config.ownerEmail.toLowerCase() !== approverEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can manage admin requests' })
  }

  config.requests = config.requests.filter((request) => request.email.toLowerCase() !== email)

  await writeConfig(config)

  return { ok: true, requests: config.requests }
})
