import { readAccounts } from '~/server/utils/accounts'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = String(query.email || '').trim().toLowerCase()
  const config = await readConfig()
  const accounts = await readAccounts()

  const isOwner = config.ownerEmail !== '' && email === config.ownerEmail.toLowerCase()
  const isSuperAdminFromConfig = config.superAdmins.map((admin) => admin.toLowerCase()).includes(email)
  const isSuperAdminFromAccount = accounts.some((a) => a.email === email && a.role === 'super-admin')
  const isSuperAdmin = isOwner || isSuperAdminFromConfig || isSuperAdminFromAccount
  const isAdmin = isSuperAdmin || config.admins.map((admin) => admin.toLowerCase()).includes(email)
  const hasPendingRequest = config.requests.some((request) => request.email.toLowerCase() === email)
  const canManage = isOwner || isSuperAdminFromAccount

  return {
    configured: config.ownerEmail !== '',
    isOwner,
    isSuperAdmin,
    isAdmin,
    hasPendingRequest,
    requests: canManage ? config.requests : [],
    admins: canManage ? config.admins : [],
    superAdmins: canManage ? config.superAdmins : []
  }
})
