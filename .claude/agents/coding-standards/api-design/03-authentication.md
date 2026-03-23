# API Authentication Standards

## Auth Methods

### Bearer Token (default for SPAs and mobile)

```
# Request
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response — 200
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    }
  }
}
```

### API Key (for service-to-service)

```
# Via header
GET /api/webhooks
X-API-Key: sk_live_abc123...

# Via query param (only when header not possible)
GET /api/webhooks?api_key=sk_live_abc123...
```

## Auth Endpoints

```
POST   /api/auth/register       → Register new user
POST   /api/auth/login          → Login, returns token
POST   /api/auth/logout         → Revoke token
POST   /api/auth/refresh        → Refresh expired token
GET    /api/auth/me             → Get current user profile
POST   /api/auth/forgot-password → Request password reset email
POST   /api/auth/reset-password  → Reset password with token
```

## Token Refresh Flow

```
# 1. Token expired — API returns 401
GET /api/users
← 401 { "message": "Token expired." }

# 2. Client refreshes token
POST /api/auth/refresh
Authorization: Bearer <expired-token>

← 200 {
  "data": {
    "token": "<new-token>",
    "expires_in": 3600
  }
}

# 3. Client retries original request with new token
GET /api/users
Authorization: Bearer <new-token>
← 200 { "data": [...] }
```

## Permission/Role Headers

```json
// GET /api/auth/me — includes permissions
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "role": "admin",
    "permissions": [
      "users.list",
      "users.create",
      "users.update",
      "users.delete",
      "orders.list",
      "orders.manage"
    ]
  }
}
```

## Auth Error Responses

```json
// 401 — Missing or invalid token
{
  "message": "Unauthenticated."
}

// 401 — Expired token
{
  "message": "Token expired."
}

// 403 — Insufficient permissions
{
  "message": "You do not have permission to perform this action."
}

// 422 — Login validation failed
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}

// 401 — Invalid credentials
{
  "message": "Invalid credentials."
}
```

## Rules

- Bearer token via `Authorization` header — not cookies for APIs
- Tokens have expiration — never issue permanent tokens
- Refresh token flow for long-lived sessions
- Separate auth endpoints under `/api/auth/` prefix
- Return user profile + permissions on login and `/me` endpoint
- Consistent error messages — do not leak internal details
- Rate limit auth endpoints (login, register, password reset)
- Password reset tokens are single-use and time-limited
- API keys for service-to-service only — never expose to frontend
- NO credentials in URL query params (except API key as fallback)
- NO plain text passwords in responses

---

*API Authentication Standard v1.0.0*
