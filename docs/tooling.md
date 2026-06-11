# Tooling

The Phase 0 toolchain is intentionally small:

- pnpm workspaces for package management
- TypeScript project references for build ordering
- ESLint for static checks
- Prettier for formatting
- Vitest for tests
- Changesets for versioning and npm publishing

The root quality gate is:

```bash
pnpm check
```

It runs type checking, linting, tests, and format verification.
