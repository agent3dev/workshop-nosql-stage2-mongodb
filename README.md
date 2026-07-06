# 📰 NextGen Python Internship MX Q2 2026 [Stage 2]: Workshop NoSQL DB — MongoDB

**Case study: Forbes' 2011 CMS rebuild.**

In 2011, Forbes rewrote their entire content-management system on MongoDB
so editors could publish articles, videos, slideshows, and sponsored posts
— each shaped completely differently — without a DBA running a schema
migration every time a new content type showed up. It's a real, documented
case study, not a toy example:
https://www.mongodb.com/solutions/customer-case-studies/forbes

This session rebuilds a small version of that same CMS, hitting each
MongoDB feature at the exact point Forbes' engineers actually needed it.

**Format:** this is a follow-along-with-teacher session, not a self-paced
tutorial. Some of you will type every command as we go, others will watch
and jump in on the open challenges at the end of each file — both are
fine, go at the pace that fits your comfort with the terminal.

---

## Before the session (do this once)

Same WSL2 + Docker Desktop setup as Stage 1. If you already did that for
the SQL workshop, skip straight to **Get the workshop files**.

### WSL 2 (Windows Subsystem for Linux)

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

Restart your computer when prompted. After restarting, Ubuntu will open
and ask you to create a Linux username and password.

> Mac users: skip the WSL steps, everything else is the same.

### Docker Desktop

Download from: https://www.docker.com/products/docker-desktop/

During install, check **"Use WSL 2 instead of Hyper-V"**. Afterwards,
open **Settings → Resources → WSL Integration** and enable it for Ubuntu.
Wait for **"Engine running"** in the bottom-left corner.

### Get the workshop files

```bash
git clone https://github.com/agent3dev/workshop-nosql-stage2-mongodb.git
cd workshop-nosql-stage2-mongodb
```

---

## Session start — bring the stack up

```bash
docker compose up -d
```

This starts:
1. **`forbes_mongo`** — MongoDB 7, auto-loads the seed data from `init/`
2. **`forbes_mongo_express`** — a web UI to browse the database visually

**Verify it's running:**

```bash
docker compose ps
```

---

## Connect — pick whichever you're more comfortable with

### Option A: mongo-express (visual)

Open http://localhost:8081 in your browser. You should see the
`forbes_cms` database with `articles` and `authors` collections.

### Option B: mongosh (terminal)

```bash
docker exec -it forbes_mongo mongosh -u editor -p headline1917 --authenticationDatabase admin forbes_cms
```

Try it:

```js
db.articles.find().pretty();
```

You should see 4 seeded articles. Type `exit` to leave.

> This is the shell every exercise file in this workshop is written for —
> copy each block into it as we go.

---

## Curriculum

Work through the files in order. Each one is the case study's own story,
one beat at a time.

| File | Topic | The Forbes need it answers |
|------|-------|------------------------------|
| `exercises/01_crud.js` | **CRUD basics** | Get comfortable reading/writing documents before anything else |
| `exercises/02_schema_design.js` | **Schema design: embed vs. reference** | The actual reason Forbes chose Mongo — 4 content types, 1 collection, no migrations |
| `exercises/03_aggregation.js` | **Aggregation pipelines** | "Real-time insight into social sharing" — Forbes' own words |
| `exercises/04_indexes.js` | **Indexes** | Serving ~121M monthly users without a collection scan per page load |

Take-home challenges are at the end of each file (Part D / F). Solutions
live in `exercises/solutions/`.

---

## The database

```
authors ──< articles (author_id is a reference, not a join)
articles.comments   -- embedded array
articles.tags       -- embedded array
```

| Collection | What it stores |
|---|---|
| `authors` | Byline info — referenced from articles, not embedded |
| `articles` | Mixed-shape documents: `article`, `video`, `slideshow`, `sponsored` — plus embedded `comments` and `stats` |

---

## Cheat sheet

| What you want | Command |
|---|---|
| See all documents | `db.articles.find()` |
| See specific fields | `db.articles.find({}, { title: 1, _id: 0 })` |
| Filter | `db.articles.find({ type: 'video' })` |
| Sort | `.sort({ published_at: -1 })` |
| Limit | `.limit(10)` |
| Count | `db.articles.countDocuments({ type: 'video' })` |
| Insert one | `db.articles.insertOne({ ... })` |
| Update one field | `db.articles.updateOne({ slug: 'x' }, { $set: { title: 'y' } })` |
| Push to an array | `db.articles.updateOne({ slug: 'x' }, { $push: { comments: {...} } })` |
| Delete | `db.articles.deleteOne({ slug: 'x' })` |
| Explain a query | `db.articles.find({...}).explain('executionStats')` |

---

## Stop the database (when you're done)

```bash
docker compose down
```

Data persists in a Docker volume — `docker compose up -d` again picks up
right where you left off.

---

## Troubleshooting

**`docker compose` command not found**
Try `docker-compose` (hyphenated). Make sure Docker Desktop is running
and WSL integration is enabled.

**Port 27017 or 8081 already in use**
Something else is bound to that port. Stop it, or change the left side
of the port mapping in `docker-compose.yml` (e.g. `27018:27017`).

**mongo-express shows "not authorized"**
Double check `ME_CONFIG_MONGODB_ADMINUSERNAME` / `PASSWORD` in
`docker-compose.yml` match the mongo service's root credentials.

**Containers stopped after restarting my PC**
Run `docker compose up -d` again from the workshop folder.
