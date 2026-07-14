# idb-ts

<p align="center">
  <a href="https://www.npmjs.com/package/idb-ts">
    <img src="https://img.shields.io/npm/v/idb-ts.svg" alt="npm version">
  </a>
  <a href="https://badgen.net/bundlephobia/min/idb-ts">
    <img src="https://badgen.net/bundlephobia/min/idb-ts&cache-control=no-cache" alt="minified">
  </a>
  <a href="https://badgen.net/bundlephobia/minzip/idb-ts">
    <img src="https://badgen.net/bundlephobia/minzip/idb-ts&cache-control=no-cache" alt="minified + gzipped">
  </a>
</p>

<p align="center">
  <a href="https://github.com/maifeeulasad/idb-ts/stargazers">
    <img src="https://img.shields.io/github/stars/maifeeulasad/idb-ts" alt="GitHub stars">
  </a>
  <a href="https://github.com/maifeeulasad/idb-ts/watchers">
    <img src="https://img.shields.io/github/watchers/maifeeulasad/idb-ts" alt="GitHub watchers">
  </a>
  <a href="https://img.shields.io/github/commits-since/maifeeulasad/idb-ts/latest/main?include_prereleases">
    <img src="https://img.shields.io/github/commits-since/maifeeulasad/idb-ts/latest/main?include_prereleases" alt="Commits since release">
  </a>
</p>

---

## Introduction

**idb-ts** is a declarative, type-safe ORM layer for [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). Define your data models with TypeScript decorators, and the library handles schema creation, key generation, validation, querying, transactions, and data retention automatically - with no external runtime dependencies.

---

## Installation

```sh
npm install idb-ts
pnpm add idb-ts
yarn add idb-ts
```

> **Requirement:** `reflect-metadata` must be imported once at your application entry point, and `experimentalDecorators` and `emitDecoratorMetadata` must be enabled in your `tsconfig.json`.

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## Feature Overview

| Feature                           | Description                                                    |
| --------------------------------- | -------------------------------------------------------------- |
| **Declarative entity definition** | Define stores, keys, and indexes with class decorators         |
| **Full CRUD API**                 | Create, read, update, delete, list, paginate, and count        |
| **Typed query builder**           | Chainable, type-checked filter, sort, and aggregation DSL      |
| **Key generation**                | Auto-increment, UUID v4, timestamp, random, or custom function |
| **Composite keys**                | Multi-field primary keys for relational associations           |
| **Field validation**              | Per-property predicate rules enforced on write                 |
| **Schema versioning**             | Automatic `onupgradeneeded` migration based on entity versions |
| **Transaction API**               | Callback-based and explicit commit/rollback patterns           |
| **Data retention**                | Periodic background cleanup of expired records                 |
| **Automatic timestamps**          | `__idb_createdAt` / `__idb_updatedAt` injected on every write  |

---

## Quick Start

```typescript
import 'reflect-metadata';
import { Database, DataClass, KeyPath, Index } from 'idb-ts';

@DataClass()
class User {
  @KeyPath({ generator: 'uuid' })
  id!: string;

  @Index({ unique: true })
  email!: string;

  name!: string;
  age!: number;
}

const db = await Database.build<{ User: EntityRepository<User> }>('mydb', [
  User,
]);

await db.User.create({
  id: '',
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
});
const alice = await db.User.findOneByIndex('email', 'alice@example.com');
```

---

## Defining Entities

Every entity class must declare exactly one primary key field and be annotated with `@DataClass()`. Apply decorators in the order shown - TypeScript executes decorators bottom-up, so `@DataClass` must appear last (i.e., closest to the `class` keyword).

```typescript
import { Database, DataClass, KeyPath, Index, Validate } from 'idb-ts';

@DataClass({ version: 1 })
class User {
  @KeyPath({ generator: 'uuid' })
  id!: string;

  @Index({ unique: true })
  @Validate(
    (v) => typeof v === 'string' && v.includes('@'),
    'must be a valid email',
  )
  email!: string;

  @Validate((v) => typeof v === 'number' && v >= 0, 'age must be non-negative')
  age!: number;

  name!: string;
}
```

### Decorator reference

#### `@DataClass(options?)`

Marks a class as a managed entity. Must be applied exactly once per class, after all other idb-ts decorators.

| Option    | Type     | Default | Description                                                          |
| --------- | -------- | ------- | -------------------------------------------------------------------- |
| `version` | `number` | `1`     | Schema version. Increment when the entity's store or indexes change. |

#### `@KeyPath(options?)`

Designates the decorated property as the primary key of the object store. Exactly one property per class may carry this decorator. For multi-field keys, use `@CompositeKeyPath` at the class level instead.

| Option          | Type                                                                    | Default | Description                                                                        |
| --------------- | ----------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `autoIncrement` | `boolean`                                                               | `false` | Delegate key assignment to IndexedDB's auto-increment mechanism.                   |
| `generator`     | `'uuid'` \| `'timestamp'` \| `'random'` \| `(item) => string \| number` | -       | Automatic key generator invoked when the key field is absent or empty on `create`. |

#### `@CompositeKeyPath(fields, options?)`

Class-level decorator for composite primary keys. Cannot be combined with `@KeyPath`. Write it *below* `@DataClass` (decorators are applied bottom-up, and the key path must be registered before `@DataClass` validates it).

Key generation is not supported for composite keys: passing `generator` or `autoIncrement` throws at decoration time. Provide every key field explicitly before `create()`.

```typescript
@DataClass()
@CompositeKeyPath(['userId', 'projectId'])
class UserProject {
  userId!: string;
  projectId!: string;
  role!: string;
}
```

#### `@Index(options?)`

Creates an IDB index on the decorated field, enabling efficient lookups via `findByIndex` and `findOneByIndex`.

| Option   | Type      | Description                              |
| -------- | --------- | ---------------------------------------- |
| `unique` | `boolean` | Enforce uniqueness on the indexed field. |

#### `@Validate(predicate, message)`

Attaches a validation rule to the decorated property. Rules are enforced on every `create` and `update` call. If any rule fails, the operation throws with a message listing all failing fields.

#### `@RetentionPolicy(options)`

Class-level decorator that configures automatic expiry and deletion of records. See [Data Retention](#data-retention) for full details.

---

## Database Initialisation

```typescript
const db = await Database.build<{
  User: EntityRepository<User>;
  Order: EntityRepository<Order>;
}>('shop', [User, Order]);
```

`Database.build` opens (or upgrades) the IDB database, reconciles the declared schema against the stored one (creating missing stores and indexes and removing indexes that are no longer declared), starts background retention jobs if applicable, and attaches typed repository properties to the returned object.

The declared database version is the highest `version` value across all registered entities; see [Migration behaviour](#migration-behaviour) for how drift and downgrades are handled.

### Inspecting database metadata

```typescript
db.getDatabaseVersion(); // number - current IDB version
db.getEntityVersions(); // Map<string, number>
db.getEntityVersion('User'); // number | undefined
db.getAvailableEntities(); // string[]
```

### Closing the connection

```typescript
db.close(); // Stops the retention cleanup timer and closes the IDB connection.
```

---

## CRUD Operations

Each entity is accessible as a named property on the database object. All methods return `Promise`.

```typescript
// Create
await db.User.create(user);
await db.User.createMany([alice, bob, charlie]);

// Read
const user = await db.User.read('u1'); // by primary key
const page = await db.User.listPaginated(1, 20); // 1-based pagination
const all = await db.User.list();

// Update
await db.User.update(updatedUser);
await db.User.updateMany([user1, user2]);

// Delete
await db.User.delete('u1');
await db.User.deleteMany(['u1', 'u2']);
await db.User.deleteWhere((q) => q.where('age').lt(18));

// Utilities
const count = await db.User.count();
const exists = await db.User.exists('u1');
await db.User.clear();
```

### Index lookups

```typescript
const allAdmins = await db.User.findByIndex('role', 'admin');
const firstAdmin = await db.User.findOneByIndex('role', 'admin');
```

Querying a non-existent index throws immediately.

---

## Automatic Timestamps

Every record written through a repository automatically receives two internal fields:

| Field             | Type                      | Set on                |
| ----------------- | ------------------------- | --------------------- |
| `__idb_createdAt` | `number` (ms since epoch) | `create` only         |
| `__idb_updatedAt` | `number` (ms since epoch) | `create` and `update` |

`__idb_createdAt` is preserved across updates; `__idb_updatedAt` is refreshed on every write.

```typescript
const item = await db.Session.read(key);
console.log(item.__idb_createdAt, item.__idb_updatedAt);
```

---

## Query Builder

`EntityRepository.query()` returns a typed `QueryBuilder<T>` for constructing complex filter expressions, sorting, pagination, and aggregations.

### Filtering

```typescript
const results = await db.User.query()
  .where('age')
  .gte(18)
  .and('status')
  .equals('active')
  .execute();
```

#### Available operators

| Operator                       | Field types       | Description                     |
| ------------------------------ | ----------------- | ------------------------------- |
| `equals`                       | any               | Strict equality (`===`)         |
| `gt` / `gte` / `lt` / `lte`    | `ComparableValue` | Comparison                      |
| `between(start, end)`          | `ComparableValue` | Inclusive range                 |
| `notBetween(start, end)`       | `ComparableValue` | Outside range                   |
| `startsWith` / `endsWith`      | `string`          | Prefix / suffix match           |
| `contains`                     | `string` \| array | Substring or element membership |
| `matches`                      | `string`          | Regular expression test         |
| `in(values)` / `notIn(values)` | any               | Membership test                 |
| `containsAny(values)`          | array             | At least one element matches    |
| `containsAll(values)`          | array             | All elements present            |

TypeScript enforces operator/type compatibility at compile time - string-only operators are not exposed on numeric fields, and so on.

### Logical grouping

```typescript
// OR connector
const results = await db.User.query()
  .where('age')
  .gte(18)
  .or()
  .where('hasParentalConsent')
  .equals(true)
  .execute();

// Grouped sub-expression
const premiumOrTrial = await db.User.query()
  .where((qb) =>
    qb.where('type').equals('premium').and('status').equals('active'),
  )
  .or()
  .where('isTrial')
  .equals(true)
  .execute();
```

### Sorting and pagination

```typescript
await db.User.query()
  .where('status')
  .equals('active')
  .orderBy('createdAt', 'desc')
  .offset(20)
  .limit(10)
  .execute();
```

### Index and range acceleration

When a field is indexed, you can constrain the initial IDB candidate set at the storage layer before in-memory filtering begins:

```typescript
await db.Product.query().useIndex('price').range(10, 100).execute();
```

The two mechanisms are deliberately distinct:

- `useIndex(...).range(start, end)` narrows candidates **natively at the IndexedDB layer** via an `IDBKeyRange` — fast, but limited to one indexed field.
- `.where(...)` conditions are evaluated **in memory** after the candidates are fetched. They can target any field (including one different from the index), at the cost of scanning the fetched candidates.

Mixing them is valid and useful — the index range prunes the bulk, `where()` refines the rest. Calling `range()` **without** `useIndex()` throws at execution time instead of silently ignoring the bounds; express such bounds as `where(field).between(start, end)` instead.

### Aggregations

```typescript
await db.Order.query().where('status').equals('paid').count();
await db.Order.query().sum('amount');
await db.Order.query().avg('price');
await db.Order.query().min('createdAt');
await db.Order.query().max('createdAt');

// Grouped count
const byStatus = await db.Order.query().groupBy('status').count();
// [{ status: 'paid', count: 42 }, { status: 'pending', count: 7 }]
```

`sum` and `avg` are restricted to numeric fields. `min` and `max` accept any comparable field. `groupBy(...).count()` returns results sorted by group key.

---

## Key Management

### Auto-increment

```typescript
@DataClass()
class Task {
  @KeyPath({ autoIncrement: true })
  id!: number; // Assigned by IndexedDB: 1, 2, 3, …

  title!: string;
}
```

### Built-in generators

```typescript
@DataClass()
class Document {
  @KeyPath({ generator: 'uuid' }) // RFC 4122 v4
  id!: string;
}

@DataClass()
class Event {
  @KeyPath({ generator: 'timestamp' }) // Date.now()
  id!: number;
}

@DataClass()
class Session {
  @KeyPath({ generator: 'random' }) // Base-36 random string
  id!: string;
}
```

### Custom generator

```typescript
@DataClass()
class Invoice {
  @KeyPath({
    generator: (entity) =>
      `INV-${entity.year}-${String(entity.number).padStart(4, '0')}`,
  })
  invoiceId!: string;

  year!: number;
  number!: number;
}
// invoiceId → "INV-2024-0001"
```

### Using generators directly

```typescript
import { KeyGenerators } from 'idb-ts';

KeyGenerators.uuid(); // "a1b2c3d4-..."
KeyGenerators.timestamp(); // 1696118400000
KeyGenerators.random(); // "xyz789abc"
```

### Composite keys

Key generation (`generator` / `autoIncrement`) is not supported for composite keys and throws at decoration time.

```typescript
@DataClass()
@CompositeKeyPath(['userId', 'projectId'])
class UserProject {
  userId!: string;
  projectId!: string;

  @Index()
  role!: string;

  joinedAt!: Date;
}

// Create
await db.UserProject.create(new UserProject('u1', 'p1', 'developer'));

// Read / update / delete with composite key tuple
const rel = await db.UserProject.read(['u1', 'p1']);
await db.UserProject.delete(['u1', 'p1']);
```

---

## Field Validation

Validation rules are declared per-property with `@Validate`. All rules for an entity are evaluated before any write; a single thrown error enumerates every failing rule.

```typescript
@DataClass()
class User {
  @KeyPath()
  id!: string;

  @Validate(
    (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    'must be a valid email address',
  )
  email!: string;

  @Validate(
    (v) => Number.isInteger(v) && v >= 0,
    'must be a non-negative integer',
  )
  age!: number;
}
```

Error format on failure:

```
Validation failed for User: email: must be a valid email address; age: must be a non-negative integer
```

---

## Transactions

### Callback form (recommended)

The callback receives a `TransactionalDatabase` handle. On successful return the transaction is committed automatically. Any thrown error triggers an automatic rollback before rethrowing.

```typescript
await db.transaction(async (tx) => {
  await tx.User.create(user);
  await tx.Order.create(order);
  await tx.OrderItem.create(item);
});
```

### Explicit form

```typescript
const tx = await db.beginTransaction(['User', 'Order'], 'readwrite');
try {
  await tx.User.create(user);
  await tx.Order.create(order);
  await tx.commit();
} catch (error) {
  await tx.rollback();
  throw error;
}
```

### Transaction semantics

All repository operations performed through the `tx` handle share the same native `IDBTransaction`, ensuring atomicity. `beginTransaction` accepts an array of entity names that determines the transaction scope; the callback form spans all registered entities. The default mode is `'readwrite'`; pass `'readonly'` for read-only workloads. Use `tx.Entity.query()` to run queries within the same transaction boundary.

---

## Data Retention

`@RetentionPolicy` triggers a background cleanup job that deletes records whose age exceeds the configured threshold.

```typescript
@RetentionPolicy({ seconds: 60 * 60 * 24 * 30 }) // 30-day retention
@DataClass()
class Session {
  @KeyPath({ generator: 'uuid' })
  id!: string;

  userId!: string;
}
```

| Option    | Type      | Default             | Description                                                             |
| --------- | --------- | ------------------- | ----------------------------------------------------------------------- |
| `seconds` | `number`  | -                   | **(Required)** Retention window in seconds. Must be a positive integer. |
| `enabled` | `boolean` | `true`              | Set to `false` to suspend cleanup without removing the policy.          |
| `field`   | `string`  | `'__idb_createdAt'` | Numeric timestamp field used to compute record age.                     |

When multiple entities define retention policies, the cleanup interval is set to the GCD of all configured `seconds` values in milliseconds, so a single timer satisfies every policy efficiently. The job runs immediately on database open and then on each interval tick, using cursor-based `readwrite` transactions.

---

## Schema Versioning

Increment an entity's `version` to trigger `onupgradeneeded` and update its object store on the user's next visit. The declared database version is the maximum across all registered entities, so adding a new high-version entity is sufficient to initiate a migration.

```typescript
@DataClass({ version: 1 })
class User {
  /* ... */
}
@DataClass({ version: 2 })
class Post {
  /* ... */
}
@DataClass({ version: 3 })
class Comment {
  /* ... */
}

// Database opens at version 3 and reconciles the full declared schema
// (stores + indexes) inside the upgrade transaction.
const db = await Database.build('blog', [User, Post, Comment]);

console.log(db.getDatabaseVersion()); // 3
```

### Migration behaviour

Migration is **declarative**: on every upgrade the actual IndexedDB schema is reconciled against the schema declared by your decorators.

| Change                                      | Handling                                                                                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New entity / store                          | Created automatically.                                                                                                                                                 |
| Index added (even without a version bump)   | Detected as schema drift after opening; the database is reopened one version higher and the index is created. Existing records are re-indexed by IndexedDB.            |
| Index removed (even without a version bump) | Detected as drift; the stale index is deleted. Record data is not affected.                                                                                            |
| Entity `version` lowered                    | IndexedDB cannot downgrade. The database opens at the existing on-disk version instead of throwing `VersionError`; `getDatabaseVersion()` reports the on-disk version. |
| Key path / `autoIncrement` changed          | **Not applied** — IndexedDB cannot change a store's key path in place. A warning is logged; migrate the data to a new entity or delete the database.                   |
| Entity no longer registered                 | Its store and data are **preserved** and a warning is logged. Re-register the entity to access the data again, or delete the store manually.                           |

> Because drift detection may reopen the database one version higher than declared, `getDatabaseVersion()` returns the _actual_ IndexedDB version, which can exceed the highest entity `version`.

---

## Bulk Operations

All repository bulk helpers iterate the corresponding single-item operation and therefore enforce validation and key generation per item. They are not issued as a single atomic transaction. For atomic batch writes, use the [Transaction API](#transactions).

```typescript
await db.User.createMany([alice, bob, charlie]);
await db.User.updateMany([alice, bob]);
await db.User.deleteMany(['u1', 'u2', 'u3']);
```

---

## Performance

<!-- performance start -->

Already up to date
Done in 383ms using pnpm v11.9.0

### Suite 1: CRUD Operations

| Operation                       | Ops | Total ms |      Ops/s | Avg ms |   P50 |   P95 |   P99 |   Min |    Max |
| ------------------------------- | --: | -------: | ---------: | -----: | ----: | ----: | ----: | ----: | -----: |
| create (single)                 | 200 |   11.668 | 17,141.483 |  0.058 | 0.044 | 0.103 |  0.13 | 0.039 |  0.883 |
| read (by PK)                    | 200 |    7.972 | 25,087.351 |  0.039 | 0.036 | 0.062 | 0.091 |  0.03 |  0.113 |
| update (single)                 | 200 |   133.17 |  1,501.843 |  0.665 | 0.615 |  1.01 | 1.184 | 0.545 |  2.036 |
| findByIndex (email)             | 200 |    8.942 | 22,365.168 |  0.044 | 0.041 | 0.073 | 0.086 | 0.034 |  0.111 |
| findOneByIndex (email)          | 200 |   10.246 | 19,519.677 |  0.051 | 0.044 | 0.057 | 0.072 | 0.039 |  0.998 |
| count                           | 200 |     8.28 | 24,155.266 |  0.041 |  0.04 | 0.049 | 0.055 | 0.037 |  0.079 |
| exists                          | 200 |   13.325 | 15,009.758 |  0.066 | 0.052 |  0.09 | 0.118 | 0.046 |  2.085 |
| list (all)                      |  50 |    96.56 |    517.814 |  1.931 | 1.771 | 4.279 | 6.013 | 1.515 |  6.013 |
| listPaginated (1, 20)           | 200 |  398.616 |    501.736 |  1.993 | 1.765 | 3.022 | 8.919 |  1.51 | 10.708 |
| query().where().gte().execute() | 100 |  181.336 |    551.463 |  1.813 | 1.599 | 1.896 | 2.042 | 1.524 | 14.147 |
| delete (single)                 | 200 |  161.278 |  1,240.095 |  0.806 | 0.773 | 0.896 | 1.019 |  0.64 |  6.043 |

### Suite 2: Batched CRUD (by batch size)

| Operation                | Ops |  Total ms |     Ops/s |    Avg ms |       P50 |       P95 |       P99 |       Min |       Max |
| ------------------------ | --: | --------: | --------: | --------: | --------: | --------: | --------: | --------: | --------: |
| createMany (10)          |   3 |     1.421 | 2,111.564 |     0.473 |     0.513 |     0.528 |     0.528 |     0.377 |     0.528 |
| read batch (10 keys)     |   3 |       0.5 | 5,998.488 |     0.166 |      0.16 |     0.189 |     0.189 |     0.151 |     0.189 |
| updateMany (10)          |   3 |     4.472 |   670.902 |      1.49 |     1.452 |     1.646 |     1.646 |      1.37 |     1.646 |
| deleteMany (10)          |   3 |     3.163 |   948.378 |     1.054 |     1.054 |     1.139 |     1.139 |     0.969 |     1.139 |
| deleteWhere (10+ match)  |   3 |     0.841 | 3,566.321 |      0.28 |     0.278 |     0.312 |     0.312 |     0.249 |     0.312 |
| createMany (50)          |   3 |     4.301 |   697.531 |     1.433 |     1.433 |     1.477 |     1.477 |      1.39 |     1.477 |
| read batch (50 keys)     |   3 |     3.931 |   763.202 |      1.31 |     1.296 |     1.421 |     1.421 |     1.212 |     1.421 |
| updateMany (50)          |   3 |    87.877 |    34.138 |    29.291 |    29.002 |    31.244 |    31.244 |    27.628 |    31.244 |
| deleteMany (50)          |   3 |    93.633 |     32.04 |     31.21 |     31.53 |      33.2 |      33.2 |    28.899 |      33.2 |
| deleteWhere (50+ match)  |   3 |     3.446 |   870.695 |     1.148 |     1.127 |     1.241 |     1.241 |     1.075 |     1.241 |
| createMany (100)         |   3 |     9.571 |   313.443 |      3.19 |     3.074 |       3.8 |       3.8 |     2.695 |       3.8 |
| read batch (100 keys)    |   3 |    12.769 |   234.949 |     4.255 |     4.077 |     5.665 |     5.665 |     3.023 |     5.665 |
| updateMany (100)         |   3 |   314.564 |     9.537 |   104.853 |   104.907 |   104.963 |   104.963 |    104.69 |   104.963 |
| deleteMany (100)         |   3 |   331.429 |     9.052 |   110.474 |   108.426 |   121.766 |   121.766 |   101.228 |   121.766 |
| deleteWhere (100+ match) |   3 |     6.954 |   431.435 |     2.317 |     2.254 |     2.481 |     2.481 |     2.216 |     2.481 |
| createMany (500)         |   3 |    88.569 |    33.872 |    29.522 |    27.663 |    42.007 |    42.007 |    18.894 |    42.007 |
| read batch (500 keys)    |   3 |     118.5 |    25.316 |    39.498 |    36.064 |    51.839 |    51.839 |    30.592 |    51.839 |
| updateMany (500)         |   3 | 8,577.818 |      0.35 | 2,859.271 |  2,855.88 | 2,877.442 | 2,877.442 |  2,844.49 | 2,877.442 |
| deleteMany (500)         |   3 |  9,452.42 |     0.317 | 3,150.804 | 3,097.544 | 3,450.784 | 3,450.784 | 2,904.084 | 3,450.784 |
| deleteWhere (500+ match) |   3 |    35.488 |    84.535 |    11.828 |    11.745 |    12.529 |    12.529 |     11.21 |    12.529 |

### Suite 3: Mixed CRUD Operations

| Operation                                   | Ops | Total ms |      Ops/s | Avg ms |   P50 |   P95 |   P99 |   Min |   Max |
| ------------------------------------------- | --: | -------: | ---------: | -----: | ----: | ----: | ----: | ----: | ----: |
| Read-heavy mix (70R/15U/10C/5D)             | 200 |   38.005 |  5,262.407 |   0.19 | 0.031 | 0.716 | 0.737 | 0.001 | 0.745 |
| Write-heavy mix (20R/15U/50C/15D)           | 200 |   44.985 |  4,445.915 |  0.225 | 0.035 | 0.707 | 0.739 | 0.001 | 3.708 |
| Mixed CRUD + queries                        | 200 |   83.386 |   2,398.49 |  0.417 | 0.033 | 2.061 | 2.141 | 0.011 | 6.234 |
| Cross-entity mix (User.read + Order.create) | 200 |    6.295 | 31,770.944 |  0.031 | 0.024 | 0.058 | 0.076 | 0.018 | 0.095 |

### Suite 4: Mixed Batched CRUD

| Operation                                                                   | Ops | Total ms |   Ops/s | Avg ms |    P50 |     P95 |     P99 |    Min |     Max |
| --------------------------------------------------------------------------- | --: | -------: | ------: | -----: | -----: | ------: | ------: | -----: | ------: |
| Cycle: createMany -> readAll -> updateMany -> deleteMany (50)               |   5 |  104.266 |  47.954 | 20.852 | 15.473 |  36.333 |  36.333 |  9.223 |  36.333 |
| createMany -> query filter -> deleteMany (50)                               |   5 |   33.079 | 151.155 |  6.615 |  6.368 |   9.824 |   9.824 |  4.751 |   9.824 |
| 5 waves × createMany(50) + deleteMany(50)                                   |   3 |  292.584 |  10.253 | 97.527 | 94.694 | 108.554 | 108.554 | 89.333 | 108.554 |
| Cross-entity batch: createMany(User) + createMany(Order) + deleteMany (×50) |   3 |  136.071 |  22.047 | 45.356 | 43.887 |  49.364 |  49.364 | 42.816 |  49.364 |

### Suite 5: Transaction Operations

| Operation                                    | Ops | Total ms |      Ops/s | Avg ms |   P50 |    P95 |    P99 |   Min |    Max |
| -------------------------------------------- | --: | -------: | ---------: | -----: | ----: | -----: | -----: | ----: | -----: |
| tx: single create                            | 100 |      7.5 | 13,332.676 |  0.075 | 0.063 |  0.121 |  0.209 |  0.06 |   0.37 |
| tx: create 10 users                          | 100 |   23.044 |  4,339.529 |   0.23 | 0.219 |   0.27 |  0.413 | 0.207 |  0.455 |
| tx: read + update                            | 100 |  194.689 |     513.64 |  1.947 | 1.906 |  1.986 |   3.09 | 1.836 |  5.522 |
| tx: multi-entity create (User+Order+Session) | 100 |    7.336 | 13,632.137 |  0.073 |  0.07 |  0.098 |  0.114 | 0.066 |  0.159 |
| tx: 10 reads                                 | 100 |   15.108 |  6,618.828 |  0.151 | 0.141 |  0.176 |  0.272 | 0.135 |  0.364 |
| tx: batch create 50 users                    |  20 |   23.258 |    859.911 |  1.163 | 0.953 |   1.68 |  4.091 | 0.926 |  4.091 |
| tx: query().where().gte()                    | 100 |  946.761 |    105.623 |  9.467 | 8.473 | 18.988 | 19.246 | 8.265 | 19.705 |
| tx (explicit): begin -> create -> commit     | 100 |    5.381 | 18,582.249 |  0.054 | 0.052 |  0.067 |  0.078 | 0.049 |  0.081 |

### Suite 6: Mixed Transactions

| Operation                                                   | Ops | Total ms |      Ops/s | Avg ms |   P50 |   P95 |   P99 |   Min |    Max |
| ----------------------------------------------------------- | --: | -------: | ---------: | -----: | ----: | ----: | ----: | ----: | -----: |
| tx mixed: read User -> create Order -> update User          | 100 |   53.926 |  1,854.389 |  0.539 | 0.437 | 0.462 |  0.59 |  0.41 | 10.318 |
| tx mixed: query User + read Order + create Session          | 100 |  113.792 |    878.798 |  1.138 | 1.055 | 1.088 | 1.139 |  1.03 |  8.959 |
| tx multi-entity: create User+Order+Session                  | 100 |    8.889 | 11,250.085 |  0.089 | 0.087 | 0.102 | 0.106 | 0.082 |  0.132 |
| tx batched: create 20 Users + 40 Orders + 20 Sessions       |  10 |   20.246 |    493.934 |  2.024 | 1.136 | 9.953 | 9.953 | 1.096 |  9.953 |
| tx mixed: delete old orders -> create new orders            | 100 |  122.343 |    817.377 |  1.223 | 1.145 | 1.309 | 1.386 | 0.981 |  8.579 |
| tx mixed: count Orders -> conditional create                | 100 |    7.079 | 14,125.357 |  0.071 | 0.069 | 0.083 | 0.099 | 0.065 |  0.103 |
| tx complex: read User+Orders -> aggregate -> create Session | 100 |    15.71 |  6,365.173 |  0.157 | 0.117 | 0.216 |  0.33 | 0.107 |  2.822 |

<!-- performance end -->

## Useful Links

- **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)
- **Demos**: https://maifeeulasad.github.io/idb-ts/
- **Live Editor**: https://maifeeulasad.github.io/idb-ts/typescript/
- **Code Coverage report**: https://maifeeulasad.github.io/idb-ts/coverage/lcov-report/

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

Made by [Maifee Ulasad](https://github.com/maifeeulasad) with :heart: and :tea:. Licensed under [MIT](./LICENSE).
