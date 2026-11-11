import { defineExercise } from "./exercise.js";

export const lruCacheExercise = defineExercise({
  slug: "lru-cache",
  title: "Least Recently Used Cache",
  difficulty: "intermediate",
  tags: ["data-structures", "cache", "map"],
});

/**
 * A fixed-capacity least-recently-used cache.
 *
 * JavaScript Map preserves insertion order. Deleting and reinserting an entry
 * moves it to the newest position, while the first key remains the eviction
 * candidate. Map operations are O(1) on average.
 */
export class LruCache {
  #capacity;
  #entries = new Map();

  /**
   * @param {number} capacity maximum number of entries retained
   */
  constructor(capacity) {
    if (!Number.isInteger(capacity)) {
      throw new TypeError("capacity must be an integer");
    }

    if (capacity <= 0) {
      throw new RangeError("capacity must be greater than zero");
    }

    this.#capacity = capacity;
  }

  get capacity() {
    return this.#capacity;
  }

  get size() {
    return this.#entries.size;
  }

  /**
   * Read a value and refresh its recency.
   *
   * @param {unknown} key cache key
   * @returns {unknown} stored value, or undefined when absent
   */
  get(key) {
    if (!this.#entries.has(key)) {
      return undefined;
    }

    const value = this.#entries.get(key);
    this.#entries.delete(key);
    this.#entries.set(key, value);
    return value;
  }

  /**
   * Check membership without changing recency.
   *
   * @param {unknown} key cache key
   * @returns {boolean} whether the key is present
   */
  has(key) {
    return this.#entries.has(key);
  }

  /**
   * Insert or replace a value and mark it as most recently used.
   *
   * @param {unknown} key cache key
   * @param {unknown} value value to store
   * @returns {LruCache} this cache for fluent setup
   */
  set(key, value) {
    if (this.#entries.has(key)) {
      this.#entries.delete(key);
    }

    this.#entries.set(key, value);

    if (this.#entries.size > this.#capacity) {
      const oldestKey = this.#entries.keys().next().value;
      this.#entries.delete(oldestKey);
    }

    return this;
  }
}
