# Laravel Routing Standards

## Principle

Routes define the API contract. Keep them declarative, grouped, and consistent.

## Standard API Routes

```php
<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;

// Public routes
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Resources
    Route::apiResource('users', UserController::class);
    Route::apiResource('orders', OrderController::class);

    // Nested resources
    Route::apiResource('orders.items', OrderItemController::class)
        ->shallow();

    // Custom actions
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('users/{user}/activate', [UserController::class, 'activate']);
});
```

## Route Naming

```php
// apiResource auto-generates:
// users.index    GET    /api/users
// users.store    POST   /api/users
// users.show     GET    /api/users/{user}
// users.update   PUT    /api/users/{user}
// users.destroy  DELETE /api/users/{user}

// Custom routes — name explicitly
Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])
    ->name('orders.cancel');
```

## Route Grouping

```php
// Group by prefix and shared middleware
Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin'])
    ->group(function () {
        Route::apiResource('users', Admin\UserController::class);
        Route::apiResource('settings', Admin\SettingController::class);
    });

// API versioning (when needed)
Route::prefix('v1')->group(function () {
    Route::apiResource('users', Api\V1\UserController::class);
});

Route::prefix('v2')->group(function () {
    Route::apiResource('users', Api\V2\UserController::class);
});
```

## Route Model Binding

```php
// Implicit binding — Laravel resolves by {user} param name
Route::get('users/{user}', [UserController::class, 'show']);

// Custom key binding
Route::get('users/{user:uuid}', [UserController::class, 'show']);

// Scoped binding — order item must belong to order
Route::get('orders/{order}/items/{item}', [OrderItemController::class, 'show'])
    ->scopeBindings();
```

## Rules

- Use `apiResource` for standard CRUD — do not manually define 5 routes
- Use `shallow()` for nested resources
- URI: plural, kebab-case (`/api/order-items`, not `/api/orderItems`)
- Custom actions: `POST` verb, descriptive path (`orders/{order}/cancel`)
- Name all custom routes explicitly
- Group by middleware, not by controller
- Route model binding over manual `findOrFail()` in controller when appropriate
- Keep `routes/api.php` organized: public → authenticated → admin
- NO closures in routes — always reference controller methods
- NO business logic in route files
- NO duplicate routes for the same resource

---

*Laravel Routing Standard v1.0.0 — Laravel 11+*
