import assert from "node:assert/strict";
import test from "node:test";

import {
  balancedBracketsExercise,
  isBalancedBrackets,
} from "../src/balanced-brackets.js";

test("balanced brackets exposes its exercise metadata", () => {
  assert.equal(balancedBracketsExercise.slug, "balanced-brackets");
  assert.deepEqual(balancedBracketsExercise.tags, ["strings", "stack"]);
});

test("empty text and text without brackets are balanced", () => {
  assert.equal(isBalancedBrackets(""), true);
  assert.equal(isBalancedBrackets("no delimiters here"), true);
});

test("matching bracket families are balanced", () => {
  assert.equal(isBalancedBrackets("()[]{}"), true);
});

test("properly nested brackets are balanced", () => {
  assert.equal(isBalancedBrackets("{[()]}"), true);
  assert.equal(isBalancedBrackets("function demo() { return [call(1)]; }"), true);
});

test("mismatched nesting is rejected", () => {
  assert.equal(isBalancedBrackets("([)]"), false);
  assert.equal(isBalancedBrackets("{]"), false);
});

test("premature closing brackets are rejected", () => {
  assert.equal(isBalancedBrackets(")("), false);
  assert.equal(isBalancedBrackets("text }"), false);
});

test("unclosed brackets are rejected", () => {
  assert.equal(isBalancedBrackets("(("), false);
  assert.equal(isBalancedBrackets("{[()]"), false);
});

test("long balanced sequences are handled iteratively", () => {
  const depth = 10_000;
  const input = "(".repeat(depth) + ")".repeat(depth);

  assert.equal(isBalancedBrackets(input), true);
});

test("non-string input is rejected", () => {
  assert.throws(() => isBalancedBrackets(null), /input must be a string/);
  assert.throws(() => isBalancedBrackets(["(", ")"]), /input must be a string/);
});
