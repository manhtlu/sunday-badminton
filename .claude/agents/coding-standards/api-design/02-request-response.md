# Request & Response Standards

## Request Body

```json
// POST /api/users — Create
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}

// PUT /api/users/1 — Full update (all fields required)
{
  "name": "John Updated",
  "email": "john@example.com",
  "role": "admin"
}

// PATCH /api/users/1 — Partial update (only changed fields)
{
  "name": "John Updated"
}
```

## Response Envelope

### Single Resource

```json
// GET /api/users/1 — 200
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "message": null
}

// POST /api/users — 201
{
  "data": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "message": "Created successfully."
}
```

### Collection with Pagination

```json
// GET /api/users?page=1&per_page=15 — 200
{
  "data": [
    { "id": 1, "name": "John Doe" },
    { "id": 2, "name": "Jane Doe" }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 50,
    "last_page": 4
  }
}
```

### No Content

```
// DELETE /api/users/1 — 204
// (empty response body)
```

### Action Response

```json
// POST /api/orders/1/cancel — 200
{
  "data": {
    "id": 1,
    "status": "cancelled",
    "cancelled_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Order cancelled successfully."
}
```

## Pagination

Query params:

| Param | Default | Description |
|---|---|---|
| `page` | 1 | Current page number |
| `per_page` | 15 | Items per page (max 100) |

Meta fields always included in paginated responses:

| Field | Description |
|---|---|
| `current_page` | Current page number |
| `per_page` | Items per page |
| `total` | Total number of items |
| `last_page` | Last page number |

## Relationships

```json
// Include related resources — query param
GET /api/orders?include=user,items

// Response with included relations
{
  "data": {
    "id": 1,
    "status": "pending",
    "user": {
      "id": 1,
      "name": "John Doe"
    },
    "items": [
      { "id": 1, "product_id": 10, "quantity": 2 }
    ]
  }
}
```

## Data Format Conventions

| Type | Format | Example |
|---|---|---|
| Date/time | ISO 8601 | `2024-01-15T10:30:00.000Z` |
| Boolean | true/false | `"is_active": true` |
| Enum/Status | lowercase string | `"status": "pending"` |
| Money | numeric, explicit precision | `"amount": 99.99` |
| ID | integer or UUID string | `"id": 1` or `"id": "550e8400-..."` |
| Nullable | null, not empty string | `"notes": null` |

## Rules

- All responses wrapped in `{ data, message }` or `{ data, meta }` envelope
- Dates always ISO 8601 with timezone
- Null for absent values — never empty string `""` or `0`
- Snake_case for all JSON field names
- Pagination required for all list endpoints — no unbounded queries
- `per_page` max 100 — prevent abuse
- Include relationships only when explicitly requested via `?include=`
- Consistent envelope across all endpoints — no exceptions

---

*Request & Response Standard v1.0.0*
