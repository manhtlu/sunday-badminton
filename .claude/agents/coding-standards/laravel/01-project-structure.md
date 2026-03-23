# Laravel Project Structure

## Directory Structure

```
project/
├── app/
│   ├── Console/
│   │   └── Commands/              # Artisan commands
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/               # API controllers (optional: Api/V1/ for versioning)
│   │   ├── Requests/              # Form requests (validation)
│   │   └── Resources/             # API resources (transformers)
│   ├── Models/                    # Eloquent models
│   ├── Repositories/              # Data access layer (optional: Contracts/ + Eloquent/ subdirs)
│   ├── Services/                  # Business logic
│   ├── Interfaces/                # Shared interfaces (optional, when not using Repositories/Contracts/)
│   ├── Enums/                     # PHP 8.1+ enums
│   ├── Traits/                    # Reusable traits (HasUuid, HasSlug, etc.)
│   ├── Events/
│   ├── Listeners/
│   ├── Jobs/
│   ├── Mail/
│   ├── Notifications/
│   ├── Policies/                  # Authorization policies
│   └── Providers/
│       ├── AppServiceProvider.php
│       └── RepositoryServiceProvider.php
├── bootstrap/
│   ├── app.php                    # Middleware, exception handling, routing
│   └── providers.php              # Service provider registration
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php                    # API routes
│   ├── channels.php
│   ├── console.php
│   └── web.php
├── storage/
├── tests/
├── .env
├── .env.example
├── composer.json
└── phpunit.xml
```

---

## Bootstrap Configuration (Laravel 11+)

```php
<?php
// bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
```

```php
<?php
// bootstrap/providers.php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RepositoryServiceProvider::class,
];
```

---

## Service Provider Registration

```php
<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
        // Add more repository bindings
    ];

    public function register(): void
    {
        foreach ($this->bindings as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }
    }
}
```

---

## Composer Configuration

```json
{
    "require": {
        "php": "^8.2",
        "laravel/framework": "^11.0",
        "laravel/sanctum": "^4.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.0",
        "laravel/pint": "^1.0",
        "phpstan/phpstan": "^1.10"
    },
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        }
    }
}
```

---

## Rules

- Use Service-Repository pattern for data access
- Keep controllers thin, services fat
- Use Form Requests for validation
- Use API Resources for response transformation
- Version API routes (v1, v2) only when needed — single version is acceptable
- Register service providers in `bootstrap/providers.php`
- Register middleware in `bootstrap/app.php`
- Place reusable model behaviors in `app/Traits/`
- NO direct Eloquent queries in controllers
- NO business logic in models
- NO database queries in views/resources
- NO middleware classes in `app/Http/Middleware/` unless custom (Laravel 11 uses bootstrap config)

---

*Laravel Project Structure Standard v1.0.0 — Laravel 11+*
