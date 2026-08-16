# MediaForce

MediaForce is a media processing pipeline and web app I built to work through some real distributed-systems problems — queueing, background workers, real-time updates, and streaming large files without blowing up server memory. It's less "just another CRUD app" and more an excuse to practice the kind of architecture you'd actually need if this had to handle real traffic.

---

## How it works

1. **Client request** — the user submits a media URL from the frontend, built with Astro.
2. **API ingestion** — the NestJS API validates the request, authenticates the user via JWT, and creates a `pending` record in PostgreSQL.
3. **Queueing** — rather than processing the file inline, the API pushes the job onto a Redis queue via BullMQ.
4. **Background processing** — a separate NestJS worker picks up the job and spawns a `yt-dlp` child process at the OS level, so the main event loop never gets tied up.
5. **Progress updates** — as the download runs, the worker writes progress to Redis, which gets pushed to the frontend over a Socket.io connection.
6. **Delivery** — once the file's ready, it's streamed to the client in chunks using Node.js streams, instead of being buffered fully in memory.

---

## Stack

**Frontend** (`apps/web`)
- Astro — I went with this over React/Next mainly for the "islands" approach; most of the UI doesn't need to be interactive, so shipping less JS made sense here.
- Tailwind CSS v4 + DaisyUI for styling.
- `socket.io-client` for the real-time progress updates.

**Backend** (`apps/api`)
- NestJS (TypeScript) — the modular, DI-based structure made it easier to keep the queueing/worker logic cleanly separated from the HTTP layer.
- PostgreSQL with TypeORM.
- Redis + BullMQ for the job queue.
- Node child processes, `yt-dlp`, and `ffmpeg` for the actual media handling.

**Infra**
- Turborepo (NPM workspaces) to manage the monorepo.
- Docker + Docker Compose for local dev and deployment.

---

## A few things worth calling out

**Docker image size.** My first pass at the Dockerfile produced an 800MB+ image, mostly because it was dragging along source files and dev dependencies it didn't need at runtime. I rebuilt it as a multi-stage build — a `builder` stage that runs the Turborepo prune, an `installer` stage, and a final `runner` stage on `node:alpine` that only keeps compiled output, production `node_modules`, and the runtime binaries. Cut the image down considerably and sped up the CI builds.

**Monorepo vs. splitting things up.** Right now everything lives in one Turborepo repo, which keeps tooling (ESLint, Prettier) and shared types (`@media-force/shared`) consistent across frontend and backend. I made a point of keeping the frontend and backend from sharing any runtime logic, though — just the type definitions — so if this ever needed to be split into separate repos for separate teams, that wouldn't require much rework.

**Keeping the event loop free.** Media processing is CPU-heavy and slow, and Node is single-threaded, so doing this work inline would freeze the API for everyone. That's the main reason for the BullMQ/Redis setup — the HTTP servers just accept jobs and hand them off; the actual `yt-dlp`/`ffmpeg` work happens in separate worker processes.

**Not loading whole files into memory.** Streaming a multi-gigabyte file through a normal buffered response would mean holding the whole thing in RAM per request, which doesn't scale past a couple of concurrent downloads. Completed files get served with Node read streams instead, piped out in chunks, so memory use stays flat regardless of file size or how many people are downloading at once.

---

## Repo layout

```bash
media-force/
├── apps/
│   ├── api/          # NestJS backend (HTTP API + BullMQ workers)
│   └── web/           # Astro frontend
├── packages/
│   └── shared/         # Shared TS types/DTOs
├── storage/            # Mounted volume for processed media
├── compose.yaml        # Postgres + Redis for local dev
├── Dockerfile.api
├── Dockerfile.web
├── package.json
└── turbo.json
```

---

## Reliability & testing

- E2E tests cover the auth flow, URL validation, and database constraints on the NestJS side.
- Every HTTP endpoint sits behind a JWT `AuthGuard`; WebSocket connections go through a separate `WsGuard` at handshake time.
- If a job fails — network issue, geo-blocked source, whatever — the worker catches it, marks the job `failed` in Postgres, and cleans up any partial files so nothing gets left behind.
