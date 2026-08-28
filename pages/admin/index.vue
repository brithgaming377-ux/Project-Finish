<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import { Doughnut, Line } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)
const { books, updateBook } = useCatalog()
const { requests, pending, updateStatus, recordPayment } = useRequests()
const { push: toast } = useToast()
const { isOwnerDevice, requests: adminRequests, approve: approveAdmin, deny: denyAdmin } = useAdminAccess()
const adminBusy = ref<string | null>(null)

async function onApprove(deviceId: string) {
  adminBusy.value = deviceId
  try {
    await approveAdmin(deviceId)
    toast('Admin access granted.')
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not approve.', 'error')
  } finally {
    adminBusy.value = null
  }
}

async function onDeny(deviceId: string) {
  adminBusy.value = deviceId
  try {
    await denyAdmin(deviceId)
    toast('Admin request denied.')
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not deny.', 'error')
  } finally {
    adminBusy.value = null
  }
}
const totalCopies = computed(() => books.value.reduce((sum, book) => sum + book.availability.digitalCopies, 0))
const loans = computed(() => books.value.reduce((sum, book) => sum + book.availability.checkedOut, 0))
const overdue = computed(() => books.value.filter((book) => book.availability.checkedOut >= book.availability.digitalCopies).slice(0, 3))
const paidSales = computed(() => requests.value.filter((request) => request.kind === 'purchase' && request.paymentStatus === 'paid'))
const salesRevenue = computed(() => paidSales.value.reduce((total, sale) => total + (sale.amount || 0), 0))
const recent = computed(() => [...books.value].filter((book) => book.availability.checkedOut > 0).sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()).slice(0, 3))
const chartData = computed(() => ({ labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: [4, 7, 5, 10, 8, 13, Math.max(6, loans.value)], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, .12)', fill: true, tension: .4, pointRadius: 3 }] }))
const categoryData = computed(() => ({ labels: ['On loan', 'Available'], datasets: [{ data: [loans.value, Math.max(totalCopies.value - loans.value, 0)], backgroundColor: ['#2563eb', '#dbeafe'], borderWidth: 0 }] }))
const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } } } }
const doughnutOptions = { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 14 } } } }
function processRequest(id: number, decision: 'approved' | 'declined') {
  const request = pending.value.find((item) => item.id === id)
  if (!request) return
  const book = books.value.find((item) => item.id === request.bookId)
  if (decision === 'approved' && request.kind === 'borrow') {
    if (!book || book.availability.checkedOut >= book.availability.digitalCopies) return toast('This book no longer has an available copy.', 'error')
    updateBook(book.id, { availability: { ...book.availability, checkedOut: book.availability.checkedOut + 1 } })
  }
  updateStatus(id, decision)
  if (decision === 'approved' && request.kind === 'purchase') recordPayment(id)
  toast(`${request.kind === 'borrow' ? 'Borrow' : 'Purchase'} request ${decision}.`)
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6"><div><p class="text-sm text-slate-500">Overview</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1></div>
    <section v-if="isOwnerDevice" class="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
      <div class="flex items-center justify-between border-b border-amber-100 px-5 py-4">
        <div><h2 class="font-semibold text-slate-900">Admin Access Requests</h2><p class="mt-1 text-xs text-slate-500">Approve devices owned by other people before they get admin access.</p></div>
        <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{{ adminRequests.length }} pending</span>
      </div>
      <div v-if="adminRequests.length" class="divide-y divide-amber-100">
        <div v-for="req in adminRequests" :key="req.deviceId" class="flex flex-wrap items-center gap-3 px-5 py-4">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800">{{ req.name }}</p>
            <p class="truncate text-xs text-slate-500">{{ req.email }} · requested {{ req.requestedOn }}</p>
            <p class="mt-1 truncate font-mono text-[11px] text-slate-400">device: {{ req.deviceId }}</p>
          </div>
          <button type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700" :disabled="adminBusy === req.deviceId" @click="onApprove(req.deviceId)">Approve</button>
          <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white" :disabled="adminBusy === req.deviceId" @click="onDeny(req.deviceId)">Deny</button>
        </div>
      </div>
      <p v-else class="p-8 text-center text-sm text-slate-500">No admin access requests are waiting for review.</p>
    </section>
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><article v-for="stat in [{ label: 'Books', value: totalCopies, icon: '▣', style: 'bg-blue-50 text-blue-600' }, { label: 'Members', value: 1280, icon: '♙', style: 'bg-violet-50 text-violet-600' }, { label: 'Loans', value: loans, icon: '↻', style: 'bg-emerald-50 text-emerald-600' }, { label: 'Overdue', value: overdue.length, icon: '!', style: 'bg-red-50 text-red-600' }]" :key="stat.label" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div class="flex items-start justify-between"><p class="text-sm font-medium text-slate-500">{{ stat.label }}</p><span class="flex h-9 w-9 items-center justify-center rounded-lg" :class="stat.style">{{ stat.icon }}</span></div><p class="mt-4 text-3xl font-bold text-slate-900">{{ Number(stat.value).toLocaleString() }}</p><p class="mt-1 text-xs text-slate-400">{{ stat.label === 'Overdue' ? 'Need attention' : 'Library total' }}</p></article></section>
    <section class="grid gap-6 xl:grid-cols-3"><article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"><div class="mb-5 flex items-start justify-between"><div><h2 class="font-semibold text-slate-900">Borrowing Activity</h2><p class="mt-1 text-xs text-slate-500">Loans issued in the last 7 days</p></div><span class="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">This week</span></div><div class="h-64"><Line :data="chartData" :options="lineOptions" /></div></article><article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 class="font-semibold text-slate-900">Categories</h2><p class="mt-1 text-xs text-slate-500">Book availability</p><div class="h-56 pt-4"><Doughnut :data="categoryData" :options="doughnutOptions" /></div></article></section>
    <section class="grid gap-6 xl:grid-cols-3"><article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2"><div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 class="font-semibold text-slate-900">Reader Requests</h2><p class="mt-1 text-xs text-slate-500">Approve purchases and borrowing before access is granted.</p></div><span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{{ pending.length }} pending</span></div><div v-if="pending.length" class="divide-y divide-slate-100"><div v-for="request in pending" :key="request.id" class="flex flex-wrap items-center gap-3 px-5 py-4"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm text-blue-600">{{ request.kind === 'borrow' ? '↻' : '$' }}</span><div class="min-w-0 flex-1"><p class="text-sm font-semibold text-slate-800">{{ request.userName }} <span class="font-normal text-slate-500">requested to {{ request.kind }}</span></p><p class="truncate text-xs text-slate-500">{{ books.find(book => book.id === request.bookId)?.title || 'Removed book' }} · {{ request.userEmail }}<span v-if="request.kind === 'purchase'"> · ${{ (request.amount || 0).toFixed(2) }}</span></p></div><span class="text-xs text-slate-400">{{ request.requestedOn }}</span><button type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700" @click="processRequest(request.id, 'approved')">{{ request.kind === 'purchase' ? 'Confirm payment' : 'Approve' }}</button><button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50" @click="processRequest(request.id, 'declined')">Decline</button></div></div><p v-else class="p-8 text-center text-sm text-slate-500">No reader requests are waiting for review.</p></article><article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="border-b border-slate-100 px-5 py-4"><h2 class="font-semibold text-slate-900">Sales & payments</h2><p class="mt-1 text-xs text-slate-500">Confirmed book purchases</p></div><div class="p-5"><p class="text-sm text-slate-500">Total revenue</p><p class="mt-1 text-3xl font-bold text-slate-900">${{ salesRevenue.toFixed(2) }}</p><p class="mt-1 text-xs text-emerald-600">{{ paidSales.length }} paid purchase{{ paidSales.length === 1 ? '' : 's' }}</p></div><div v-if="paidSales.length" class="divide-y divide-slate-100 border-t border-slate-100"><div v-for="sale in paidSales.slice(0, 4)" :key="sale.id" class="flex items-center justify-between gap-3 px-5 py-3"><div class="min-w-0"><p class="truncate text-xs font-semibold text-slate-800">{{ sale.userName }}</p><p class="truncate text-[11px] text-slate-500">{{ books.find(book => book.id === sale.bookId)?.title }}</p></div><span class="text-xs font-semibold text-emerald-600">${{ (sale.amount || 0).toFixed(2) }}</span></div></div><p v-else class="border-t border-slate-100 px-5 py-6 text-center text-xs text-slate-500">No payments recorded yet.</p></article></section>
    <section class="grid gap-6 lg:grid-cols-2"><article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 class="font-semibold text-slate-900">Recent Borrowing</h2><NuxtLink to="/admin/inventory" class="text-xs font-semibold text-blue-600 hover:underline">View all</NuxtLink></div><div v-if="recent.length" class="divide-y divide-slate-100"><div v-for="(book, i) in recent" :key="book.id" class="flex items-center gap-3 px-5 py-4"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">{{ ['J', 'D', 'S'][i] }}</span><div class="min-w-0 flex-1"><p class="text-sm font-medium text-slate-800">{{ ['John', 'Dara', 'Sokha'][i] || 'Member' }}</p><p class="truncate text-xs text-slate-500">Borrowed {{ book.title }}</p></div><span class="text-xs text-slate-400">Today</span></div></div><p v-else class="px-5 py-10 text-center text-sm text-slate-500">No current borrowing.</p></article><article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div class="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 class="font-semibold text-slate-900">Overdue Books</h2><span class="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{{ overdue.length }} overdue</span></div><div v-if="overdue.length" class="divide-y divide-slate-100"><div v-for="(book, i) in overdue" :key="book.id" class="flex items-center gap-3 px-5 py-4"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-600">{{ ['J', 'D', 'V'][i] }}</span><div class="min-w-0 flex-1"><p class="text-sm font-medium text-slate-800">{{ ['John', 'Dara', 'Vanna'][i] || 'Member' }}</p><p class="truncate text-xs text-slate-500">{{ book.title }}</p></div><span class="text-xs font-medium text-red-500">{{ 8 - i * 2 }} days</span></div></div><p v-else class="px-5 py-10 text-center text-sm text-slate-500">No overdue books.</p></article></section>
  </div>
</template>
