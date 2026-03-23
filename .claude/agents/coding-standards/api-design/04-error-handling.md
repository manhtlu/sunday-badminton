# API Error Handling Standards

## Error Response Format

All errors follow the same envelope:

```json
{
  "message": "Human-readable error description",
  "errors": {}
}
```

- `message` — always present, describes the error
- `errors` — optional, present only for validation errors (422)

## Error Types

### Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field is required.",
      "The email must be a valid email address."
    ],
    "name": [
      "The name must be at least 2 characters."
    ],
    "items.0.quantity": [
      "The quantity must be at least 1."
    ]
  }
}
```

### Not Found (404)

```json
{
  "message": "Resource not found."
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)

```json
{
  "message": "You do not have permission to perform this action."
}
```

### Conflict (409)

```json
{
  "message": "A user with this email already exists."
}
```

### Business Logic Error (422)

```json
{
  "message": "Order cannot be cancelled because it has already been shipped."
}
```

### Rate Limited (429)

```json
{
  "message": "Too many requests. Please try again in 60 seconds.",
  "retry_after": 60
}
```

### Server Error (500)

```json
// Production — hide details
{
  "message": "An unexpected error occurred. Please try again later."
}

// Development — include debug info
{
  "message": "An unexpected error occurred.",
  "debug": {
    "exception": "QueryException",
    "file": "app/Services/UserService.php:42",
    "trace": [...]
  }
}
```

## Error Code Pattern (optional)

For APIs that need machine-readable error codes:

```json
{
  "message": "Insufficient balance.",
  "code": "INSUFFICIENT_BALANCE",
  "errors": {
    "required": 100.00,
    "available": 50.00
  }
}
```

Common error codes:

| Code | Description |
|---|---|
| `VALIDATION_ERROR` | Input validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource does not exist |
| `DUPLICATE_ENTRY` | Resource already exists |
| `INSUFFICIENT_BALANCE` | Not enough funds/credits |
| `STATE_CONFLICT` | Action not allowed in current state |
| `RATE_LIMITED` | Too many requests |
| `MAINTENANCE` | System under maintenance |

## Rules

- Consistent error format across all endpoints — same envelope always
- `message` is human-readable — safe to show to end users
- `errors` object only for field-level validation errors
- Nested field errors use dot notation (`items.0.quantity`)
- Never expose stack traces, SQL, or internal paths in production
- Use specific HTTP status codes — not 400 for everything
- Business rule violations return 422, not 400
- 500 errors are always logged server-side with full context
- Rate limit errors include `retry_after` in seconds
- NO generic "Something went wrong" without context
- NO different error formats across endpoints

---

*API Error Handling Standard v1.0.0*
