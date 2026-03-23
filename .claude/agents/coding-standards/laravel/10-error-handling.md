# Laravel Error Handling Standards

## Principle

Centralized error handling in `bootstrap/app.php`. Controllers never catch exceptions — they bubble up to the global handler. Use domain-specific exceptions for business rule violations.

## Bootstrap Exception Configuration

```php
<?php
// bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withExceptions(function (Exceptions $exceptions) {
        // Render all exceptions as JSON for API requests
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        // Custom rendering for specific exceptions
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        // Report to external service (optional)
        $exceptions->report(function (\Throwable $e) {
            // Sentry, Bugsnag, etc.
        });
    })
    ->create();
```

## Custom Domain Exceptions

```php
<?php

namespace App\Exceptions;

use Exception;

class BusinessException extends Exception
{
    public function __construct(
        string $message,
        private readonly int $statusCode = 422,
        private readonly array $errors = [],
    ) {
        parent::__construct($message);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
```

```php
<?php

namespace App\Exceptions;

class InsufficientBalanceException extends BusinessException
{
    public function __construct(float $required, float $available)
    {
        parent::__construct(
            message: "Insufficient balance. Required: {$required}, Available: {$available}",
            statusCode: 422,
        );
    }
}
```

## Usage in Services

```php
// In service — throw domain exception, don't catch
public function processPayment(Order $order): void
{
    $balance = $this->walletService->getBalance($order->user_id);

    if ($balance < $order->total_amount) {
        throw new InsufficientBalanceException(
            required: $order->total_amount,
            available: $balance,
        );
    }

    // proceed with payment
}
```

## Standard Error Response Format

```json
// Validation error (422)
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "name": ["The name must be at least 2 characters."]
    }
}

// Business error (422)
{
    "message": "Insufficient balance. Required: 100.00, Available: 50.00"
}

// Not found (404)
{
    "message": "Resource not found."
}

// Server error (500)
{
    "message": "Internal server error."
}
```

## Rules

- Configure all exception handling in `bootstrap/app.php` (Laravel 11+)
- Create domain-specific exception classes for business rules
- Exceptions carry their own status code and error context
- Services throw exceptions — controllers do not catch them
- API responses always return consistent JSON error format
- Log 500 errors with full context — hide details from response
- Use `abort(404)` / `abort(403)` for simple HTTP errors
- Use `ModelNotFoundException` (auto 404) via `findOrFail()`
- NO try/catch in controllers
- NO generic `Exception` throwing — use specific exception classes
- NO error details in production 500 responses

---

*Laravel Error Handling Standard v1.0.0 — Laravel 11+*
