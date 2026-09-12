<template>
  <div class="min-h-screen bg-parchment font-body text-ink antialiased">
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
    <AIChatWidget />
  </div>
</template>
