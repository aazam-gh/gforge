## What changed

<!-- Describe the smallest coherent behavior delivered. -->

## Why

<!-- Link the requirement or reference section this addresses. -->

## Boundaries and safety

- [ ] No sensitive write can bypass policy or approval.
- [ ] Rejection/failure/timeout behavior is explicit.
- [ ] No secrets or private data added.
- [ ] External capabilities are not claimed unless wired and demonstrated.

## Verification

Commands run:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Results/evidence:

## Review checklist

- [ ] Qodo review completed.
- [ ] Legitimate Qodo findings fixed.
- [ ] Intentional exceptions explained.
- [ ] Docs/fixtures updated.
- [ ] Follow-up work recorded in `docs/next-step-requirements.md` or an issue.
