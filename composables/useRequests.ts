export type RequestKind = 'borrow' | 'purchase'
export type RequestStatus = 'pending' | 'approved' | 'declined' | 'returned'
export interface LibraryRequest { id: number; kind: RequestKind; bookId: number; userName: string; userEmail: string; status: RequestStatus; requestedOn: string; amount?: number; paymentStatus?: 'pending' | 'paid'; processedOn?: string; paidOn?: string }
const KEY = 'etec-library:requests'
const requestState = () => useState<LibraryRequest[]>('library-requests', () => [])
let hydrated = false
function persist(requests: LibraryRequest[]) { if (import.meta.client) localStorage.setItem(KEY, JSON.stringify(requests)) }
export function useRequests() {
  const requests = requestState()
  if (import.meta.client && !hydrated) { hydrated = true; try { const saved = localStorage.getItem(KEY); if (saved) requests.value = JSON.parse(saved) } catch {} }
  const pending = computed(() => requests.value.filter((request) => request.status === 'pending'))
  function submit(kind: RequestKind, bookId: number, userName: string, userEmail: string, amount?: number) { if (requests.value.some((request) => request.kind === kind && request.bookId === bookId && request.userEmail === userEmail && ['pending', 'approved'].includes(request.status))) return false; requests.value.unshift({ id: Math.max(0, ...requests.value.map((request) => request.id)) + 1, kind, bookId, userName, userEmail, status: 'pending', requestedOn: new Date().toISOString().slice(0, 10), amount: kind === 'purchase' ? amount : undefined, paymentStatus: kind === 'purchase' ? 'pending' : undefined }); persist(requests.value); return true }
  function updateStatus(id: number, status: 'approved' | 'declined' | 'returned') { const request = requests.value.find((item) => item.id === id); if (!request || (request.status !== 'pending' && status !== 'returned')) return; request.status = status; request.processedOn = new Date().toISOString().slice(0, 10); persist(requests.value); return request }
  function recordPayment(id: number) { const request = requests.value.find((item) => item.id === id); if (!request || request.kind !== 'purchase') return; request.paymentStatus = 'paid'; request.paidOn = new Date().toISOString().slice(0, 10); persist(requests.value); return request }
  function forUser(email: string) { return computed(() => requests.value.filter((request) => request.userEmail === email)) }
  return { requests, pending, submit, updateStatus, recordPayment, forUser }
}
