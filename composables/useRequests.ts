export type RequestKind = 'borrow'
export type RequestStatus = 'pending' | 'approved' | 'declined' | 'returned'
export interface LibraryRequest { id: number; kind: RequestKind; bookId: number; userName: string; userEmail: string; status: RequestStatus; requestedOn: string; processedOn?: string }
const requestState = () => useState<LibraryRequest[]>('library-requests', () => [])
let hydrated = false
let refreshTimer: ReturnType<typeof setInterval> | undefined
export function useRequests() {
  const requests = requestState()
  async function refresh() {
    if (!import.meta.client) return
    const remote = await $fetch<LibraryRequest[]>('/api/requests')
    requests.value = remote.filter((request) => request.kind === 'borrow')
  }
  if (import.meta.client && !hydrated) {
    hydrated = true
    refresh().catch(() => undefined)
    // Keeps dashboard data in sync across administrator devices.
    refreshTimer = setInterval(() => refresh().catch(() => undefined), 10_000)
  }
  const pending = computed(() => requests.value.filter((request) => request.status === 'pending'))
  async function submit(kind: RequestKind, bookId: number, userName: string, userEmail: string) {
    if (requests.value.some((request) => request.kind === kind && request.bookId === bookId && request.userEmail.toLowerCase() === userEmail.toLowerCase() && ['pending', 'approved'].includes(request.status))) return false
    const created = await $fetch<LibraryRequest>('/api/requests', { method: 'POST', body: { kind, bookId, userName, userEmail } })
    requests.value = [created, ...requests.value.filter((request) => request.id !== created.id)]
    return created
  }
  async function updateStatus(id: number, status: 'approved' | 'declined' | 'returned') {
    const updated = await $fetch<LibraryRequest>(`/api/requests/${id}`, { method: 'PUT', body: { status } })
    requests.value = requests.value.map((request) => request.id === id ? updated : request)
    return updated
  }
  function forUser(email: string) { return computed(() => requests.value.filter((request) => request.userEmail === email)) }
  return { requests, pending, refresh, submit, updateStatus, forUser }
}
