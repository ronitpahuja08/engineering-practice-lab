# Engineering Practice Lab Retrospective

## What the exercises established

Each exercise began with a small, explicit contract and used deterministic
tests to prove behavior at boundaries: input validation, listener lifecycle,
cache eviction, retry timing, and token refill. Keeping time and external
effects injectable made the asynchronous and rate-limiting exercises easier to
reason about than tests based on real waits.

## Tradeoffs retained deliberately

- The LRU cache uses JavaScript `Map` ordering for clarity rather than a custom
  linked list.
- The event emitter aggregates listener failures after completing the current
  dispatch, making failure visible without silently skipping later listeners.
- The token bucket is local-process state; it is not represented as a
  distributed coordination solution.

## Release checklist

1. Run `npm test` on supported Node releases.
2. Confirm every exercise has a contract, tests, and review note.
3. Review GitHub Actions results for the integration branch.
4. Tag `v0.1.0` only after the public documentation matches the code.

## Next directions

Future exercises should emphasize API compatibility, cancellation, and
resource cleanup while preserving the same issue-to-review workflow.
