# /coding — Fix bugs or implement/update features

## Required: Load coding standards before writing any code

1. Detect project stack from file markers:
   - `composer.json` → load `coding-standards/laravel/*.md`
   - `package.json` with vue/nuxt → load `coding-standards/vue/*.md`
   - `package.json` with next → load `coding-standards/nextjs/*.md`
   - `package.json` with electron → load `coding-standards/electron/*.md`
   - `requirements.txt` or `pyproject.toml` → load `coding-standards/python/*.md`
   - Multiple stacks detected → load all relevant standards

2. Read the detected coding-standards files before generating any code.

3. If the task involves API endpoints, also load `coding-standards/api-design/*.md`.

## Workflow

1. Understand the request — read related code files first
2. Plan the changes — identify which files to modify/create
3. Implement — follow the loaded coding standards strictly
4. Report — summarize what was changed and why

## Input

$ARGUMENTS
