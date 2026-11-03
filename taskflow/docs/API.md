# API contract

TaskFlow runs against a built-in mock API by default. To connect a real backend, set the base URL in `.env`:

```
VITE_API_URL=https://api.example.com
```

When `VITE_API_URL` is set, `boardApi` and `authApi` switch from the mock to HTTP (see `src/shared/api/http.ts`). No component or store code changes. The frontend sends JSON, includes cookies (`credentials: 'include'`) and aborts requests after 10 seconds.

## Errors

Any non-2xx response is turned into an `ApiError` with the HTTP status. If the body is JSON with a `message` string, that message is shown to the user.

```json
{ "message": "Invalid email or password" }
```

## Endpoints

### `POST /auth/login`

Request:

```json
{ "email": "dev@example.com", "password": "secret1" }
```

`200 OK`:

```json
{ "id": "user_1", "email": "dev@example.com", "name": "dev" }
```

`401 Unauthorized` for invalid credentials.

### `GET /board`

`200 OK` returns the whole board in normalized form:

```json
{
  "cards": {
    "c1": {
      "id": "c1",
      "title": "Design onboarding",
      "description": "",
      "priority": "high",
      "createdAt": 1730000000000
    }
  },
  "columns": {
    "todo": { "id": "todo", "title": "To do", "cardIds": ["c1"] }
  },
  "columnOrder": ["todo"]
}
```

`priority` is one of `low`, `medium`, `high`.

### `PUT /board`

Replaces the board with the request body (same shape as `GET /board`). Responds `204 No Content`.

The UI applies changes optimistically and rolls back with a notification if this request fails.

## Realtime

Cross-tab updates currently use `BroadcastChannel` through `src/shared/lib/realtime.ts`. For multi-user sync, replace that module's implementation with a WebSocket client that exposes the same `publish` / `subscribe` interface. The server should emit a `board-updated` event after each successful `PUT /board`.

## Next steps for a production backend

- Per-card endpoints (`POST /cards`, `PATCH /cards/:id`, `DELETE /cards/:id`, `POST /cards/:id/move`) to avoid sending the whole board on every change
- Token or session auth with refresh handling
- Pagination or lazy loading for large boards
