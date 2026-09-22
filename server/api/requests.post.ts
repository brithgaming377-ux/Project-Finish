import { readRequests, writeRequests, type StoredRequest } from '~/server/utils/requests'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || typeof body !== 'object' || !Number.isInteger(Number(body.bookId)) || !body.userName || !body.userEmail) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid borrow request' })
  }

  const requests = await readRequests()
  const bookId = Number(body.bookId)
  const userEmail = String(body.userEmail).trim().toLowerCase()
  if (requests.some((request) => request.bookId === bookId && request.userEmail.toLowerCase() === userEmail && ['pending', 'approved'].includes(request.status))) {
    throw createError({ statusCode: 409, statusMessage: 'An active request already exists for this book' })
  }

  const request: StoredRequest = {
    id: Math.max(0, ...requests.map((item) => item.id)) + 1,
    kind: 'borrow',
    bookId,
    userName: String(body.userName).trim(),
    userEmail,
    status: 'pending',
    requestedOn: new Date().toISOString().slice(0, 10)
  }
  requests.unshift(request)
  await writeRequests(requests)
  return request
})
