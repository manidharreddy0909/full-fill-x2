## Summary of Changes

Brief description of what this PR accomplishes and why.

## Related Issues / Tasks

Fixes # / Task ID

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Refactoring / Performance improvement
- [ ] Documentation update
- [ ] Security hardening

## Pre-Merge Checklist

- [ ] `pytest backend/tests/` passes 100% locally
- [ ] `npm run build --prefix frontend` succeeds with 0 TypeScript/Vite errors
- [ ] No hardcoded secrets or credentials committed
- [ ] Backend Pydantic models & frontend TypeScript interfaces remain in sync
- [ ] State snapshot immutability verified (`world_before == world_after`)
