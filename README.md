# 🔁 Code Reviewer Rotation App

This project is a full-featured **Code Reviewer Rotation System** designed to replace the current workflow maintained via Google Sheets. It allows teams to create projects, assign code reviewers to developers, configure custom reviewer rules, and automate recurring rotations. The app includes an automatic local development adapter and can run without a Supabase project.

---

## 📌 Features

- 🔒 Authentication with local development credentials or Supabase in a deployed environment
- 👤 Developer **Profiles**: reusable across projects
- 🧱 Project-level control over:
  - Assignees and Reviewers
  - Reviewer count per assignee
  - Fixed reviewer overrides
  - Rotation frequency & start date
- 🔁 Automatic reviewer rotations
- ✍️ Editable reviewer assignments
- 🧑‍💻 Manual re-generation of rotations (if current assignment is undesirable)
- 🗃️ Persistent rotation history (auto-saved only on scheduled runs)
- 💅 Built using Nuxt 3, UnoCSS, and Nordhealth DS

---

## 🧰 Tech Stack

| Layer        | Technology                                |
|--------------|--------------------------------------------|
| Frontend     | [Nuxt 3](https://nuxt.com/)                |
| Styling      | [UnoCSS](https://unocss.dev/), [Nord Design System](https://nordhealth.design) |
| Auth & DB    | Local browser adapter for development; Supabase-compatible production services |
| Utilities    | TypeScript, Zod, VueUse, Playwright, Vitest |
| CI/Linting   | ESLint, Stylelint, Husky, Commitlint       |

---

## 🚀 Getting Started

### Install dependencies

```bash
pnpm install
```

### Run locally without Supabase

No environment variables or external services are required:

```bash
pnpm dev
```

The app automatically seeds a local browser database on first launch. The seeded admin account is:

- Email: `admin@example.com`
- Password: `password`

Local data is stored in `localStorage`. Delete the `code-reviewer-rotation.local.v1` and `code-reviewer-rotation.local.session` keys to reset the seed data and session.

### Run with Docker

```bash
pnpm docker:up
```

This runs `docker compose up --build` and starts the app on `http://localhost:3000`.

Open `http://localhost:3000`. Docker uses the same local adapter and does not require Supabase.

### Production Supabase integration

The current local adapter is the default runtime. A production Supabase integration can be added behind a deployment-specific data adapter; the database schema remains documented in [`supabase-schema.sql`](./supabase-schema.sql).

---

## 🧪 Testing

- Unit tests (Vitest):

```bash
pnpm unit
```

- End-to-end tests (Playwright):

```bash
pnpm test
```

- Visual test runner UI:

```bash
pnpm test:ui
```

---

## 🧹 Linting & Formatting

```bash
pnpm lint
pnpm lint:fix
pnpm stylelint
pnpm stylelint:fix
```

---

## 📁 Project Structure

- **Projects**: top-level containers with settings for reviewer rotation
- **Profiles**: developer identity, reusable and linkable to users
- **Rotations**: auto- or manually-generated reviewer assignments
- **History**: stores reviewer assignment snapshots at each completed cycle

---

## 🧬 Database Schema

[`supabase-schema.sql`](./supabase-schema.sql) remains the reference schema for a hosted database implementation.

---

## 📄 License

MIT – © 2025 Provet Cloud
