# Guest Chat — Frontend

React client for the Guest Chat app. Arabic UI, right-to-left layout, light/dark theme.
Users enter with just a nickname (guest), then chat one-to-one or in groups in real time.

## Features

- Guest entry with a nickname — the session survives page reloads
- One-to-one and group conversations, live message delivery (Socket.IO)
- Online/offline presence, typing indicator, read receipts, unread badges
- Message history with "load more" pagination
- **Profile**: change nickname, avatar image, and light/dark theme (saved on the server)
- **Group rename** by the group owner (updates live for all members)
- Conversation search, new chat / new group dialogs

## Tech stack

React 18 (Create React App), Material UI 9 with RTL (`stylis-plugin-rtl`), Axios, socket.io-client.

## Setup

Requirements: Node.js 18+ and the backend running (see `../backend/README.md`).

```bash
npm install
cp .env.example .env      # set the backend URL if it is not localhost:4000
npm start                 # http://localhost:3000
npm run build             # production build
```

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:4000` | Backend base URL (REST, Socket.IO and avatar files) |

Restart `npm start` after editing `.env`.

## Project structure

```
src/
├── index.js                 # providers: RTL cache -> UserProvider -> AppThemeProvider -> App
├── App.jsx                  # loading spinner / NicknamePage (no user) / ChatPage (user)
├── AppThemeProvider.jsx     # builds the MUI theme from user.theme (light|dark)
├── theme.js                 # buildTheme(mode)
├── rtlCache.js              # emotion cache for RTL
├── api/
│   ├── http.js              # axios instance, adds x-user-id header to every request
│   ├── socket.js            # connectSocket / getSocket / disconnectSocket
│   └── assetUrl.js          # turns /uploads/... into a full URL using REACT_APP_API_URL
├── context/UserContext.jsx  # user state + createGuest, updateProfile, logout
├── pages/
│   ├── NicknamePage.jsx     # guest entry form
│   └── ChatPage.jsx         # conversations, messages and all socket event wiring
└── components/
    ├── Sidebar.jsx              # my avatar/name (opens profile), new chat/group, logout, list + search
    ├── ConversationListItem.jsx # one row: avatar, name, last message, unread badge
    ├── ChatHeader.jsx           # title, status/typing text, rename button (group owner only)
    ├── MessageList.jsx / MessageInput.jsx
    ├── NewChatDialog.jsx / NewGroupDialog.jsx
    ├── ProfileDialog.jsx        # nickname, avatar upload, dark-mode switch
    ├── UserAvatar.jsx           # image or colored initial, optional online dot
    └── EmptyState.jsx
```

## How it works

- **Session:** `createGuest` calls `POST /api/guest`, saves `guestUserId` in `localStorage`, and opens the
  socket. On reload, `UserProvider` calls `GET /api/users/me` with the saved id; if the user no longer
  exists the session is cleared.
- **State:** `UserContext` holds the current user. `ChatPage` owns conversations, messages, typing and
  read state, and subscribes to socket events (`message:new`, `message:read:ack`, `typing:*`,
  `presence:update`, `conversation:new`, `conversation:updated`).
- **Optimistic sending:** a message appears immediately with a `tempId` and is replaced when the server's
  `message:new` arrives with the same `tempId`.
- **Theme:** the choice is saved via `PATCH /api/users/me`, so it is restored on any device using the same
  guest id. Before entering, the app uses light mode.
- **Profile update:** sent as `multipart/form-data` (nickname, theme, optional avatar image ≤ 500 KB).
- **Group rename:** the pencil icon in the header (shown only when `myRole === 'owner'`) calls
  `PATCH /api/conversations/:id`; other members receive `conversation:updated`.
