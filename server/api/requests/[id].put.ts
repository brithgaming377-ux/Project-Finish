import { readRequests, writeRequests, type RequestStatus } from '~/server/utils/requests'

const statuses: RequestStatus[] = ['approved', 'declined', 'returned']

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const status = body && typeof body === 'object' ? body.status as RequestStatus : undefined
  if (!Number.isInteger(id) || !statuses.includes(status!)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request update' })
  }

  const requests = await readRequests()
  const request = requests.find((item) => item.id === id)
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Borrow request not found' })
  if (request.status !== 'pending' && status !== 'returned') {
    throw createError({ statusCode: 409, statusMessage: 'This request cannot be updated' })
  }

  request.status = status
  request.processedOn = new Date().toISOString().slice(0, 10)
  await writeRequests(requests)
  return request
})
