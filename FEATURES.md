# ChatApp - Feature, Database & API Reference (Microservices)

> This is a **design / planning document only**. It contains **no code** - just
> features, the microservice that owns each feature, the database tables, and the
> API endpoints with descriptions.
>
> It is organised **phase by phase**. Build the early phases first (MVP), then
> scale outward into the later phases. Each phase lists:
>
> 1. **Goal** - what the user gets
> 2. **Owner service** - which microservice is responsible
> 3. **Tables** - database tables + column descriptions
> 4. **APIs** - endpoints + descriptions
> 5. **Events** - real-time socket events (where relevant)

---

## Microservice Map

Each service owns its **own database** (database-per-service pattern). Services
talk to each other through the **API Gateway** (sync) and an **event bus** like
Redis / Kafka (async).

| Service                | Stack (current / planned)     | Database         | Responsibility                                        |
| ---------------------- | ----------------------------- | ---------------- | ----------------------------------------------------- |
| `api-gateway`          | Node + Express                | -                | Single entry point, routing, auth check, rate limit   |
| `auth-service`         | Node + Express, Prisma, JWT   | MySQL            | Register, login, OTP, tokens, sessions, devices       |
| `user-service`         | Node + Express, Prisma        | PostgreSQL       | Profiles, contacts, blocking, privacy                 |
| `chat-service`         | Node + Express (planned)      | PostgreSQL       | Conversations (1:1 + group), membership               |
| `message-service`      | Node + Express (planned)      | PostgreSQL/Mongo | Messages, reactions, replies, edits, receipts         |
| `media-service`        | Node + Express (planned)      | S3 + metadata DB | File upload/download, thumbnails                       |
| `presence-service`     | Node + Socket.IO (planned)    | Redis            | Online status, typing, last-seen, delivery            |
| `notification-service` | Node + Express (planned)      | PostgreSQL       | Push / in-app notifications                            |
| `call-service`         | Node + WebRTC signaling (plan)| Redis            | Voice/video call signaling                             |
| `status-service`       | Node + Express (planned)      | PostgreSQL       | Stories / status (24h expiry)                          |
| `search-service`       | Node + Elasticsearch (plan)   | Elasticsearch    | Full-text search of messages/users/groups             |
| `analytic-service`     | Python + FastAPI              | MySQL (read)     | Metrics & reporting                                   |
| `admin-service`        | Node + Express (planned)      | PostgreSQL       | Reports, moderation, bans                              |

> **Convention:** all public routes are prefixed with `/api/v1/...` at the
> gateway. The service-internal path is shown without the prefix below.

---

# PHASE 1 - Authentication & Identity

**Goal:** users can sign up, verify, and log in securely.
**Owner:** `auth-service` (MySQL)

### Tables

**`auth-user`** - the login identity (credentials only, not the public profile)

| Column              | Type     | Description                          |
| ------------------- | -------- | ------------------------------------ |
| id                  | uuid PK  | Unique account id                    |
| email               | string   | Login email (unique)                 |
| password            | string   | Hashed password (bcrypt)             |
| firstName           | string?  | First name                           |
| lastName            | string?  | Last name                            |
| mobile              | string?  | Phone number                         |
| role                | enum     | USER / ADMIN / SUPER_ADMIN           |
| is_email_verified   | bool     | Email verified flag                  |
| is_phone_verified   | bool     | Phone verified flag                  |
| token               | text?    | Current refresh/session token        |
| createdAt           | datetime | Created at                           |
| updatedAt           | datetime | Updated at                           |

**`otps`** - one-time codes for verification / password reset

| Column    | Type     | Description                       |
| --------- | -------- | --------------------------------- |
| id        | uuid PK  | OTP id                            |
| email     | string   | Target email                      |
| otp       | string   | The code (hashed in prod)         |
| verified  | bool     | Whether it was consumed           |
| expiresAt | datetime | Expiry timestamp                  |
| userId    | uuid? FK | Linked account                    |
| createdAt | datetime | Created at                        |

### APIs

| Method | Path                    | Description                                 |
| ------ | ----------------------- | ------------------------------------------- |
| POST   | `/auth/register`        | Create a new account                        |
| POST   | `/auth/login`           | Log in, returns access + refresh token      |
| POST   | `/auth/logout`          | Invalidate the current session              |
| POST   | `/auth/send-otp`        | Send OTP to email/phone                     |
| POST   | `/auth/verify-otp`      | Verify the OTP code                         |
| POST   | `/auth/refresh-token`   | Exchange refresh token for new access token |
| POST   | `/auth/forgot-password` | Start password reset (sends OTP)            |
| POST   | `/auth/reset-password`  | Set a new password using OTP                |
| GET    | `/auth/me`              | Get the current authenticated identity      |

---

# PHASE 2 - User Profile

**Goal:** every account has a public profile others can see.
**Owner:** `user-service` (PostgreSQL)

### Tables

**`users`** - public profile (separate from credentials)

| Column        | Type     | Description                               |
| ------------- | -------- | ----------------------------------------- |
| id            | uuid PK  | Matches `auth-user.id`                     |
| username      | string   | Unique handle                             |
| display_name  | string   | Shown name                                |
| bio           | text?    | About / bio text                          |
| avatar_url    | text?    | Profile photo URL                         |
| phone         | string?  | Phone number                              |
| status_msg    | string?  | Status text ("Hey there!")                |
| is_online     | bool     | Online flag (synced from presence)        |
| last_seen_at  | datetime | Last activity time                        |
| privacy       | json     | Privacy settings (last_seen, photo, etc.) |
| created_at    | datetime | Created at                                |

### APIs

| Method | Path             | Description                          |
| ------ | ---------------- | ------------------------------------ |
| GET    | `/users/me`      | Get my profile                       |
| PUT    | `/users/me`      | Update my profile                    |
| DELETE | `/users/me`      | Delete my account                    |
| GET    | `/users/:userId` | Get another user's public profile    |
| POST   | `/users/avatar`  | Upload/replace avatar                |
| DELETE | `/users/avatar`  | Remove avatar                        |
| PUT    | `/users/status`  | Update status message                |
| PUT    | `/users/about`   | Update bio/about                     |
| PUT    | `/users/privacy` | Update privacy settings              |

---

# PHASE 3 - Contacts & Blocking

**Goal:** users build a contact list and can block people.
**Owner:** `user-service` (PostgreSQL)

### Tables

**`contacts`** - one user's saved contacts

| Column     | Type     | Description                     |
| ---------- | -------- | ------------------------------- |
| id         | uuid PK  | Contact row id                  |
| owner_id   | uuid FK  | Who owns this contact list      |
| contact_id | uuid FK  | The saved user                  |
| nickname   | string?  | Custom name for the contact     |
| created_at | datetime | Saved at                        |

**`blocked_users`** - block relationships

| Column     | Type     | Description           |
| ---------- | -------- | --------------------- |
| blocker_id | uuid FK  | User who blocks       |
| blocked_id | uuid FK  | User who is blocked   |
| created_at | datetime | Blocked at            |

### APIs

| Method | Path                     | Description                  |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/contacts`              | List my contacts            |
| POST   | `/contacts`              | Add a contact               |
| DELETE | `/contacts/:contactId`   | Remove a contact            |
| GET    | `/contacts/search`       | Search contacts             |
| POST   | `/users/block/:userId`   | Block a user                |
| DELETE | `/users/block/:userId`   | Unblock a user              |
| GET    | `/users/blocked`         | List blocked users          |

---

# PHASE 4 - Direct (1:1) Chat

**Goal:** two users can have a private conversation.
**Owner:** `chat-service` (conversations) + `message-service` (messages)

### Tables

**`conversations`** - a chat thread (1:1 or group)

| Column      | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| id          | uuid PK  | Conversation id                      |
| type        | enum     | DIRECT / GROUP                       |
| created_by  | uuid     | Creator user id                      |
| created_at  | datetime | Created at                           |
| updated_at  | datetime | Last message time (for sorting)      |

**`conversation_members`** - who is in a conversation

| Column          | Type     | Description                         |
| --------------- | -------- | ----------------------------------- |
| id              | uuid PK  | Row id                              |
| conversation_id | uuid FK  | The conversation                    |
| user_id         | uuid FK  | Member                              |
| role            | enum     | MEMBER / ADMIN (groups)             |
| joined_at       | datetime | When they joined                    |
| last_read_at    | datetime | For unread counts                   |

**`messages`** - a single message (owned by `message-service`)

| Column          | Type     | Description                              |
| --------------- | -------- | ---------------------------------------- |
| id              | uuid PK  | Message id                               |
| conversation_id | uuid FK  | Parent conversation                      |
| sender_id       | uuid     | Who sent it                              |
| type            | enum     | TEXT / IMAGE / VIDEO / AUDIO / DOC / etc |
| body            | text?    | Text content                             |
| media_id        | uuid?    | Linked media file                        |
| reply_to_id     | uuid?    | Message being replied to                 |
| status          | enum     | SENT / DELIVERED / READ                  |
| edited_at       | datetime?| If edited                                |
| deleted_at      | datetime?| Soft delete                              |
| created_at      | datetime | Sent at                                  |

### APIs

| Method | Path                      | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| POST   | `/chats`                  | Start/find a 1:1 conversation        |
| GET    | `/chats`                  | List my conversations                |
| GET    | `/chats/:chatId`          | Get one conversation                 |
| DELETE | `/chats/:chatId`          | Leave/delete a conversation          |
| POST   | `/messages`               | Send a message                       |
| GET    | `/messages/:chatId`       | Get recent messages                  |
| GET    | `/messages/:chatId/history` | Paginated message history          |
| PUT    | `/messages/:messageId`    | Edit a message                       |
| DELETE | `/messages/:messageId`    | Delete a message (for me)            |

---

# PHASE 5 - Real-Time Messaging (WebSocket)

**Goal:** messages, typing, and presence happen live.
**Owner:** `presence-service` (Socket.IO + Redis)

### Tables

Mostly **Redis** (ephemeral). Persistent state is mirrored to `users.is_online`
and `users.last_seen_at`.

| Redis key                | Description                          |
| ------------------------ | ------------------------------------ |
| `presence:{userId}`      | online/offline + last-seen           |
| `socket:{userId}`        | active socket/device ids             |
| `typing:{conversationId}`| who is currently typing              |

### Events

| Event               | Direction       | Description                     |
| ------------------- | --------------- | ------------------------------- |
| `socket:connect`    | client → server | Open connection                 |
| `socket:disconnect` | client → server | Close connection                |
| `message:send`      | client → server | Send a message                  |
| `message:receive`   | server → client | Deliver a message               |
| `message:delivered` | server → client | Mark delivered                  |
| `message:read`      | both            | Mark read                       |
| `typing:start`      | both            | Started typing                  |
| `typing:stop`       | both            | Stopped typing                  |
| `user:online`       | server → client | Contact came online             |
| `user:offline`      | server → client | Contact went offline            |
| `user:last-seen`    | server → client | Last-seen update                |

---

# PHASE 6 - Media Sharing

**Goal:** send images, videos, audio, and documents.
**Owner:** `media-service` (object storage + metadata DB)

### Tables

**`media_files`**

| Column       | Type     | Description                         |
| ------------ | -------- | ----------------------------------- |
| id           | uuid PK  | File id                             |
| uploader_id  | uuid     | Who uploaded                        |
| type         | enum     | IMAGE / VIDEO / AUDIO / DOCUMENT    |
| url          | text     | Storage URL                         |
| thumbnail_url| text?    | Preview URL                         |
| mime_type    | string   | MIME type                           |
| size_bytes   | bigint   | File size                           |
| created_at   | datetime | Uploaded at                         |

### APIs

| Method | Path                       | Description               |
| ------ | -------------------------- | ------------------------- |
| POST   | `/media/upload/image`      | Upload an image           |
| POST   | `/media/upload/video`      | Upload a video            |
| POST   | `/media/upload/audio`      | Upload audio              |
| POST   | `/media/upload/document`   | Upload a document         |
| GET    | `/media/:fileId`           | Get/download a file       |
| DELETE | `/media/:fileId`           | Delete a file             |
| POST   | `/messages/image`          | Send an image message     |
| POST   | `/messages/video`          | Send a video message      |
| POST   | `/messages/audio`          | Send an audio message     |
| POST   | `/messages/document`       | Send a document message   |

---

# PHASE 7 - Group Chat

**Goal:** many users in one conversation with admins.
**Owner:** `chat-service` (reuses `conversations` with `type = GROUP`)

### Tables

**`groups`** - group metadata (extends a conversation)

| Column          | Type     | Description                  |
| --------------- | -------- | ---------------------------- |
| id              | uuid PK  | Group id                     |
| conversation_id | uuid FK  | Linked conversation          |
| name            | string   | Group name                   |
| description     | text?    | Group description            |
| avatar_url      | text?    | Group photo                  |
| created_by      | uuid     | Creator/owner                |
| created_at      | datetime | Created at                   |

> Members & roles reuse the `conversation_members` table from Phase 4.

### APIs

| Method | Path                                   | Description              |
| ------ | -------------------------------------- | ----------------------- |
| POST   | `/groups`                              | Create a group          |
| GET    | `/groups`                              | List my groups          |
| GET    | `/groups/:groupId`                     | Get group details       |
| PUT    | `/groups/:groupId`                     | Update group info       |
| DELETE | `/groups/:groupId`                     | Delete a group          |
| POST   | `/groups/:groupId/members`             | Add member(s)           |
| DELETE | `/groups/:groupId/members/:userId`     | Remove a member         |
| GET    | `/groups/:groupId/members`             | List members            |
| POST   | `/groups/:groupId/admins`              | Promote to admin        |
| DELETE | `/groups/:groupId/admins/:userId`      | Demote an admin         |

---

# PHASE 8 - Read Receipts & Delivery Status

**Goal:** show sent / delivered / read (ticks).
**Owner:** `message-service`

### Tables

**`message_receipts`**

| Column      | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| id          | uuid PK  | Row id                         |
| message_id  | uuid FK  | The message                    |
| user_id     | uuid     | The recipient                  |
| status      | enum     | DELIVERED / READ               |
| updated_at  | datetime | When status changed            |

### APIs

| Method | Path                              | Description           |
| ------ | --------------------------------- | --------------------- |
| POST   | `/messages/:messageId/delivered`  | Mark delivered        |
| POST   | `/messages/:messageId/read`       | Mark read             |
| GET    | `/messages/:messageId/status`     | Get receipt status    |

---

# PHASE 9 - Reactions, Reply & Forward

**Goal:** richer interactions on messages.
**Owner:** `message-service`

### Tables

**`message_reactions`**

| Column     | Type     | Description                |
| ---------- | -------- | -------------------------- |
| id         | uuid PK  | Reaction id                |
| message_id | uuid FK  | The message                |
| user_id    | uuid     | Who reacted                |
| emoji      | string   | The emoji (👍 ❤️ 😂 …)       |
| created_at | datetime | Reacted at                 |

> Reply uses `messages.reply_to_id` (Phase 4). Forward creates a new message
> referencing the original.

### APIs

| Method | Path                                | Description           |
| ------ | ----------------------------------- | --------------------- |
| POST   | `/messages/:messageId/reactions`    | Add a reaction        |
| DELETE | `/messages/:messageId/reactions`    | Remove a reaction     |
| POST   | `/messages/:messageId/reply`        | Reply to a message    |
| POST   | `/messages/:messageId/forward`      | Forward a message     |

---

# PHASE 10 - Message Management (Star / Pin / Delete)

**Goal:** organise and control messages.
**Owner:** `message-service`

### Tables

**`starred_messages`**

| Column     | Type     | Description        |
| ---------- | -------- | ------------------ |
| user_id    | uuid     | Who starred        |
| message_id | uuid FK  | Starred message    |
| created_at | datetime | Starred at         |

**`pinned_messages`**

| Column          | Type     | Description           |
| --------------- | -------- | --------------------- |
| conversation_id | uuid FK  | The conversation      |
| message_id      | uuid FK  | Pinned message        |
| pinned_by       | uuid     | Who pinned            |
| created_at      | datetime | Pinned at             |

### APIs

| Method | Path                              | Description                |
| ------ | --------------------------------- | -------------------------- |
| POST   | `/messages/:messageId/star`       | Star a message             |
| DELETE | `/messages/:messageId/star`       | Unstar                     |
| GET    | `/messages/starred`               | List starred messages      |
| POST   | `/messages/:messageId/pin`        | Pin a message              |
| DELETE | `/messages/:messageId/pin`        | Unpin                      |
| PUT    | `/messages/:messageId`            | Edit a message             |
| DELETE | `/messages/:messageId`            | Delete for me              |
| DELETE | `/messages/:messageId/everyone`   | Delete for everyone        |

---

# PHASE 11 - Search

**Goal:** find messages, users, and groups fast.
**Owner:** `search-service` (Elasticsearch, fed by an event stream)

### Tables

Elasticsearch indexes (not relational):

| Index      | Description                         |
| ---------- | ----------------------------------- |
| `messages` | Indexed message text for full-text  |
| `users`    | Indexed usernames / display names   |
| `groups`   | Indexed group names                 |

### APIs

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/search/messages`  | Search messages (`text,chatId,from,to`) |
| GET    | `/search/users`     | Search users                         |
| GET    | `/search/groups`    | Search groups                        |

---

# PHASE 12 - Notifications

**Goal:** push and in-app notifications.
**Owner:** `notification-service`

### Tables

**`notifications`**

| Column     | Type     | Description                       |
| ---------- | -------- | --------------------------------- |
| id         | uuid PK  | Notification id                   |
| user_id    | uuid     | Recipient                         |
| type       | enum     | MESSAGE / CALL / GROUP / SYSTEM   |
| title      | string   | Title                             |
| body       | text     | Content                           |
| data       | json     | Deep-link payload                 |
| is_read    | bool     | Read flag                         |
| created_at | datetime | Created at                        |

**`device_tokens`** - push tokens (FCM/APNs)

| Column     | Type     | Description           |
| ---------- | -------- | --------------------- |
| id         | uuid PK  | Row id                |
| user_id    | uuid     | Owner                 |
| token      | string   | Push token            |
| platform   | enum     | IOS / ANDROID / WEB   |
| created_at | datetime | Registered at         |

### APIs

| Method | Path                  | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/notifications/send` | Send a notification      |
| GET    | `/notifications`      | List my notifications    |
| PUT    | `/notifications/read` | Mark as read             |

---

# PHASE 13 - Voice Notes

**Goal:** record and send voice messages.
**Owner:** `media-service` + `message-service`

### Tables

Reuses `media_files` with `type = AUDIO` and a message with `type = AUDIO`.

### APIs / Events

| Method | Path                | Description              |
| ------ | ------------------- | ------------------------ |
| POST   | `/voice-notes`      | Upload a voice note      |
| GET    | `/voice-notes/:id`  | Get a voice note         |

| Event             | Description            |
| ----------------- | ---------------------- |
| `voice:recording` | User is recording      |
| `voice:uploaded`  | Voice note ready       |

---

# PHASE 14 - Status / Stories

**Goal:** 24-hour disappearing stories.
**Owner:** `status-service`

### Tables

**`statuses`**

| Column     | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| id         | uuid PK  | Status id                      |
| user_id    | uuid     | Author                         |
| type       | enum     | IMAGE / VIDEO / TEXT           |
| content    | text     | Text or media URL              |
| expires_at | datetime | Auto-expire (24h)              |
| created_at | datetime | Posted at                      |

**`status_views`**

| Column     | Type     | Description        |
| ---------- | -------- | ------------------ |
| status_id  | uuid FK  | Viewed status      |
| viewer_id  | uuid     | Who viewed         |
| viewed_at  | datetime | When               |

### APIs

| Method | Path           | Description            |
| ------ | -------------- | ---------------------- |
| POST   | `/status`      | Post a status          |
| GET    | `/status`      | Get contacts' statuses |
| DELETE | `/status/:id`  | Delete my status       |

---

# PHASE 15 - Voice & Video Calling

**Goal:** real-time voice/video (WebRTC).
**Owner:** `call-service` (signaling only; media is peer-to-peer WebRTC)

### Tables

**`calls`**

| Column          | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| id              | uuid PK  | Call id                        |
| caller_id       | uuid     | Who started                    |
| conversation_id | uuid?    | Linked conversation/group      |
| type            | enum     | VOICE / VIDEO                  |
| status          | enum     | RINGING/ONGOING/ENDED/MISSED   |
| started_at      | datetime | Start time                     |
| ended_at        | datetime?| End time                       |

### APIs / Events

| Method | Path             | Description           |
| ------ | ---------------- | --------------------- |
| POST   | `/calls/voice`   | Start a voice call    |
| POST   | `/calls/video`   | Start a video call    |
| GET    | `/calls/history` | Call history          |

| Event           | Description        |
| --------------- | ------------------ |
| `call:incoming` | Incoming call      |
| `call:accepted` | Call accepted      |
| `call:rejected` | Call rejected      |
| `call:ended`    | Call ended         |

---

# PHASE 16 - Multi-Device Support

**Goal:** use the account on several devices.
**Owner:** `auth-service`

### Tables

**`devices`**

| Column      | Type     | Description                  |
| ----------- | -------- | ---------------------------- |
| id          | uuid PK  | Device id                    |
| user_id     | uuid     | Owner                        |
| device_name | string   | "iPhone 15", "Web Chrome"    |
| platform    | enum     | IOS / ANDROID / WEB          |
| last_active | datetime | Last seen                    |
| created_at  | datetime | Linked at                    |

### APIs

| Method | Path                  | Description            |
| ------ | --------------------- | ---------------------- |
| GET    | `/devices`            | List linked devices    |
| POST   | `/devices/link`       | Link a new device      |
| DELETE | `/devices/:deviceId`  | Unlink a device        |

---

# PHASE 17 - Admin & Moderation

**Goal:** report abuse and moderate users.
**Owner:** `admin-service`

### Tables

**`reports`**

| Column       | Type     | Description                  |
| ------------ | -------- | ---------------------------- |
| id           | uuid PK  | Report id                    |
| reporter_id  | uuid     | Who reported                 |
| target_type  | enum     | USER / MESSAGE / GROUP       |
| target_id    | uuid     | What was reported            |
| reason       | text     | Reason                       |
| status       | enum     | OPEN / REVIEWED / ACTIONED   |
| created_at   | datetime | Reported at                  |

**`user_bans`**

| Column     | Type     | Description           |
| ---------- | -------- | --------------------- |
| id         | uuid PK  | Ban id                |
| user_id    | uuid     | Banned user           |
| banned_by  | uuid     | Admin                 |
| reason     | text     | Reason                |
| expires_at | datetime?| Temp ban expiry       |
| created_at | datetime | Banned at             |

### APIs

| Method | Path                 | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/reports`           | Submit a report     |
| GET    | `/reports`           | List reports (admin)|
| POST   | `/admin/ban-user`    | Ban a user          |
| POST   | `/admin/unban-user`  | Unban a user        |

---

# PHASE 18 - Analytics

**Goal:** metrics and reporting.
**Owner:** `analytic-service` (FastAPI, read-only)

### Tables

Read-only access to other services' data (via DB views or an event-sourced
analytics store). No write tables of its own initially.

### APIs

| Method | Path                          | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/analytics/users`            | User metrics          |
| GET    | `/analytics/messages`         | Message metrics       |
| GET    | `/analytics/groups`           | Group metrics         |

---

# PHASE 19 - Enterprise / Advanced

**Goal:** power features for scale.
**Owner:** mix (`message-service`, new `poll-service`, etc.)

### Tables (selected)

**`scheduled_messages`**

| Column          | Type     | Description           |
| --------------- | -------- | --------------------- |
| id              | uuid PK  | Row id                |
| sender_id       | uuid     | Author                |
| conversation_id | uuid     | Target                |
| body            | text     | Content               |
| send_at         | datetime | When to send          |
| status          | enum     | PENDING / SENT        |

**`polls`** + **`poll_votes`**

| Column     | Type     | Description           |
| ---------- | -------- | --------------------- |
| id         | uuid PK  | Poll id               |
| created_by | uuid     | Author                |
| question   | text     | Poll question         |
| options    | json     | Choices               |
| created_at | datetime | Created at            |

### APIs

| Method | Path                       | Description              |
| ------ | -------------------------- | ------------------------ |
| POST   | `/messages/schedule`       | Schedule a message       |
| GET    | `/messages/scheduled`      | List scheduled messages  |
| POST   | `/polls`                   | Create a poll            |
| GET    | `/polls/:id`               | Get a poll               |
| POST   | `/polls/:id/vote`          | Vote on a poll           |
| POST   | `/broadcasts`              | Send a broadcast         |

---

# PHASE 20 - Security & Scale Hardening

**Goal:** make it production-grade.
**Owner:** cross-cutting (gateway + all services)

| Area                  | What to add                                                    |
| --------------------- | ------------------------------------------------------------- |
| End-to-end encryption | Signal protocol; server stores ciphertext only                |
| Rate limiting         | Per-user/IP limits at the gateway (Redis)                     |
| Sessions & refresh    | Redis-backed sessions, rotating refresh tokens                |
| RBAC                  | Role-based access (USER / ADMIN / SUPER_ADMIN)                |
| OAuth / MFA           | Social login + multi-factor auth                              |
| Event bus             | Kafka / RabbitMQ for async cross-service events               |
| Caching               | Redis for hot data (profiles, conversations)                  |
| Observability         | Centralized logging, tracing, health checks per service      |

---

## Build / Scale Order (Roadmap)

**MVP (Phases 1-7)**
Auth → Profile → Contacts → Direct Chat → Real-Time → Media → Groups

**V2 (Phases 8-13)**
Receipts → Reactions/Reply/Forward → Star/Pin → Search → Notifications → Voice Notes

**V3 (Phases 14-17)**
Status/Stories → Calling → Multi-Device → Admin/Moderation

**V4 (Phases 18-20)**
Analytics → Enterprise (polls/scheduled/broadcast) → Security & Scale (E2EE, MFA, event bus)

---

## How Microservices Fit Together (Request Flow)

```
Client (web / mobile)
        │
        ▼
   API Gateway  ──(JWT check, routing, rate limit)
        │
        ├──► auth-service        (login, tokens, devices)
        ├──► user-service        (profiles, contacts, blocking)
        ├──► chat-service        (conversations, groups)
        ├──► message-service     (messages, reactions, receipts)
        ├──► media-service       (files)
        ├──► presence-service    (WebSocket: online, typing)  ◄── real-time
        ├──► notification-service(push / in-app)
        ├──► call-service        (WebRTC signaling)
        ├──► status-service      (stories)
        ├──► search-service      (search)
        ├──► admin-service       (moderation)
        └──► analytic-service    (metrics)
                │
                ▼
        Event Bus (Redis / Kafka) ── async events between services
```

- **Sync** calls go through the gateway.
- **Async** events (e.g. "message.sent", "user.registered") flow over the event
  bus so services stay decoupled.
- Each service owns its **own database**; services never read each other's tables
  directly (except `analytic-service`, which reads for reporting).
