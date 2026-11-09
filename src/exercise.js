const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function defineExercise({ slug, title, difficulty, tags = [] }) {
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    throw new TypeError("slug must use lowercase words separated by hyphens");
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new TypeError("title must be a non-empty string");
  }

  if (!DIFFICULTIES.has(difficulty)) {
    throw new TypeError(
      "difficulty must be beginner, intermediate, or advanced",
    );
  }

  if (
    !Array.isArray(tags) ||
    tags.some((tag) => typeof tag !== "string" || tag.trim().length === 0)
  ) {
    throw new TypeError("tags must contain non-empty strings");
  }

  const normalizedTags = [...new Set(tags.map((tag) => tag.trim()))];

  return Object.freeze({
    slug,
    title: title.trim(),
    difficulty,
    tags: Object.freeze(normalizedTags),
  });
}
