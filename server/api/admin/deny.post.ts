export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const approverDeviceId = String(body?.approverDeviceId || '')
  const deviceId = String(body?.deviceId || '')

  if (!deviceId) {
    throw createError({ statusCode: 400, statusMessage: 'deviceId is required' })
  }

  const config = await readConfig()

  if (config.ownerDeviceId !== approverDeviceId) {
    throw createError({ statusCode: 403, statusMessage: 'Only the owner can manage admin requests' })
  }

  config.requests = config.requests.filter((request) => request.deviceId !== deviceId)

  await writeConfig(config)

  return { ok: true, requests: config.requests }
})
