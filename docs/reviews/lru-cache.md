# LRU Cache Design and Review Notes

## Public contract

- `new LruCache(capacity)` requires a positive integer capacity.
- `set(key, value)` inserts or replaces a value, marks it most recent, and
  returns the cache for fluent setup.
- `get(key)` returns the stored value and refreshes recency on a hit. A miss
  returns `undefined` without changing state.
- `has(key)` reports membership without refreshing recency. This keeps it a
  Map-like observation rather than a cache access.
- `size` and `capacity` are read-only properties.
- Any JavaScript value can be a key or value. Callers can distinguish a stored
  `undefined` from a miss by calling `has`.

## State invariants

After construction and after every `set` or successful `get`:

1. `0 <= size <= capacity`.
2. Each key appears at most once.
3. Map iteration order runs from least recent to most recent.
4. The first key is the only eviction candidate.
5. A read miss and `has` do not change the ordering.

The implementation maintains these invariants by deleting an existing key
before reinserting it. If an insertion exceeds capacity, it deletes exactly the
first key returned by the ordered Map iterator.

## Complexity

JavaScript `Map` lookup, insertion, and deletion are expected to be O(1) on
average. Each public operation performs a constant number of those operations:

- `get`: O(1) average time and O(1) additional space.
- `has`: O(1) average time and O(1) additional space.
- `set`: O(1) average time and O(1) additional space per inserted entry.
- Total retained storage: O(capacity).

The ECMAScript specification guarantees Map insertion order, but it does not
mandate a specific internal hash-table implementation. The complexity statement
therefore describes normal JavaScript engine behavior rather than a language
specification guarantee.

## Ordered Map versus hash map plus linked list

The classic LRU design combines a hash map for key lookup with a doubly linked
list for recency order. That design gives explicit O(1) movement and eviction,
works in languages without ordered maps, and can expose nodes for more advanced
operations. Its cost is more code and more invariants: every update must keep
the map, head, tail, and neighboring pointers synchronized.

JavaScript's ordered `Map` provides the two behaviors this exercise needs:
constant-average lookup and deterministic insertion order. Delete-plus-set
moves a key to the newest position, and the first key is the oldest. This keeps
the implementation compact and lowers pointer-corruption risk. A linked-list
implementation would become preferable if profiling showed delete-plus-set to
be expensive, if entry nodes needed extra lifecycle hooks, or if ordering
operations expanded beyond LRU behavior.

## Review findings

- Capacity validation distinguishes wrong types from out-of-range integers.
- Reads use `has` before `get`, so a stored `undefined` remains a valid hit.
- Updating an existing key does not grow the cache and does refresh recency.
- Eviction occurs only after insertion exceeds capacity, so exactly one oldest
  entry is removed.
- `has` is intentionally non-mutating and its policy is locked by a test.
- Private fields prevent callers from bypassing capacity and ordering rules.
- Tests cover construction, misses, fluent writes, eviction, read refresh,
  overwrite refresh, `has` policy, undefined values, and object-key identity.

## Review outcome

The implementation satisfies issue #3 with O(1)-average operations, explicit
recency semantics, and 28 passing repository tests. No linked-list version is
needed for the current API; the alternative and its tradeoffs are documented.
