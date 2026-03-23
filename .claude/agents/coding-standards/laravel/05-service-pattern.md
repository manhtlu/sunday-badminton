# Laravel Service Pattern

## Principle

Services contain all business logic. They orchestrate between repositories, models, and external systems.

## Standard Service

```php
<?php

namespace App\Services;

use App\Models\Order;
use App\Enums\OrderStatus;
use App\Repositories\OrderRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly OrderRepository $orderRepository,
    ) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        return $this->orderRepository->paginate($filters);
    }

    public function findOrFail(int $id): Order
    {
        return $this->orderRepository->findOrFail($id);
    }

    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $order = $this->orderRepository->create($data);

            if (!empty($data['items'])) {
                $order->items()->createMany($data['items']);
            }

            return $order->load('items');
        });
    }

    public function update(int $id, array $data): Order
    {
        return DB::transaction(function () use ($id, $data) {
            $order = $this->orderRepository->findOrFail($id);

            $this->orderRepository->update($order, $data);

            return $order->fresh();
        });
    }

    public function delete(int $id): void
    {
        $order = $this->orderRepository->findOrFail($id);

        $this->orderRepository->delete($order);
    }

    public function markCompleted(int $id): Order
    {
        $order = $this->orderRepository->findOrFail($id);

        if ($order->status !== OrderStatus::Processing) {
            throw new \DomainException('Only processing orders can be completed.');
        }

        $this->orderRepository->update($order, [
            'status' => OrderStatus::Completed,
            'completed_at' => now(),
        ]);

        return $order->fresh();
    }
}
```

## Service Without Repository

When the project does not use the repository pattern, services can use Eloquent directly:

```php
<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        return User::query()
            ->when($filters['search'] ?? null, fn ($q, $search) =>
                $q->where('name', 'like', "%{$search}%")
            )
            ->when($filters['status'] ?? null, fn ($q, $status) =>
                $q->byStatus($status)
            )
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): User
    {
        return User::create($data);
    }
}
```

## Rules

- One service per domain entity (UserService, OrderService)
- Inject dependencies via constructor with `readonly`
- Wrap multi-step writes in `DB::transaction()`
- Throw domain exceptions for business rule violations
- Return models or collections — never return arrays or raw data
- Keep methods focused — one method per business action
- Services can call other services for cross-domain operations
- NO HTTP-aware code (no `request()`, no `response()`)
- NO direct output (no `echo`, no `dd()`)

---

*Laravel Service Pattern Standard v1.0.0 — Laravel 11+*
