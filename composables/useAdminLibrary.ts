export interface Member { id: number; name: string; email: string; role: 'Student' | 'Teacher'; joinedOn: string }
export interface AdminLoan { id: number; memberId: number; bookId: number; borrowedOn: string; dueOn: string; returnedOn?: string }
export interface Fine { id: number; loanId?: number; memberId: number; bookId?: number; amount: number; reason: string; paid: boolean; createdOn: string; paidOn?: string }
export interface AdminSettings {
  loanDays: number
  finePerDay: number
  libraryName: string
  description: string
  primaryEmail: string
  catalogSort: 'relevance' | 'rating' | 'newest' | 'title'
  booksPerPage: number
  showUnavailable: boolean
  allowSearch: boolean
  allowCategoryFilter: boolean
  allowAuthorFilter: boolean
  newBooksVisible: boolean
  maxBooks: number
  borrowingEnabled: boolean
  allowRenewals: boolean
  maxRenewals: number
  borrowingNotifications: boolean
  returnReminders: boolean
  overdueNotifications: boolean
  newBookNotifications: boolean
  adminNotifications: boolean
  allowRegistration: boolean
  allowProfileEditing: boolean
  requireVerifiedEmail: boolean
  manualAdminApproval: boolean
  memberAccountsEnabled: boolean
  defaultMemberStatus: 'active' | 'pending'
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  sidebarCompact: boolean
  language: 'English'
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'
  timeFormat: '12h' | '24h'
  timezone: string
  requireTwoFactor: boolean
  sessionTimeout: boolean
  passwordPolicy: 'strong' | 'standard'
}

const STORAGE_KEY = 'etec-admin-library'
const defaults = () => ({
  members: [] as Member[], loans: [] as AdminLoan[], fines: [] as Fine[],
  settings: {
    loanDays: 14, finePerDay: 0.5, libraryName: 'E-LIBRARY',
    description: 'A modern digital library where readers can discover, read, and manage books online.',
    primaryEmail: 'admin@example.com', catalogSort: 'relevance' as const, booksPerPage: 12,
    showUnavailable: true, allowSearch: true, allowCategoryFilter: true, allowAuthorFilter: true, newBooksVisible: true,
    maxBooks: 3, borrowingEnabled: true, allowRenewals: true, maxRenewals: 1,
    borrowingNotifications: true, returnReminders: true, overdueNotifications: true, newBookNotifications: true, adminNotifications: true,
    allowRegistration: true, allowProfileEditing: true, requireVerifiedEmail: false, manualAdminApproval: true, memberAccountsEnabled: true, defaultMemberStatus: 'active' as const,
    theme: 'light' as const, accentColor: '#c9a227', sidebarCompact: false,
    language: 'English' as const, dateFormat: 'YYYY-MM-DD' as const, timeFormat: '24h' as const, timezone: 'Asia/Phnom_Penh',
    requireTwoFactor: false, sessionTimeout: true, passwordPolicy: 'strong' as const
  }
})
export function getDefaultAdminSettings(): AdminSettings { return defaults().settings }
type AdminState = ReturnType<typeof defaults>
const state = () => useState<AdminState>('admin-library-data', defaults)
let hydrated = false
function save(value: AdminState) { if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) }
function datePlus(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10) }

export function useAdminLibrary() {
  const data = state()
  if (import.meta.client && !hydrated) {
    hydrated = true
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const base = defaults()
        data.value = { ...base, ...parsed, settings: { ...base.settings, ...(parsed.settings || {}) } }
      }
    } catch {}
  }
  if (import.meta.client) {
    watch(() => data.value.settings.theme, (theme) => {
      const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.style.setProperty('--library-accent', data.value.settings.accentColor)
    }, { immediate: true })
  }
  const activeLoans = computed(() => data.value.loans.filter((loan) => !loan.returnedOn))
  const overdueLoans = computed(() => activeLoans.value.filter((loan) => loan.dueOn < new Date().toISOString().slice(0, 10)))
  function commit() { save(data.value) }
  function addMember(input: Pick<Member, 'name' | 'email' | 'role'>) { const member = { ...input, id: Math.max(0, ...data.value.members.map((item) => item.id)) + 1, joinedOn: new Date().toISOString().slice(0, 10) }; data.value.members.push(member); commit(); return member }
  function createLoan(memberId: number, bookId: number) { if (activeLoans.value.some((loan) => loan.memberId === memberId && loan.bookId === bookId)) return false; const today = new Date().toISOString().slice(0, 10); data.value.loans.unshift({ id: Math.max(0, ...data.value.loans.map((loan) => loan.id)) + 1, memberId, bookId, borrowedOn: today, dueOn: datePlus(data.value.settings.loanDays) }); commit(); return true }
  function returnLoan(id: number) { const loan = data.value.loans.find((item) => item.id === id); if (!loan || loan.returnedOn) return; loan.returnedOn = new Date().toISOString().slice(0, 10); if (loan.dueOn < loan.returnedOn) { const days = Math.ceil((new Date(loan.returnedOn).getTime() - new Date(loan.dueOn).getTime()) / 86400000); data.value.fines.unshift({ id: Math.max(0, ...data.value.fines.map((fine) => fine.id)) + 1, loanId: id, memberId: loan.memberId, bookId: loan.bookId, amount: days * data.value.settings.finePerDay, reason: `Late return (${days} day${days === 1 ? '' : 's'})`, paid: false, createdOn: loan.returnedOn }) }; commit(); return loan }
  function addFine(memberId: number, amount: number, reason: string) { if (!memberId || amount <= 0) return false; data.value.fines.unshift({ id: Math.max(0, ...data.value.fines.map((fine) => fine.id)) + 1, memberId, amount, reason: reason.trim() || 'Library charge', paid: false, createdOn: new Date().toISOString().slice(0, 10) }); commit(); return true }
  function payFine(id: number) { const fine = data.value.fines.find((item) => item.id === id); if (fine) { fine.paid = true; fine.paidOn = new Date().toISOString().slice(0, 10); commit() } }
  function updateSettings(patch: Partial<AdminSettings>) { data.value.settings = { ...data.value.settings, ...patch }; commit() }
  function clearDemoData() { data.value.members = []; data.value.loans = []; data.value.fines = []; commit() }
  return { data, activeLoans, overdueLoans, addMember, createLoan, returnLoan, addFine, payFine, updateSettings, clearDemoData }
}
