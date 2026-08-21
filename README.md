# MediaForce 🚀

**MediaForce** is a highly-scalable, production-grade media processing pipeline and web application. It allows users to asynchronously download and process media files from the web, featuring real-time WebSocket progress updates, robust background job queues, and strict JWT-based authentication.

---

## 🏗️ Architecture & Features

MediaForce is designed using enterprise-grade computer science principles, completely decoupling the HTTP API from the heavy media processing tasks to ensure a blazing-fast, non-blocking user experience.

* **Asynchronous Queueing**: Media downloads are offloaded to an in-memory Redis database via **BullMQ**.
* **Background Workers**: Dedicated background processors pull jobs from Redis and spawn OS-level `yt-dlp` child processes, ensuring the main API thread never freezes.
* **Real-Time Data Bridge**: Using **Socket.io**, the background workers broadcast live download percentages through a secure TCP WebSocket pipeline directly to the frontend React components.
* **Security**: JWT-based authentication. HTTP requests are protected via `AuthGuard`, and WebSockets are secured at the handshake level via a custom `WsGuard`.
* **State Persistence**: A relational PostgreSQL database strictly tracks user ownership and download lifecycles (`pending`, `completed`, `failed`).

---

## 💻 Tech Stack

### The Monorepo
MediaForce is built as a **Turborepo** monorepo, utilizing NPM Workspaces to cleanly separate concerns while allowing for shared logic.

* **Package Manager**: NPM (`apps/*`, `packages/*`)
* **Build System**: Turborepo

### Frontend (`apps/web`)
* **Framework**: Next.js 14/15 (React)
* **Styling**: Tailwind CSS & Shadcn UI (`Card`, `Button`, `Progress`, `Input`)
* **State Management**: Zustand
* **Real-Time Engine**: Socket.io-client

### Backend (`apps/api`)
* **Framework**: NestJS (TypeScript)
* **Database**: PostgreSQL with TypeORM
* **Queue & Cache**: Redis & BullMQ
* **Real-Time Engine**: `@nestjs/websockets` (Socket.io)
* **Core Processing**: Child Processes (`spawn`), OS Streams, `yt-dlp`

---

