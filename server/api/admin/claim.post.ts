export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const deviceId = String(body?.deviceId || '')

  if (!deviceId) {
    throw createError({ statusCode: 400, statusMessage: 'deviceId is required' })
  }

  const config = await readConfig()

  if (config.ownerDeviceId) {
    throw createError({ statusCode: 409, statusMessage: 'Ownership has already been claimed on another device' })
  }

  config.ownerDeviceId = deviceId
  await writeConfig(config)

  return { ok: true, ownerDeviceId: deviceId }
})
