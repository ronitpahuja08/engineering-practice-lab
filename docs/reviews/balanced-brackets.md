# Balanced Brackets Review Notes

## Policy reviewed

- Only `()`, `[]`, and `{}` participate in balance checks.
- Other characters are ignored, allowing brackets inside general text to be checked.
- Non-string input is rejected with a `TypeError`.
- An empty string is balanced.

## Stack invariant

Before each character is processed, the stack contains exactly the unmatched opening brackets encountered so far, in nesting order. An opening bracket is pushed. A closing bracket must match the top item; otherwise the input cannot be repaired by later characters and the function returns `false` immediately. After the scan, an empty stack proves that every opening bracket was closed.

## Complexity

- Time: O(n), where `n` is the number of Unicode code points inspected.
- Additional storage: O(n) in the worst case when every relevant character is an opening bracket.

The implementation is iterative, so deeply nested valid input does not depend on the JavaScript call-stack limit.

## Review findings

- Calling `pop()` on an empty stack returns `undefined`, which safely rejects a premature closing bracket because no expected opening symbol is `undefined`.
- Module-level bracket maps avoid rebuilding constant lookup structures for every call.
- Tests cover empty input, all bracket families, nested text, mismatches, premature closes, unclosed input, long sequences, and invalid argument types.
- The branch contains only the implementation, tests, and review documentation for issue #2.

## Known limitation

This function is not a programming-language parser. Brackets inside quoted strings and comments are still counted. Supporting language-aware parsing would require a separate tokenizer and is intentionally outside this exercise.

## Review outcome

The implementation satisfies issue #2. The stack invariant is explicit, the chosen non-bracket policy is documented, and all 18 repository tests pass.
