<script setup lang="ts">
const services = [
  { title: 'Online Reading', desc: 'Read thousands of books directly in your browser, no download required.' },
  { title: 'Downloads', desc: 'Save PDF copies of eligible titles to read offline, anytime.' },
  { title: 'Free Membership', desc: 'Register a free account to track and save what you\u2019re reading.' },
  { title: 'Favorites', desc: 'Bookmark titles you care about and find them again in one place.' }
]

const mission = [
  'Provide quality digital learning resources',
  'Support students with free online books',
  'Reduce paper usage across campuses',
  'Build a modern, accessible library experience'
]
</script>

<template>
  <div class="container about">
    <header class="about-head">
      <p class="eyebrow">About Marginalia</p>
      <h1>A library that fits in your pocket.</h1>
      <p class="lead">
        Marginalia is a digital library platform that gives students, teachers
        and researchers access to books and educational materials, anytime
        and anywhere.
      </p>
    </header>

    <section class="split">
      <div class="split-block">
        <h3>Our vision</h3>
        <p>
          To become a trusted, free digital library that lowers the barrier
          to educational resources for anyone with an internet connection.
        </p>
      </div>
      <div class="split-block">
        <h3>Our mission</h3>
        <ul>
          <li v-for="item in mission" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="services">
      <h2>What you get</h2>
      <div class="service-grid">
        <div v-for="s in services" :key="s.title" class="service-card">
          <h4>{{ s.title }}</h4>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <section class="contact">
      <h2>Get in touch</h2>
      <p>Phnom Penh, Cambodia</p>
      <p>+855 89 416 985</p>
    </section>
  </div>
</template>

<style scoped>
.about {
  padding: 56px 24px 80px;
}

.about-head {
  max-width: 62ch;
  margin-bottom: 48px;
}

.about-head h1 {
  font-size: clamp(28px, 4vw, 40px);
  margin-top: 10px;
}

.lead {
  margin-top: 16px;
  color: var(--ink-soft);
  font-size: 16px;
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.split-block h3 {
  font-size: 19px;
  margin-bottom: 10px;
}

.split-block p,
.split-block li {
  color: var(--ink-soft);
  font-size: 14.5px;
}

.split-block ul {
  margin: 0;
  padding-left: 18px;
}

.split-block li {
  margin-bottom: 6px;
}

.services {
  padding: 48px 0;
}

.services h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.service-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px;
}

.service-card h4 {
  font-size: 16px;
  margin-bottom: 8px;
}

.service-card p {
  font-size: 14px;
  color: var(--ink-soft);
}

.contact {
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.contact h2 {
  font-size: 22px;
  margin-bottom: 12px;
}

.contact p {
  color: var(--ink-soft);
  font-size: 14.5px;
}

@media (max-width: 640px) {
  .split {
    grid-template-columns: 1fr;
  }
}
</style>
