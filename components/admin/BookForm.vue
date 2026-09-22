<script setup lang="ts">
import type { NewBookInput } from '~/composables/useCatalog'

const props = defineProps<{
  initial?: Partial<NewBookInput>
  submitLabel: string
}>()

const { books } = useCatalog()
const { categories: managedCategories } = useCategoryManagement()

const emit = defineEmits<{ submit: [NewBookInput] }>()

const defaultCategories = ['Technology', 'Philosophy', 'Science', 'Leadership', 'Language', 'History', 'Other']

const subjectOptions = computed(() => {
  const names = new Set<string>(defaultCategories)
  for (const category of managedCategories.value) names.add(category.name)
  for (const book of books.value) names.add(book.category)
  return Array.from(names).sort()
})

const form = reactive<NewBookInput>({
  title: props.initial?.title ?? '',
  author: props.initial?.author ?? '',
  category: props.initial?.category ?? subjectOptions.value[0] ?? 'Other',
  level: props.initial?.level ?? 'Beginner',
  pages: props.initial?.pages ?? 200,
  year: props.initial?.year ?? new Date().getFullYear(),
  format: props.initial?.format ?? 'PDF',
  fileUrl: props.initial?.fileUrl ?? '',
  publisher: props.initial?.publisher ?? '',
  language: props.initial?.language ?? 'English',
  description: props.initial?.description ?? '',
  spineColor: props.initial?.spineColor ?? '#1B1F3B',
  coverUrl: props.initial?.coverUrl ?? '',
  exchangeable: props.initial?.exchangeable ?? true,
  requiresBorrow: props.initial?.requiresBorrow ?? false
})

const swatches = ['#1B1F3B', '#4A4E69', '#6B8F71', '#C97F1E', '#8C5E3C', '#3F6C51', '#C9A227']

const errors = ref<string[]>([])
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

function validate(): boolean {
  const errs: string[] = []
  const fileUrl = form.fileUrl ?? ''
  if (!form.title.trim()) errs.push('Title is required.')
  if (!form.author.trim()) errs.push('Author is required.')
  if (!form.publisher.trim()) errs.push('Publisher is required.')
  if (!form.description.trim()) errs.push('Description is required.')
  if (form.pages <= 0) errs.push('Pages must be a positive number.')
  if (!fileUrl.trim() && !selectedFile.value) errs.push('Choose a PDF or enter a file URL.')
  if (fileUrl.trim() && !/^(https?:\/\/|\/)/i.test(fileUrl)) {
    errs.push('File URL must start with http:// or https://.')
  }
  errors.value = errs
  return errs.length === 0
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
  if (selectedFile.value) form.fileUrl = ''
}

async function onSubmit() {
  if (!validate()) return
  uploading.value = true
  errors.value = []
  try {
    if (selectedFile.value) {
      const body = new FormData()
      body.append('file', selectedFile.value)
      const result = await $fetch<{ files: { url: string }[] }>('/api/upload', {
        method: 'POST',
        body
      })
      form.fileUrl = result.files[0]?.url || ''
    }
    emit('submit', { ...form, coverUrl: (form.coverUrl ?? '').trim() || undefined })
  } catch (error: any) {
    errors.value = [error?.data?.statusMessage || 'The PDF could not be uploaded.']
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
    <div class="grid sm:grid-cols-2 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Title</span>
        <input
          v-model="form.title"
          type="text"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        />
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Author</span>
        <input
          v-model="form.author"
          type="text"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        />
      </label>
    </div>

    <div class="grid sm:grid-cols-3 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Subject</span>
        <select
          v-model="form.category"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        >
          <option v-for="c in subjectOptions" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Level</span>
        <select
          v-model="form.level"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Format</span>
        <select
          v-model="form.format"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        >
          <option value="PDF">PDF</option>
          <option value="EPUB">EPUB</option>
        </select>
      </label>
    </div>

    <div class="grid sm:grid-cols-4 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Pages</span>
        <input
          v-model.number="form.pages"
          type="number"
          min="1"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        />
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Year</span>
        <input
          v-model.number="form.year"
          type="number"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        />
      </label>
      <label class="flex items-end gap-2 text-[13px] font-semibold pb-2.5">
        <input v-model="form.exchangeable" type="checkbox" class="w-4 h-4" />
        <span>Exchangeable</span>
      </label>
      <label class="flex items-end gap-2 text-[13px] font-semibold pb-2.5">
        <input v-model="form.requiresBorrow" type="checkbox" class="w-4 h-4" />
        <span>Requires borrow to read</span>
      </label>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Publisher</span>
        <input
          v-model="form.publisher"
          type="text"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        />
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Language</span>
        <input
          v-model="form.language"
          type="text"
          class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white"
        />
      </label>
    </div>

    <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
      <span>Description</span>
      <textarea
        v-model="form.description"
        rows="4"
        class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white resize-y"
      />
    </label>

    <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
      <span>PDF / EPUB file URL</span>
      <input
        v-model.trim="form.fileUrl"
        type="url"
        placeholder="https://example.com/book.pdf"
        class="w-full rounded-card border border-line bg-white px-3 py-2.5 text-sm font-normal"
      />
      <span class="text-xs font-normal text-ink-soft">Direct link to the book file. It opens when clicking "Read now".</span>
    </label>

    <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
      <span>Choose the PDF from your computer</span>
      <input
        type="file"
        accept="application/pdf,.pdf"
        class="w-full rounded-card border border-line bg-white px-3 py-2.5 text-sm font-normal"
        @change="onFileChange"
      />
      <span class="text-xs font-normal text-ink-soft">The selected file is uploaded when you save the book.</span>
    </label>

    <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
      <span>Cover image URL</span>
      <input
        v-model.trim="form.coverUrl"
        type="url"
        placeholder="https://example.com/cover.jpg"
        class="w-full rounded-card border border-line bg-white px-3 py-2.5 text-sm font-normal"
      />
      <span class="text-xs font-normal text-ink-soft">Optional. Leave empty to use the category cover.</span>
    </label>

    <div class="flex flex-col gap-1.5 text-[13px] font-semibold">
      <span>Cover color</span>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="s in swatches"
          :key="s"
          type="button"
          class="w-8 h-8 rounded-full border-2"
          :class="form.spineColor === s ? 'border-ink' : 'border-transparent'"
          :style="{ background: s }"
          :aria-label="`Choose color ${s}`"
          @click="form.spineColor = s"
        />
        <input
          v-model="form.spineColor"
          type="color"
          class="w-8 h-8 rounded-full border border-line cursor-pointer"
        />
      </div>
    </div>

    <div v-if="errors.length" class="bg-rose/10 border border-rose/30 rounded-card p-3.5">
      <p v-for="e in errors" :key="e" class="text-rose text-[13px]">{{ e }}</p>
    </div>

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="uploading"
        class="rounded-card bg-ink text-white font-semibold text-sm px-6 py-2.5 hover:bg-ink-light transition"
      >
        {{ uploading ? 'Uploading PDF...' : submitLabel }}
      </button>
      <slot name="extra-actions" />
    </div>
  </form>
</template>
