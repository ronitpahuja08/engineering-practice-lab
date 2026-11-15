import { defineExercise } from "./exercise.js";

export const tokenBucketExercise = defineExercise({
  slug: "token-bucket-rate-limiter",
  title: "Deterministic Token-Bucket Rate Limiter",
  difficulty: "intermediate",
  tags: ["rate-limiting", "time", "state"],
});

function requirePositiveFinite(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

function requireClock(clock) {
  if (typeof clock !== "function") {
    throw new TypeError("clock must be a function");
  }
}

/**
 * Limits consumption using a token bucket whose time source is injectable.
 *
 * Tokens refill continuously at `refillPerSecond`, capped at `capacity`.
 * `tryConsume` never waits or permits a negative balance.
 */
export class TokenBucket {
  #capacity;
  #refillPerMillisecond;
  #clock;
  #tokens;
  #lastRefillAt;

  constructor({ capacity, refillPerSecond, clock = () => Date.now() }) {
    requirePositiveFinite(capacity, "capacity");
    requirePositiveFinite(refillPerSecond, "refillPerSecond");
    requireClock(clock);

    const now = clock();
    if (!Number.isFinite(now)) {
      throw new RangeError("clock must return a finite timestamp");
    }
    this.#capacity = capacity;
    this.#refillPerMillisecond = refillPerSecond / 1_000;
    this.#clock = clock;
    this.#tokens = capacity;
    this.#lastRefillAt = now;
  }

  get capacity() {
    return this.#capacity;
  }

  get availableTokens() {
    this.#refill();
    return this.#tokens;
  }

  tryConsume(amount = 1) {
    requirePositiveFinite(amount, "amount");
    this.#refill();
    if (amount > this.#tokens) {
      return false;
    }
    this.#tokens -= amount;
    return true;
  }

  #refill() {
    const now = this.#clock();
    if (!Number.isFinite(now)) {
      throw new RangeError("clock must return a finite timestamp");
    }
    if (now < this.#lastRefillAt) {
      throw new RangeError("clock cannot move backwards");
    }
    const elapsed = now - this.#lastRefillAt;
    this.#tokens = Math.min(
      this.#capacity,
      this.#tokens + elapsed * this.#refillPerMillisecond,
    );
    this.#lastRefillAt = now;
  }
}
