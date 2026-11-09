import assert from "node:assert/strict";
import test from "node:test";

import { defineExercise } from "../src/exercise.js";

test("defineExercise normalizes and freezes valid metadata", () => {
  const exercise = defineExercise({
    slug: "two-sum",
    title: "  Two Sum  ",
    difficulty: "beginner",
    tags: ["arrays", "hash-map", "arrays"],
  });

  assert.deepEqual(exercise, {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "beginner",
    tags: ["arrays", "hash-map"],
  });
  assert.equal(Object.isFrozen(exercise), true);
  assert.equal(Object.isFrozen(exercise.tags), true);
});

test("defineExercise rejects invalid metadata", () => {
  assert.throws(
    () =>
      defineExercise({
        slug: "Two Sum",
        title: "Two Sum",
        difficulty: "beginner",
      }),
    /slug/,
  );
  assert.throws(
    () =>
      defineExercise({
        slug: "two-sum",
        title: "",
        difficulty: "beginner",
      }),
    /title/,
  );
  assert.throws(
    () =>
      defineExercise({
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "expert",
      }),
    /difficulty/,
  );
});
