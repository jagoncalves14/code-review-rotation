# 🔁 Code Reviewer Rotation App

This project is a full-featured **Code Reviewer Rotation System** designed to replace the current workflow maintained via Google Sheets. It allows teams to create projects, assign code reviewers to developers, configure custom reviewer rules, and automate recurring rotations — all backed by **Supabase** and styled with the **Nordhealth Design System**.

---

## 📌 Features

- 🔒 **Authentication** via Supabase Auth  
- 👤 Developer **Profiles**: reusable across projects  
- 🧱 Project-level control over:
  - Assignees and Reviewers  
  - Reviewer count per assignee  
  - Fixed reviewer overrides  
  - Rotation frequency & start date  
- 🔁 Automatic reviewer rotations  
- ✍️ Editable reviewer assignments  
- 🧑‍💻 Manual re-generation of rotations (if current assignment is undesirable)  
- 🗃️ Persistent **rotation history** (auto-saved only on scheduled runs)  
- 💅 Built using Nuxt 3, UnoCSS, and Nordhealth DS  

---

## 🧰 Tech Stack

| Layer        | Technology                                |
|--------------|--------------------------------------------|
| Frontend     | [Nuxt 3](https://nuxt.com/)                |
| Styling      | [UnoCSS](https://unocss.dev/), [Nord Design System](https://nordhealth.design) |
| Auth & DB    | [Supabase](https://supabase.com/)          |
| Utilities    | TypeScript, Zod, VueUse, Playwright, Vitest |
| CI/Linting   | ESLint, Stylelint, Husky, Commitlint       |

---

## 📁 Project Structure

- **Projects**: top-level containers with settings for reviewer rotation  
- **Profiles**: developer identity, reusable and linkable to users  
- **Rotations**: auto- or manually-generated reviewer assignments  
- **History**: stores reviewer assignment snapshots at each completed cycle  

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/code-reviewer-rotation.git
cd code-reviewer-rotation
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment

Copy and update `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials and environment settings.

### 4. Run the app locally

```bash
pnpm dev
```

### 5. Build for production

```bash
pnpm build
```

Serve the generated app:

```bash
pnpm start
# or for static site preview
pnpm start:generate
```

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

- JavaScript & TypeScript:

```bash
pnpm lint
pnpm lint:fix
```

- Styles:

```bash
pnpm stylelint
pnpm stylelint:fix
```

---

## 💡 Conventions

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).  
- Pre-commit hooks are enforced using Husky + Lint-Staged.  
- Typing and formatting are checked via ESLint, Stylelint, and Vue TSC.  

---

## 🔧 Supabase Integration

This project uses Supabase for:

- **Auth**: User sign-up, login, and profile linkage  
- **Database**: Projects, Profiles, Rotations, History  
- **Scheduled Functions / CRON**: Automatic rotation logic  
- **RLS**: Row-level security to protect multi-user access  

Ensure your Supabase project has:

- Auth enabled  
- Database tables matching the schema  
- Scheduled functions to trigger automatic rotation on interval  

---

## 🧬 Database Schema

The Supabase database structure used in this project is fully defined in [`supabase-schema.sql`](./supabase-schema.sql).  
Use this as the source of truth for table definitions, relationships, and documentation for tools like Cursor.

---

## 📄 License

MIT – © 2025 Provet Cloud

---

## 🙌 Acknowledgements

- [Nordhealth Design System](https://nordhealth.design)  
- [Nuxt](https://nuxt.com/)  
- [Supabase](https://supabase.com/)  
- [UnoCSS](https://unocss.dev/)  

---

_Contributions welcome!_
