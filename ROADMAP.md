# Seven-Day Engineering Plan

Each day follows the same real workflow: issue → branch → implementation → tests → pull request → review notes → merge.

## Day 1 — Foundation and Two Sum

Build the repository foundation and solve Two Sum as a production-style function.

- Define reusable exercise metadata and validate it with tests.
- Open an issue with input, output, error, and immutability expectations.
- Implement an O(n) hash-map solution without mutating the input.
- Test duplicates, negative values, no-solution behavior, and invalid arguments.
- Document why the lookup occurs before storing the current value.
- Open a PR and record a self-review focused on correctness and complexity.

Deliverable: a tested `twoSum(values, target)` implementation and its merged PR.

## Day 2 — Balanced Brackets

Practice stack invariants and explicit input policy.

- Decide whether non-bracket characters are ignored or rejected.
- Implement matching for `()`, `[]`, and `{}`.
- Test empty input, early closing brackets, mixed nesting, and long sequences.
- Explain the stack invariant in the PR description.
- Review naming, early-return behavior, and error messages.

Deliverable: `isBalancedBrackets(input)` with a complete behavioral contract.

## Day 3 — LRU Cache

Design a small stateful API with strict complexity goals.

- Specify constructor, `get`, `set`, `has`, `size`, and capacity behavior.
- Implement recency updates using JavaScript's ordered `Map` semantics.
- Test eviction, overwrites, reads that refresh recency, and invalid capacity.
- Write a design note comparing this approach with a hash map plus linked list.
- Review invariants after every mutating operation.

Deliverable: an LRU cache with O(1)-average access and mutation.

## Day 4 — Retry Utility

Build deterministic asynchronous behavior.

- Define retry count, delay strategy, retry predicate, and final-error behavior.
- Implement exponential backoff with injected sleep and clock functions.
- Test success after failure, exhausted retries, non-retryable errors, and delays.
- Avoid real waiting in tests by using controlled fakes.
- Review cancellation and jitter as documented future improvements.

Deliverable: `retry(operation, options)` with deterministic tests.

## Day 5 — Event Emitter

Practice lifecycle management and safe callback execution.

- Implement `on`, `off`, `once`, `emit`, and listener-count behavior.
- Decide how duplicate listeners and errors are handled.
- Test unsubscribe behavior during emission and one-time listeners.
- Document ordering guarantees and memory-leak risks.
- Review the public API for surprising state transitions.

Deliverable: a compact event emitter with explicit lifecycle semantics.

## Day 6 — Token-Bucket Rate Limiter

Model time-dependent state without flaky tests.

- Define capacity, refill rate, and token-consumption behavior.
- Inject the clock so refills can be tested deterministically.
- Test bursts, partial refills, empty buckets, and invalid configuration.
- Add a small benchmark script and record observations without overstating them.
- Review numerical precision and long-idle behavior.

Deliverable: a deterministic token-bucket limiter and benchmark notes.

## Day 7 — Integration, Cleanup, and Retrospective

Treat the collection as a coherent library.

- Standardize naming, error types, exports, and documentation.
- Run the complete test suite and remove accidental duplication.
- Add continuous integration for supported Node versions.
- Close or defer every remaining issue with a written reason.
- Write a retrospective covering decisions, mistakes, and next steps.
- Tag a small internal `v0.1.0` release after the final review.

Deliverable: a consistent, documented practice library with traceable decisions.
