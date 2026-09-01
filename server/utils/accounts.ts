import { promises as fs } from 'fs'
import { join } from 'path'

export interface StoredAccount {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  phone: string
  gender: string
  dateOfBirth: string
  address: string
  studentId: string
  major: string
  year: string
  createdOn: string
}

const ACCOUNTS_PATH = join(process.cwd(), 'data', 'accounts.json')

export async function readAccounts(): Promise<StoredAccount[]> {
  try {
    const raw = await fs.readFile(ACCOUNTS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function writeAccounts(accounts: StoredAccount[]): Promise<void> {
  await fs.writeFile(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2), 'utf8')
}
