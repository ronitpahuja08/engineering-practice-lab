import assert from "node:assert/strict";
import test from "node:test";

import {
  EventEmitter,
  eventEmitterExercise,
} from "../src/event-emitter.js";

test("event emitter exposes its exercise metadata", () => {
  assert.equal(eventEmitterExercise.slug, "event-emitter");
  assert.deepEqual(eventEmitterExercise.tags, [
    "events",
    "callbacks",
    "lifecycle",
  ]);
});

test("listeners run synchronously in registration order", () => {
  const emitter = new EventEmitter();
  const calls = [];
  emitter.on("message", (value) => calls.push(`first:${value}`));
  emitter.on("message", (value) => calls.push(`second:${value}`));

  const invoked = emitter.emit("message", "ready");

  assert.equal(invoked, 2);
  assert.deepEqual(calls, ["first:ready", "second:ready"]);
});

test("duplicate callbacks are independent registrations", () => {
  const emitter = new EventEmitter();
  let calls = 0;
  const listener = () => {
    calls += 1;
  };
  const unsubscribeFirst = emitter.on("tick", listener);
  emitter.on("tick", listener);

  assert.equal(emitter.listenerCount("tick"), 2);
  assert.equal(unsubscribeFirst(), true);
  assert.equal(unsubscribeFirst(), false);
  assert.equal(emitter.emit("tick"), 1);
  assert.equal(calls, 1);
});

test("off removes every matching callback for one event", () => {
  const emitter = new EventEmitter();
  const listener = () => {};
  emitter.on("first", listener);
  emitter.on("first", listener);
  emitter.on("second", listener);

  assert.equal(emitter.off("first", listener), 2);
  assert.equal(emitter.listenerCount("first"), 0);
  assert.equal(emitter.listenerCount("second"), 1);
  assert.equal(emitter.off("missing", listener), 0);
});

test("once listener is removed before a recursive emission", () => {
  const emitter = new EventEmitter();
  let calls = 0;
  emitter.once("ready", () => {
    calls += 1;
    emitter.emit("ready");
  });

  emitter.emit("ready");
  emitter.emit("ready");

  assert.equal(calls, 1);
  assert.equal(emitter.listenerCount("ready"), 0);
});

test("unsubscription during emission skips a listener not yet invoked", () => {
  const emitter = new EventEmitter();
  const calls = [];
  let unsubscribeSecond;
  emitter.on("work", () => {
    calls.push("first");
    unsubscribeSecond();
  });
  unsubscribeSecond = emitter.on("work", () => calls.push("second"));

  assert.equal(emitter.emit("work"), 1);
  assert.deepEqual(calls, ["first"]);
});

test("listeners added during emission wait for the next emission", () => {
  const emitter = new EventEmitter();
  const calls = [];
  let added = false;
  emitter.on("work", () => {
    calls.push("original");
    if (!added) {
      added = true;
      emitter.on("work", () => calls.push("late"));
    }
  });

  emitter.emit("work");
  assert.deepEqual(calls, ["original"]);
  emitter.emit("work");
  assert.deepEqual(calls, ["original", "original", "late"]);
});

test("listener failures are aggregated after remaining listeners run", () => {
  const emitter = new EventEmitter();
  const firstError = new Error("first failure");
  const secondError = new TypeError("second failure");
  const calls = [];
  emitter.on("work", () => {
    calls.push("first");
    throw firstError;
  });
  emitter.on("work", () => calls.push("middle"));
  emitter.on("work", () => {
    calls.push("last");
    throw secondError;
  });

  assert.throws(
    () => emitter.emit("work"),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(error.errors, [firstError, secondError]);
      return true;
    },
  );
  assert.deepEqual(calls, ["first", "middle", "last"]);
});

test("once listener stays removed when its callback throws", () => {
  const emitter = new EventEmitter();
  emitter.once("work", () => {
    throw new Error("failure");
  });

  assert.throws(() => emitter.emit("work"), AggregateError);
  assert.equal(emitter.listenerCount("work"), 0);
  assert.equal(emitter.emit("work"), 0);
});

test("symbols isolate events without string conversion collisions", () => {
  const emitter = new EventEmitter();
  const first = Symbol("ready");
  const second = Symbol("ready");
  emitter.on(first, () => {});

  assert.equal(emitter.listenerCount(first), 1);
  assert.equal(emitter.listenerCount(second), 0);
});

test("invalid event names and listeners fail immediately", () => {
  const emitter = new EventEmitter();

  for (const eventName of ["", "   ", null, 1]) {
    assert.throws(() => emitter.on(eventName, () => {}), /event name/);
  }
  assert.throws(() => emitter.on("ready", null), /listener/);
  assert.throws(() => emitter.once("ready", "callback"), /listener/);
  assert.throws(() => emitter.off("ready", {}), /listener/);
});

test("emitting an unknown event is a no-op", () => {
  const emitter = new EventEmitter();

  assert.equal(emitter.emit("missing", 1, 2, 3), 0);
});
