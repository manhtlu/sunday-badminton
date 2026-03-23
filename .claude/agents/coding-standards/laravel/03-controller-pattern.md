# Laravel Controller Pattern

## Principle

Controllers are thin. They handle HTTP concerns only: receive request, delegate to service, return response.

## Standard API Controller

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserCollection;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService,
    ) {}

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

## Route Registration

```php
// routes/api.php
use App\Http\Controllers\Api\UserController;

Route::apiResource('users', UserController::class);

// Custom actions beyond CRUD
Route::post('users/{user}/activate', [UserController::class, 'activate']);
```

## Comments

- Standard CRUD methods (`index`, `store`, `show`, `update`, `destroy`) — NO comments needed, names are self-explanatory
- Non-CRUD actions — add a one-line `/** */` explaining the business purpose:

```php
/** Activate a pending user and send welcome notification. */
public function activate(int $id): JsonResponse
{
    $user = $this->userService->activate($id);

    return $this->success(new UserResource($user), 'User activated.');
}
```

- If using API doc generators (Scribe, Swagger), use their annotations — not generic PHPDoc
- Never comment what the code does — comment why, only when non-obvious

## Rules

- Inject services via constructor with `readonly` promotion
- Use Form Requests for validation — never validate in controller
- Use `ApiResponse` trait for all responses (see `12-response-pattern.md`)
- Use API Resources for data transformation — never return raw models
- One resource per controller (follow REST)
- Return appropriate HTTP status codes (201 created, 204 no content)
- Keep methods under 15 lines — if longer, extract to service
- Use `apiResource` route for standard CRUD
- NO direct Eloquent queries in controllers
- NO business logic in controllers
- NO `try/catch` in controllers — let exception handler deal with it

---

*Laravel Controller Pattern Standard v1.0.0 — Laravel 11+*
