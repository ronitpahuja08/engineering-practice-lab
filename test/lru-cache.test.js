import assert from "node:assert/strict";
import test from "node:test";

import { LruCache, lruCacheExercise } from "../src/lru-cache.js";

test("LRU cache exposes its exercise metadata", () => {
  assert.equal(lruCacheExercise.slug, "lru-cache");
  assert.deepEqual(lruCacheExercise.tags, [
    "data-structures",
    "cache",
    "map",
  ]);
});

test("constructor requires a positive integer capacity", () => {
  for (const capacity of [1.5, Number.NaN, Number.POSITIVE_INFINITY, "2"]) {
    assert.throws(() => new LruCache(capacity), TypeError);
  }

  for (const capacity of [0, -1]) {
    assert.throws(() => new LruCache(capacity), RangeError);
  }
});

test("new cache exposes capacity and starts empty", () => {
  const cache = new LruCache(3);

  assert.equal(cache.capacity, 3);
  assert.equal(cache.size, 0);
  assert.equal(cache.has("missing"), false);
  assert.equal(cache.get("missing"), undefined);
});

test("set stores values and supports fluent setup", () => {
  const cache = new LruCache(2);

  assert.equal(cache.set("first", 1), cache);
  cache.set("second", 2);

  assert.equal(cache.size, 2);
  assert.equal(cache.get("first"), 1);
  assert.equal(cache.get("second"), 2);
});

test("least recently inserted entry is evicted at capacity", () => {
  const cache = new LruCache(2);
  cache.set("oldest", 1).set("newer", 2).set("newest", 3);

  assert.equal(cache.has("oldest"), false);
  assert.equal(cache.get("newer"), 2);
  assert.equal(cache.get("newest"), 3);
  assert.equal(cache.size, 2);
});

test("successful get refreshes recency", () => {
  const cache = new LruCache(2);
  cache.set("first", 1).set("second", 2);

  assert.equal(cache.get("first"), 1);
  cache.set("third", 3);

  assert.equal(cache.has("first"), true);
  assert.equal(cache.has("second"), false);
  assert.equal(cache.has("third"), true);
});

test("overwriting a key updates its value and recency", () => {
  const cache = new LruCache(2);
  cache.set("first", 1).set("second", 2).set("first", 10);
  cache.set("third", 3);

  assert.equal(cache.get("first"), 10);
  assert.equal(cache.has("second"), false);
  assert.equal(cache.size, 2);
});

test("has observes membership without refreshing recency", () => {
  const cache = new LruCache(2);
  cache.set("first", 1).set("second", 2);

  assert.equal(cache.has("first"), true);
  cache.set("third", 3);

  assert.equal(cache.has("first"), false);
  assert.equal(cache.has("second"), true);
});

test("stored undefined remains distinguishable through has", () => {
  const cache = new LruCache(1);
  cache.set("key", undefined);

  assert.equal(cache.get("key"), undefined);
  assert.equal(cache.has("key"), true);
  assert.equal(cache.get("missing"), undefined);
  assert.equal(cache.has("missing"), false);
});

test("object keys use identity semantics", () => {
  const cache = new LruCache(2);
  const key = { id: 1 };
  cache.set(key, "stored");

  assert.equal(cache.get(key), "stored");
  assert.equal(cache.has({ id: 1 }), false);
});
