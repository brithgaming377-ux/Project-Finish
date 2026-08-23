# Marginalia — E-Library (Nuxt 3 + TypeScript)

A digital library site rebuilt in Nuxt 3 / TypeScript, inspired by
https://genzelib.vercel.app/ — same core pages and features (home
catalog with category filtering, about, account, login), original
design.

## Pages

- `/` — Hero, stats bar, category filter chips, book grid
- `/about` — Vision, mission, services, contact
- `/account` — Mock profile + saved/favorite books
- `/login` — Login form with client-side validation

## Structure

```
components/   AppHeader, AppFooter, BookCard, CategoryChips
data/books.ts mock catalog data (edit or connect to a real API here)
pages/        index, about, account, login
assets/css/   design tokens + global styles
```

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Build for production

```bash
npm run build
npm run preview
```

## Next steps if you want it fully functional

- Replace `data/books.ts` with a real API or database (e.g. a
  Nuxt server route + SQLite/Postgres, or a headless CMS).
- Wire up `/login` and `/account` to real authentication
  (nuxt-auth-utils or better-auth work well with Nuxt 3).
- Add a search input alongside the category chips.
