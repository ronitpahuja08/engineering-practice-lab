import { defineExercise } from "./exercise.js";

export const balancedBracketsExercise = defineExercise({
  slug: "balanced-brackets",
  title: "Balanced Brackets",
  difficulty: "beginner",
  tags: ["strings", "stack"],
});

const OPENING_BRACKETS = new Set(["(", "[", "{"]);
const EXPECTED_OPENING = new Map([
  [")", "("],
  ["]", "["],
  ["}", "{"],
]);

/**
 * Determine whether every bracket in a string is correctly paired and nested.
 * Characters other than (), [], and {} are ignored.
 *
 * @param {string} input text whose brackets should be checked
 * @returns {boolean} true when every bracket is balanced
 */
export function isBalancedBrackets(input) {
  if (typeof input !== "string") {
    throw new TypeError("input must be a string");
  }

  const openBrackets = [];

  for (const character of input) {
    if (OPENING_BRACKETS.has(character)) {
      openBrackets.push(character);
      continue;
    }

    const expectedOpening = EXPECTED_OPENING.get(character);
    if (expectedOpening === undefined) {
      continue;
    }

    if (openBrackets.pop() !== expectedOpening) {
      return false;
    }
  }

  return openBrackets.length === 0;
}
