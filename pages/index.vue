<script setup lang="ts">
const features = [
  {
    title: 'Read anywhere',
    desc: 'Every title opens straight in your browser — no app, no account wall.',
    icon: 'book'
  },
  {
    title: 'Built for study',
    desc: 'Categories map to real coursework: technology, science, history and more.',
    icon: 'shelf'
  },
  {
    title: 'Always free',
    desc: 'Marginalia stays free for students, teachers and independent learners.',
    icon: 'heart'
  }
]

const steps = [
  { n: '01', title: 'Browse the catalog', desc: 'Filter by subject and find something worth reading.' },
  { n: '02', title: 'Create a free account', desc: 'Takes a minute — no payment details, ever.' },
  { n: '03', title: 'Save & read', desc: 'Bookmark titles and pick up right where you left off.' }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <p class="eyebrow">Free digital library</p>
          <h1>A quiet corner of the internet, full of books.</h1>
          <p class="hero-sub">
            Marginalia is a home for the books you need for class and the
            ones you read just for yourself — open, free, and built for
            students.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/products" class="btn btn-amber">Browse the catalog</NuxtLink>
            <NuxtLink to="/about" class="btn btn-ghost">How it works</NuxtLink>
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <svg viewBox="0 0 320 240" class="book-svg">
            <g class="pages">
              <path d="M160 200 C 100 175, 40 180, 20 195 L 20 60 C 40 45, 100 40, 160 65 Z" fill="#FFFFFF" stroke="var(--ink)" stroke-width="2" />
              <path d="M160 200 C 220 175, 280 180, 300 195 L 300 60 C 280 45, 220 40, 160 65 Z" fill="#FDFBF5" stroke="var(--ink)" stroke-width="2" />
              <path d="M160 65 L 160 200" stroke="var(--ink)" stroke-width="2" />
              <path class="flip" d="M160 200 C 200 178, 250 180, 270 192 L 270 62 C 250 50, 200 48, 160 65 Z" fill="var(--amber)" opacity="0.9" />
            </g>
            <ellipse cx="160" cy="212" rx="130" ry="10" fill="var(--ink)" opacity="0.08" />
          </svg>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats">
      <div class="container stats-inner">
        <div class="stat">
          <span class="stat-num">120+</span>
          <span class="stat-label">Titles catalogued</span>
        </div>
        <div class="stat">
          <span class="stat-num">7</span>
          <span class="stat-label">Categories</span>
        </div>
        <div class="stat">
          <span class="stat-num">24/7</span>
          <span class="stat-label">Access</span>
        </div>
        <div class="stat">
          <span class="stat-num">Free</span>
          <span class="stat-label">Always</span>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features container">
      <div class="section-head">
        <p class="eyebrow">Why Marginalia</p>
        <h2>Built to get out of your way.</h2>
      </div>
      <div class="feature-grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <span class="feature-icon" aria-hidden="true">
            <svg v-if="f.icon === 'book'" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 5.5C7 4.2 10.5 4.2 12 5.5V19C10.5 17.8 7 17.8 4 19V5.5Z" stroke="var(--ink)" stroke-width="1.6"/><path d="M20 5.5C17 4.2 13.5 4.2 12 5.5V19C13.5 17.8 17 17.8 20 19V5.5Z" stroke="var(--amber-deep)" stroke-width="1.6"/></svg>
            <svg v-else-if="f.icon === 'shelf'" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 4H21V10H3V4Z" stroke="var(--ink)" stroke-width="1.6"/><path d="M3 14H21V20H3V14Z" stroke="var(--amber-deep)" stroke-width="1.6"/></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20C12 20 3 14.6 3 8.8C3 5.8 5.4 4 7.8 4C9.6 4 11.1 5 12 6.4C12.9 5 14.4 4 16.2 4C18.6 4 21 5.8 21 8.8C21 14.6 12 20 12 20Z" stroke="var(--amber-deep)" stroke-width="1.6"/></svg>
          </span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Getting started</p>
          <h2>Three steps to your next book.</h2>
        </div>
        <div class="steps">
          <div v-for="s in steps" :key="s.n" class="step">
            <span class="step-n">{{ s.n }}</span>
            <h4>{{ s.title }}</h4>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta container">
      <div class="cta-card">
        <div>
          <h2>Ready to start reading?</h2>
          <p>Head to the catalog and filter by subject — everything is free.</p>
        </div>
        <NuxtLink to="/products" class="btn btn-amber">View the catalog</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding: 56px 0 40px;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
}

.hero h1 {
  font-size: clamp(32px, 4.2vw, 48px);
  margin-top: 10px;
  max-width: 15ch;
}

.hero-sub {
  margin-top: 18px;
  color: var(--ink-soft);
  font-size: 16px;
  max-width: 48ch;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.hero-art {
  display: flex;
  justify-content: center;
}

.book-svg {
  width: 100%;
  max-width: 340px;
}

.pages .flip {
  transform-origin: 160px 130px;
  transition: transform 0.5s ease;
}

.hero-art:hover .flip {
  transform: rotateY(35deg) scaleX(0.9);
}

.stats {
  background: var(--ink);
  color: var(--parchment);
  padding: 28px 0;
}

.stats-inner {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
}

.stat-label {
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(247, 243, 232, 0.6);
}

.section-head {
  max-width: 46ch;
  margin-bottom: 32px;
}

.section-head h2 {
  font-size: clamp(22px, 3vw, 30px);
  margin-top: 8px;
}

.features {
  padding: 72px 24px 24px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 22px;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--parchment-dim);
  margin-bottom: 14px;
}

.feature-card h3 {
  font-size: 17px;
  margin-bottom: 6px;
}

.feature-card p {
  font-size: 14px;
  color: var(--ink-soft);
}

.how {
  background: var(--parchment-dim);
  padding: 64px 0;
  margin-top: 56px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.step-n {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--amber-deep);
}

.step h4 {
  font-size: 16px;
  margin: 8px 0 6px;
}

.step p {
  font-size: 14px;
  color: var(--ink-soft);
}

.cta {
  padding: 64px 24px 80px;
}

.cta-card {
  background: var(--ink);
  color: var(--parchment);
  border-radius: 10px;
  padding: 36px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cta-card h2 {
  font-size: 24px;
  color: var(--parchment);
}

.cta-card p {
  margin-top: 8px;
  color: rgba(247, 243, 232, 0.7);
  font-size: 14.5px;
}

@media (max-width: 780px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }
  .hero-art {
    order: -1;
  }
  .feature-grid,
  .steps {
    grid-template-columns: 1fr;
  }
}
</style>
