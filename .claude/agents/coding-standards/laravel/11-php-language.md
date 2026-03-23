# PHP Language Rules

## Requirements

- PHP 8.2+ minimum
- `declare(strict_types=1);` in every PHP file

## Modern PHP — Must Use

- Constructor property promotion with `readonly`
- Named arguments for clarity when > 2 params
- `match` expression instead of `switch`
- PHP 8.1+ enums for status/type values
- Union types, intersection types, nullable types
- Null coalescing `??` and `??=` — no verbose ternary null checks
- Short array syntax `[]` — never `array()`
- Arrow functions `fn()` for simple closures

## Type Declarations

- All method parameters must have type hints
- All method return types must be declared
- Use PHPDoc `@param` / `@return` only for array shapes and generics
- Use `?Type` or `Type|null` for nullable — be consistent per project

## Forbidden Patterns

| Pattern | Use Instead |
|---|---|
| `$_GET`, `$_POST`, `$_REQUEST`, `$_SERVER` | Request objects |
| `echo` / `print` inside classes | Return values or response objects |
| `die()` / `exit()` | Throw exceptions |
| `@$variable` (error suppression) | Handle errors explicitly |
| `global $var` | Dependency injection |
| `new Service()` inside another service | Constructor injection |
| `Container::get()` / `app()` in services | Constructor injection |
| `catch (Exception $e) {}` (empty catch) | Log or rethrow |
| `catch (\Exception $e)` (generic) | Catch specific exceptions |

## Dependency Injection

- Always constructor injection with `readonly`
- Depend on interfaces when available, not concrete classes
- No service locator pattern (`app()`, `resolve()` in services)
- `app()` / `resolve()` acceptable only in ServiceProviders and config files

---

*PHP Language Rules v1.0.0 — PHP 8.2+*
