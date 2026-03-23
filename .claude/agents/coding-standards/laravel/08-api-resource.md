# Laravel API Resource Standards

## Principle

API Resources are the single layer that transforms models into JSON responses. They control exactly what data is exposed to the client.

## Standard Resource

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
```

## Resource with Relationships

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'total_amount' => $this->total_amount,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toISOString(),

            // Conditional relationships — only included when loaded
            'user' => new UserResource($this->whenLoaded('user')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),

            // Conditional fields
            'completed_at' => $this->when($this->completed_at, fn () =>
                $this->completed_at->toISOString()
            ),
        ];
    }
}
```

## Resource Collection with Meta

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class OrderCollection extends ResourceCollection
{
    public $collects = OrderResource::class;

    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
        ];
    }

    public function paginationInformation($request, $paginated, $default): array
    {
        return [
            'meta' => [
                'current_page' => $paginated['current_page'],
                'per_page' => $paginated['per_page'],
                'total' => $paginated['total'],
                'last_page' => $paginated['last_page'],
            ],
        ];
    }
}
```

## Standard API Response Format

```json
// Single resource
{
    "data": {
        "id": 1,
        "name": "John"
    }
}

// Collection with pagination
{
    "data": [
        { "id": 1, "name": "John" },
        { "id": 2, "name": "Jane" }
    ],
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 50,
        "last_page": 4
    }
}

// Error response
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

## Rules

- Every API endpoint must return through a Resource — never raw model
- Use `whenLoaded()` for relationships — prevents extra queries
- Use `when()` for conditional fields
- Dates always in ISO 8601 format (`toISOString()`)
- Enum values as strings (`.value`), not objects
- Use ResourceCollection for list endpoints with pagination meta
- Explicitly list fields — never use `$this->resource->toArray()`
- NO sensitive data in resources (passwords, tokens, internal IDs if using UUIDs)
- NO business logic in resources — they are transformers only

---

*Laravel API Resource Standard v1.0.0 — Laravel 11+*
