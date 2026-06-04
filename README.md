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

Class-level decorator for composite primary keys. Cannot be combined with `@KeyPath`.

```typescript
@CompositeKeyPath(['userId', 'projectId'])
@DataClass()
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

`Database.build` opens (or upgrades) the IDB database, creates object stores and indexes for any entity whose version exceeds the stored database version, starts background retention jobs if applicable, and attaches typed repository properties to the returned object.

The effective database version is the highest `version` value declared across all registered entities.

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

```typescript
@CompositeKeyPath(['userId', 'projectId'])
@DataClass()
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

Increment an entity's `version` to trigger `onupgradeneeded` and update its object store on the user's next visit. The effective database version is the maximum across all registered entities, so adding a new high-version entity is sufficient to initiate a migration.

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

// Database opens at version 3.
// If a user was on version 1, only Post (v2) and Comment (v3) stores are
// created or updated during onupgradeneeded.
const db = await Database.build('blog', [User, Post, Comment]);

console.log(db.getDatabaseVersion()); // 3
```

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
Done in 371ms using pnpm v11.5.1

### Suite 1: CRUD Operations

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| create (single) | 200 | 11.452 | 17,464.575 | 0.057 | 0.042 | 0.106 | 0.13 | 0.037 | 0.873 |
| read (by PK) | 200 | 8.747 | 22,864.697 | 0.043 | 0.038 | 0.073 | 0.124 | 0.031 | 0.142 |
| update (single) | 200 | 107.417 | 1,861.908 | 0.537 | 0.492 | 0.846 | 0.996 | 0.422 | 1.837 |
| findByIndex (email) | 200 | 9.161 | 21,831.263 | 0.046 | 0.042 | 0.072 | 0.098 | 0.035 | 0.102 |
| findOneByIndex (email) | 200 | 10.831 | 18,466.266 | 0.054 | 0.048 | 0.062 | 0.079 | 0.041 | 0.818 |
| count | 200 | 9.418 | 21,235.638 | 0.047 | 0.045 | 0.058 | 0.073 | 0.041 | 0.087 |
| exists | 200 | 15.159 | 13,193.577 | 0.076 | 0.058 | 0.094 | 0.126 | 0.051 | 2.479 |
| list (all) | 50 | 94.742 | 527.749 | 1.894 | 1.563 | 4.379 | 6.68 | 1.439 | 6.68 |
| listPaginated (1, 20) | 200 | 373.165 | 535.956 | 1.865 | 1.569 | 1.993 | 8.988 | 1.415 | 12.812 |
| query().where().gte().execute() | 100 | 180.633 | 553.61 | 1.806 | 1.519 | 1.985 | 2.312 | 1.462 | 13.98 |
| delete (single) | 200 | 131.658 | 1,519.083 | 0.658 | 0.632 | 0.713 | 0.818 | 0.527 | 4.997 |


### Suite 2: Batched CRUD (by batch size)

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| createMany (10) | 3 | 1.046 | 2,867.4 | 0.348 | 0.361 | 0.378 | 0.378 | 0.306 | 0.378 |
| read batch (10 keys) | 3 | 0.554 | 5,418.361 | 0.184 | 0.172 | 0.227 | 0.227 | 0.154 | 0.227 |
| updateMany (10) | 3 | 4.395 | 682.573 | 1.464 | 1.258 | 1.878 | 1.878 | 1.258 | 1.878 |
| deleteMany (10) | 3 | 2.865 | 1,047.076 | 0.954 | 1 | 1.008 | 1.008 | 0.855 | 1.008 |
| deleteWhere (10+ match) | 3 | 0.84 | 3,570.901 | 0.28 | 0.272 | 0.299 | 0.299 | 0.267 | 0.299 |
| createMany (50) | 3 | 4.187 | 716.558 | 1.395 | 1.404 | 1.441 | 1.441 | 1.339 | 1.441 |
| read batch (50 keys) | 3 | 4.077 | 735.788 | 1.358 | 1.345 | 1.484 | 1.484 | 1.246 | 1.484 |
| updateMany (50) | 3 | 74.328 | 40.362 | 24.775 | 24.348 | 27.021 | 27.021 | 22.956 | 27.021 |
| deleteMany (50) | 3 | 75.39 | 39.793 | 25.129 | 25.188 | 26.75 | 26.75 | 23.449 | 26.75 |
| deleteWhere (50+ match) | 3 | 3.5 | 857.117 | 1.166 | 1.108 | 1.317 | 1.317 | 1.073 | 1.317 |
| createMany (100) | 3 | 9.336 | 321.343 | 3.111 | 3.056 | 3.673 | 3.673 | 2.605 | 3.673 |
| read batch (100 keys) | 3 | 12.635 | 237.428 | 4.211 | 4.237 | 4.515 | 4.515 | 3.881 | 4.515 |
| updateMany (100) | 3 | 244.862 | 12.252 | 81.619 | 81.278 | 82.714 | 82.714 | 80.864 | 82.714 |
| deleteMany (100) | 3 | 254.607 | 11.783 | 84.867 | 84.406 | 93.02 | 93.02 | 77.175 | 93.02 |
| deleteWhere (100+ match) | 3 | 7.163 | 418.824 | 2.387 | 2.313 | 2.61 | 2.61 | 2.238 | 2.61 |
| createMany (500) | 3 | 74.592 | 40.219 | 24.863 | 25.375 | 32.078 | 32.078 | 17.135 | 32.078 |
| read batch (500 keys) | 3 | 127.272 | 23.572 | 42.422 | 40.657 | 49.184 | 49.184 | 37.426 | 49.184 |
| updateMany (500) | 3 | 6,835.912 | 0.439 | 2,278.635 | 2,280.033 | 2,286.256 | 2,286.256 | 2,269.617 | 2,286.256 |
| deleteMany (500) | 3 | 7,376.397 | 0.407 | 2,458.797 | 2,437.771 | 2,704.82 | 2,704.82 | 2,233.8 | 2,704.82 |
| deleteWhere (500+ match) | 3 | 34.386 | 87.244 | 11.461 | 11.211 | 12.336 | 12.336 | 10.837 | 12.336 |


### Suite 3: Mixed CRUD Operations

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| Read-heavy mix (70R/15U/10C/5D) | 200 | 26.574 | 7,526.246 | 0.133 | 0.024 | 0.551 | 0.561 | 0.013 | 0.571 |
| Write-heavy mix (20R/15U/50C/15D) | 200 | 82.62 | 2,420.71 | 0.413 | 0.067 | 1.91 | 2.095 | 0.001 | 4.229 |
| Mixed CRUD + queries | 200 | 98.103 | 2,038.669 | 0.49 | 0.031 | 1.896 | 2.197 | 0.011 | 6.57 |
| Cross-entity mix (User.read + Order.create) | 200 | 6.041 | 33,106.027 | 0.03 | 0.022 | 0.067 | 0.094 | 0.017 | 0.098 |


### Suite 4: Mixed Batched CRUD

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| Cycle: createMany -> readAll -> updateMany -> deleteMany (50) | 5 | 66.669 | 74.998 | 13.333 | 11.728 | 21.48 | 21.48 | 8.506 | 21.48 |
| createMany  ->  query filter  ->  deleteMany (50) | 5 | 31.257 | 159.963 | 6.251 | 6.591 | 7.251 | 7.251 | 4.913 | 7.251 |
| 5 waves × createMany(50) + deleteMany(50) | 3 | 221.312 | 13.555 | 73.77 | 75.679 | 75.901 | 75.901 | 69.73 | 75.901 |
| Cross-entity batch: createMany(User) + createMany(Order) + deleteMany (×50) | 3 | 119.524 | 25.1 | 39.84 | 41.353 | 41.413 | 41.413 | 36.755 | 41.413 |


### Suite 5: Transaction Operations

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| tx: single create | 100 | 7.428 | 13,462.663 | 0.074 | 0.059 | 0.138 | 0.218 | 0.056 | 0.567 |
| tx: create 10 users | 100 | 21.907 | 4,564.804 | 0.219 | 0.208 | 0.272 | 0.385 | 0.195 | 0.428 |
| tx: read + update | 100 | 153.092 | 653.2 | 1.531 | 1.472 | 1.531 | 2.672 | 1.446 | 5.587 |
| tx: multi-entity create (User+Order+Session) | 100 | 7.525 | 13,288.812 | 0.075 | 0.068 | 0.129 | 0.152 | 0.064 | 0.155 |
| tx: 10 reads | 100 | 16.528 | 6,050.469 | 0.165 | 0.139 | 0.262 | 0.294 | 0.131 | 0.354 |
| tx: batch create 50 users | 20 | 22.746 | 879.273 | 1.137 | 0.918 | 1.553 | 4.197 | 0.896 | 4.197 |
| tx: query().where().gte() | 100 | 883.632 | 113.169 | 8.836 | 7.845 | 18.63 | 18.774 | 7.639 | 19.521 |
| tx (explicit): begin -> create -> commit | 100 | 5.115 | 19,551.978 | 0.051 | 0.049 | 0.065 | 0.079 | 0.047 | 0.08 |


### Suite 6: Mixed Transactions

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| tx mixed: read User  ->  create Order  ->  update User | 100 | 47.215 | 2,117.983 | 0.472 | 0.365 | 0.403 | 0.616 | 0.345 | 10.325 |
| tx mixed: query User + read Order + create Session | 100 | 107.901 | 926.778 | 1.079 | 0.999 | 1.043 | 1.162 | 0.984 | 8.352 |
| tx multi-entity: create User+Order+Session | 100 | 18.548 | 5,391.352 | 0.185 | 0.085 | 0.109 | 0.215 | 0.08 | 9.694 |
| tx batched: create 20 Users + 40 Orders + 20 Sessions | 10 | 11.005 | 908.716 | 1.1 | 1.071 | 1.323 | 1.323 | 1.052 | 1.323 |
| tx mixed: delete old orders  ->  create new orders | 100 | 99.606 | 1,003.955 | 0.996 | 0.911 | 1.033 | 1.441 | 0.786 | 8.421 |
| tx mixed: count Orders  ->  conditional create | 100 | 9.774 | 10,230.797 | 0.098 | 0.068 | 0.097 | 0.116 | 0.065 | 2.669 |
| tx complex: read User+Orders  ->  aggregate  ->  create Session | 100 | 12.089 | 8,271.708 | 0.121 | 0.115 | 0.141 | 0.197 | 0.105 | 0.256 |

<!-- performance end -->

## Useful Links

- **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)
- **Demos**: https://maifeeulasad.github.io/idb-ts/
- **Live Editor**: https://maifeeulasad.github.io/idb-ts/typescript/
- **Code Coverage report**: https://maifeeulasad.github.io/idb-ts/coverage/lcov-report/

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

Made by [Maifee Ulasad](https://github.com/maifeeulasad) with :heart: and :tea:. Licensed under [MIT](./LICENSE).
