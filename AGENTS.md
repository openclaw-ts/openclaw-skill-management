# AGENTS.md - OpenClaw Skill Management Plugin

## Project Overview

This is an OpenClaw plugin providing HTTP-based CRUD for managing OpenClaw skills.

- **Type**: OpenClaw Plugin (TypeScript)
- **Runtime**: Node.js (pnpm)
- **Module**: ESM (`"type": "module"`)

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Type check only (no build)
pnpm exec tsc --noEmit

# Build the plugin
pnpm exec openclaw plugins build

# Run in development mode
pnpm exec openclaw gateway --verbose
```

### Running Tests

This project uses Vitest. To run tests:

```bash
# Run all tests
pnpm exec vitest run

# Run a single test file
pnpm exec vitest run src/services/skill.service.test.ts

# Run with coverage
pnpm exec vitest run --coverage
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript
- Declare explicit return types for exported functions
- Use `type` for object shapes, `interface` for extendable types
- Use `import type` for type-only imports

```typescript
// Good - interface for extendable types
interface SkillConfig { name: string; description: string; }

// Good - type for object shapes
type SkillListResult = { list: SkillInfo[]; total: number; };

// Good - type-only imports
import type { Skill, SyncResult } from '../types';
```

### Imports

Order: 1) External libs, 2) Internal modules, 3) Type imports

```typescript
// Group 1: External
import { Type } from '@sinclair/typebox';
import * as fs from 'fs';

// Group 2: Internal
import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { SkillService } from './services/skill.service';

// Group 3: Types
import type { Skill } from '../types';
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `skill.service.ts` |
| Classes | PascalCase | `SkillService` |
| Functions | camelCase | `getSkillById()` |
| Constants | SCREAMING_SNAKE | `MAX_PAGE_SIZE` |
| Interfaces/Types | PascalCase | `Skill` |

### Error Handling

- Throw descriptive error messages
- Never expose stack traces to users
- Return consistent `{ error: string }` format

```typescript
if (!fs.existsSync(skillFile)) {
  throw new Error(`Skill ${name} not found`);
}
```

### Plugin Structure

```typescript
import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';

export default definePluginEntry({
  id: 'openclaw-skill-management',
  name: 'Openclaw Skill Management',
  description: 'HTTP-based skill CRUD',
  register(api) {
    api.registerHttpRoute({
      path: '/skill',
      auth: 'plugin',
      match: 'prefix',
      handler: async (req, res) => { /* ... */ },
    });
  },
});
```

### File Organization

```
src/
├── index.ts           # Plugin entry point
├── services/           # Business logic
│   └── skill.service.ts
└── types/              # TypeScript interfaces
    └── index.ts
```

### Best Practices

- Keep functions small (max 50 lines)
- Avoid `any` - use `unknown` if needed
- Use async/await
- Don't use empty catch blocks
- Use early returns to reduce nesting

### Dependencies

- Minimize external deps
- Use `@sinclair/typebox` for schemas
- Use Node.js built-ins (`fs`, `path`, `os`, `fetch`) when possible

### Git Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Keep commits atomic

## OpenClaw SDK Reference

- Plugin SDK: `openclaw/plugin-sdk/plugin-entry`
- Schema: `@sinclair/typebox`
- HTTP Routes: `api.registerHttpRoute()`

## API Endpoints

Prefix: `/skill`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/skill` | List all skills |
| POST | `/skill` | Create skill |
| GET | `/skill/:name` | Get skill |
| PUT | `/skill/:name` | Update skill |
| DELETE | `/skill/:name` | Delete skill |
| POST | `/skill/sync` | Sync from remote |
| POST | `/skill/upsert` | Insert or update |

## Development Notes

- Skills stored in `~/.agents/skills/{name}/SKILL.md`
- Each skill needs `SKILL.md` file
- Description extracted from `description:` or first non-heading line
- Built-in skills filtered during sync
