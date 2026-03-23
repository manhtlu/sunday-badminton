# Laravel Policy & Authorization Standards

## Principle

Authorization logic lives in Policy classes. Controllers and services delegate to policies — never inline auth checks.

## Standard Policy

```php
<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // all authenticated users can list
    }

    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->id === $order->user_id
            && $order->status->canBeEdited();
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->id === $order->user_id
            && $order->status->canBeDeleted();
    }

    public function cancel(User $user, Order $order): bool
    {
        return $user->id === $order->user_id
            && $order->status->canBeCancelled();
    }
}
```

## Policy Registration

```php
// Laravel 11+ auto-discovers policies by convention:
// App\Models\Order → App\Policies\OrderPolicy

// Manual registration only when convention doesn't match:
// app/Providers/AppServiceProvider.php
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::policy(Order::class, OrderPolicy::class);
}
```

## Usage in Controllers

```php
class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $orders = $this->orderService->list($request->query());

        return $this->success(new OrderCollection($orders));
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        return $this->success(new OrderResource($order));
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $this->authorize('create', Order::class);

        $order = $this->orderService->create($request->validated());

        return $this->created(new OrderResource($order));
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $order = $this->orderService->update($order->id, $request->validated());

        return $this->success(new OrderResource($order));
    }

    public function destroy(Order $order): JsonResponse
    {
        $this->authorize('delete', $order);

        $this->orderService->delete($order->id);

        return $this->noContent();
    }
}
```

## Usage in Form Requests (alternative)

```php
// When authorize logic is simple, can use in Form Request instead
class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('order'));
    }
}
```

## Role-Based with Enums

```php
<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    case User = 'user';

    public function canManageUsers(): bool
    {
        return in_array($this, [self::Admin, self::Manager]);
    }

    public function canAccessAdmin(): bool
    {
        return $this === self::Admin;
    }
}
```

```php
// In policy — use enum methods
public function manage(User $user): bool
{
    return $user->role->canManageUsers();
}
```

## Gate for Non-Model Authorization

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    Gate::define('access-admin', function (User $user) {
        return $user->role->canAccessAdmin();
    });
}

// Usage in controller or middleware
$this->authorize('access-admin');
```

## Rules

- One Policy per Model — follow naming convention (`OrderPolicy` for `Order`)
- Use `$this->authorize()` in controllers — never manual `if/else` auth checks
- Delegate complex permission logic to enum methods or dedicated service
- Use auto-discovery (Laravel 11+) — register manually only when needed
- Policy methods return `bool` — no exceptions, no side effects
- Use `Gate::define()` for non-model permissions (feature flags, admin access)
- Authorization in Form Request `authorize()` is acceptable for simple cases
- NO role string comparisons (`$user->role === 'admin'`) — use enums
- NO authorization logic in services — services assume authorized access
- NO inline `Gate::allows()` scattered in code — centralize in controller authorize calls

---

*Laravel Policy & Authorization Standard v1.0.0 — Laravel 11+*
