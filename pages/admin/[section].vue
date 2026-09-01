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
  UserX
} from '@lucide/vue'

const route = useRoute()
const { books, updateBook } = useCatalog()
const { data, activeLoans, overdueLoans, addMember, createLoan, returnLoan, addFine, payFine, updateSettings } = useAdminLibrary()
const { requests: allRequests } = useRequests()
const { push: toast } = useToast()
const { user } = useAuth()
const { isOwnerDevice, requests: adminRequests, approve: approveAdmin, deny: denyAdmin } = useAdminAccess()
const { state: libraryState } = useLibrary()
const section = computed(() => String(route.params.section || '').toLowerCase())
const labels: Record<string, string> = { admins: 'Admins', readers: 'Readers', members: 'Members', circulation: 'Circulation', fines: 'Fines', reports: 'Reports', settings: 'Settings' }
const title = computed(() => labels[section.value])

const newAdminEmail = ref('')
const adminBusy = ref(false)

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
const readers = ref<{ name: string; email: string; role: string; phone: string; gender: string; dateOfBirth: string; address: string; studentId: string; major: string; year: string; createdOn: string }[]>([])
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
  return readers.value.filter(r => `${r.name} ${r.email} ${r.role} ${r.phone} ${r.studentId} ${r.major} ${r.year} ${r.address}`.toLowerCase().includes(q))
})

const readerStats = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const registeredToday = readers.value.filter(r => r.createdOn === today).length
  const activeBorrowers = new Set(allRequests.value.filter(r => r.kind === 'borrow' && r.status === 'approved' && !r.processedOn).map(r => r.userEmail)).size
  const totalPurchases = allRequests.value.filter(r => r.kind === 'purchase' && r.status === 'approved').length
  return { registeredToday, activeBorrowers, totalPurchases }
})

function getReaderBorrowedCount(email: string) {
  return allRequests.value.filter(r => r.userEmail === email && r.kind === 'borrow' && r.status === 'approved').length
}

function getReaderPurchasedCount(email: string) {
  return allRequests.value.filter(r => r.userEmail === email && r.kind === 'purchase' && r.status === 'approved').length
}

function getReaderSavedCount(email: string) {
  return libraryState.value.saved.length
}

const editingReader = ref<{ name: string; email: string; role: string; phone: string; gender: string; dateOfBirth: string; address: string; studentId: string; major: string; year: string; createdOn: string } | null>(null)
const editForm = reactive({ name: '', role: 'user', phone: '', gender: '', dateOfBirth: '', address: '', studentId: '', major: '', year: '' })
const editBusy = ref(false)

function startEdit(reader: { name: string; email: string; role: string; phone: string; gender: string; dateOfBirth: string; address: string; studentId: string; major: string; year: string; createdOn: string }) {
  editingReader.value = reader
  editForm.name = reader.name
  editForm.role = reader.role
  editForm.phone = reader.phone
  editForm.gender = reader.gender
  editForm.dateOfBirth = reader.dateOfBirth
  editForm.address = reader.address
  editForm.studentId = reader.studentId
  editForm.major = reader.major
  editForm.year = reader.year
}

function cancelEdit() {
  editingReader.value = null
  editForm.name = ''
  editForm.role = 'user'
  editForm.phone = ''
  editForm.gender = ''
  editForm.dateOfBirth = ''
  editForm.address = ''
  editForm.studentId = ''
  editForm.major = ''
  editForm.year = ''
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
        role: editForm.role,
        phone: editForm.phone,
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth,
        address: editForm.address,
        studentId: editForm.studentId,
        major: editForm.major,
        year: editForm.year
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
const settingsForm = reactive({ ...data.value.settings })
const search = ref('')
const memberFor = (id: number) => data.value.members.find((item) => item.id === id)
const bookFor = (id: number) => books.value.find((item) => item.id === id)
const filteredMembers = computed(() => data.value.members.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(search.value.toLowerCase())))
const outstandingFines = computed(() => data.value.fines.filter((fine) => !fine.paid))
const availableBooks = computed(() => books.value.filter((book) => book.availability.digitalCopies > book.availability.checkedOut))
const totalFineAmount = computed(() => outstandingFines.value.reduce((sum, fine) => sum + fine.amount, 0))
function createMember() { if (!memberForm.name.trim() || !memberForm.email.trim()) return toast('Enter a member name and email.', 'error'); addMember({ ...memberForm, name: memberForm.name.trim(), email: memberForm.email.trim() }); memberForm.name = ''; memberForm.email = ''; toast('Member added.') }
function issueLoan() { const book = bookFor(loanForm.bookId); if (!loanForm.memberId || !book) return toast('Choose both a member and a book.', 'error'); if (!createLoan(loanForm.memberId, book.id)) return toast('This member already has that title.', 'error'); updateBook(book.id, { availability: { ...book.availability, checkedOut: book.availability.checkedOut + 1 } }); loanForm.memberId = 0; loanForm.bookId = 0; toast('Loan issued.') }
function finishLoan(id: number) { const loan = returnLoan(id); if (!loan) return; const book = bookFor(loan.bookId); if (book) updateBook(book.id, { availability: { ...book.availability, checkedOut: Math.max(0, book.availability.checkedOut - 1) } }); toast('Book returned.') }
function createFine() { if (!addFine(fineForm.memberId, Number(fineForm.amount), fineForm.reason)) return toast('Choose a member and enter a fine amount.', 'error'); fineForm.memberId = 0; fineForm.amount = 0; fineForm.reason = ''; toast('Fine added to the member account.') }
function saveSettings() { updateSettings({ ...settingsForm, loanDays: Number(settingsForm.loanDays), finePerDay: Number(settingsForm.finePerDay) }); toast('Library settings saved.') }
function downloadReport() { const rows = [['Metric', 'Value'], ['Members', String(data.value.members.length)], ['Active loans', String(activeLoans.value.length)], ['Overdue loans', String(overdueLoans.value.length)], ['Outstanding fines', `$${totalFineAmount.value.toFixed(2)}`], ['Catalog titles', String(books.value.length)]]; const url = URL.createObjectURL(new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' })); const link = document.createElement('a'); link.href = url; link.download = 'etec-library-report.csv'; link.click(); URL.revokeObjectURL(url); toast('Report downloaded.') }
if (!title.value) await navigateTo('/admin')
</script>

<template>
  <div v-if="title" class="mx-auto max-w-7xl space-y-6">
    <header><p class="text-sm text-slate-500">Library management</p><h1 class="mt-1 text-2xl font-bold text-slate-900">{{ title }}</h1></header>

    <template v-if="section === 'members'"><section class="grid gap-6 lg:grid-cols-[1fr_1.5fr]"><form class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="createMember"><h2 class="font-semibold text-slate-900">Add member</h2><div class="mt-4 space-y-3"><input v-model="memberForm.name" required placeholder="Full name" class="field" /><input v-model="memberForm.email" required type="email" placeholder="Email address" class="field" /><select v-model="memberForm.role" class="field"><option>Student</option><option>Teacher</option></select><button class="primary">Add member</button></div></form><section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 p-4"><input v-model="search" type="search" placeholder="Search members..." class="field" /></div><div class="divide-y divide-slate-100"><div v-for="member in filteredMembers" :key="member.id" class="flex items-center gap-3 p-4"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">{{ member.name[0] }}</span><div class="min-w-0 flex-1"><p class="font-medium text-slate-800">{{ member.name }}</p><p class="text-xs text-slate-500">{{ member.email }} · {{ member.role }}</p></div><span class="text-xs text-slate-400">{{ activeLoans.filter(loan => loan.memberId === member.id).length }} loans</span></div></div></section></section></template>

    <template v-else-if="section === 'circulation'"><section class="grid gap-6 lg:grid-cols-[1fr_1.5fr]"><form class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="issueLoan"><h2 class="font-semibold text-slate-900">Issue a loan</h2><p class="mt-1 text-xs text-slate-500">Due in {{ data.settings.loanDays }} days.</p><div class="mt-4 space-y-3"><select v-model.number="loanForm.memberId" class="field"><option :value="0">Select member</option><option v-for="member in data.members" :key="member.id" :value="member.id">{{ member.name }}</option></select><select v-model.number="loanForm.bookId" class="field"><option :value="0">Select available book</option><option v-for="book in availableBooks" :key="book.id" :value="book.id">{{ book.title }}</option></select><button class="primary">Issue loan</button></div></form><section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 p-4"><h2 class="font-semibold text-slate-900">Active loans</h2></div><div v-if="activeLoans.length" class="divide-y divide-slate-100"><div v-for="loan in activeLoans" :key="loan.id" class="flex items-center gap-3 p-4"><div class="min-w-0 flex-1"><p class="font-medium text-slate-800">{{ bookFor(loan.bookId)?.title || 'Removed title' }}</p><p class="text-xs text-slate-500">{{ memberFor(loan.memberId)?.name }} · Due {{ loan.dueOn }}</p></div><span v-if="loan.dueOn < new Date().toISOString().slice(0, 10)" class="text-xs font-semibold text-red-500">Overdue</span><button type="button" class="secondary" @click="finishLoan(loan.id)">Return</button></div></div><p v-else class="p-8 text-center text-sm text-slate-500">No active loans.</p></section></section></template>

    <template v-else-if="section === 'fines'"><section class="grid gap-4 sm:grid-cols-3"><div class="card"><p>Outstanding</p><strong>{{ outstandingFines.length }}</strong></div><div class="card"><p>Amount due</p><strong>${{ totalFineAmount.toFixed(2) }}</strong></div><div class="card"><p>Paid fines</p><strong>{{ data.fines.filter(fine => fine.paid).length }}</strong></div></section><section class="grid gap-6 lg:grid-cols-[.8fr_1.5fr]"><form class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="createFine"><h2 class="font-semibold text-slate-900">Add a fine</h2><p class="mt-1 text-xs text-slate-500">Use this for damaged, lost, or other library charges.</p><div class="mt-4 space-y-3"><select v-model.number="fineForm.memberId" class="field"><option :value="0">Select member</option><option v-for="member in data.members" :key="member.id" :value="member.id">{{ member.name }}</option></select><input v-model.number="fineForm.amount" min="0.01" step="0.01" type="number" placeholder="Amount (USD)" class="field" /><input v-model="fineForm.reason" placeholder="Reason, e.g. damaged book" class="field" /><button class="primary">Add fine</button></div></form><section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 p-4"><h2 class="font-semibold text-slate-900">Fine register</h2></div><div v-if="data.fines.length" class="divide-y divide-slate-100"><div v-for="fine in data.fines" :key="fine.id" class="flex items-center gap-3 p-4"><span class="flex h-9 w-9 items-center justify-center rounded-full" :class="fine.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">$</span><div class="min-w-0 flex-1"><p class="font-medium text-slate-800">{{ memberFor(fine.memberId)?.name || 'Former member' }}</p><p class="truncate text-xs text-slate-500">{{ fine.reason || 'Library charge' }}<span v-if="fine.bookId"> · {{ bookFor(fine.bookId)?.title }}</span></p><p class="mt-0.5 text-[11px] text-slate-400">Created {{ fine.createdOn }}<span v-if="fine.paidOn"> · Paid {{ fine.paidOn }}</span></p></div><span class="font-semibold text-slate-800">${{ fine.amount.toFixed(2) }}</span><button v-if="!fine.paid" type="button" class="secondary" @click="payFine(fine.id)">Mark paid</button><span v-else class="text-xs font-semibold text-emerald-600">Paid</span></div></div><p v-else class="p-8 text-center text-sm text-slate-500">Fines are created automatically when an overdue book is returned, or you can add one manually.</p></section></section></template>

    <template v-else-if="section === 'reports'"><section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div v-for="item in [{ label: 'Members', value: data.members.length }, { label: 'Active loans', value: activeLoans.length }, { label: 'Overdue', value: overdueLoans.length }, { label: 'Available books', value: availableBooks.length }]" :key="item.label" class="card"><p>{{ item.label }}</p><strong>{{ item.value }}</strong></div></section><section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 class="font-semibold text-slate-900">Library summary</h2><p class="mt-2 max-w-xl text-sm leading-6 text-slate-500">Download a CSV summary based on the current members, loans, fines, and catalog records.</p><button type="button" class="primary mt-5" @click="downloadReport">Download CSV report</button></section></template>

    <template v-else-if="section === 'settings'"><form class="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm" @submit.prevent="saveSettings"><h2 class="font-semibold text-slate-900">Library preferences</h2><div class="mt-5 space-y-4"><label class="block text-sm font-medium">Library name<input v-model="settingsForm.libraryName" class="field mt-1" /></label><label class="block text-sm font-medium">Default loan period (days)<input v-model.number="settingsForm.loanDays" min="1" type="number" class="field mt-1" /></label><label class="block text-sm font-medium">Late fee per day (USD)<input v-model.number="settingsForm.finePerDay" min="0" step="0.25" type="number" class="field mt-1" /></label><button class="primary">Save settings</button></div></form></template>

    <template v-else-if="section === 'admins'">
      <section v-if="isOwnerDevice" class="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
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
          <p class="mt-1 text-xs text-slate-500">Only the owner can manage admin access.</p>
          <div class="mt-4 space-y-3">
            <input v-model="newAdminEmail" required type="email" placeholder="Admin email address" class="field" />
            <button class="primary" :disabled="adminBusy">{{ adminBusy ? 'Adding...' : 'Add admin' }}</button>
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
              <button type="button" class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" :disabled="adminBusy" @click="removeAdmin(email)">Remove</button>
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
        <div class="card"><p>Total purchases</p><strong>{{ readerStats.totalPurchases }}</strong></div>
        <div class="card"><p>Registered today</p><strong>{{ readerStats.registeredToday }}</strong></div>
      </section>
      <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 class="font-semibold text-slate-900">Reader accounts</h2>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input v-model="readerSearch" type="search" placeholder="Search by name, email, phone, student ID..." class="field max-w-xs pl-9" />
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
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="getReaderBorrowedCount(reader.email) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'">
                    {{ getReaderBorrowedCount(reader.email) > 0 ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">{{ reader.email }} · {{ reader.phone }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ reader.studentId }} · {{ reader.major }} · {{ reader.year }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ reader.address }} · Joined {{ reader.createdOn }}</p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div class="flex items-center gap-3 text-xs text-slate-500">
                  <span class="text-center"><strong class="block text-sm text-slate-700">{{ getReaderBorrowedCount(reader.email) }}</strong>Borrowed</span>
                  <span class="text-center"><strong class="block text-sm text-slate-700">{{ getReaderPurchasedCount(reader.email) }}</strong>Purchased</span>
                </div>
                <div class="flex gap-1.5">
                  <button type="button" class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1" @click="startEdit(reader)"><Edit3 class="h-3.5 w-3.5" /> Edit</button>
                  <button type="button" class="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1" @click="deleteReader(reader.email)"><Trash2 class="h-3.5 w-3.5" /> Delete</button>
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
            <div class="grid grid-cols-2 gap-4">
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Name</span>
                <input v-model="editForm.name" type="text" placeholder="Full name" class="field mt-1" />
              </label>
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Phone</span>
                <input v-model="editForm.phone" type="text" placeholder="Phone number" class="field mt-1" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Gender</span>
                <select v-model="editForm.gender" class="field mt-1">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Date of Birth</span>
                <input v-model="editForm.dateOfBirth" type="date" class="field mt-1" />
              </label>
            </div>
            <label class="block text-sm font-medium">
              <span class="text-slate-700">Address</span>
              <input v-model="editForm.address" type="text" placeholder="Address" class="field mt-1" />
            </label>
            <div class="grid grid-cols-2 gap-4">
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Student ID</span>
                <input v-model="editForm.studentId" type="text" placeholder="Student ID" class="field mt-1" />
              </label>
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Major</span>
                <input v-model="editForm.major" type="text" placeholder="Major" class="field mt-1" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Year</span>
                <select v-model="editForm.year" class="field mt-1">
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                </select>
              </label>
              <label class="block text-sm font-medium">
                <span class="text-slate-700">Role</span>
                <select v-model="editForm.role" class="field mt-1">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
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
.field { @apply w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100; }
.primary { @apply rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700; }
.secondary { @apply rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50; }
.card { @apply rounded-xl border border-slate-200 bg-white p-5 shadow-sm; }
.card p { @apply text-sm text-slate-500; }.card strong { @apply mt-3 block text-3xl text-slate-900; }
</style>
