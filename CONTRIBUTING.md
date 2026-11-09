# Contributing Workflow

This lab uses a lightweight but real review workflow.

## Before coding

- Create or select an issue with measurable acceptance criteria.
- Use a focused branch such as `exercise/two-sum` or `docs/review-guide`.
- Keep unrelated cleanup out of the branch.

## Before opening a pull request

- Run `npm test`.
- Check normal, boundary, and invalid-input behavior.
- Document time and space complexity where relevant.
- Update the README or roadmap if behavior or scope changed.

## Pull request description

Include:

- the problem being solved;
- the chosen approach and alternatives considered;
- evidence that the acceptance criteria pass;
- known limitations and follow-up work;
- a closing reference such as `Closes #1`.

Use [docs/review-checklist.md](docs/review-checklist.md) during review.
