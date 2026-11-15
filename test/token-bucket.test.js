import assert from "node:assert/strict";
import test from "node:test";

import { TokenBucket, tokenBucketExercise } from "../src/token-bucket.js";

function createClock() {
  let now = 0;
  return {
    now: () => now,
    advance(milliseconds) {
      now += milliseconds;
    },
    rewind(milliseconds) {
      now -= milliseconds;
    },
  };
}

test("token bucket exposes exercise metadata", () => {
  assert.equal(tokenBucketExercise.slug, "token-bucket-rate-limiter");
  assert.deepEqual(tokenBucketExercise.tags, ["rate-limiting", "time", "state"]);
});

test("token bucket permits a bounded initial burst", () => {
  const clock = createClock();
  const bucket = new TokenBucket({ capacity: 3, refillPerSecond: 2, clock: clock.now });

  assert.equal(bucket.tryConsume(), true);
  assert.equal(bucket.tryConsume(2), true);
  assert.equal(bucket.tryConsume(), false);
  assert.equal(bucket.availableTokens, 0);
});

test("token bucket refills continuously and caps at capacity", () => {
  const clock = createClock();
  const bucket = new TokenBucket({ capacity: 4, refillPerSecond: 2, clock: clock.now });
  bucket.tryConsume(4);

  clock.advance(750);
  assert.equal(bucket.availableTokens, 1.5);
  assert.equal(bucket.tryConsume(1.5), true);
  clock.advance(10_000);
  assert.equal(bucket.availableTokens, 4);
});

test("token bucket rejects invalid configuration and unsafe time", () => {
  const clock = createClock();
  assert.throws(() => new TokenBucket({ capacity: 0, refillPerSecond: 1 }), /capacity/);
  assert.throws(() => new TokenBucket({ capacity: 1, refillPerSecond: Infinity }), /refill/);
  assert.throws(() => new TokenBucket({ capacity: 1, refillPerSecond: 1, clock: null }), /clock/);

  const bucket = new TokenBucket({ capacity: 1, refillPerSecond: 1, clock: clock.now });
  assert.throws(() => bucket.tryConsume(0), /amount/);
  clock.rewind(1);
  assert.throws(() => bucket.availableTokens, /backwards/);
});
