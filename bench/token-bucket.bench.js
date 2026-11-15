import { performance } from "node:perf_hooks";

import { TokenBucket } from "../src/token-bucket.js";

const operations = 100_000;
let now = 0;
const bucket = new TokenBucket({
  capacity: operations,
  refillPerSecond: operations,
  clock: () => now,
});

const started = performance.now();
for (let index = 0; index < operations; index += 1) {
  bucket.tryConsume();
  now += 1;
}
const elapsed = performance.now() - started;

console.log(
  JSON.stringify({
    operations,
    elapsedMilliseconds: Number(elapsed.toFixed(2)),
    operationsPerSecond: Math.round((operations / elapsed) * 1_000),
    remainingTokens: bucket.availableTokens,
  }),
);
