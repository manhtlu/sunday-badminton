# /debug — Diagnose and trace root cause of a bug

## Required: Load coding standards for context

1. Detect project stack from file markers:
   - `composer.json` → load `coding-standards/laravel/*.md`
   - `package.json` with vue/nuxt → load `coding-standards/vue/*.md`
   - `package.json` with next → load `coding-standards/nextjs/*.md`
   - `package.json` with electron → load `coding-standards/electron/*.md`
   - `requirements.txt` or `pyproject.toml` → load `coding-standards/python/*.md`

2. Read the detected coding-standards to understand expected patterns and spot deviations.

## Workflow

1. **Reproduce** — understand the symptoms from user description, logs, or error messages
2. **Trace** — follow the execution path from entry point to failure
   - Read relevant source files
   - Check recent git changes (`git log`, `git diff`) if the bug is a regression
   - Identify the exact line(s) causing the issue
3. **Root cause** — determine WHY it fails, not just WHERE
4. **Report** — output findings in format:

```
## Bug Analysis

**Symptom**: What the user sees
**Location**: file:line
**Root Cause**: Why it happens
**Impact**: What else might be affected
**Suggested Fix**: Specific code change (do NOT apply — report only)
```

5. Ask the user if they want to apply the fix. Do NOT auto-fix.

## Input

$ARGUMENTS
