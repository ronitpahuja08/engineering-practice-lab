# Token-Bucket Rate Limiter Review

## Contract

`TokenBucket` starts full, refills continuously up to its configured capacity,
and exposes `tryConsume(amount)` as a non-blocking operation. A failed request
does not change the balance. The constructor accepts a clock so tests do not
depend on wall-clock time.

## Invariants reviewed

- The balance remains within `0..capacity` after every public operation.
- A request can only reduce the balance when enough tokens are available.
- Elapsed time is measured from the previous refill and never counted twice.
- A clock moving backwards is rejected rather than silently minting tokens.

## Complexity and tradeoffs

Each operation is O(1) and stores only scalar state. Fractional tokens preserve
continuous refill behavior; callers that need discrete units can use integer
amounts. This single-process implementation is intentionally not a distributed
rate limiter. Coordinating multiple processes would require a shared atomic
store and a clearly documented clock policy.

## Benchmark note

`npm run bench:token-bucket` exercises 100,000 consumes with an injected
clock. It is a local smoke benchmark, not a production throughput claim: its
result varies by runtime, machine, and instrumentation.

## Follow-ups

- Add a `retryAfterMilliseconds` helper for HTTP-facing consumers.
- Consider a fixed-point representation if a service needs long-running,
  high-precision accounting.
