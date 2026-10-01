# Guest Chat

A real-time chat app where people join as **guests** with just a nickname — no sign-up, no password.

- `backend/` — Node.js, Express, Socket.IO, MongoDB → see [backend/README.md](backend/README.md)
- `frontend/` — React + Material UI (Arabic, RTL) → see [front/README.md](front/README.md)

## Quick start

```bash
# 1) MongoDB must be running locally (or set MONGO_URI)

# 2) Backend
cd backend
npm install
cp .env.example .env
npm run dev            # http://localhost:4000

# 3) Frontend (new terminal)
cd front
npm install
cp .env.example .env
npm start              # http://localhost:3000
```

Open two browsers (or one normal + one private window), enter different nicknames, and start chatting.

## Features

One-to-one and group chat · live messages · presence · typing indicators · read receipts ·
paginated history · profile (nickname, avatar, light/dark theme) · group rename by the owner.

## Notes

Identity is deliberately simple: the server trusts the `userId` a guest received on entry. This is meant
for learning and demos, not for production security.
