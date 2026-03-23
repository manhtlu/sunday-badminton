# Laravel Response Pattern

## Principle

All API responses go through a unified layer. Resources handle data transformation, a response trait handles consistent formatting.

## ApiResponse Trait

```php
<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    protected function success(
        mixed $data = null,
        string $message = null,
        int $status = 200,
    ): JsonResponse {
        $response = [];

        if ($data instanceof JsonResource || $data instanceof ResourceCollection) {
            return $data->additional([
                'message' => $message,
            ])->response()->setStatusCode($status);
        }

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    protected function created(
        mixed $data = null,
        string $message = 'Created successfully.',
    ): JsonResponse {
        return $this->success($data, $message, 201);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    protected function error(
        string $message,
        int $status = 400,
        array $errors = [],
    ): JsonResponse {
        $response = ['message' => $message];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }
}
```

## Usage in Controllers

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->list($request->query());

        return $this->success(new UserCollection($users));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return $this->created(new UserResource($user));
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->userService->findOrFail($id);

        return $this->success(new UserResource($user));
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->update($id, $request->validated());

        return $this->success(new UserResource($user), 'Updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->userService->delete($id);

        return $this->noContent();
    }
}
```

## Standard Response Format

```json
// Success with data (200)
{
    "data": { "id": 1, "name": "John" },
    "message": null
}

// Created (201)
{
    "data": { "id": 1, "name": "John" },
    "message": "Created successfully."
}

// No content (204)
null

// Collection with pagination (200)
{
    "data": [{ "id": 1 }, { "id": 2 }],
    "meta": { "current_page": 1, "total": 50 },
    "message": null
}

// Error (4xx/5xx) — handled by exception handler
{
    "message": "The given data was invalid.",
    "errors": { "email": ["The email field is required."] }
}
```

## Rules

- All controllers `use ApiResponse` — no direct `response()->json()` calls
- Use `$this->success()` for 200 responses with data
- Use `$this->created()` for 201 responses
- Use `$this->noContent()` for 204 responses
- Use `$this->error()` only for controller-level errors (rare — prefer exceptions)
- Resources still handle data transformation — the trait handles wrapping
- Error responses remain in exception handler (see `10-error-handling.md`)

---

*Laravel Response Pattern Standard v1.0.0 — Laravel 11+*
