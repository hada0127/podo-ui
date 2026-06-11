# Build Performance Budget

Phase 2 establishes initial local budgets for token and icon builds. These are starting values for CI and can be tightened after the build graph grows.

## Budgets

| Build area                                    | Budget | Notes                                              |
| --------------------------------------------- | -----: | -------------------------------------------------- |
| Token load + merge + resolve for 1,000 tokens | 500 ms | Includes origin metadata and reference validation. |
| Token CSS/TS/RN/JSON emit for 1,000 tokens    | 500 ms | Per target output.                                 |
| Icon validation + SVGO for 250 icons          |    2 s | Assumes simple 24px SVG sources.                   |
| Icon WOFF + WOFF2 build for 250 icons         |    5 s | Depends on font backend and machine speed.         |
| Component codegen for 100 component specs     | 500 ms | Covers web/react/hono/native target file emit.     |
| Studio initial context load                   |  1.5 s | Local project with 100 tokens and 25 components.   |

## Rules

- Build outputs must be deterministic for the same JSON and SVG inputs.
- Generated output should be skipped when input hashes are unchanged in later CLI phases.
- Performance regressions should be measured against the sample fixtures before being accepted.
- Studio should keep initial HTML and `/api/context` lightweight; long-running builds stay behind explicit build actions.
