import "dotenv/config";

import { sqlClient } from "@/db/client";
import { env } from "@/lib/env";
import { resolveProvider } from "@/providers";
import { processNextOrder } from "@/services/provisioning-service";

const once = process.argv.includes("--once");
let stopping = false;

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    stopping = true;
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.info(`Worker started${once ? " (once)" : ""}.`);

  while (!stopping) {
    try {
      const outcome = await processNextOrder({
        resolveProvider,
        leaseMs: env.WORKER_LEASE_MS,
      });

      if (outcome.processed) {
        console.info(`Order ${outcome.orderId}: ${outcome.result}`);
        continue;
      }
    } catch (error) {
      console.error("Worker iteration failed", error);
    }

    if (once) {
      break;
    }

    await sleep(env.WORKER_POLL_INTERVAL_MS);
  }
}

main().finally(() => sqlClient.end());
