# RESTful Conventions

## HTTP Methods

| Method | Purpose | Idempotent | Request Body | Example |
|---|---|---|---|---|
| `GET` | Read resource(s) | Yes | No | `GET /api/users` |
| `POST` | Create resource | No | Yes | `POST /api/users` |
| `PUT` | Full update | Yes | Yes | `PUT /api/users/1` |
| `PATCH` | Partial update | Yes | Yes | `PATCH /api/users/1` |
| `DELETE` | Remove resource | Yes | No | `DELETE /api/users/1` |

## Status Codes

### Success

| Code | When |
|---|---|
| `200 OK` | GET, PUT, PATCH successful |
| `201 Created` | POST successful, resource created |
| `204 No Content` | DELETE successful, no response body |

### Client Errors

| Code | When |
|---|---|
| `400 Bad Request` | Malformed request syntax |
| `401 Unauthorized` | Missing or invalid authentication |
| `403 Forbidden` | Authenticated but not authorized |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Resource state conflict (duplicate, version mismatch) |
| `422 Unprocessable Entity` | Validation failed |
| `429 Too Many Requests` | Rate limit exceeded |

### Server Errors

| Code | When |
|---|---|
| `500 Internal Server Error` | Unhandled server error |
| `502 Bad Gateway` | Upstream service failure |
| `503 Service Unavailable` | Server maintenance or overload |

## URL Structure

```
# Resource collection
GET    /api/users
POST   /api/users

# Single resource
GET    /api/users/:id
PUT    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id

# Nested resources (max 2 levels)
GET    /api/users/:id/orders
POST   /api/users/:id/orders
GET    /api/orders/:id/items        # Shallow — no /users/:id/orders/:id/items

# Custom actions (use POST for non-CRUD operations)
POST   /api/orders/:id/cancel
POST   /api/orders/:id/refund
POST   /api/users/:id/activate

# Filter, sort, search via query params
GET    /api/users?role=admin&sort=-created_at&search=john
```

## Naming Rules

```
# GOOD — plural nouns, kebab-case
/api/users
/api/order-items
/api/user-profiles

# BAD — singular, verbs, camelCase, snake_case
/api/user
/api/getUsers
/api/orderItems
/api/order_items
```

## Filtering & Sorting

```
# Filtering — field=value
GET /api/users?status=active&role=admin

# Multiple values — comma separated
GET /api/users?status=active,pending

# Date ranges — field_from, field_to
GET /api/orders?created_from=2024-01-01&created_to=2024-12-31

# Sorting — sort field, prefix - for descending
GET /api/users?sort=name            # ASC
GET /api/users?sort=-created_at     # DESC
GET /api/users?sort=-created_at,name  # Multiple

# Search — generic search param
GET /api/users?search=john
```

## Rules

- Resources are always plural nouns
- URLs are kebab-case, lowercase
- No trailing slashes (`/api/users` not `/api/users/`)
- No verbs in URLs for standard CRUD
- Nested resources max 2 levels deep — use shallow routing beyond that
- Custom actions use `POST` with descriptive path
- Query params for filtering, sorting, searching, pagination
- IDs in URL path, not query params (`/users/1` not `/users?id=1`)
- Always prefix with `/api/` for API routes

---

*RESTful Conventions Standard v1.0.0*
