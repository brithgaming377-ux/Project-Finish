<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import {
  UserPlus,
  BookOpen,
  DollarSign,
  Settings,
  Shield,
  Trash2,
  Edit3,
  Search,
  Download,
  Users,
  BookMarked,
  AlertTriangle,
  FileText,
  Save,
  UserCheck,
  UserX,
  Building2,
  BookOpenText,
  ArrowRightLeft,
  BellRing,
  Palette,
  Languages,
  ShieldCheck,
  Wrench,
  Building,
  BookText,
  Sparkles
} from '@lucide/vue'
import { getCoverUrl } from '~/data/books'
import BookCoverImage from '~/components/BookCoverImage.vue'

const route = useRoute()
const { books, updateBook } = useCatalog()
const { data, activeLoans, overdueLoans, addMember, createLoan, returnLoan, addFine, payFine, updateSettings } = useAdminLibrary()
const { requests: allRequests } = useRequests()
const { push: toast } = useToast()
const { user } = useAuth()
const { isOwnerDevice, isSuperAdminDevice, requests: adminRequests, approve: approveAdmin, deny: denyAdmin } = useAdminAccess()
const { state: libraryState } = useLibrary()
const section = computed(() => String(route.params.section || '').toLowerCase())
const labels: Record<string, string> = { admins: 'Admins', readers: 'Readers', members: 'Members', circulation: 'Circulation', fines: 'Fines', reports: 'Reports', settings: 'Settings' }
const title = computed(() => labels[section.value])

const newAdminEmail = ref('')
const adminBusy = ref<boolean | string | null>(false)

async function addAdmin() {
  const email = newAdminEmail.value.trim().toLowerCase()
  if (!email.includes('@')) return toast('Enter a valid email address.', 'error')
  adminBusy.value = true
  try {
    await $fetch('/api/admin/add', { method: 'POST', body: { email, approverEmail: user.value?.email } })
    newAdminEmail.value = ''
    toast('Admin added.')
    await refreshAdmins()
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not add admin.', 'error')
  } finally {
    adminBusy.value = false
  }
}

async function removeAdmin(email: string) {
  adminBusy.value = true
  try {
    await $fetch('/api/admin/remove', { method: 'POST', body: { email, approverEmail: user.value?.email } })
    toast('Admin removed.')
    await refreshAdmins()
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not remove admin.', 'error')
  } finally {
    adminBusy.value = false
  }
}

async function onApprove(email: string) {
  adminBusy.value = email
  try {
    await approveAdmin(email)
    toast('Admin access granted.')
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not approve.', 'error')
  } finally {
    adminBusy.value = null
  }
}

async function onDeny(email: string) {
  adminBusy.value = email
  try {
    await denyAdmin(email)
    toast('Admin request denied.')
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not deny.', 'error')
  } finally {
    adminBusy.value = null
  }
}

const adminList = ref<string[]>([])
async function refreshAdmins() {
  try {
    const config = await $fetch('/api/admin/config', { query: { email: user.value?.email } })
    adminList.value = (config as any).admins || []
  } catch {}
}

const readerSearch = ref('')
const readers = ref<{ name: string; email: string; role: string; createdOn: string }[]>([])
const readerLoading = ref(false)
async function refreshReaders() {
  readerLoading.value = true
  try {
    const result = await $fetch('/api/accounts', { query: { email: user.value?.email } }) as any
    readers.value = result.accounts || []
  } catch {
    readers.value = []
  } finally {
    readerLoading.value = false
  }
}

const filteredReaders = computed(() => {
  const q = readerSearch.value.toLowerCase()
  if (!q) return readers.value
  return readers.value.filter(r => `${r.name} ${r.email} ${r.role}`.toLowerCase().includes(q))
})

const readerStats = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const registeredToday = readers.value.filter(r => r.createdOn === today).length
  const activeBorrowers = new Set(allRequests.value.filter(r => r.kind === 'borrow' && r.status === 'approved' && !r.processedOn).map(r => r.userEmail)).size
  return { registeredToday, activeBorrowers }
})

function getReaderBorrowedCount(email: string) {
  return allRequests.value.filter(r => r.userEmail === email && r.kind === 'borrow' && r.status === 'approved').length
}

function getReaderSavedCount(email: string) {
  return libraryState.value.saved.length
}

function canEditReader(reader: { name: string; email: string; role: string; createdOn: string }) {
  if (reader.email === user.value?.email) return false
  if (user.value?.role === 'admin' && (reader.role === 'admin' || reader.role === 'super-admin')) return false
  return true
}

const editingReader = ref<{ name: string; email: string; role: string; createdOn: string } | null>(null)
const editForm = reactive({ name: '', role: 'user' })
const editBusy = ref(false)

function startEdit(reader: { name: string; email: string; role: string; createdOn: string }) {
  editingReader.value = reader
  editForm.name = reader.name
  editForm.role = reader.role
}

function cancelEdit() {
  editingReader.value = null
  editForm.name = ''
  editForm.role = 'user'
}

async function saveEdit() {
  if (!editingReader.value) return
  editBusy.value = true
  try {
    await $fetch(`/api/accounts/${encodeURIComponent(editingReader.value.email)}`, {
      method: 'PUT',
      body: {
        approverEmail: user.value?.email,
        name: editForm.name,
        role: editForm.role
      }
    })
    toast('Reader updated.')
    cancelEdit()
    await refreshReaders()
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not update reader.', 'error')
  } finally {
    editBusy.value = false
  }
}

async function deleteReader(email: string) {
  if (!confirm(`Delete reader "${email}"? This cannot be undone.`)) return
  try {
    await $fetch(`/api/accounts/${encodeURIComponent(email)}`, { method: 'DELETE', body: { approverEmail: user.value?.email } })
    toast('Reader deleted.')
    await refreshReaders()
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not delete reader.', 'error')
  }
}

watch(() => section.value, (val) => {
  if (val === 'admins') refreshAdmins()
  if (val === 'readers') refreshReaders()
}, { immediate: true })
const memberForm = reactive({ name: '', email: '', role: 'Student' as 'Student' | 'Teacher' })
const loanForm = reactive({ memberId: 0, bookId: 0 })
const fineForm = reactive({ memberId: 0, amount: 0, reason: '' })
const settingsStats = computed(() => ({
  books: books.value.length,
  categories: new Set(books.value.map((book) => book.category)).size,
  activeLoans: activeLoans.value.length,
  overdueLoans: overdueLoans.value.length,
  readers: readers.value.length,
  admins: adminList.value.length + 1,
  saved: libraryState.value.saved.length,
  currentUser: user.value?.email || 'Not signed in'
}))
const settingsSections = [
  { key: 'library', icon: Building2, label: 'Library Information', summary: 'Public name, identity, and contact data' },
  { key: 'catalog', icon: BookOpenText, label: 'Catalog', summary: 'Books, categories, and discovery settings' },
  { key: 'borrow', icon: ArrowRightLeft, label: 'Borrowing Rules', summary: 'Loan policies used across the site' },
  { key: 'notifications', icon: BellRing, label: 'Notifications', summary: 'Alerts used in admin and borrower flows' },
  { key: 'members', icon: Users, label: 'Members', summary: 'Readers, admins, and account access' },
  { key: 'appearance', icon: Palette, label: 'Appearance', summary: 'Brand styling shown to visitors' },
  { key: 'language', icon: Languages, label: 'Language & Region', summary: 'Locale settings for the platform' },
  { key: 'security', icon: ShieldCheck, label: 'Security', summary: 'Admin permissions and protected routes' },
  { key: 'system', icon: Wrench, label: 'System', summary: 'Maintenance, reports, and operational tools' }
]
const activeSettingsSection = ref('library')
const settingsForm = reactive({ ...data.value.settings })
const search = ref('')
const memberFor = (id: number) => data.value.members.find((item) => item.id === id)
const bookFor = (id: number) => books.value.find((item) => item.id === id)
const filteredMembers = computed(() => data.value.members.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(search.value.toLowerCase())))
const outstandingFines = computed(() => data.value.fines.filter((fine) => !fine.paid))
const availableBooks = computed(() => books.value.filter((book) => book.availability.digitalCopies > book.availability.checkedOut))
const totalFineAmount = computed(() => outstandingFines.value.reduce((sum, fine) => sum + fine.amount, 0))
function createMember() { if (!memberForm.name.trim() || !memberForm.email.trim()) return toast('Enter a member name and email.', 'error'); addMember({ ...memberForm, name: memberForm.name.trim(), email: memberForm.email.trim() }); memberForm.name = ''; memberForm.email = ''; toast('Member added.') }
async function issueLoan() {
  const book = bookFor(loanForm.bookId)
  if (!loanForm.memberId || !book) return toast('Choose both a member and a book.', 'error')
  if (!createLoan(loanForm.memberId, book.id)) return toast('This member already has that title.', 'error')
  await updateBook(book.id, { availability: { ...book.availability, checkedOut: book.availability.checkedOut + 1 } })
  loanForm.memberId = 0
  loanForm.bookId = 0
  toast('Loan issued.')
}
async function finishLoan(id: number) {
  const loan = returnLoan(id)
  if (!loan) return
  const book = bookFor(loan.bookId)
  if (book) await updateBook(book.id, { availability: { ...book.availability, checkedOut: Math.max(0, book.availability.checkedOut - 1) } })
  toast('Book returned.')
}
function createFine() { if (!addFine(fineForm.memberId, Number(fineForm.amount), fineForm.reason)) return toast('Choose a member and enter a fine amount.', 'error'); fineForm.memberId = 0; fineForm.amount = 0; fineForm.reason = ''; toast('Fine added to the member account.') }
function saveSettings() { updateSettings({ ...settingsForm, loanDays: Number(settingsForm.loanDays), finePerDay: Number(settingsForm.finePerDay) }); toast('Library settings saved.') }
const reportItems = computed(() => [
  { label: 'Members', value: data.value.members.length, tone: 'blue' },
  { label: 'Catalog titles', value: books.value.length, tone: 'slate' },
  { label: 'Available titles', value: availableBooks.value.length, tone: 'emerald' },
  { label: 'Active loans', value: activeLoans.value.length, tone: 'amber' },
  { label: 'Overdue loans', value: overdueLoans.value.length, tone: 'red' },
  { label: 'Returned loans', value: allRequests.value.filter(request => request.kind === 'borrow' && request.status === 'returned').length, tone: 'violet' },
  { label: 'Outstanding fines', value: `$${totalFineAmount.value.toFixed(2)}`, tone: 'rose' }
])
const reportCategories = computed(() => {
  const counts: Record<string, number> = {}
  books.value.forEach(book => { counts[book.category] = (counts[book.category] || 0) + 1 })
  return Object.entries(counts).sort(([, first], [, second]) => second - first).slice(0, 6)
})
const reportInventory = computed(() => ({
  digitalCopies: books.value.reduce((total, book) => total + book.availability.digitalCopies, 0),
  checkedOutCopies: books.value.reduce((total, book) => total + book.availability.checkedOut, 0),
  paidFines: data.value.fines.filter(fine => fine.paid).length,
  pendingRequests: allRequests.value.filter(request => request.status === 'pending').length
}))
function downloadReport() { const rows = [['Metric', 'Value'], ['Members', String(data.value.members.length)], ['Active loans', String(activeLoans.value.length)], ['Overdue loans', String(overdueLoans.value.length)], ['Outstanding fines', `$${totalFineAmount.value.toFixed(2)}`], ['Catalog titles', String(books.value.length)]]; const url = URL.createObjectURL(new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' })); const link = document.createElement('a'); link.href = url; link.download = 'etec-library-report.csv'; link.click(); URL.revokeObjectURL(url); toast('Report downloaded.') }
if (!title.value) await navigateTo('/admin')
</script>

<template>
  <div v-if="title" class="mx-auto max-w-7xl space-y-6">
    <header><p class="text-sm text-slate-500">Library management</p><h1 class="mt-1 text-2xl font-bold text-slate-900">{{ title }}</h1></header>

    <template v-if="section === 'members'"><section class="grid gap-6 lg:grid-cols-[1fr_1.5fr]"><form class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="createMember"><h2 class="font-semibold text-slate-900">Add member</h2><div class="mt-4 space-y-3"><input v-model="memberForm.name" required placeholder="Full name" class="field" /><input v-model="memberForm.email" required type="email" placeholder="Email address" class="field" /><select v-model="memberForm.role" class="field"><option>Student</option><option>Teacher</option></select><button class="primary">Add member</button></div></form><section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 p-4"><input v-model="search" type="search" placeholder="Search members..." class="field" /></div><div class="divide-y divide-slate-100"><div v-for="member in filteredMembers" :key="member.id" class="flex items-center gap-3 p-4"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">{{ member.name[0] }}</span><div class="min-w-0 flex-1"><p class="font-medium text-slate-800">{{ member.name }}</p><p class="text-xs text-slate-500">{{ member.email }} · {{ member.role }}</p></div><span class="text-xs text-slate-400">{{ activeLoans.filter(loan => loan.memberId === member.id).length }} loans</span></div></div></section></section></template>

    <template v-else-if="section === 'circulation'"><section class="grid gap-6 lg:grid-cols-[1fr_1.5fr]"><form class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="issueLoan"><h2 class="font-semibold text-slate-900">Issue a loan</h2><p class="mt-1 text-xs text-slate-500">Due in {{ data.settings.loanDays }} days.</p><div class="mt-4 space-y-3"><select v-model.number="loanForm.memberId" class="field"><option :value="0">Select member</option><option v-for="member in data.members" :key="member.id" :value="member.id">{{ member.name }}</option></select><select v-model.number="loanForm.bookId" class="field"><option :value="0">Select available book</option><option v-for="book in availableBooks" :key="book.id" :value="book.id">{{ book.title }}</option></select><button class="primary">Issue loan</button></div></form><section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 p-4"><h2 class="font-semibold text-slate-900">Active loans</h2></div><div v-if="activeLoans.length" class="divide-y divide-slate-100"><div v-for="loan in activeLoans" :key="loan.id" class="flex items-center gap-3 p-4"><div class="min-w-0 flex-1"><p class="font-medium text-slate-800">{{ bookFor(loan.bookId)?.title || 'Removed title' }}</p><p class="text-xs text-slate-500">{{ memberFor(loan.memberId)?.name }} · Due {{ loan.dueOn }}</p></div><span v-if="loan.dueOn < new Date().toISOString().slice(0, 10)" class="text-xs font-semibold text-red-500">Overdue</span><button type="button" class="secondary" @click="finishLoan(loan.id)">Return</button></div></div><p v-else class="p-8 text-center text-sm text-slate-500">No active loans.</p></section></section></template>

    <template v-else-if="section === 'fines'"><section class="grid gap-4 sm:grid-cols-3"><div class="card"><p>Outstanding</p><strong>{{ outstandingFines.length }}</strong></div><div class="card"><p>Amount due</p><strong>${{ totalFineAmount.toFixed(2) }}</strong></div><div class="card"><p>Paid fines</p><strong>{{ data.fines.filter(fine => fine.paid).length }}</strong></div></section><section class="grid gap-6 lg:grid-cols-[.8fr_1.5fr]"><form class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="createFine"><h2 class="font-semibold text-slate-900">Add a fine</h2><p class="mt-1 text-xs text-slate-500">Use this for damaged, lost, or other library charges.</p><div class="mt-4 space-y-3"><select v-model.number="fineForm.memberId" class="field"><option :value="0">Select member</option><option v-for="member in data.members" :key="member.id" :value="member.id">{{ member.name }}</option></select><input v-model.number="fineForm.amount" min="0.01" step="0.01" type="number" placeholder="Amount (USD)" class="field" /><input v-model="fineForm.reason" placeholder="Reason, e.g. damaged book" class="field" /><button class="primary">Add fine</button></div></form><section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 p-4"><h2 class="font-semibold text-slate-900">Fine register</h2></div><div v-if="data.fines.length" class="divide-y divide-slate-100"><div v-for="fine in data.fines" :key="fine.id" class="flex items-center gap-3 p-4"><span class="flex h-9 w-9 items-center justify-center rounded-full" :class="fine.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">$</span><div class="min-w-0 flex-1"><p class="font-medium text-slate-800">{{ memberFor(fine.memberId)?.name || 'Former member' }}</p><p class="truncate text-xs text-slate-500">{{ fine.reason || 'Library charge' }}<span v-if="fine.bookId"> · {{ bookFor(fine.bookId)?.title }}</span></p><p class="mt-0.5 text-[11px] text-slate-400">Created {{ fine.createdOn }}<span v-if="fine.paidOn"> · Paid {{ fine.paidOn }}</span></p></div><span class="font-semibold text-slate-800">${{ fine.amount.toFixed(2) }}</span><button v-if="!fine.paid" type="button" class="secondary" @click="payFine(fine.id)">Mark paid</button><span v-else class="text-xs font-semibold text-emerald-600">Paid</span></div></div><p v-else class="p-8 text-center text-sm text-slate-500">Fines are created automatically when an overdue book is returned, or you can add one manually.</p></section></section></template>

    <template v-else-if="section === 'reports'">
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="item in reportItems" :key="item.label" class="card">
          <div class="flex items-center justify-between gap-3">
            <p>{{ item.label }}</p>
            <span class="h-2.5 w-2.5 rounded-full" :class="{ 'bg-blue-500': item.tone === 'blue', 'bg-slate-500': item.tone === 'slate', 'bg-emerald-500': item.tone === 'emerald', 'bg-amber-500': item.tone === 'amber', 'bg-red-500': item.tone === 'red', 'bg-violet-500': item.tone === 'violet', 'bg-cyan-500': item.tone === 'cyan', 'bg-rose-500': item.tone === 'rose' }"></span>
          </div>
          <strong>{{ item.value }}</strong>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div><h2 class="font-semibold text-slate-900">Library summary</h2><p class="mt-1 text-sm text-slate-500">A current snapshot of circulation and inventory activity.</p></div>
            <button type="button" class="primary" @click="downloadReport">Download CSV</button>
          </div>
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg bg-slate-50 p-4"><p class="text-xs text-slate-500">Digital copies</p><p class="mt-1 text-2xl font-bold text-slate-900">{{ reportInventory.digitalCopies }}</p></div>
            <div class="rounded-lg bg-blue-50 p-4"><p class="text-xs text-blue-600">Copies checked out</p><p class="mt-1 text-2xl font-bold text-slate-900">{{ reportInventory.checkedOutCopies }}</p></div>
            <div class="rounded-lg bg-amber-50 p-4"><p class="text-xs text-amber-700">Pending requests</p><p class="mt-1 text-2xl font-bold text-slate-900">{{ reportInventory.pendingRequests }}</p></div>
            <div class="rounded-lg bg-emerald-50 p-4"><p class="text-xs text-emerald-700">Paid fines</p><p class="mt-1 text-2xl font-bold text-slate-900">{{ reportInventory.paidFines }}</p></div>
          </div>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="font-semibold text-slate-900">Collection by category</h2>
          <p class="mt-1 text-sm text-slate-500">Titles currently in the catalog.</p>
          <div class="mt-5 space-y-4">
            <div v-for="([category, count]) in reportCategories" :key="category">
              <div class="mb-1 flex items-center justify-between gap-3 text-sm"><span class="truncate text-slate-700">{{ category }}</span><span class="font-semibold text-slate-900">{{ count }}</span></div>
              <div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-blue-500" :style="{ width: `${Math.max(10, (count / Math.max(books.length, 1)) * 100)}%` }"></div></div>
            </div>
            <p v-if="!reportCategories.length" class="text-sm text-slate-500">No catalog categories yet.</p>
          </div>
        </article>
      </section>
    </template>

    <template v-else-if="section === 'settings'">
      <div class="space-y-6">
        <header class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600">System preferences</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Settings</h2>
          </div>
          <div class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            All changes saved automatically
          </div>
        </header>

        <div class="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Configuration</p>
            <nav class="mt-4 space-y-2">
              <button
                v-for="item in settingsSections"
                :key="item.key"
                type="button"
                class="flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition"
                :class="activeSettingsSection === item.key ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'"
                @click="activeSettingsSection = item.key"
              >
                <span class="flex h-8 w-8 items-center justify-center rounded-lg text-base" :class="activeSettingsSection === item.key ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'">
                  <component :is="item.icon" class="h-4 w-4" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-semibold">{{ item.label }}</span>
                  <span class="mt-0.5 block text-[11px] opacity-75">{{ item.summary }}</span>
                </span>
              </button>
            </nav>
          </aside>

          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div v-if="activeSettingsSection === 'library'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Library Information</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Public library identity</h3>
                </div>
                <span class="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">Used across the app</span>
              </div>

              <form class="mt-6 grid gap-5 md:grid-cols-2" @submit.prevent="saveSettings">
                <label class="block md:col-span-2">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Library name</span>
                  <input v-model="settingsForm.libraryName" class="field" placeholder="E-LIBRARY" />
                  <p class="mt-2 text-xs text-slate-500">This value is used on the public library pages and the admin dashboard.</p>
                </label>

                <label class="block md:col-span-2">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
                  <textarea rows="4" placeholder="Short description of the library and its mission" class="field resize-none"></textarea>
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Primary email</span>
                  <input type="email" :value="settingsStats.currentUser" class="field" />
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Library profile</span>
                  <input type="text" :value="`${settingsStats.books} titles · ${settingsStats.categories} categories`" class="field" />
                </label>

                <div class="md:col-span-2 flex justify-end pt-2">
                  <button type="submit" class="primary inline-flex items-center justify-center gap-2">
                    <Save class="h-4 w-4" />
                    Save changes
                  </button>
                </div>
              </form>
            </div>

            <div v-else-if="activeSettingsSection === 'catalog'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Catalog</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Book discovery and catalog rules</h3>
                </div>
                <span class="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">Matches the public catalog</span>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-3">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Titles</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.books }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Subjects</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.categories }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Saved</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.saved }}</p>
                </div>
              </div>

              <div class="mt-6 space-y-5">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="font-medium text-slate-800">Default catalog view</p>
                      <p class="text-sm text-slate-500">Controls how books are displayed on the bookstore and subject pages.</p>
                    </div>
                    <select class="field max-w-[180px]">
                      <option>Grid view</option>
                      <option>List view</option>
                    </select>
                  </div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="font-medium text-slate-800">Auto-refresh catalog</p>
                      <p class="text-sm text-slate-500">Refreshes after admin edits in the digital catalog.</p>
                    </div>
                    <label class="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
                      Enabled
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeSettingsSection === 'borrow'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Borrowing Rules</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Rules used by loans and late fees</h3>
                </div>
                <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Connected to circulation</span>
              </div>

              <form class="mt-6 grid gap-5 md:grid-cols-2" @submit.prevent="saveSettings">
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Default loan period</span>
                  <div class="relative">
                    <input v-model.number="settingsForm.loanDays" min="1" type="number" class="field pr-10" />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">days</span>
                  </div>
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Late fee per day</span>
                  <div class="relative">
                    <input v-model.number="settingsForm.finePerDay" min="0" step="0.25" type="number" class="field pr-10" />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">USD</span>
                  </div>
                </label>

                <label class="block md:col-span-2">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Borrow limit per member</span>
                  <input type="number" :value="Math.max(1, settingsForm.loanDays || 14)" class="field" />
                </label>

                <div class="md:col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <span>Active loans in the system</span>
                  <strong class="text-slate-900">{{ settingsStats.activeLoans }}</strong>
                </div>

                <div class="md:col-span-2 flex justify-end pt-2">
                  <button type="submit" class="primary inline-flex items-center justify-center gap-2">
                    <Save class="h-4 w-4" />
                    Save policy
                  </button>
                </div>
              </form>
            </div>

            <div v-else-if="activeSettingsSection === 'notifications'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Notifications</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Alerts used by the library workflow</h3>
                </div>
                <span class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">Admin & reader touchpoints</span>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-3">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Active</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.activeLoans }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Overdue</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.overdueLoans }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Need attention</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.activeLoans + settingsStats.overdueLoans }}</p>
                </div>
              </div>

              <div class="mt-6 space-y-4">
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Toast notifications for admin actions</span>
                  <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </label>
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Due date reminders for borrowed books</span>
                  <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </label>
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Overdue alerts and fine warnings</span>
                  <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </label>
              </div>
            </div>

            <div v-else-if="activeSettingsSection === 'members'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Members</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Reader and admin account access</h3>
                </div>
                <span class="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700">Linked to auth and admin access</span>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-3">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Readers</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.readers }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Admins</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ settingsStats.admins }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current role</p>
                  <p class="mt-2 text-lg font-semibold text-slate-900 capitalize">{{ user?.role || 'guest' }}</p>
                </div>
              </div>

              <div class="mt-6 space-y-4">
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Allow self-registration from the public site</span>
                  <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                </label>
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Require verified email before access</span>
                  <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                </label>
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Manual admin approval for new roles</span>
                  <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                </label>
              </div>
            </div>

            <div v-else-if="activeSettingsSection === 'appearance'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Appearance</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Brand styling shown on the website</h3>
                </div>
                <span class="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">Design system</span>
              </div>

              <div class="mt-6 grid gap-5 md:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Primary theme</span>
                  <select class="field">
                    <option>Default</option>
                    <option>Warm</option>
                    <option>Dark</option>
                  </select>
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Accent color</span>
                  <input type="color" value="#c9a227" class="field h-11 cursor-pointer px-2 py-2" />
                </label>
              </div>

              <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                The visual identity used on the public storefront and admin panels follows the current ETEC brand colors and warm library styling.
              </div>
            </div>

            <div v-else-if="activeSettingsSection === 'language'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Language & Region</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Locale for the public site and admin portal</h3>
                </div>
                <span class="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold text-cyan-700">Regional settings</span>
              </div>

              <div class="mt-6 grid gap-5 md:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Language</span>
                  <select class="field">
                    <option>English</option>
                    <option>French</option>
                    <option>Khmer</option>
                  </select>
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-slate-700">Timezone</span>
                  <select class="field">
                    <option>Asia/Phnom_Penh</option>
                    <option>UTC</option>
                  </select>
                </label>
              </div>
            </div>

            <div v-else-if="activeSettingsSection === 'security'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Security</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Access rules for protected admin pages</h3>
                </div>
                <span class="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-700">Protected by role checks</span>
              </div>

              <div class="mt-6 space-y-4">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current owner</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ settingsStats.currentUser }}</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Admin access</p>
                  <p class="mt-2 text-base font-semibold text-slate-900">{{ settingsStats.admins }} accounts active</p>
                </div>
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Require two-factor authentication</span>
                  <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
                </label>
                <label class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span>Session timeout after inactivity</span>
                  <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
                </label>
                <label class="block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <span class="mb-1.5 block font-medium">Password policy</span>
                  <select class="field">
                    <option>Strong password required</option>
                    <option>Standard password policy</option>
                  </select>
                </label>
              </div>
            </div>

            <div v-else-if="activeSettingsSection === 'system'">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">System</p>
                  <h3 class="mt-1 text-xl font-semibold text-slate-900">Operational tools for the library platform</h3>
                </div>
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">Connected to admin tools</span>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <button type="button" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white" @click="downloadReport">
                  <p class="text-sm font-semibold text-slate-800">Download CSV report</p>
                  <p class="mt-1 text-xs text-slate-500">Exports the current member, loan, and fine summary.</p>
                </button>
                <button type="button" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white" @click="refreshAdmins">
                  <p class="text-sm font-semibold text-slate-800">Sync admin access</p>
                  <p class="mt-1 text-xs text-slate-500">Refreshes the owner and admin list used by permissions.</p>
                </button>
                <button type="button" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white">
                  <p class="text-sm font-semibold text-slate-800">Backup data</p>
                  <p class="mt-1 text-xs text-slate-500">Creates a snapshot of the library data stored locally.</p>
                </button>
                <button type="button" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white">
                  <p class="text-sm font-semibold text-slate-800">System health</p>
                  <p class="mt-1 text-xs text-slate-500">Checks the status of catalog, borrowing, and permissions.</p>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>

    <template v-else-if="section === 'admins'">
      <section v-if="isOwnerDevice || isSuperAdminDevice" class="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
        <div class="flex items-center justify-between border-b border-amber-100 px-5 py-4">
          <div><h2 class="font-semibold text-slate-900">Admin Access Requests</h2><p class="mt-1 text-xs text-slate-500">Approve devices owned by other people before they get admin access.</p></div>
          <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{{ adminRequests.length }} pending</span>
        </div>
        <div v-if="adminRequests.length" class="divide-y divide-amber-100">
          <div v-for="req in adminRequests" :key="req.email" class="flex flex-wrap items-center gap-3 px-5 py-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-800">{{ req.name }}</p>
              <p class="truncate text-xs text-slate-500">{{ req.email }} · requested {{ req.requestedOn }}</p>
            </div>
            <button type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700" :disabled="adminBusy === req.email" @click="onApprove(req.email)">Approve</button>
            <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white" :disabled="adminBusy === req.email" @click="onDeny(req.email)">Deny</button>
          </div>
        </div>
        <p v-else class="p-8 text-center text-sm text-slate-500">No admin access requests are waiting for review.</p>
      </section>
      <section class="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <form class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="addAdmin">
          <h2 class="font-semibold text-slate-900">Add admin</h2>
          <p class="mt-1 text-xs text-slate-500">Only the owner or super-admin can manage admin access.</p>
          <div class="mt-4 space-y-3">
            <input v-model="newAdminEmail" required type="email" placeholder="Admin email address" class="field" />
            <button class="primary" :disabled="!!adminBusy">{{ adminBusy ? 'Adding...' : 'Add admin' }}</button>
          </div>
        </form>
        <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 p-4"><h2 class="font-semibold text-slate-900">Current admins</h2></div>
          <div class="divide-y divide-slate-100">
            <div class="flex items-center gap-3 p-4">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 font-semibold text-amber-600">★</span>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-slate-800">{{ user?.email }}</p>
                <p class="text-xs text-slate-500">Owner</p>
              </div>
              <span class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Owner</span>
            </div>
            <div v-for="email in adminList" :key="email" class="flex items-center gap-3 p-4">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">{{ email[0].toUpperCase() }}</span>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-slate-800">{{ email }}</p>
                <p class="text-xs text-slate-500">Administrator</p>
              </div>
              <button type="button" class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" :disabled="!!adminBusy" @click="removeAdmin(email)">Remove</button>
            </div>
            <p v-if="!adminList.length" class="p-4 text-center text-sm text-slate-500">No additional admins yet.</p>
          </div>
        </section>
      </section>
    </template>

    <template v-else-if="section === 'readers'">
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card"><p>Total readers</p><strong>{{ readers.length }}</strong></div>
        <div class="card"><p>Active borrowers</p><strong>{{ readerStats.activeBorrowers }}</strong></div>
        <div class="card"><p>Registered today</p><strong>{{ readerStats.registeredToday }}</strong></div>
      </section>
      <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 class="font-semibold text-slate-900">Reader accounts</h2>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input v-model="readerSearch" type="search" placeholder="Search by name, email, role..." class="field max-w-xs pl-9" />
          </div>
        </div>
        <div v-if="readerLoading" class="p-8 text-center text-sm text-slate-500">Loading readers...</div>
        <div v-else-if="filteredReaders.length" class="divide-y divide-slate-100">
          <div v-for="reader in filteredReaders" :key="reader.email" class="p-4">
            <div class="flex items-start gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 font-semibold text-violet-600">{{ reader.name?.[0]?.toUpperCase() || '?' }}</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="font-medium text-slate-800">{{ reader.name || 'Unnamed' }}</p>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="reader.role === 'admin' || reader.role === 'super-admin' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'">
                    {{ reader.role === 'admin' || reader.role === 'super-admin' ? 'Admin' : 'Reader' }}
                  </span>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="getReaderBorrowedCount(reader.email) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'">
                    {{ getReaderBorrowedCount(reader.email) > 0 ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">{{ reader.email }} · Joined {{ reader.createdOn }}</p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div class="flex items-center gap-3 text-xs text-slate-500">
                  <span class="text-center"><strong class="block text-sm text-slate-700">{{ getReaderBorrowedCount(reader.email) }}</strong>Borrowed</span>
                </div>
                <div class="flex gap-1.5">
                  <button v-if="canEditReader(reader)" type="button" class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1" @click="startEdit(reader)"><Edit3 class="h-3.5 w-3.5" /> Edit</button>
                  <button v-if="canEditReader(reader)" type="button" class="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1" @click="deleteReader(reader.email)"><Trash2 class="h-3.5 w-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="p-8 text-center text-sm text-slate-500">No readers found.</p>
      </section>

      <div v-if="editingReader" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl my-8">
          <h3 class="text-lg font-semibold text-slate-900">Edit reader</h3>
          <p class="mt-1 text-sm text-slate-500">{{ editingReader.email }}</p>
          <div class="mt-5 space-y-4">
            <label class="block text-sm font-medium">
              <span class="text-slate-700">Name</span>
              <input v-model="editForm.name" type="text" placeholder="Full name" class="field mt-1" />
            </label>
            <label class="block text-sm font-medium">
              <span class="text-slate-700">Role</span>
              <select v-model="editForm.role" class="field mt-1">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="secondary" @click="cancelEdit">Cancel</button>
            <button type="button" class="primary" :disabled="editBusy" @click="saveEdit">{{ editBusy ? 'Saving...' : 'Save changes' }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.field { @apply w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100; }
.primary { @apply rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-200; }
.secondary { @apply rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50; }
.card { @apply rounded-2xl border border-slate-200 bg-white p-5 shadow-sm; }
.card p { @apply text-sm text-slate-500; }
.card strong { @apply mt-3 block text-3xl font-semibold tracking-tight text-slate-900; }
</style>
