# Event Emitter Design and Review Notes

## Public contract

- `on(eventName, listener)` registers a synchronous listener and returns an
  idempotent unsubscribe function for that exact registration.
- `once(eventName, listener)` has the same subscription contract but removes
  its registration before invocation.
- `off(eventName, listener)` removes every active registration of that callback
  for the named event and returns the number removed.
- `emit(eventName, ...args)` invokes the active snapshot in registration order
  and returns the number of listeners invoked when all callbacks succeed.
- `listenerCount(eventName)` reports only active registrations.
- Event names may be non-empty strings or symbols. Symbols retain identity and
  do not collide merely because their descriptions match.

## Lifecycle invariants

Each call to `on` or `once` creates a separate registration, even if the same
callback is supplied more than once. The returned unsubscribe function removes
only its own registration; `off` intentionally removes all matching callback
registrations for that event.

Emission uses a shallow snapshot to guarantee ordering and to defer listeners
added mid-emission until the next call. Snapshot entries retain an active flag,
so removing a listener before its turn prevents that callback from running.
This combines stable iteration with meaningful unsubscription semantics.

A once-listener is marked inactive before its callback begins. Recursive
emission therefore cannot invoke it twice, and a throwing once-listener still
leaves no registration behind.

## Error policy

One failing callback should not silently block unrelated subscribers. The
emitter runs the remaining active listeners, collects thrown values, performs
normal lifecycle cleanup, and then throws an `AggregateError` in callback
order. This policy makes partial delivery visible without hiding later listener
failures.

The emitter is deliberately synchronous. Supporting promises would require a
separate contract for ordering, rejection handling, concurrency, and return
values rather than an implicit mixture of sync and async behavior.

## Complexity and storage

- Subscription is amortized O(1).
- Emission is O(n) for the event because it snapshots and visits registrations.
- `off` and `listenerCount` are O(n) for the event.
- Inactive registrations are compacted after removal and emission, preventing
  normal subscribe/unsubscribe cycles from retaining dead callback references.

The class does not impose an arbitrary listener limit. Long-lived owners remain
responsible for calling the returned unsubscribe function or using `once`; a
future diagnostics layer could warn when event counts cross a configured
threshold.

## Review findings

- Duplicate-listener behavior is explicit and tested.
- New listeners cannot affect an in-progress snapshot.
- Mid-emission removal takes effect before the removed listener's turn.
- Recursive emission cannot repeat a once-listener.
- Callback errors preserve identity inside an ordered `AggregateError`.
- Symbol event names remain isolated.
- Invalid events and callbacks fail at the API boundary.
- The implementation has no dependencies and no asynchronous timing behavior.

## Deferred improvements

- Add an async emitter only as a separate class with a defined concurrency
  policy.
- Consider optional listener-count warnings for diagnostics in long-lived
  services.
- Add event-name enumeration only when a real inspection use case appears.
- Consider an `AbortSignal` subscription helper for browser and service code.

## Review outcome

The implementation satisfies issue #5 with explicit lifecycle semantics,
listener isolation during mutation, deterministic error handling, and 49
passing repository tests.
