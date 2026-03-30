# AGENTS.md - OpenClaw Skill Management Plugin

## Project Overview

This is an OpenClaw plugin that provides HTTP-based CRUD operations for managing OpenClaw skills (create, read, update, delete).

- **Type**: OpenClaw Plugin (TypeScript)
- **Runtime**: Node.js (pnpm)
- **Framework**: OpenClaw Plugin SDK

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Type check only (no build output)
pnpm exec tsc --noEmit

# Build the plugin
pnpm exec openclaw plugins build

# Run OpenClaw in development mode
pnpm exec openclaw gateway --verbose
```

**Note**: This project does not have a traditional test framework configured yet. Tests should be added using Vitest or Node's built-in test runner.

## Code Style Guidelines

### TypeScript

- Use **strict TypeScript** - enable `strict: true` in tsconfig
- Always declare explicit return types for exported functions
- Use `type` for object shapes, `interface` for extendable types
- Prefer `as const` for literal values that won't change

```typescript
// Good
interface ToolConfig {
  name: string;
  description: string;
  parameters: T.Schema;
}

// Good - const assertion
const API_VERSIONS = {
  V1: 'v1',
} as const;
```

### Imports

- Use **path aliases** when available (`@/` style imports)
- Group imports in this order:
  1. External libraries
  2. Internal modules (relative paths)
  3. Type imports

```typescript
// Group 1: External
import { Type } from '@sinclair/typebox';
import { z } from 'zod';

// Group 2: Internal
import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { SkillService } from './services/skill.service';

// Group 3: Types (if separate file)
import type { Skill } from './types';
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files (components) | kebab-case | `skill.service.ts` |
| Classes | PascalCase | `SkillService` |
| Functions | camelCase | `getSkillById()` |
| Constants | SCREAMING_SNAKE | `MAX_PAGE_SIZE` |
| Interfaces | PascalCase | `Skill` |
| Types | PascalCase | `SkillResponse` |

### Error Handling

- Use typed error classes extending `Error`
- Never expose stack traces to end users
- Log errors with appropriate context

```typescript
// Good
class SkillNotFoundError extends Error {
  constructor(skillId: string) {
    super(`Skill not found: ${skillId}`);
    this.name = 'SkillNotFoundError';
  }
}
```

### OpenClaw Plugin Structure

Follow the standard plugin pattern:

```typescript
import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { Type } from '@sinclair/typebox';

export default definePluginEntry({
  id: 'openclaw-skill-management',
  name: 'Openclaw Skill Management',
  description: 'HTTP-based skill CRUD operations',
  register(api) {
    api.registerTool({
      name: 'skill_list',
      description: 'List all skills',
      parameters: Type.Object({}),
      async execute() {
        // implementation
      },
    });
  },
});
```

### File Organization

```
src/
├── index.ts              # Plugin entry point (exports definePluginEntry)
├── services/            # Business logic
├── types/               # TypeScript interfaces
└── utils/               # Helper functions
```

### General Best Practices

- **Keep functions small** - max 50 lines per function
- **One export per file** - for named exports, prefer single default export
- **Avoid `any`** - use `unknown` if type is truly unknown
- **Use async/await** - prefer over raw promises
- **Handle errors explicitly** - don't use empty catch blocks
- **Write meaningful comments** - explain WHY, not WHAT
- **Use early returns** - reduce nesting

### Dependencies

- Minimize external dependencies
- Use `@sinclair/typebox` for OpenClaw schema definitions
- Reuse OpenClaw SDK utilities when available

### Git Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Keep commits atomic and focused
- Write descriptive commit messages

## OpenClaw SDK Reference

- Plugin SDK: `openclaw/plugin-sdk/plugin-entry`
- Schema: `@sinclair/typebox`
- API Reference: See OpenClaw docs at https://docs.openclaw.ai

## Configuration

This plugin uses `openclaw-plugin.json` for metadata. Update the following when adding new tools:

```json
{
  "id": "openclaw-skill-management",
  "name": "Openclaw Skill Management",
  "description": "HTTP-based skill CRUD operations"
}
```

## Next Steps

1. Implement skill CRUD service layer
2. Add HTTP server for external API (if needed)
3. Register tools: `skill_list`, `skill_get`, `skill_create`, `skill_update`, `skill_delete`
4. Add input validation with TypeBox
5. Write unit tests with Vitest
