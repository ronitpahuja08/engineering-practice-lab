# Two Sum Review Notes

## Contract reviewed

- Inputs must be an array of finite numbers and a finite numeric target.
- The function returns two distinct indices or `null` when no solution exists.
- The input array is never modified.
- Invalid values are rejected consistently, even when an earlier pair could be found.

## Correctness reasoning

Before processing index `i`, the map contains the earliest index for every distinct value in positions `0..i-1`. If the complement of `values[i]` is present, the stored index is necessarily distinct from `i`, so the returned pair is valid. Looking up the complement before storing the current value also handles duplicate pairs such as `[3, 3]` correctly.

## Complexity

- Validation: O(n) time.
- Pair search: O(n) expected time using a hash map.
- Additional storage: O(n) in the worst case.

## Tradeoffs and follow-ups

- The function returns the first pair discovered during a left-to-right scan, not every possible pair.
- Returning `null` makes the absence of a solution an expected result rather than an exception.
- A future variant could expose all unique pairs, but that should be a separate API because its output and complexity differ.

## Review outcome

The implementation meets issue #1's acceptance criteria. Tests cover duplicates, negatives, no solution, invalid input, and immutability. No unrelated changes are included in the branch.
