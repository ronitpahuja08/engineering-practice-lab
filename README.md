# Engineering Practice Lab

A private, structured workspace for practicing algorithm design, production-minded JavaScript, automated testing, documentation, and GitHub collaboration workflows.

This repository treats each exercise like a small engineering change rather than a loose code snippet. Every exercise starts with an issue, is implemented on a focused branch, includes tests and design notes, and is delivered through a pull request with a review checklist.

## Working agreement

For every exercise:

1. Define the problem and acceptance criteria in a GitHub issue.
2. Create a branch named `exercise/<short-name>`.
3. Commit the implementation and tests in reviewable steps.
4. Open a pull request that links the issue.
5. Record correctness, complexity, edge cases, and follow-up ideas.
6. Merge only after the test suite passes and the review checklist is complete.

## Seven-day program

| Day | Focus | Main engineering lesson |
| --- | --- | --- |
| 1 | Two Sum | Contracts, hash-map tradeoffs, edge cases |
| 2 | Balanced Brackets | Stack invariants and malformed input |
| 3 | LRU Cache | Data-structure design and O(1) operations |
| 4 | Retry Utility | Async control flow and deterministic timing |
| 5 | Event Emitter | API lifecycle and listener isolation |
| 6 | Token-Bucket Limiter | Time-dependent state and injected clocks |
| 7 | Integration and retrospective | Refactoring, documentation, and release discipline |

The detailed plan and acceptance criteria live in [ROADMAP.md](ROADMAP.md).

## Run the tests

```bash
npm test
```

The lab uses Node's built-in test runner, so the initial project has no runtime or development dependencies.

## Repository layout

```text
docs/        Review checklists and engineering notes
src/         Exercise metadata and implementations
test/        Automated tests mirroring src/
```

## Quality bar

- Behavior is described before implementation.
- Tests cover normal cases, boundaries, and invalid input.
- Complexity claims are justified in the PR description.
- Public functions have clear input and output contracts.
- Review notes identify at least one tradeoff or possible improvement.
