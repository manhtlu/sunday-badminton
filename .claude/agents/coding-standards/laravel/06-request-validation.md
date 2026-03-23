# Laravel Request Validation

## Principle

All input validation lives in Form Request classes. Controllers and services never validate directly.

## Standard Form Request

```php
<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // or policy check: $this->user()->can('create', Order::class)
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'status' => ['sometimes', new Enum(OrderStatus::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'At least one item is required.',
            'items.*.product_id.exists' => 'The selected product does not exist.',
        ];
    }
}
```

## Update Request with Route Model Binding

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users')->ignore($this->route('user')),
            ],
        ];
    }
}
```

## Prepared Data

```php
// Use prepareForValidation to normalize input before validation
protected function prepareForValidation(): void
{
    $this->merge([
        'email' => strtolower($this->email),
        'phone' => preg_replace('/[^0-9]/', '', $this->phone),
    ]);
}

// Use passedValidation to transform data after validation
protected function passedValidation(): void
{
    $this->replace([
        ...$this->validated(),
        'slug' => Str::slug($this->name),
    ]);
}
```

## Rules

- One Form Request per controller action (Store, Update)
- Use `$this->validated()` in controller — never `$request->all()`
- Use `Rule::` class for complex rules (unique, exists, enum)
- Use PHP enum validation with `new Enum(ClassName::class)`
- Nested array validation with dot notation (`items.*.field`)
- Custom messages only when default Laravel messages are unclear
- `authorize()` returns `true` or uses policy — never inline auth logic
- NO validation in controllers or services
- NO sanitization in controllers — use `prepareForValidation()`

---

*Laravel Request Validation Standard v1.0.0 — Laravel 11+*
