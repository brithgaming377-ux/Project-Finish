import { promises as fs } from 'fs'
import { join } from 'path'

export type RequestStatus = 'pending' | 'approved' | 'declined' | 'returned'
export interface StoredRequest {
  id: number
  kind: 'borrow'
  bookId: number
  userName: string
  userEmail: string
  status: RequestStatus
  requestedOn: string
  processedOn?: string
}

const REQUESTS_PATH = join(process.cwd(), 'data', 'requests.json')

export async function readRequests(): Promise<StoredRequest[]> {
  try {
    const raw = await fs.readFile(REQUESTS_PATH, 'utf8')
    const requests = JSON.parse(raw)
    return Array.isArray(requests) ? requests : []
  } catch {
    return []
  }
}

export async function writeRequests(requests: StoredRequest[]): Promise<void> {
  await fs.writeFile(REQUESTS_PATH, JSON.stringify(requests, null, 2), 'utf8')
}
