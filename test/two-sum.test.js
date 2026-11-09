import assert from "node:assert/strict";
import test from "node:test";

import { twoSum, twoSumExercise } from "../src/two-sum.js";

test("twoSum exposes its exercise metadata", () => {
  assert.equal(twoSumExercise.slug, "two-sum");
  assert.deepEqual(twoSumExercise.tags, ["arrays", "hash-map"]);
});

test("twoSum returns indices for a normal pair", () => {
  assert.deepEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
});

test("twoSum uses distinct indices for duplicate values", () => {
  assert.deepEqual(twoSum([3, 3], 6), [0, 1]);
});

test("twoSum handles negative values and zero", () => {
  assert.deepEqual(twoSum([-4, 8, 0, 5], 1), [0, 3]);
});

test("twoSum returns null when no pair exists", () => {
  assert.equal(twoSum([1, 2, 3], 99), null);
});

test("twoSum does not mutate its input", () => {
  const values = Object.freeze([9, 4, 7, 1]);

  assert.deepEqual(twoSum(values, 10), [0, 3]);
  assert.deepEqual(values, [9, 4, 7, 1]);
});

test("twoSum rejects invalid arguments", () => {
  assert.throws(() => twoSum("2,7", 9), /values must be an array/);
  assert.throws(() => twoSum([2, Number.NaN], 9), /values\[1\]/);
  assert.throws(() => twoSum([2, 7], Number.POSITIVE_INFINITY), /target/);
});
