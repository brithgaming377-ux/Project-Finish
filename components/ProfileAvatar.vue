<script setup lang="ts">
defineProps<{
  name?: string
  avatar?: string
  alt?: string
}>()
</script>

<template>
  <span class="flex items-center justify-center overflow-hidden rounded-full">
    <img v-if="avatar" :src="avatar" :alt="alt || `${name || 'User'} profile picture`" loading="eager" decoding="async" class="h-full w-full object-cover object-center" />
    <span v-else>{{ name?.charAt(0).toUpperCase() || '?' }}</span>
  </span>
</template>
