# Laravel Model Pattern

## Principle

Models define data structure, relationships, and attribute behavior. NO business logic, NO complex queries.

## Standard Model

```php
<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Order extends Model
{
    use HasFactory, SoftDeletes, HasUuid;

    protected $fillable = [
        'user_id',
        'status',
        'total_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'total_amount' => 'decimal:2',
            'completed_at' => 'datetime',
        ];
    }

    // ──── Relationships ────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ──── Accessors & Mutators (Laravel 11+) ────

    protected function formattedTotal(): Attribute
    {
        return Attribute::make(
            get: fn () => number_format($this->total_amount, 2),
        );
    }

    // ──── Scopes ────

    public function scopeActive($query)
    {
        return $query->where('status', '!=', OrderStatus::Cancelled);
    }

    public function scopeByStatus($query, OrderStatus $status)
    {
        return $query->where('status', $status);
    }
}
```

## Trait Example

```php
<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    protected static function bootHasUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }
}
```

## Model Organization Order

Keep model internals in this order for consistency:

1. `use` traits
2. `$fillable` / `$guarded`
3. `casts()`
4. Relationships
5. Accessors & Mutators
6. Scopes
7. Custom methods (keep minimal)

## Rules

- Always use `$fillable` — never use `$guarded = []`
- Use PHP enum casting for status/type columns
- Use `casts()` method (Laravel 11+) instead of `$casts` property
- Always type-hint relationship return types (`BelongsTo`, `HasMany`, etc.)
- Scopes must be chainable — always return query builder
- Keep custom methods to a minimum — complex logic belongs in Services
- Use traits for reusable behaviors across models
- NO raw SQL in models
- NO HTTP/request-aware code in models
- NO service calls in models

---

*Laravel Model Pattern Standard v1.0.0 — Laravel 11+*
