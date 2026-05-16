import type {
  Collection,
  CreateIndexesOptions,
  Db,
  Document,
  MongoServerError,
} from "mongodb";

import fp from "fastify-plugin";
import { createHash } from "node:crypto";

declare module "fastify" {
  interface FastifyInstance {
    syncIndexes: (options: RunSyncOptions) => Promise<void>;
  }
}

type ManagedIndexSpec = {
  key: Document;
  options: CreateIndexesOptions;
};

type RunSyncOptions = {
  db: Db;
  mode?: SyncMode;
  targets: Array<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: Collection<any>;
    specs: ManagedIndexSpec[];
  }>;
};

type SyncMode = "create-only" | "reconcile";

const LOCK_COLLECTION = "_migration_locks";
const LOCK_TTL_SECONDS = 300;

type LockDocument = {
  _id: string;
  acquiredAt: Date;
  completedAt?: Date;
  expiresAt: Date;
};

function buildLockId(targets: RunSyncOptions["targets"]): string {
  // eslint-disable-next-line sonarjs/hashing
  const hash = createHash("sha1")
    .update(JSON.stringify(targets.map((t) => t.specs)))
    .digest("hex")
    .slice(0, 8);
  return `index-sync:${hash}`;
}

async function ensureLockCollection(
  database: Db,
): Promise<Collection<LockDocument>> {
  await database
    .command({
      createIndexes: LOCK_COLLECTION,
      indexes: [
        {
          expireAfterSeconds: 0,
          key: { expiresAt: 1 },
          name: "expiresAt_ttl",
        },
      ],
    })
    .catch((error: MongoServerError) => {
      if (error.code === 85 || error.code === 86) return;
      throw error;
    });

  return database.collection<LockDocument>(LOCK_COLLECTION);
}

async function markLockComplete(
  col: Collection<LockDocument>,
  lockId: string,
): Promise<void> {
  const completedAt = new Date();
  const expiresAt = new Date(completedAt.getTime() + 24 * 60 * 60 * 1000);

  await col.updateOne({ _id: lockId }, { $set: { completedAt, expiresAt } });
}

function normalizeIndex(index: {
  expireAfterSeconds?: number;
  key: Document;
  partialFilterExpression?: Document;
  sparse?: boolean;
  unique?: boolean;
}) {
  return JSON.stringify({
    // eslint-disable-next-line unicorn/no-null
    expireAfterSeconds: index.expireAfterSeconds ?? null,
    key: Object.entries(index.key),
    // eslint-disable-next-line unicorn/no-null
    partialFilterExpression: index.partialFilterExpression ?? null,
    sparse: Boolean(index.sparse),
    unique: Boolean(index.unique),
  });
}

async function syncCollectionIndexes<TSchema extends Document>({
  collection,
  mode = "create-only",
  specs,
}: {
  collection: Collection<TSchema>;
  mode?: SyncMode;
  specs: ManagedIndexSpec[];
}) {
  const existingIndexes = await collection
    .listIndexes()
    .toArray()
    .catch((error: MongoServerError) => {
      if (error.code === 26) return [];
      throw error;
    });

  const desired = new Map<string, ManagedIndexSpec>(
    specs.map((spec) => [
      normalizeIndex({ key: spec.key, ...spec.options }),
      spec,
    ]),
  );

  const existing = new Map<string, string>(
    existingIndexes
      .filter((index) => index.name !== "_id_")
      .map((index) => [normalizeIndex(index), index.name as string]),
  );

  const toCreate = [...desired.entries()]
    .filter(([sig]) => !existing.has(sig))
    .map(([, spec]) => spec);

  const toDrop = [...existing.entries()]
    .filter(([sig]) => !desired.has(sig))
    .map(([, name]) => name);

  for (const spec of toCreate) {
    await collection.createIndex(spec.key, spec.options);
  }

  if (mode === "reconcile") {
    for (const name of toDrop) {
      await collection.dropIndex(name);
    }
  }
}

async function tryAcquireLock(
  col: Collection<LockDocument>,
  lockId: string,
): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TTL_SECONDS * 1000);

  const result = await col.findOneAndUpdate(
    { _id: lockId },
    {
      $setOnInsert: {
        _id: lockId,
        acquiredAt: now,
        expiresAt,
      },
    },
    { returnDocument: "before", upsert: true },
  );

  return result === null;
}

/**
 * This plugin runs index sync for every target collection
 * behind a distributed lock. Safe to call from every app
 * instance at startup — only one will proceed.
 */
export default fp(
  async (fastify) => {
    async function runIndexSync({
      db,
      mode = "reconcile",
      targets,
    }: RunSyncOptions): Promise<void> {
      const isProduction = fastify.env.NODE_ENV === "production";

      const lockId = buildLockId(targets);
      const lockCol = await ensureLockCollection(db);
      const acquired = isProduction
        ? await tryAcquireLock(lockCol, lockId)
        : true;

      if (!acquired) {
        fastify.log.info(
          "[index-sync] Lock held by another instance — skipping.",
        );
        return;
      }

      fastify.log.info(
        `[index-sync] Lock acquired (${lockId}). Running in '${mode}' mode...`,
      );

      try {
        for (const { collection, specs } of targets) {
          await syncCollectionIndexes({ collection, mode, specs });
        }

        if (isProduction) {
          await markLockComplete(lockCol, lockId);
        }
        fastify.log.info("[index-sync] Done.");
      } catch (error) {
        fastify.log.warn(error, "[index-sync] Failed");
        throw error;
      }
    }

    fastify.decorate("syncIndexes", runIndexSync);
  },
  { name: "sync-indexes" },
);
