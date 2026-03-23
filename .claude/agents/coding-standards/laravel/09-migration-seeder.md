# Laravel Migration & Seeder Standards

## Principle

Migrations are the single source of truth for database schema. They must be reversible, atomic, and production-safe.

## Standard Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status', 50)->default('pending');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status', 'idx_orders_status');
            $table->index('created_at', 'idx_orders_created_at');
            $table->index(['user_id', 'status'], 'idx_orders_user_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

## Alter Table Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_number')->nullable()->after('status');
            $table->index('tracking_number', 'idx_orders_tracking_number');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_tracking_number');
            $table->dropColumn('tracking_number');
        });
    }
};
```

## Seeder

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
```

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Order;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory(10)->create();

        $users->each(function (User $user) {
            Order::factory()
                ->count(rand(1, 5))
                ->for($user)
                ->hasItems(rand(1, 3))
                ->create();
        });
    }
}
```

## Factory

```php
<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'uuid' => fake()->uuid(),
            'status' => fake()->randomElement(OrderStatus::cases()),
            'total_amount' => fake()->randomFloat(2, 10, 1000),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Completed,
            'completed_at' => now(),
        ]);
    }
}
```

## Rules

- Every migration must have a working `down()` method
- Use anonymous class syntax (Laravel 11+ default)
- Use `foreignId()->constrained()` for foreign keys — explicit cascade behavior
- Always name indexes explicitly (`idx_table_columns`, `uniq_table_columns`)
- One concern per migration — do not mix create/alter for different tables
- Use `after()` to control column position in alter migrations
- String columns: always specify max length
- Decimal columns: always specify precision and scale
- Use factories for test data — seeders call factories
- Factory states for common variations (completed, cancelled, etc.)
- NO raw SQL in migrations unless schema builder cannot handle it
- NO data manipulation in schema migrations — use separate data migrations

---

*Laravel Migration & Seeder Standard v1.0.0 — Laravel 11+*
