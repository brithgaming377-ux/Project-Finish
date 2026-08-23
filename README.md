# Marginalia — E-Library (Nuxt 3 + TypeScript)

A digital library site rebuilt in Nuxt 3 / TypeScript, inspired by
https://genzelib.vercel.app/ — original design throughout.

## Pages

- `/` — Hero, stats bar, "why Marginalia" features, how-it-works steps, CTA. No book listing here.
- `/products` — Full catalog: category filter chips + search, book grid (moved here from the homepage)
- `/about` — Vision, mission, services, contact
- `/account` — Mock profile + saved/favorite books
- `/login` — Login form with client-side validation

## Structure

```
components/   AppHeader, AppFooter, BookCard, CategoryChips
data/books.ts mock catalog data (edit or connect to a real API here)
pages/        index, products, about, account, login
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

## Push this to your own GitHub

This folder is already a git repo with one commit. To push it:

```bash
# 1. Create an empty repo on github.com (no README/license, so it stays empty)
# 2. Then, inside this folder:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

If you don't have a repo yet, either create one at github.com/new,
or with the GitHub CLI:

```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```

## Next steps if you want it fully functional

- Replace `data/books.ts` with a real API or database (e.g. a
  Nuxt server route + SQLite/Postgres, or a headless CMS).
- Wire up `/login` and `/account` to real authentication
  (nuxt-auth-utils or better-auth work well with Nuxt 3).
- Deploy to Vercel or Netlify (both support Nuxt 3 out of the box).

## Routing

`/products` uses Nuxt's file-based dynamic routing:

```
pages/products/index.vue   ->  /products
pages/products/[id].vue    ->  /products/:id   (e.g. /products/9)
```

`[id].vue` reads `route.params.id`, looks the book up in `data/books.ts`,
and throws a real 404 (`createError({ statusCode: 404, ... })`) if no
book matches — try visiting `/products/999`.
