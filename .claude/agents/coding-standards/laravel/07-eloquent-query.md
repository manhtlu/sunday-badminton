# Laravel Eloquent Query Standards

## Principle

Queries live in repositories or services. Use Eloquent builder features to write readable, performant queries. Avoid raw SQL unless absolutely necessary.

## Repository Pattern

```php
<?php

namespace App\Repositories;

use App\Models\Order;
use App\Enums\OrderStatus;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class OrderRepository
{
    public function findOrFail(int $id): Order
    {
        return Order::findOrFail($id);
    }

    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function update(Order $order, array $data): bool
    {
        return $order->update($data);
    }

    public function delete(Order $order): bool
    {
        return $order->delete();
    }

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return Order::query()
            ->when($filters['status'] ?? null, fn ($q, $status) =>
                $q->byStatus(OrderStatus::from($status))
            )
            ->when($filters['search'] ?? null, fn ($q, $search) =>
                $q->whereHas('user', fn ($uq) =>
                    $uq->where('name', 'like', "%{$search}%")
                )
            )
            ->when($filters['date_from'] ?? null, fn ($q, $date) =>
                $q->where('created_at', '>=', $date)
            )
            ->with(['user', 'items'])
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    public function getTotalByStatus(OrderStatus $status): float
    {
        return Order::byStatus($status)->sum('total_amount');
    }
}
```

## Query Optimization Patterns

### Eager Loading — Prevent N+1

```php
// GOOD: eager load
$orders = Order::with(['user', 'items.product'])->get();

// GOOD: conditional eager load
$orders = Order::with(['items' => fn ($q) => $q->where('quantity', '>', 1)])->get();

// GOOD: lazy eager load when needed later
$order->loadMissing('items');

// BAD: N+1
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name; // query per iteration
}
```

### Select Only What You Need

```php
// GOOD: select specific columns
$users = User::select(['id', 'name', 'email'])->get();

// GOOD: with relationship columns
$orders = Order::with('user:id,name')->select(['id', 'user_id', 'total_amount'])->get();
```

### Chunking for Large Datasets

```php
// GOOD: chunk for batch processing
Order::where('status', OrderStatus::Pending)
    ->chunkById(200, function ($orders) {
        foreach ($orders as $order) {
            // process
        }
    });

// GOOD: lazy collection for memory efficiency
Order::where('status', OrderStatus::Pending)
    ->lazy()
    ->each(function ($order) {
        // process
    });
```

### Efficient Counting & Existence

```php
// GOOD: count without loading models
$count = Order::where('status', OrderStatus::Pending)->count();

// GOOD: check existence
$exists = Order::where('email', $email)->exists();

// BAD: load all then count
$count = Order::all()->count();
```

## Rules

- Always use `when()` for conditional filters — no manual if/else chains
- Always eager load relationships with `with()` — prevent N+1
- Select specific columns when full model is not needed
- Use `chunkById()` or `lazy()` for processing large datasets
- Use `count()` / `exists()` instead of loading models to check
- Use model scopes for reusable query conditions
- Prefer Eloquent builder over raw SQL
- Use `DB::transaction()` for multi-step writes (in service, not repository)
- NO queries in loops
- NO `Model::all()` without constraints in production code

---

*Laravel Eloquent Query Standard v1.0.0 — Laravel 11+*
