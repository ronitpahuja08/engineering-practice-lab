import assert from "node:assert/strict";
import test from "node:test";

import {
  createExponentialBackoff,
  retry,
  retryExercise,
} from "../src/retry.js";

test("retry utility exposes its exercise metadata", () => {
  assert.equal(retryExercise.slug, "retry-utility");
  assert.deepEqual(retryExercise.tags, [
    "async",
    "resilience",
    "dependency-injection",
  ]);
});

test("successful operation resolves without sleeping", async () => {
  const sleeps = [];

  const result = await retry(async ({ attempt, retriesRemaining }) => {
    assert.equal(attempt, 1);
    assert.equal(retriesRemaining, 3);
    return "done";
  }, { sleep: async (delayMs) => sleeps.push(delayMs) });

  assert.equal(result, "done");
  assert.deepEqual(sleeps, []);
});

test("operation succeeds after failures with deterministic time", async () => {
  let clock = 1_000;
  const attempts = [];
  const sleeps = [];

  const result = await retry(
    async (context) => {
      attempts.push(context);
      if (context.attempt < 3) {
        throw new Error(`failure ${context.attempt}`);
      }
      return "recovered";
    },
    {
      retries: 3,
      getDelay: createExponentialBackoff({
        initialDelayMs: 10,
        factor: 3,
        maxDelayMs: 100,
      }),
      now: () => clock,
      sleep: async (delayMs) => {
        sleeps.push(delayMs);
        clock += delayMs;
      },
    },
  );

  assert.equal(result, "recovered");
  assert.deepEqual(sleeps, [10, 30]);
  assert.deepEqual(
    attempts.map(({ attempt, elapsedMs, retriesRemaining }) => ({
      attempt,
      elapsedMs,
      retriesRemaining,
    })),
    [
      { attempt: 1, elapsedMs: 0, retriesRemaining: 3 },
      { attempt: 2, elapsedMs: 10, retriesRemaining: 2 },
      { attempt: 3, elapsedMs: 40, retriesRemaining: 1 },
    ],
  );
  assert.equal(Object.isFrozen(attempts[0]), true);
});

test("exhausted retries rethrow the original error", async () => {
  const originalError = new Error("still failing");
  let calls = 0;
  const sleeps = [];

  await assert.rejects(
    retry(
      async () => {
        calls += 1;
        throw originalError;
      },
      {
        retries: 2,
        getDelay: ({ attempt }) => attempt,
        sleep: async (delayMs) => sleeps.push(delayMs),
      },
    ),
    (error) => error === originalError,
  );

  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [1, 2]);
});

test("non-retryable error stops before delay and sleep", async () => {
  const permanentError = new TypeError("invalid request");
  let delayCalls = 0;
  let sleepCalls = 0;

  await assert.rejects(
    retry(async () => {
      throw permanentError;
    }, {
      retries: 5,
      shouldRetry: (error, { attempt }) => {
        assert.equal(error, permanentError);
        assert.equal(attempt, 1);
        return false;
      },
      getDelay: () => {
        delayCalls += 1;
        return 1;
      },
      sleep: async () => {
        sleepCalls += 1;
      },
    }),
    (error) => error === permanentError,
  );

  assert.equal(delayCalls, 0);
  assert.equal(sleepCalls, 0);
});

test("exponential backoff grows and respects its cap", () => {
  const getDelay = createExponentialBackoff({
    initialDelayMs: 25,
    factor: 2,
    maxDelayMs: 80,
  });

  assert.deepEqual(
    [1, 2, 3, 4].map((attempt) => getDelay({ attempt })),
    [25, 50, 80, 80],
  );
});

test("invalid retry options fail before operation execution", async () => {
  await assert.rejects(retry(null), /operation must be a function/);

  for (const retries of [-1, 1.5, Number.NaN, "2"]) {
    await assert.rejects(
      retry(async () => "unused", { retries }),
      /retries must be a non-negative integer/,
    );
  }

  for (const [name, value] of [
    ["getDelay", 1],
    ["shouldRetry", true],
    ["sleep", null],
    ["now", "clock"],
  ]) {
    await assert.rejects(
      retry(async () => "unused", { [name]: value }),
      new RegExp(`${name} must be a function`),
    );
  }
});

test("invalid generated delay rejects instead of sleeping", async () => {
  await assert.rejects(
    retry(async () => {
      throw new Error("retry me");
    }, {
      retries: 1,
      getDelay: () => Number.NaN,
      sleep: async () => assert.fail("sleep must not run"),
    }),
    /retry delay must be a non-negative finite number/,
  );
});

test("backoff validates its configuration", () => {
  assert.throws(
    () => createExponentialBackoff({ initialDelayMs: -1 }),
    /initialDelayMs/,
  );
  assert.throws(
    () => createExponentialBackoff({ factor: 0.5 }),
    /factor/,
  );
  assert.throws(
    () =>
      createExponentialBackoff({ initialDelayMs: 100, maxDelayMs: 50 }),
    RangeError,
  );
});
