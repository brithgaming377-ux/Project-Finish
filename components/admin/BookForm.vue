<script setup lang="ts">
import { categories } from '~/data/books'
import type { NewBookInput } from '~/composables/useCatalog'

const props = defineProps<{
  initial?: Partial<NewBookInput>
  submitLabel: string
}>()

const emit = defineEmits<{ submit: [NewBookInput] }>()

const form = reactive<NewBookInput>({
  title: props.initial?.title ?? '',
  author: props.initial?.author ?? '',
  category: props.initial?.category ?? categories[0],
  level: props.initial?.level ?? 'Beginner',
  pages: props.initial?.pages ?? 200,
  year: props.initial?.year ?? new Date().getFullYear(),
  price: props.initial?.price ?? 12.99,
  format: props.initial?.format ?? 'PDF',
  publisher: props.initial?.publisher ?? '',
  language: props.initial?.language ?? 'English',
  description: props.initial?.description ?? '',
  spineColor: props.initial?.spineColor ?? '#1B1F3B',
  exchangeable: props.initial?.exchangeable ?? true
})

const swatches = ['#1B1F3B', '#4A4E69', '#6B8F71', '#C97F1E', '#8C5E3C', '#3F6C51', '#C9A227']

const errors = ref<string[]>([])

function validate(): boolean {
  const errs: string[] = []
  if (!form.title.trim()) errs.push('Title is required.')
  if (!form.author.trim()) errs.push('Author is required.')
  if (!form.publisher.trim()) errs.push('Publisher is required.')
  if (!form.description.trim()) errs.push('Description is required.')
  if (form.pages <= 0) errs.push('Pages must be a positive number.')
  if (form.price < 0) errs.push('Price cannot be negative.')
  errors.value = errs
  return errs.length === 0
}

function onSubmit() {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
    <div class="grid sm:grid-cols-2 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Title</span>
        <input v-model="form.title" type="text" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white" />
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Author</span>
        <input v-model="form.author" type="text" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white" />
      </label>
    </div>

    <div class="grid sm:grid-cols-3 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Subject</span>
        <select v-model="form.category" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white">
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Level</span>
        <select v-model="form.level" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Format</span>
        <select v-model="form.format" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white">
          <option value="PDF">PDF</option>
          <option value="EPUB">EPUB</option>
        </select>
      </label>
    </div>

    <div class="grid sm:grid-cols-4 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Pages</span>
        <input v-model.number="form.pages" type="number" min="1" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white" />
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Year</span>
        <input v-model.number="form.year" type="number" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white" />
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Price (USD)</span>
        <input v-model.number="form.price" type="number" step="0.01" min="0" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white" />
      </label>
      <label class="flex items-end gap-2 text-[13px] font-semibold pb-2.5">
        <input v-model="form.exchangeable" type="checkbox" class="w-4 h-4" />
        <span>Exchangeable</span>
      </label>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Publisher</span>
        <input v-model="form.publisher" type="text" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white" />
      </label>
      <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
        <span>Language</span>
        <input v-model="form.language" type="text" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white" />
      </label>
    </div>

    <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
      <span>Description</span>
      <textarea v-model="form.description" rows="4" class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-white resize-y" />
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
        <input v-model="form.spineColor" type="color" class="w-8 h-8 rounded-full border border-line cursor-pointer" />
      </div>
    </div>

    <div v-if="errors.length" class="bg-rose/10 border border-rose/30 rounded-card p-3.5">
      <p v-for="e in errors" :key="e" class="text-rose text-[13px]">{{ e }}</p>
    </div>

    <div class="flex items-center gap-3 pt-2">
      <button type="submit" class="rounded-card bg-ink text-white font-semibold text-sm px-6 py-2.5 hover:bg-ink-light transition">
        {{ submitLabel }}
      </button>
      <slot name="extra-actions" />
    </div>
  </form>
</template>
