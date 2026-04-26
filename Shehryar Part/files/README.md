# GamerFeed — Full-Stack Next.js + Prisma + SQLite

A gaming social feed app migrated from vanilla HTML/CSS/JS + localStorage to a
full-stack architecture: **Next.js** (React + API routes) + **Prisma ORM** + **SQLite**.

---

## Architecture Overview

```
gamerfeed/
├── prisma/
│   ├── schema.prisma      ← Data model (Users, Posts, Comments, Likes)
│   ├── seed.js            ← Populates DB with rich sample data
│   └── dev.db             ← SQLite database (auto-created)
│
├── lib/
│   ├── prisma.js          ← Prisma client singleton
│   └── repository.js      ← Data Repository (all DB read/write logic)
│
├── pages/
│   ├── index.js           ← Main React UI (replaces index.html + script.js)
│   ├── _app.js            ← Next.js app wrapper
│   └── api/
│       ├── posts/
│       │   ├── index.js          GET /api/posts  POST /api/posts
│       │   ├── [id].js           GET /api/posts/:id  DELETE /api/posts/:id
│       │   └── [id]/
│       │       ├── like.js       POST /api/posts/:id/like
│       │       └── comments.js   GET/POST /api/posts/:id/comments
│       └── users/
│           ├── me.js             GET /api/users/me
│           └── leaderboard.js    GET /api/users/leaderboard
│
├── styles/
│   └── globals.css        ← All styles (migrated + enhanced from styles.css)
│
├── next.config.js
├── package.json
└── .env                   ← DATABASE_URL="file:./dev.db"
```

---

## Data Model

```
User      — id, username, displayName, avatarText, avatarColor, xp, createdAt
Post      — id, type, title, content, game, hasAchievement, achievementName, createdAt, authorId
Comment   — id, text, createdAt, authorId, postId
Like      — id, createdAt, userId, postId?, commentId?   (unique per user+post / user+comment)
```

**Relations:**
- User → Post (one-to-many)
- User → Comment (one-to-many)
- User → Like (one-to-many)
- Post → Comment (one-to-many, cascade delete)
- Post → Like (one-to-many, cascade delete)
- Comment → Like (one-to-many, cascade delete)

---

## API Endpoints

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | /api/posts                    | All posts (filter: ?type=update…)  |
| POST   | /api/posts                    | Create a new post                  |
| GET    | /api/posts/:id                | Get single post with comments      |
| DELETE | /api/posts/:id                | Delete a post                      |
| POST   | /api/posts/:id/like           | Toggle like on a post              |
| GET    | /api/posts/:id/comments       | Get comments for a post            |
| POST   | /api/posts/:id/comments       | Add a comment                      |
| GET    | /api/users/me                 | Get current user                   |
| GET    | /api/users/leaderboard        | Top players by XP                  |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Create the SQLite database & push schema
npx prisma db push

# 4. Seed the database with sample data
node prisma/seed.js

# 5. Start the development server
npm run dev
```

Then open: **http://localhost:3000**

Or run everything in one command:
```bash
npm run setup && npm run dev
```

---

## Seed Data Summary

The seed file (`prisma/seed.js`) populates:

| Table    | Count |
|----------|-------|
| Users    | 10    |
| Posts    | 15    |
| Comments | 35+   |
| Likes    | 100+  |

Users include: DrMucahid, NightKira, VoidX, StormFang, AxelRift, LunaCore,
CryptoHawk, IronBlaze, PixelDusk, ZephyrAce — each with XP, avatarColor, etc.

---

## Data Repository Design

All database operations are in `lib/repository.js`. Key principles:

- **Filtering in DB**: `type` filter passed as a Prisma `where` clause — no
  application-level filtering.
- **Aggregation in DB**: Like counts and comment counts use Prisma's `_count`
  include — no array `.length` counting in JS.
- **Selective fields**: `select` used on `author` to fetch only the fields the
  UI needs (no over-fetching).
- **Cascade deletes**: Defined in schema so deleting a post removes its
  comments and likes automatically at DB level.

---

## What Changed from the Original

| Original                        | New                                     |
|---------------------------------|-----------------------------------------|
| localStorage                    | SQLite via Prisma                       |
| JSON in browser memory          | Relational DB with proper foreign keys  |
| Hardcoded posts in JS           | DB seed with 15 posts, 35+ comments    |
| No backend                      | Next.js API routes                      |
| Vanilla JS DOM manipulation     | React components with state             |
| Non-functional nav items        | Disabled with `cursor: not-allowed`     |
| Non-functional Share/Save btns  | Removed from modal (not implemented)    |
| Search bar (decorative)         | Disabled with tooltip "coming soon"     |

---

## Database Management

```bash
# View data in Prisma Studio (GUI)
npm run db:studio

# Reset and re-seed the database
npm run db:reset

# Re-run seed only
npm run db:seed
```
