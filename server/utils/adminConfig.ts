import { promises as fs } from 'fs'
import { join } from 'path'

export interface AdminRequest {
  deviceId: string
  name: string
  email: string
  requestedOn: string
}

export interface AdminConfig {
  ownerDeviceId: string
  admins: string[]
  requests: AdminRequest[]
}

const CONFIG_PATH = join(process.cwd(), 'data', 'admin-config.json')

export async function readConfig(): Promise<AdminConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      ownerDeviceId: parsed.ownerDeviceId || '',
      admins: Array.isArray(parsed.admins) ? parsed.admins : [],
      requests: Array.isArray(parsed.requests) ? parsed.requests : []
    }
  } catch {
    return { ownerDeviceId: '', admins: [], requests: [] }
  }
}

export async function writeConfig(config: AdminConfig): Promise<void> {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8')
}
