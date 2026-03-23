# /review — Review code for issues and standards compliance

## Required: Load coding standards before reviewing

1. Detect project stack from file markers:
   - `composer.json` → load `coding-standards/laravel/*.md`
   - `package.json` with vue/nuxt → load `coding-standards/vue/*.md`
   - `package.json` with next → load `coding-standards/nextjs/*.md`
   - `package.json` with electron → load `coding-standards/electron/*.md`
   - `requirements.txt` or `pyproject.toml` → load `coding-standards/python/*.md`
   - Multiple stacks detected → load all relevant standards

2. If the code involves API endpoints, also load `coding-standards/api-design/*.md`.

## Required: Load agents

- Use the `code-reviewer` agent with full checklist (security, bugs, performance, coding standards, code quality).

## Workflow

1. Read the target files or recent git changes
2. Load relevant coding standards for the detected stack
3. Review against loaded standards and code-reviewer checklist
4. Output findings in format:

```
[SEVERITY] file:line — description
  → Suggested fix
```

Severity: `CRITICAL` | `WARNING` | `INFO`

End with summary: total issues by severity, overall assessment.

## Input

$ARGUMENTS
