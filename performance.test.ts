/**
 * idb-ts Performance Test Suite
 *
 * Covers: CRUD - Batched CRUD - Mixed CRUD - Mixed Batched CRUD - Transaction - Mixed Transaction
 *
 * Run:
 *   npx tsx performance.test.ts
 *
 * Dependencies:
 *   npm install idb-ts reflect-metadata fake-indexeddb
 */

const PRINT_CONSOLE = false;

import 'reflect-metadata';
// Ensure `performance` is available in older Node.js environments
import { performance as nodePerformance } from 'perf_hooks';
if (typeof (globalThis as any).performance === 'undefined') {
  (globalThis as any).performance = nodePerformance;
}
import { Database, DataClass, KeyPath, Index, Validate } from './index';
// Polyfill IndexedDB for Node.js
import 'fake-indexeddb/auto';

// ─────────────────────────────────────────────
//  Entity Definitions
// ─────────────────────────────────────────────

@DataClass({ version: 1 })
class User {
  @KeyPath({ generator: 'uuid' })
  id!: string;

  @Index({ unique: true })
  email!: string;

  name!: string;
  age!: number;
  @Index()
  status!: string;
  tags!: string[];
}

@DataClass({ version: 1 })
class Order {
  @KeyPath({ generator: 'uuid' })
  id!: string;

  @Index()
  userId!: string;

  amount!: number;
  @Index()
  status!: string;
  items!: string[];
  createdAt!: number;
}

@DataClass({ version: 1 })
class Session {
  @KeyPath({ generator: 'uuid' })
  id!: string;

  @Index()
  userId!: string;
  token!: string;
  expiresAt!: number;
}

// ─────────────────────────────────────────────
//  Benchmark Harness
// ─────────────────────────────────────────────

interface BenchResult {
  label: string;
  ops: number;
  totalMs: number;
  opsPerSec: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function bench(
  label: string,
  iterations: number,
  fn: () => Promise<void>,
  warmup = 5,
): Promise<BenchResult> {
  // Warm-up
  for (let i = 0; i < warmup; i++) await fn();

  const durations: number[] = [];
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    const s = performance.now();
    await fn();
    durations.push(performance.now() - s);
  }

  const totalMs = performance.now() - start;
  durations.sort((a, b) => a - b);

  return {
    label,
    ops: iterations,
    totalMs: round(totalMs),
    opsPerSec: round((iterations / totalMs) * 1000),
    avgMs: round(durations.reduce((a, b) => a + b, 0) / durations.length),
    p50Ms: round(percentile(durations, 50)),
    p95Ms: round(percentile(durations, 95)),
    p99Ms: round(percentile(durations, 99)),
    minMs: round(durations[0]),
    maxMs: round(durations[durations.length - 1]),
  };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ─────────────────────────────────────────────
//  Test Data Factories
// ─────────────────────────────────────────────

let counter = 0;
const uid = () => `u-${++counter}-${Math.random().toString(36).slice(2, 8)}`;
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function makeUser(
  overrides?: Partial<User>,
): Omit<User, 'id'> & { id?: string } {
  const id = uid();
  return {
    id,
    email: `${id}@test.dev`,
    name: `User ${id}`,
    age: randInt(18, 80),
    status: ['active', 'inactive', 'banned'][randInt(0, 2)],
    tags: ['tag-' + randInt(1, 10), 'tag-' + randInt(11, 20)],
    ...overrides,
  };
}

function makeOrder(userId: string): Omit<Order, 'id'> & { id?: string } {
  const id = uid();
  return {
    id,
    userId,
    amount: Math.round(Math.random() * 50000) / 100,
    status: ['pending', 'paid', 'shipped', 'delivered'][randInt(0, 3)],
    items: [`item-${randInt(1, 50)}`, `item-${randInt(1, 50)}`],
    createdAt: Date.now(),
  };
}

function makeSession(userId: string): Omit<Session, 'id'> & { id?: string } {
  const id = uid();
  return {
    id,
    userId,
    token: Math.random().toString(36).slice(2),
    expiresAt: Date.now() + randInt(3600, 86400) * 1000,
  };
}

function makeUsers(n: number) {
  return Array.from({ length: n }, () => makeUser());
}
function makeOrders(userId: string, n: number) {
  return Array.from({ length: n }, () => makeOrder(userId));
}

// ─────────────────────────────────────────────
//  Results Printer
// ─────────────────────────────────────────────

function print(title: string, results: BenchResult[]) {
  if (PRINT_CONSOLE) {
    printResults(title, results);
  } else {
    printResultsMarkdown(title, results);
  }
}

function printResults(title: string, results: BenchResult[]) {
  const line = '─'.repeat(120);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(line);
  console.log(
    pad('Operation', 40) +
    pad('Ops', 8) +
    pad('Total ms', 12) +
    pad('Ops/s', 12) +
    pad('Avg ms', 10) +
    pad('P50', 10) +
    pad('P95', 10) +
    pad('P99', 10) +
    pad('Min', 10) +
    pad('Max', 10),
  );
  console.log(line);
  for (const r of results) {
    console.log(
      pad(r.label, 40) +
      pad(String(r.ops), 8) +
      pad(String(r.totalMs), 12) +
      pad(String(r.opsPerSec), 12) +
      pad(String(r.avgMs), 10) +
      pad(String(r.p50Ms), 10) +
      pad(String(r.p95Ms), 10) +
      pad(String(r.p99Ms), 10) +
      pad(String(r.minMs), 10) +
      pad(String(r.maxMs), 10),
    );
  }
  console.log(line);
}

function pad(s: string, len: number): string {
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

const fmt = (n: number) => n.toLocaleString(undefined, {
  maximumFractionDigits: 3,
});

function printResultsMarkdown(title: string, results: BenchResult[]) {
  console.log(`\n## ${title}\n`);
  console.log(
    '| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |',
  );
  console.log(
    '|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|',
  );

  for (const r of results) {
    console.log(
      `| ${r.label} | ${fmt(r.ops)} | ${fmt(r.totalMs)} | ${fmt(r.opsPerSec)} | ${fmt(r.avgMs)} | ${fmt(r.p50Ms)} | ${fmt(r.p95Ms)} | ${fmt(r.p99Ms)} | ${fmt(r.minMs)} | ${fmt(r.maxMs)} |`,
    );
  }

  console.log('');
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function freshDbName(): string {
  return `perf-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function seedUsers(
  db: Database,
  count: number,
): Promise<ReturnType<typeof makeUsers>> {
  const users = makeUsers(count);
  await db.User.createMany(users as any);
  return users;
}

// ─────────────────────────────────────────────
//  Suite 1: CRUD Operations
// ─────────────────────────────────────────────

async function suiteCrud() {
  const ITERS = 200;
  const db = await Database.build<{
    User: InstanceType<typeof User> extends infer U ? any : any;
    Order: any;
  }>(freshDbName(), [User, Order]);

  const results: BenchResult[] = [];

  // Seed data for reads/updates/deletes
  const seeded = await seedUsers(db, ITERS + 50);
  const seededIds = seeded.map((u) => u.id);
  const seededEmails = seeded.map((u) => u.email);

  let idx = 0;
  const nextUser = () => seeded[idx++ % seeded.length];

  // --- Create ---
  results.push(
    await bench('create (single)', ITERS, async () => {
      await db.User.create(makeUser() as any);
    }),
  );

  // --- Read by primary key ---
  idx = 0;
  results.push(
    await bench('read (by PK)', ITERS, async () => {
      await db.User.read(seededIds[idx++ % seededIds.length]);
    }),
  );

  // --- Update ---
  idx = 0;
  results.push(
    await bench('update (single)', ITERS, async () => {
      const u = nextUser();
      await db.User.update({ ...u, age: randInt(18, 99) } as any);
    }),
  );

  // --- findByIndex ---
  idx = 0;
  results.push(
    await bench('findByIndex (email)', ITERS, async () => {
      await db.User.findByIndex(
        'email',
        seededEmails[idx++ % seededEmails.length],
      );
    }),
  );

  // --- findOneByIndex ---
  idx = 0;
  results.push(
    await bench('findOneByIndex (email)', ITERS, async () => {
      await db.User.findOneByIndex(
        'email',
        seededEmails[idx++ % seededEmails.length],
      );
    }),
  );

  // --- Count ---
  results.push(
    await bench('count', ITERS, async () => {
      await db.User.count();
    }),
  );

  // --- Exists ---
  idx = 0;
  results.push(
    await bench('exists', ITERS, async () => {
      await db.User.exists(seededIds[idx++ % seededIds.length]);
    }),
  );

  // --- List all ---
  results.push(
    await bench('list (all)', 50, async () => {
      await db.User.list();
    }),
  );

  // --- Paginated list ---
  results.push(
    await bench('listPaginated (1, 20)', ITERS, async () => {
      await db.User.listPaginated(randInt(1, 5), 20);
    }),
  );

  // --- Query builder filter ---
  results.push(
    await bench('query().where().gte().execute()', 100, async () => {
      await db.User.query().where('age').gte(30).execute();
    }),
  );

  // --- Delete ---
  idx = 0;
  // Prepare disposable users (include warmup deletes).
  const deleteWarmup = 5;
  const disposable = makeUsers(ITERS + deleteWarmup);
  await db.User.createMany(disposable as any);
  results.push(
    await bench(
      'delete (single)',
      ITERS,
      async () => {
        await db.User.delete(disposable[idx++].id);
      },
      deleteWarmup,
    ),
  );

  print('Suite 1: CRUD Operations', results);
  db.close();
  return results;
}

// ─────────────────────────────────────────────
//  Suite 2: Batched CRUD
// ─────────────────────────────────────────────

async function suiteBatchedCrud() {
  const results: BenchResult[] = [];

  const BATCH_SIZES = [10, 50, 100, 500];

  for (const size of BATCH_SIZES) {
    const db = await Database.build(freshDbName(), [User, Order]);

    const users = makeUsers(size);

    // --- createMany ---
    results.push(
      await bench(
        `createMany (${size})`,
        3,
        async () => {
          const batch = makeUsers(size);
          await db.User.createMany(batch as any);
        },
        1,
      ),
    );

    // Seed for read/update/delete batches
    const seeded = await seedUsers(db, size * 4);
    const chunks: string[][] = [];
    for (let i = 0; i < seeded.length; i += size) {
      chunks.push(seeded.slice(i, i + size).map((u) => u.id));
    }

    // --- read (batch simulation via createMany/read loop) ---
    let chunkIdx = 0;
    results.push(
      await bench(
        `read batch (${size} keys)`,
        3,
        async () => {
          const ids = chunks[chunkIdx++ % chunks.length];
          await Promise.all(ids.map((id) => db.User.read(id)));
        },
        1,
      ),
    );

    // --- updateMany ---
    chunkIdx = 0;
    results.push(
      await bench(
        `updateMany (${size})`,
        3,
        async () => {
          const ids = chunks[chunkIdx++ % chunks.length];
          const items = await Promise.all(ids.map((id) => db.User.read(id)));
          const updated = items.map((u: any) => ({
            ...u,
            age: randInt(18, 99),
          }));
          await db.User.updateMany(updated as any);
        },
        1,
      ),
    );

    // --- deleteMany ---
    const toDelete = makeUsers(size * 3);
    await db.User.createMany(toDelete as any);
    const deleteChunks: string[][] = [];
    for (let i = 0; i < toDelete.length; i += size) {
      deleteChunks.push(toDelete.slice(i, i + size).map((u) => u.id));
    }
    let dIdx = 0;
    results.push(
      await bench(
        `deleteMany (${size})`,
        3,
        async () => {
          await db.User.deleteMany(deleteChunks[dIdx++ % deleteChunks.length]);
        },
        1,
      ),
    );

    // --- deleteWhere ---
    await seedUsers(db, size * 2); // repopulate
    results.push(
      await bench(
        `deleteWhere (${size}+ match)`,
        3,
        async () => {
          await db.User.deleteWhere((q: any) => q.where('age').gte(60));
        },
        1,
      ),
    );

    db.close();
  }

  print('Suite 2: Batched CRUD (by batch size)', results);
  return results;
}

// ─────────────────────────────────────────────
//  Suite 3: Mixed CRUD
// ─────────────────────────────────────────────

async function suiteMixedCrud() {
  const ITERS = 200;
  const db = await Database.build(freshDbName(), [User, Order]);
  const results: BenchResult[] = [];

  // Seed baseline
  const baseline = await seedUsers(db, 500);
  const baselineIds = baseline.map((u) => u.id);

  // --- Read-Heavy Mix: 70% read, 15% update, 10% create, 5% delete ---
  {
    const created: string[] = [];
    const deleted = 0;
    let idx = 0;
    results.push(
      await bench('Read-heavy mix (70R/15U/10C/5D)', ITERS, async () => {
        const roll = Math.random();
        const id = baselineIds[idx++ % baselineIds.length];

        if (roll < 0.7) {
          await db.User.read(id);
        } else if (roll < 0.85) {
          const u = await db.User.read(id);
          if (u)
            await db.User.update({
              ...(u as any),
              age: randInt(18, 99),
            } as any);
        } else if (roll < 0.95) {
          const u = makeUser();
          await db.User.create(u as any);
          created.push(u.id!);
        } else {
          if (created.length > 0) {
            const delId = created.pop()!;
            await db.User.delete(delId);
          }
        }
      }),
    );
  }

  // --- Write-Heavy Mix: 20% read, 15% update, 50% create, 15% delete ---
  {
    const created: string[] = [];
    let idx = 0;
    results.push(
      await bench('Write-heavy mix (20R/15U/50C/15D)', ITERS, async () => {
        const roll = Math.random();

        if (roll < 0.2) {
          const id = baselineIds[idx++ % baselineIds.length];
          await db.User.read(id);
        } else if (roll < 0.35) {
          const id = baselineIds[idx++ % baselineIds.length];
          const u = await db.User.read(id);
          if (u)
            await db.User.update({
              ...(u as any),
              name: `Updated ${Date.now()}`,
            } as any);
        } else if (roll < 0.85) {
          const u = makeUser();
          await db.User.create(u as any);
          created.push(u.id!);
        } else if (created.length > 0) {
          const delId = created.pop()!;
          await db.User.delete(delId);
        }
      }),
    );
  }

  // --- Mixed CRUD + Queries: reads + queries + writes interleaved ---
  {
    let idx = 0;
    results.push(
      await bench('Mixed CRUD + queries', ITERS, async () => {
        const roll = Math.random();
        const id = baselineIds[idx++ % baselineIds.length];

        if (roll < 0.3) {
          await db.User.read(id);
        } else if (roll < 0.5) {
          await db.User.query().where('age').gte(randInt(18, 60)).execute();
        } else if (roll < 0.7) {
          await db.User.findByIndex(
            'email',
            baseline[idx % baseline.length].email,
          );
        } else if (roll < 0.85) {
          await db.User.create(makeUser() as any);
        } else {
          await db.User.count();
        }
      }),
    );
  }

  // --- Cross-entity mixed: User reads + Order creates ---
  {
    const userIds = baseline.slice(0, 10).map((u) => u.id);
    let idx = 0;
    results.push(
      await bench(
        'Cross-entity mix (User.read + Order.create)',
        ITERS,
        async () => {
          const roll = Math.random();
          const uid = userIds[idx++ % userIds.length];

          if (roll < 0.5) {
            await db.User.read(uid);
          } else {
            await db.Order.create(makeOrder(uid) as any);
          }
        },
      ),
    );
  }

  print('Suite 3: Mixed CRUD Operations', results);
  db.close();
  return results;
}

// ─────────────────────────────────────────────
//  Suite 4: Mixed Batched CRUD
// ─────────────────────────────────────────────

async function suiteMixedBatchedCrud() {
  const results: BenchResult[] = [];
  const BATCH = 50;

  const db = await Database.build(freshDbName(), [User, Order]);

  // --- Batched create + read + update cycle ---
  {
    results.push(
      await bench(
        `Cycle: createMany -> readAll -> updateMany -> deleteMany (${BATCH})`,
        5,
        async () => {
          // Create
          const users = makeUsers(BATCH);
          await db.User.createMany(users as any);

          // Read all back
          const ids = users.map((u) => u.id!);
          await Promise.all(ids.map((id) => db.User.read(id)));

          // Update all
          const loaded = await Promise.all(ids.map((id) => db.User.read(id)));
          await db.User.updateMany(
            loaded.map((u: any) => ({ ...u, age: randInt(20, 60) })) as any,
          );

          // Delete all
          await db.User.deleteMany(ids);
        },
        1,
      ),
    );
  }

  // --- Batched create Many + query + batched delete ---
  {
    results.push(
      await bench(
        `createMany  ->  query filter  ->  deleteMany (${BATCH})`,
        5,
        async () => {
          const users = makeUsers(BATCH).map((u) => ({
            ...u,
            status: Math.random() > 0.5 ? 'active' : 'inactive',
          }));
          await db.User.createMany(users as any);

          const active = await db.User.query()
            .where('status')
            .equals('active')
            .execute();
          const activeIds = (active as any[]).map((u: any) => u.id);
          if (activeIds.length) await db.User.deleteMany(activeIds);
        },
        1,
      ),
    );
  }

  // --- Multi-batch waves ---
  {
    results.push(
      await bench(
        `5 waves × createMany(${BATCH}) + deleteMany(${BATCH})`,
        3,
        async () => {
          for (let wave = 0; wave < 5; wave++) {
            const users = makeUsers(BATCH);
            await db.User.createMany(users as any);
            await db.User.deleteMany(users.map((u) => u.id!));
          }
        },
        1,
      ),
    );
  }

  // --- Batched cross-entity: Users + Orders ---
  {
    results.push(
      await bench(
        `Cross-entity batch: createMany(User) + createMany(Order) + deleteMany (×${BATCH})`,
        3,
        async () => {
          const users = makeUsers(BATCH);
          await db.User.createMany(users as any);

          const userIds = users.map((u) => u.id!);
          const orders = userIds.flatMap((uid) => makeOrders(uid, 2));
          await db.Order.createMany(orders as any);

          await db.Order.deleteMany(orders.map((o) => o.id!));
          await db.User.deleteMany(userIds);
        },
        1,
      ),
    );
  }

  print('Suite 4: Mixed Batched CRUD', results);
  db.close();
  return results;
}

// ─────────────────────────────────────────────
//  Suite 5: Transaction Operations
// ─────────────────────────────────────────────

async function suiteTransactions() {
  const ITERS = 100;
  const db = await Database.build(freshDbName(), [User, Order, Session]);
  const results: BenchResult[] = [];

  const seeded = await seedUsers(db, 200);
  const userIds = seeded.map((u) => u.id);

  // --- Single create in transaction ---
  results.push(
    await bench('tx: single create', ITERS, async () => {
      await db.transaction(async (tx) => {
        await tx.User.create(makeUser() as any);
      });
    }),
  );

  // --- Multiple creates in transaction (10 items) ---
  results.push(
    await bench('tx: create 10 users', ITERS, async () => {
      await db.transaction(async (tx) => {
        for (const u of makeUsers(10)) {
          await tx.User.create(u as any);
        }
      });
    }),
  );

  // --- Read + Update in transaction ---
  let idx = 0;
  results.push(
    await bench('tx: read + update', ITERS, async () => {
      const id = userIds[idx++ % userIds.length];
      await db.transaction(async (tx) => {
        const u = await tx.User.read(id);
        if (u)
          await tx.User.update({ ...(u as any), age: randInt(18, 99) } as any);
      });
    }),
  );

  // --- Multi-entity transaction (User + Order + Session) ---
  idx = 0;
  results.push(
    await bench(
      'tx: multi-entity create (User+Order+Session)',
      ITERS,
      async () => {
        const uid = userIds[idx++ % userIds.length];
        await db.transaction(async (tx) => {
          await tx.Order.create(makeOrder(uid) as any);
          await tx.Session.create(makeSession(uid) as any);
        });
      },
    ),
  );

  // --- Read-heavy transaction (10 reads) ---
  idx = 0;
  results.push(
    await bench('tx: 10 reads', ITERS, async () => {
      await db.transaction(async (tx) => {
        for (let i = 0; i < 10; i++) {
          await tx.User.read(userIds[idx++ % userIds.length]);
        }
      });
    }),
  );

  // --- Batch create in transaction ---
  results.push(
    await bench(
      'tx: batch create 50 users',
      20,
      async () => {
        await db.transaction(async (tx) => {
          for (const u of makeUsers(50)) {
            await tx.User.create(u as any);
          }
        });
      },
      1,
    ),
  );

  // --- Query inside transaction ---
  results.push(
    await bench('tx: query().where().gte()', ITERS, async () => {
      await db.transaction(async (tx) => {
        await tx.User.query().where('age').gte(30).execute();
      });
    }),
  );

  // --- Explicit begin/commit ---
  results.push(
    await bench('tx (explicit): begin -> create -> commit', ITERS, async () => {
      const tx = await db.beginTransaction(['User'], 'readwrite');
      try {
        await tx.User.create(makeUser() as any);
        await tx.commit();
      } catch (e) {
        await tx.rollback();
      }
    }),
  );

  print('Suite 5: Transaction Operations', results);
  db.close();
  return results;
}

// ─────────────────────────────────────────────
//  Suite 6: Mixed Transactions
// ─────────────────────────────────────────────

async function suiteMixedTransactions() {
  const ITERS = 100;
  const db = await Database.build(freshDbName(), [User, Order, Session]);
  const results: BenchResult[] = [];

  const seeded = await seedUsers(db, 300);
  const userIds = seeded.map((u) => u.id);

  // --- Mixed read-write transaction: read user  ->  create order  ->  update user ---
  {
    let idx = 0;
    results.push(
      await bench(
        'tx mixed: read User  ->  create Order  ->  update User',
        ITERS,
        async () => {
          const uid = userIds[idx++ % userIds.length];
          await db.transaction(async (tx) => {
            const user = await tx.User.read(uid);
            await tx.Order.create(makeOrder(uid) as any);
            if (user) {
              await tx.User.update({
                ...(user as any),
                name: `Updated ${Date.now()}`,
              } as any);
            }
          });
        },
      ),
    );
  }

  // --- Transaction with reads + query + writes ---
  {
    let idx = 0;
    results.push(
      await bench(
        'tx mixed: query User + read Order + create Session',
        ITERS,
        async () => {
          const uid = userIds[idx++ % userIds.length];
          await db.transaction(async (tx) => {
            const activeUsers = await tx.User.query()
              .where('status')
              .equals('active')
              .limit(5)
              .execute();
            await tx.Session.create(makeSession(uid) as any);
          });
        },
      ),
    );
  }

  // --- Multi-entity write transaction ---
  {
    results.push(
      await bench(
        'tx multi-entity: create User+Order+Session',
        ITERS,
        async () => {
          await db.transaction(async (tx) => {
            const user = makeUser();
            await tx.User.create(user as any);
            await tx.Order.create(makeOrder(user.id!) as any);
            await tx.Session.create(makeSession(user.id!) as any);
          });
        },
      ),
    );
  }

  // --- Batched multi-entity transaction ---
  {
    results.push(
      await bench(
        'tx batched: create 20 Users + 40 Orders + 20 Sessions',
        10,
        async () => {
          await db.transaction(async (tx) => {
            const users = makeUsers(20);
            for (const u of users) await tx.User.create(u as any);

            for (const u of users) {
              for (const o of makeOrders(u.id!, 2)) {
                await tx.Order.create(o as any);
              }
            }

            for (const u of users) {
              await tx.Session.create(makeSession(u.id!) as any);
            }
          });
        },
        1,
      ),
    );
  }

  // --- Transaction with deletions + creations (data refresh pattern) ---
  {
    let idx = 0;
    results.push(
      await bench(
        'tx mixed: delete old orders  ->  create new orders',
        ITERS,
        async () => {
          const uid = userIds[idx++ % userIds.length];
          await db.transaction(async (tx) => {
            const oldOrders = await tx.Order.findByIndex('userId', uid);
            for (const o of oldOrders) {
              await tx.Order.delete((o as any).id);
            }
            for (const o of makeOrders(uid, 3)) {
              await tx.Order.create(o as any);
            }
          });
        },
      ),
    );
  }

  // --- Transaction with count + conditional write ---
  {
    results.push(
      await bench(
        'tx mixed: count Orders  ->  conditional create',
        ITERS,
        async () => {
          await db.transaction(async (tx) => {
            const count = await tx.Order.count();
            if (count < 5000) {
              const uid = userIds[randInt(0, userIds.length - 1)];
              await tx.Order.create(makeOrder(uid) as any);
            }
          });
        },
      ),
    );
  }

  // --- Complex: read multiple entities  ->  aggregate  ->  create ---
  {
    let idx = 0;
    results.push(
      await bench(
        'tx complex: read User+Orders  ->  aggregate  ->  create Session',
        ITERS,
        async () => {
          const uid = userIds[idx++ % userIds.length];
          await db.transaction(async (tx) => {
            const user = await tx.User.read(uid);
            const orders = await tx.Order.findByIndex('userId', uid);
            const totalSpent = (orders as any[]).reduce(
              (sum: number, o: any) => sum + o.amount,
              0,
            );
            await tx.Session.create({
              id: '',
              userId: uid,
              token: `spend-${totalSpent}`,
              expiresAt: Date.now() + 3600000,
            } as any);
          });
        },
      ),
    );
  }

  print('Suite 6: Mixed Transactions', results);
  db.close();
  return results;
}

// ─────────────────────────────────────────────
//  Main Runner
// ─────────────────────────────────────────────

async function main() {
  if (PRINT_CONSOLE) {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        idb-ts Performance Test Suite             ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log(`  Started: ${new Date().toISOString()}\n`);
  }

  const t0 = performance.now();

  await suiteCrud();
  await suiteBatchedCrud();
  await suiteMixedCrud();
  await suiteMixedBatchedCrud();
  await suiteTransactions();
  await suiteMixedTransactions();

  if (PRINT_CONSOLE) {
    const total = ((performance.now() - t0) / 1000).toFixed(2);
    console.log(`\n  All suites completed in ${total}s`);
    console.log(`  Finished: ${new Date().toISOString()}`);
  }

}

main().catch(console.error);
