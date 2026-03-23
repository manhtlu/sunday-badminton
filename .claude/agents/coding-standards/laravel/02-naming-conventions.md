# Laravel Naming Conventions

## Classes

| Type | Convention | Example |
|---|---|---|
| Model | Singular, PascalCase | `User`, `OrderItem` |
| Controller | Singular + Controller | `UserController`, `OrderItemController` |
| Service | Singular + Service | `UserService`, `PaymentService` |
| Repository | Singular + Repository | `UserRepository`, `OrderRepository` |
| Interface | Singular + Interface | `UserRepositoryInterface`, `PaymentGatewayInterface` |
| Form Request | Action + Singular + Request | `StoreUserRequest`, `UpdateOrderRequest` |
| API Resource | Singular + Resource | `UserResource`, `OrderItemResource` |
| Resource Collection | Singular + Collection | `UserCollection`, `OrderCollection` |
| Event | PastTense descriptive | `OrderPlaced`, `UserRegistered` |
| Listener | Action descriptive | `SendOrderConfirmation`, `CreateUserProfile` |
| Job | Action descriptive | `ProcessPayment`, `SendWelcomeEmail` |
| Mail | Descriptive | `OrderConfirmation`, `WelcomeEmail` |
| Policy | Singular + Policy | `UserPolicy`, `OrderPolicy` |
| Enum | Singular, PascalCase | `OrderStatus`, `UserRole` |
| Trait | Adjective or HasX | `HasUuid`, `Sortable`, `Filterable` |
| Middleware | Descriptive | `EnsureUserIsAdmin`, `TrackApiUsage` |

## Methods

| Context | Convention | Example |
|---|---|---|
| Controller CRUD | index, store, show, update, destroy | `public function store(StoreUserRequest $request)` |
| Service | verb + noun | `createUser()`, `calculateTotal()`, `sendNotification()` |
| Repository | verb + descriptive | `findById()`, `getByEmail()`, `listActive()` |
| Scope | scope + Descriptive | `scopeActive()`, `scopeByStatus()` |
| Accessor | attribute name (L11) | `protected function fullName(): Attribute` |
| Relationship | descriptive, camelCase | `orderItems()`, `createdBy()` |
| Boolean methods | is/has/can prefix | `isActive()`, `hasPermission()`, `canEdit()` |

## Database

| Type | Convention | Example |
|---|---|---|
| Table | plural, snake_case | `users`, `order_items` |
| Column | snake_case | `first_name`, `is_active` |
| Foreign key | singular_table + _id | `user_id`, `order_item_id` |
| Pivot table | singular alphabetical, snake_case | `order_product`, `role_user` |
| Primary key | `id` | `id` (auto-increment or UUID) |
| Boolean column | is_/has_ prefix | `is_active`, `has_verified` |
| Timestamp column | _at suffix | `created_at`, `verified_at`, `deleted_at` |
| Index | idx_table_columns | `idx_users_email` |
| Unique index | uniq_table_columns | `uniq_users_email` |

## Files & Routes

| Type | Convention | Example |
|---|---|---|
| Migration | timestamp_action_table | `2024_01_15_create_users_table` |
| Seeder | Singular + Seeder | `UserSeeder`, `DatabaseSeeder` |
| Factory | Singular + Factory | `UserFactory`, `OrderFactory` |
| Config file | snake_case | `auth.php`, `mail.php` |
| Route name | dot notation, plural resource | `users.index`, `users.store` |
| Route URI | plural, kebab-case | `/api/users`, `/api/order-items` |

## Variables

```php
// Local variables: camelCase
$userName = 'John';
$orderItems = Order::find(1)->items;

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Enum cases: PascalCase
enum OrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
}
```

## Rules

- Follow Laravel's implicit conventions — if Artisan generates it, match that style
- Namespace must mirror directory structure exactly
- Never abbreviate class names (`Repo`, `Ctrl`, `Svc`) — use full words
- Use descriptive names over generic ones (`ProcessPaymentJob` not `PaymentJob`)

---

*Laravel Naming Conventions Standard v1.0.0 — Laravel 11+*
