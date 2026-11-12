# Retry Utility Design and Review Notes

## Public contract

- `retry(operation, options)` always performs one initial attempt.
- `retries` is the number of additional attempts allowed after the initial one.
- The operation receives a frozen context containing its one-based `attempt`,
  `retriesRemaining`, and elapsed milliseconds from the injected clock.
- `shouldRetry(error, context)` can stop retries before a delay is calculated.
- `getDelay(context, error)` chooses the wait before the next attempt.
- `sleep(delayMs)` and `now()` are injectable, keeping tests free of real waits
  and wall-clock assumptions.
- Success resolves with the operation's value. Exhaustion or predicate refusal
  rejects with the exact original thrown value rather than wrapping it.

## State and timing invariants

For a retry budget of `n`, the operation runs at most `n + 1` times. Sleep runs
only between two permitted attempts, so it runs at most `n` times. The delay
strategy is never called after exhaustion or when the predicate rejects an
error. Generated delays must be finite and non-negative before reaching the
sleep dependency.

Elapsed time is observed before each operation call. A clock that moves
backward is clamped to zero elapsed time rather than exposing a negative value.
The implementation does not infer that injected sleep advanced the clock;
tests control both dependencies explicitly.

## Exponential backoff

`createExponentialBackoff` starts at `initialDelayMs`, multiplies the next delay
by `factor`, and caps the result at `maxDelayMs`. It validates all configuration
when the strategy is created, so invalid policies fail before an operation is
attempted. The default policy uses 100 ms, a factor of two, and a 30-second cap.

This strategy is deterministic and intentionally has no jitter. Determinism is
appropriate for this exercise and for unit tests, but simultaneous production
clients could otherwise retry in lockstep.

## Error policy

JavaScript permits throwing any value, so the retry utility treats caught
values as opaque. It passes the value to the predicate and rethrows it unchanged
at the terminal boundary. This preserves error identity, stack information, and
custom fields without making assumptions about error classes.

Configuration errors are different: invalid operation, budget, dependency, or
delay values fail with descriptive `TypeError` or `RangeError` instances. These
are programmer errors and are never retried.

## Review findings

- The attempt loop has one terminal check, avoiding off-by-one branches.
- Predicate evaluation occurs before delay calculation and sleeping.
- The retry context is frozen so policies cannot affect later observers.
- Success on the first attempt performs no policy or sleep work.
- The final thrown object retains identity with the operation's error.
- Tests use injected clock and sleep functions and contain no timers.
- Tests cover first-attempt success, recovery, exhaustion, predicate refusal,
  capped backoff, invalid configuration, invalid generated delays, and metadata.

## Deferred improvements

- Accept an `AbortSignal` and check it before attempts and during waits.
- Add an injectable jitter strategy with bounded full- and equal-jitter modes.
- Consider an optional overall elapsed-time budget in addition to retry count.
- Add observability callbacks only when a concrete logging or metrics consumer
  exists; callbacks should not be speculative API surface.

## Review outcome

The implementation satisfies issue #4 with deterministic time control,
explicit retry and error semantics, and 37 passing repository tests.
Cancellation and jitter remain documented follow-ups rather than partially
implemented behavior.
