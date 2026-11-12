import { defineExercise } from "./exercise.js";

export const retryExercise = defineExercise({
  slug: "retry-utility",
  title: "Deterministic Retry Utility",
  difficulty: "intermediate",
  tags: ["async", "resilience", "dependency-injection"],
});

const defaultSleep = (delayMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const defaultNow = () => Date.now();

function requireNonNegativeFinite(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number`);
  }
}

/**
 * Build a capped exponential delay strategy.
 *
 * The first retry uses initialDelayMs. Each later retry multiplies the previous
 * delay by factor until maxDelayMs is reached.
 */
export function createExponentialBackoff({
  initialDelayMs = 100,
  factor = 2,
  maxDelayMs = 30_000,
} = {}) {
  requireNonNegativeFinite(initialDelayMs, "initialDelayMs");
  requireNonNegativeFinite(maxDelayMs, "maxDelayMs");

  if (typeof factor !== "number" || !Number.isFinite(factor) || factor < 1) {
    throw new TypeError("factor must be a finite number greater than or equal to 1");
  }

  if (maxDelayMs < initialDelayMs) {
    throw new RangeError("maxDelayMs must be greater than or equal to initialDelayMs");
  }

  return ({ attempt }) =>
    Math.min(initialDelayMs * factor ** (attempt - 1), maxDelayMs);
}

/**
 * Retry an async operation according to an explicit, injectable policy.
 *
 * `retries` counts attempts after the initial call. The operation receives a
 * one-based attempt number and elapsed time. The original final error is
 * rethrown unchanged when the budget is exhausted or the predicate declines.
 */
export async function retry(
  operation,
  {
    retries = 3,
    getDelay = createExponentialBackoff(),
    shouldRetry = () => true,
    sleep = defaultSleep,
    now = defaultNow,
  } = {},
) {
  if (typeof operation !== "function") {
    throw new TypeError("operation must be a function");
  }

  if (!Number.isInteger(retries) || retries < 0) {
    throw new TypeError("retries must be a non-negative integer");
  }

  for (const [value, name] of [
    [getDelay, "getDelay"],
    [shouldRetry, "shouldRetry"],
    [sleep, "sleep"],
    [now, "now"],
  ]) {
    if (typeof value !== "function") {
      throw new TypeError(`${name} must be a function`);
    }
  }

  const startedAt = now();
  requireNonNegativeFinite(startedAt, "now() result");

  for (let attempt = 1; ; attempt += 1) {
    const currentTime = now();
    requireNonNegativeFinite(currentTime, "now() result");
    const context = Object.freeze({
      attempt,
      elapsedMs: Math.max(0, currentTime - startedAt),
      retriesRemaining: retries - attempt + 1,
    });

    try {
      return await operation(context);
    } catch (error) {
      const exhausted = attempt > retries;
      if (exhausted || !shouldRetry(error, context)) {
        throw error;
      }

      const delayMs = getDelay(context, error);
      requireNonNegativeFinite(delayMs, "retry delay");
      await sleep(delayMs);
    }
  }
}
