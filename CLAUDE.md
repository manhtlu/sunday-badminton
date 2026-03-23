# CCDK — Claude Code Development Kit

> Base rules for all projects. Keep concise — details live in agents/commands/skills.

## Stack Detection

Auto-detect tech stack from project root file markers:

| Marker File | Stack | Activate |
|---|---|---|
| `composer.json` | PHP/Laravel | agents: db-designer, api-architect; commands: migration, scaffold |
| `package.json` + `nuxt.config.*` | Nuxt | agents: code-scaffolder; commands: scaffold |
| `package.json` + `next.config.*` | Next.js | agents: code-scaffolder; commands: scaffold |
| `package.json` + `vue.config.*` or `vite.config.*` with vue | Vue | agents: code-scaffolder; commands: scaffold |
| `package.json` + `electron` in dependencies | Electron | agents: code-scaffolder |
| `requirements.txt` or `pyproject.toml` | Python | agents: code-scaffolder; commands: scaffold |
| `prisma/schema.prisma` | Prisma ORM | agents: db-designer |
| `docker-compose.yml` | Docker | include in system-designer context |

When multiple stacks are detected (monorepo), activate all relevant agents/commands.

## Context Budget Rules

### File Reading
- Priority order: config files → entry points → task-related files
- DO NOT read the entire codebase. Only read files necessary for the current task
- Files > 300 lines: read with offset/limit, never read entirely
- When exploring: use Glob/Grep first, then read specific files

### Agent/Skill Loading
- Only load agent/command/skill when the task requires it — NO preloading
- Agents self-terminate after completion, do not retain context
- Each agent call must have a clear prompt with sufficient context — do not rely on conversation history

### Output
- Be concise, go straight to the point
- Code blocks must have language tags
- When creating files: only create what is necessary, nothing extra

## Conventions

### Git
- Commit message: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- Branch naming: `type/short-description` (e.g., `feat/user-auth`, `fix/login-bug`)
- No force push, no amending published commits

### Code Style
- Follow existing project conventions (eslint, phpcs, ruff...)
- If no linter config exists: ask before applying any style
- Naming: follow language convention (camelCase JS, snake_case Python/PHP)

### Database
- Migrations must be reversible (up + down)
- Table names: plural, snake_case
- Column names: snake_case
- Always include `created_at`, `updated_at` timestamps
- Foreign key naming: `{referenced_table_singular}_id`
- Index naming: `idx_{table}_{columns}`

### API Design
- RESTful conventions: correct HTTP methods and status codes
- Consistent response format: `{ data, meta, errors }`
- Versioning: URL prefix (`/api/v1/`)
- Pagination required for list endpoints

## Diagram Standards

- Default: **Mermaid** (renders in markdown)
- Fallback: PlantUML when Mermaid is insufficient
- Supported diagram types:
  - ERD → for DB design
  - Sequence diagram → for API flow
  - Flowchart → for business logic
  - C4 model → for system architecture

## Project Override

Project-level `CLAUDE.md` can override any rule above.
Only write what differs from base — do not repeat existing rules.

Example project-level override:
```markdown
# Project: my-saas-app
<!-- Extends base CCDK -->

## Stack Override
- Primary: Laravel 11 + Vue 3 + Inertia
- DB: PostgreSQL 16
- Cache: Redis

## Convention Override
- API response format: `{ success, data, message }`
- Auth: Laravel Sanctum — no session-based auth
```

## Agents

Located at `.claude/agents/`. Only invoke when task matches:

| Agent | When to invoke |
|---|---|
| `db-designer` | Schema design, ERD, migration strategy |
| `api-architect` | API spec, endpoint structure |
| `system-designer` | System diagrams, architecture decisions |
| `code-scaffolder` | Boilerplate, project structure |
| `code-reviewer` | Code review, issue detection |

## Commands

Located at `.claude/commands/`. User invokes directly:

- `/db-design` — design DB schema from description
- `/migration` — generate migration file
- `/api-contract` — generate OpenAPI spec
- `/diagram` — generate diagram (Mermaid/PlantUML)
- `/scaffold` — generate boilerplate code
- `/review` — quick code review
- `/debug` — diagnose and trace root cause of a bug (logs, stack trace, reproduce steps)
- `/coding` — fix bugs or implement/update features following existing patterns

## Skills

Located at `.claude/skills/`. Auto-triggered or via tool:

- See individual skill files for details

## Project Override — The Kinetic Court

### Language
- UI language: **Vietnamese** (hardcoded, no i18n)
- All text, button labels, placeholders, messages displayed to users must be in Vietnamese
- Code (variables, functions, comments) remains in English

### Site Map

```
/                           ← Member Selection (public)
/login                      ← Leader Login (public)
/dashboard                  ← Leader Dashboard (leader)
  └─ SessionDialog          ← Modal: tạo/sửa buổi tập
/dashboard/members          ← Leader Member Management (leader) [DONE]
/dashboard/courts           ← Leader Court Management (leader) [DONE]
/dashboard/schedule         ← Leader Schedule / Lịch chơi (leader) [DONE]
/dashboard/summary          ← Monthly Summary / Export (leader) [TODO]
/my/[id]                    ← Member My Page (member, read-only)
/my/[id]/dashboard          ← Member Dashboard (member, read-only)
```

### Evidence
- Implementation status tracked in `docs/evidence.md`
