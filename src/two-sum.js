import { defineExercise } from "./exercise.js";

export const twoSumExercise = defineExercise({
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "beginner",
  tags: ["arrays", "hash-map"],
});

function assertFiniteNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
}

/**
 * Find the first pair of distinct indices whose values add up to target.
 *
 * @param {number[]} values finite numbers to inspect
 * @param {number} target desired sum
 * @returns {[number, number] | null} matching indices, or null when no pair exists
 */
export function twoSum(values, target) {
  if (!Array.isArray(values)) {
    throw new TypeError("values must be an array");
  }

  assertFiniteNumber(target, "target");
  values.forEach((value, index) =>
    assertFiniteNumber(value, `values[${index}]`),
  );

  const seenIndices = new Map();

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    const complement = target - value;

    if (seenIndices.has(complement)) {
      return [seenIndices.get(complement), index];
    }

    if (!seenIndices.has(value)) {
      seenIndices.set(value, index);
    }
  }

  return null;
}
