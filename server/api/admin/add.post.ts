export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const approverEmail = String(body?.approverEmail || '').trim().toLowerCase()
  const email = String(body?.email || '').trim().toLowerCase()

  if (!email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }

  const config = await readConfig()
  if (config.ownerEmail.toLowerCase() !== approverEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can manage admins' })
  }

  // Already the owner.
  if (config.ownerEmail.toLowerCase() === email) {
    return { ok: true, admins: config.admins }
  }

  if (!config.admins.map((admin) => admin.toLowerCase()).includes(email)) {
    config.admins.push(email)
  }

  await writeConfig(config)
  return { ok: true, admins: config.admins }
})
