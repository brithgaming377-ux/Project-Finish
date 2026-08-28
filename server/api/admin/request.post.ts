export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const deviceId = String(body?.deviceId || '')
  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim()

  if (!deviceId || !name || !email) {
    throw createError({ statusCode: 400, statusMessage: 'deviceId, name and email are required' })
  }

  const config = await readConfig()

  if (config.ownerDeviceId === deviceId || config.admins.includes(deviceId)) {
    throw createError({ statusCode: 409, statusMessage: 'This device is already an admin' })
  }

  if (config.requests.some((request) => request.deviceId === deviceId)) {
    throw createError({ statusCode: 409, statusMessage: 'An admin request from this device is already pending' })
  }

  config.requests.push({
    deviceId,
    name,
    email,
    requestedOn: new Date().toISOString().slice(0, 10)
  })

  await writeConfig(config)

  return { ok: true }
})
