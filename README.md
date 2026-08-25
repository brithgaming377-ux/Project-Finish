# Marginalia — E-Library (Nuxt 3 + TypeScript + Tailwind)

A digital library catalog: browse subjects, read books online, borrow,
buy, or exchange copies, and (if you're an Admin) manage the whole
catalog. Built entirely in **Nuxt 3 + TypeScript**, styled entirely
with **Tailwind CSS utility classes** — there is no hand-written CSS
file anywhere in the project.

## Folder structure

```
genz-elibrary/
├── app.vue                  Root component — sets global font/bg via Tailwind
├── nuxt.config.ts           Nuxt config (Tailwind module, fonts, meta)
├── tailwind.config.ts       ALL design tokens live here: colors, fonts, radius, shadows
├── tsconfig.json
├── package.json
│
├── data/                    Static data + types
│   ├── books.json             the catalog seed data (30 books, generated — see scripts/)
│   ├── books.ts                typed loader over books.json + helpers (getBookById, etc.)
│   └── subjects.ts             the 7 subjects: name, description, color, icon
│
├── scripts/
│   └── generate-books.mjs   One-off Node script that generates data/books.json.
│                             Not part of the running app — edit the `base` array here
│                             and re-run `node scripts/generate-books.mjs` to regenerate.
│
├── composables/              Shared reactive state (Nuxt auto-imports these)
│   ├── useAuth.ts              mock login — Admin / User roles, persisted to localStorage
│   ├── useCatalog.ts           the live book list + addBook/updateBook/deleteBook (Admin CRUD)
│   ├── useLibrary.ts           per-user saved/borrowed/purchased state
│   └── useToast.ts             small notification system (used by ToastHost.vue)
│
├── middleware/
│   └── admin.ts              Route guard — redirects non-admins away from /admin/*
│
├── layouts/
│   └── default.vue           Header + page slot + footer + toast host
│
├── components/
│   ├── AppHeader.vue          nav, auth-aware (shows Admin link + avatar menu when logged in)
│   ├── AppFooter.vue
│   ├── BookCard.vue            catalog grid card — cover, rating, price
│   ├── CategoryChips.vue       subject filter pills
│   ├── StarRating.vue          star rating display
│   ├── ToastHost.vue           renders active toasts (bottom-right)
│   └── admin/
│       └── BookForm.vue        shared add/edit form used by both admin pages
│
└── pages/                    File-based routing
    ├── index.vue               Home — search-first hero, subject tiles, features
    ├── about.vue                mission, stats (live from the catalog), FAQ
    ├── login.vue                 mock auth — pick Admin or User
    ├── account.vue                signed-in user's saved / borrowed / purchased books
    ├── subjects/
    │   ├── index.vue              all 7 subjects, with live book counts
    │   └── [slug].vue             one subject's detail page — stats, top rated, full shelf
    ├── products/
    │   ├── index.vue              full catalog — sidebar filters, search, sort
    │   └── [id]/
    │       ├── index.vue           book detail — buy / borrow / exchange / save, tabs, reviews
    │       └── read.vue            in-browser paginated reader
    └── admin/                    Admin-only (guarded by middleware/admin.ts)
        ├── index.vue               dashboard — searchable table, edit/delete
        ├── new.vue                 add a new book
        └── [id]/
            └── edit.vue            edit or delete an existing book
```

## Roles

This is a **front-end demo**, so "login" is a mock: no server, no real
passwords. On `/login`, either pick a role manually or use the
**Continue as Reader** / **Continue as Admin** buttons for an instant
demo session. The chosen role is stored in `localStorage` and read by
`useAuth()` everywhere in the app.

- **Reader (User)** — browse, save, borrow, buy, exchange, and read books.
- **Admin** — everything a Reader can do, plus `/admin`: add, edit, and
  delete catalog entries. The header shows an **Admin** nav link and an
  "Edit in admin" shortcut on every book's detail page when logged in
  as Admin.

Because auth lives in `localStorage`, the `admin` middleware only
enforces on the client (a real backend would check a session/cookie
server-side too — see "Next steps" below).

## Buy / Borrow / Exchange / Read

All of this is real, working client-side state (via `useLibrary.ts`),
not just UI:

- **Borrow** — sets a 14-day due date; shows up on `/account` with
  days remaining, and can be returned early.
- **Buy** — marks the book as purchased (price is shown throughout;
  see `price` in `data/books.json`).
- **Exchange** — trade a book you've currently borrowed for a
  different `exchangeable` book, in one click.
- **Read** — opens `/products/[id]/read`, a paginated reader UI built
  from that book's own table of contents and description — page
  controls, zoom, and a serif/sans toggle.

## Data

`data/books.json` has **30 books** across all 7 subjects, each with:
description, long description, table of contents, tags, subjects,
call number, ISBN, publisher, edition, language, format, file size,
reading time, price, exchangeable flag, rating + review breakdown,
and availability (copies / checked out).

Admin add/edit/delete operations mutate a runtime copy of this data
(via `useCatalog.ts`), persisted to `localStorage` — so changes survive
a page reload but don't touch the actual JSON file on disk. That's a
deliberate simplification for a backend-less demo; see "Next steps."

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

This folder is already a git repo with commit history. To push it:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

Or with the GitHub CLI:

```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```

## Next steps if you want it fully production-ready

- Replace `data/books.json` + `useCatalog.ts`'s localStorage persistence
  with a real database (Postgres/SQLite via Nuxt server routes, or a
  headless CMS) so catalog edits are shared across users/devices.
- Replace `useAuth.ts`'s mock login with real authentication
  (`nuxt-auth-utils` or `better-auth` both work well with Nuxt 3), and
  enforce the admin check server-side too.
- Wire the "Read" page to real PDF/EPUB files (e.g. via `pdf.js` for
  PDFs) instead of the generated chapter-preview pages.
- Add real payment processing for "Buy" (Stripe Checkout, etc.).
- Deploy to Vercel or Netlify (both support Nuxt 3 out of the box).
