import type { Collection, CreateIndexesOptions, Document } from "mongodb";

import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    syncIndexes: <TSchema extends Document>(
      options: SyncIndexesOptions & {
        collection: Collection<TSchema>;
        specs: ManagedIndexSpec[];
      },
    ) => Promise<void>;
  }
}

type ManagedIndexSpec = {
  key: Document;
  options: CreateIndexesOptions & { name: string };
};

type SyncIndexesOptions = {
  mode?: SyncMode;
};

type SyncMode = "create-only" | "reconcile" | "validate";

function assertNoDriftInValidateMode({
  mode,
  toCreateCount,
  toDropCount,
}: {
  mode: SyncMode;
  toCreateCount: number;
  toDropCount: number;
}) {
  if (mode === "validate" && (toCreateCount > 0 || toDropCount > 0)) {
    throw new Error(
      `Index drift detected. Missing: ${toCreateCount}, Extraneous: ${toDropCount}`,
    );
  }
}

async function syncIndexes<TSchema extends Document>({
  collection,
  mode = "create-only",
  specs,
}: SyncIndexesOptions & {
  collection: Collection<TSchema>;
  specs: ManagedIndexSpec[];
}) {
  const existingIndexes = await collection.listIndexes().toArray();

  const normalize = (index: {
    expireAfterSeconds?: number;
    key: Document;
    partialFilterExpression?: Document;
    sparse?: boolean;
    unique?: boolean;
  }) =>
    JSON.stringify({
      // eslint-disable-next-line unicorn/no-null
      expireAfterSeconds: index.expireAfterSeconds ?? null,
      key: Object.entries(index.key),
      // eslint-disable-next-line unicorn/no-null
      partialFilterExpression: index.partialFilterExpression ?? null,
      sparse: Boolean(index.sparse),
      unique: Boolean(index.unique),
    });

  const desired = new Map<string, ManagedIndexSpec>();
  for (const spec of specs) {
    desired.set(normalize({ key: spec.key, ...spec.options }), spec);
  }

  const existing = new Map<string, string>();
  for (const index of existingIndexes) {
    if (index.name === "_id_") continue;
    existing.set(normalize(index), index.name);
  }

  const toCreate: ManagedIndexSpec[] = [];
  const toDrop: string[] = [];

  for (const [signature, spec] of desired) {
    if (!existing.has(signature)) {
      toCreate.push(spec);
    }
  }

  for (const [signature, name] of existing) {
    if (!desired.has(signature)) {
      toDrop.push(name);
    }
  }

  assertNoDriftInValidateMode({
    mode,
    toCreateCount: toCreate.length,
    toDropCount: toDrop.length,
  });

  for (const spec of toCreate) {
    await collection.createIndex(spec.key, spec.options);
  }

  if (mode === "reconcile") {
    for (const name of toDrop) {
      await collection.dropIndex(name);
    }
  }
}

/**
 * Syncs a MongoDB collection's indexes with a declarative specification.
 *
 * Modes:
 * - "create-only": only creates missing indexes
 * - "reconcile": creates missing + drops extraneous
 * - "validate": throws if drift exists
 */
export default fp(
  async (fastify) => {
    fastify.decorate("syncIndexes", syncIndexes);
  },
  { name: "sync-indexes" },
);
