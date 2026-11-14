import { defineExercise } from "./exercise.js";

export const eventEmitterExercise = defineExercise({
  slug: "event-emitter",
  title: "Lifecycle-Safe Event Emitter",
  difficulty: "intermediate",
  tags: ["events", "callbacks", "lifecycle"],
});

function requireEventName(eventName) {
  const validSymbol = typeof eventName === "symbol";
  const validString =
    typeof eventName === "string" && eventName.trim().length > 0;
  if (!validSymbol && !validString) {
    throw new TypeError("event name must be a non-empty string or symbol");
  }
}

function requireListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError("listener must be a function");
  }
}

/**
 * A synchronous event emitter with explicit subscription lifecycles.
 *
 * Duplicate callbacks are separate registrations. Each subscription returns
 * an idempotent function that removes only that registration, while `off`
 * removes every registration for the same callback and event.
 */
export class EventEmitter {
  #listeners = new Map();

  on(eventName, listener) {
    return this.#subscribe(eventName, listener, false);
  }

  once(eventName, listener) {
    return this.#subscribe(eventName, listener, true);
  }

  off(eventName, listener) {
    requireEventName(eventName);
    requireListener(listener);

    const entries = this.#listeners.get(eventName);
    if (!entries) {
      return 0;
    }

    let removed = 0;
    for (const entry of entries) {
      if (entry.active && entry.listener === listener) {
        entry.active = false;
        removed += 1;
      }
    }
    this.#compact(eventName);
    return removed;
  }

  listenerCount(eventName) {
    requireEventName(eventName);
    return (this.#listeners.get(eventName) ?? []).filter(
      (entry) => entry.active,
    ).length;
  }

  emit(eventName, ...arguments_) {
    requireEventName(eventName);
    const entries = this.#listeners.get(eventName);
    if (!entries) {
      return 0;
    }

    const snapshot = [...entries];
    const errors = [];
    let invoked = 0;

    for (const entry of snapshot) {
      if (!entry.active) {
        continue;
      }
      if (entry.once) {
        entry.active = false;
      }
      invoked += 1;
      try {
        entry.listener(...arguments_);
      } catch (error) {
        errors.push(error);
      }
    }

    this.#compact(eventName);
    if (errors.length > 0) {
      throw new AggregateError(errors, `event listener failure: ${String(eventName)}`);
    }
    return invoked;
  }

  #subscribe(eventName, listener, once) {
    requireEventName(eventName);
    requireListener(listener);

    const entry = { listener, once, active: true };
    const entries = this.#listeners.get(eventName) ?? [];
    entries.push(entry);
    this.#listeners.set(eventName, entries);

    return () => {
      if (!entry.active) {
        return false;
      }
      entry.active = false;
      this.#compact(eventName);
      return true;
    };
  }

  #compact(eventName) {
    const entries = this.#listeners.get(eventName);
    if (!entries) {
      return;
    }
    const activeEntries = entries.filter((entry) => entry.active);
    if (activeEntries.length === 0) {
      this.#listeners.delete(eventName);
    } else if (activeEntries.length !== entries.length) {
      this.#listeners.set(eventName, activeEntries);
    }
  }
}
