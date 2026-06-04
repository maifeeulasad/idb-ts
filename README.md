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
Done in 443ms using pnpm v11.5.1

### Suite 1: CRUD Operations

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| create (single) | 200 | 15.46 | 12,936.753 | 0.077 | 0.058 | 0.137 | 0.162 | 0.052 | 1.01 |
| read (by PK) | 200 | 10.987 | 18,203.475 | 0.054 | 0.047 | 0.089 | 0.163 | 0.04 | 0.175 |
| update (single) | 200 | 121.183 | 1,650.4 | 0.605 | 0.535 | 0.991 | 1.739 | 0.459 | 2.227 |
| findByIndex (email) | 200 | 11.218 | 17,828.706 | 0.056 | 0.052 | 0.083 | 0.111 | 0.044 | 0.143 |
| findOneByIndex (email) | 200 | 13.331 | 15,002.256 | 0.066 | 0.057 | 0.081 | 0.103 | 0.048 | 1.11 |
| count | 200 | 10.209 | 19,589.884 | 0.051 | 0.049 | 0.064 | 0.088 | 0.044 | 0.101 |
| exists | 200 | 16.586 | 12,058.587 | 0.083 | 0.064 | 0.097 | 0.18 | 0.057 | 2.444 |
| list (all) | 50 | 97.836 | 511.058 | 1.956 | 1.724 | 4.683 | 7.585 | 1.481 | 7.585 |
| listPaginated (1, 20) | 200 | 374.357 | 534.25 | 1.871 | 1.692 | 2.005 | 9.138 | 1.447 | 12.441 |
| query().where().gte().execute() | 100 | 182.997 | 546.458 | 1.829 | 1.542 | 1.975 | 2.457 | 1.485 | 14.388 |
| delete (single) | 200 | 138.608 | 1,442.92 | 0.693 | 0.658 | 0.764 | 0.857 | 0.556 | 5.689 |


### Suite 2: Batched CRUD (by batch size)

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| createMany (10) | 3 | 1.482 | 2,023.901 | 0.493 | 0.531 | 0.534 | 0.534 | 0.415 | 0.534 |
| read batch (10 keys) | 3 | 0.522 | 5,741.792 | 0.174 | 0.169 | 0.191 | 0.191 | 0.161 | 0.191 |
| updateMany (10) | 3 | 5.066 | 592.172 | 1.688 | 1.488 | 2.093 | 2.093 | 1.482 | 2.093 |
| deleteMany (10) | 3 | 3.06 | 980.235 | 1.02 | 1.031 | 1.099 | 1.099 | 0.929 | 1.099 |
| deleteWhere (10+ match) | 3 | 0.984 | 3,048.328 | 0.327 | 0.302 | 0.401 | 0.401 | 0.279 | 0.401 |
| createMany (50) | 3 | 5.753 | 521.463 | 1.917 | 1.933 | 2.106 | 2.106 | 1.712 | 2.106 |
| read batch (50 keys) | 3 | 4.12 | 728.179 | 1.372 | 1.386 | 1.468 | 1.468 | 1.263 | 1.468 |
| updateMany (50) | 3 | 78.35 | 38.29 | 26.116 | 25.63 | 28.291 | 28.291 | 24.426 | 28.291 |
| deleteMany (50) | 3 | 76.547 | 39.191 | 25.514 | 24.517 | 27.751 | 27.751 | 24.276 | 27.751 |
| deleteWhere (50+ match) | 3 | 3.43 | 874.636 | 1.143 | 1.069 | 1.294 | 1.294 | 1.065 | 1.294 |
| createMany (100) | 3 | 11.795 | 254.341 | 3.931 | 4.058 | 4.244 | 4.244 | 3.491 | 4.244 |
| read batch (100 keys) | 3 | 29.324 | 102.305 | 9.773 | 8.39 | 14.867 | 14.867 | 6.062 | 14.867 |
| updateMany (100) | 3 | 272.998 | 10.989 | 90.997 | 89.999 | 95.133 | 95.133 | 87.86 | 95.133 |
| deleteMany (100) | 3 | 270.164 | 11.104 | 90.048 | 88.568 | 98.799 | 98.799 | 82.777 | 98.799 |
| deleteWhere (100+ match) | 3 | 6.852 | 437.839 | 2.283 | 2.136 | 2.591 | 2.591 | 2.123 | 2.591 |
| createMany (500) | 3 | 89.252 | 33.613 | 29.749 | 31.124 | 34.061 | 34.061 | 24.062 | 34.061 |
| read batch (500 keys) | 3 | 163.408 | 18.359 | 54.467 | 59.069 | 60.496 | 60.496 | 43.837 | 60.496 |
| updateMany (500) | 3 | 7,195.857 | 0.417 | 2,398.617 | 2,397.101 | 2,406.21 | 2,406.21 | 2,392.539 | 2,406.21 |
| deleteMany (500) | 3 | 7,951.45 | 0.377 | 2,650.481 | 2,603.507 | 2,912.156 | 2,912.156 | 2,435.78 | 2,912.156 |
| deleteWhere (500+ match) | 3 | 36.772 | 81.584 | 12.256 | 11.967 | 12.995 | 12.995 | 11.806 | 12.995 |


### Suite 3: Mixed CRUD Operations

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| Read-heavy mix (70R/15U/10C/5D) | 200 | 29.799 | 6,711.698 | 0.149 | 0.029 | 0.606 | 0.619 | 0.016 | 0.652 |
| Write-heavy mix (20R/15U/50C/15D) | 200 | 41.659 | 4,800.892 | 0.208 | 0.042 | 0.582 | 0.608 | 0.022 | 3.973 |
| Mixed CRUD + queries | 200 | 118.964 | 1,681.186 | 0.594 | 0.051 | 2.065 | 7.636 | 0.013 | 10.791 |
| Cross-entity mix (User.read + Order.create) | 200 | 7.316 | 27,336.962 | 0.036 | 0.03 | 0.069 | 0.081 | 0.021 | 0.091 |


### Suite 4: Mixed Batched CRUD

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| Cycle: createMany -> readAll -> updateMany -> deleteMany (50) | 5 | 66.384 | 75.319 | 13.276 | 13.426 | 17.594 | 17.594 | 10.02 | 17.594 |
| createMany  ->  query filter  ->  deleteMany (50) | 5 | 36.888 | 135.546 | 7.377 | 6.693 | 9.052 | 9.052 | 6.469 | 9.052 |
| 5 waves × createMany(50) + deleteMany(50) | 3 | 249.923 | 12.004 | 83.307 | 85.413 | 85.568 | 85.568 | 78.939 | 85.568 |
| Cross-entity batch: createMany(User) + createMany(Order) + deleteMany (×50) | 3 | 140.09 | 21.415 | 46.696 | 47.77 | 51.181 | 51.181 | 41.137 | 51.181 |


### Suite 5: Transaction Operations

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| tx: single create | 100 | 8.886 | 11,253.788 | 0.089 | 0.073 | 0.178 | 0.228 | 0.07 | 0.253 |
| tx: create 10 users | 100 | 25.153 | 3,975.637 | 0.251 | 0.238 | 0.288 | 0.489 | 0.223 | 0.517 |
| tx: read + update | 100 | 159.349 | 627.553 | 1.593 | 1.525 | 1.63 | 2.939 | 1.499 | 5.745 |
| tx: multi-entity create (User+Order+Session) | 100 | 9.628 | 10,386.133 | 0.096 | 0.087 | 0.128 | 0.189 | 0.081 | 0.23 |
| tx: 10 reads | 100 | 20.01 | 4,997.52 | 0.2 | 0.169 | 0.343 | 0.399 | 0.153 | 0.441 |
| tx: batch create 50 users | 20 | 24.816 | 805.936 | 1.24 | 1.019 | 1.284 | 4.769 | 0.976 | 4.769 |
| tx: query().where().gte() | 100 | 933.212 | 107.157 | 9.331 | 8.393 | 19.189 | 19.988 | 7.73 | 19.998 |
| tx (explicit): begin -> create -> commit | 100 | 6.974 | 14,337.972 | 0.07 | 0.065 | 0.091 | 0.108 | 0.061 | 0.162 |


### Suite 6: Mixed Transactions

| Operation | Ops | Total ms | Ops/s | Avg ms | P50 | P95 | P99 | Min | Max |
|-----------|-----:|---------:|------:|-------:|----:|----:|----:|----:|----:|
| tx mixed: read User  ->  create Order  ->  update User | 100 | 51.695 | 1,934.439 | 0.517 | 0.41 | 0.485 | 0.724 | 0.38 | 10.259 |
| tx mixed: query User + read Order + create Session | 100 | 113.605 | 880.244 | 1.136 | 1.037 | 1.134 | 1.274 | 1.018 | 9.734 |
| tx multi-entity: create User+Order+Session | 100 | 11.079 | 9,025.916 | 0.111 | 0.106 | 0.138 | 0.143 | 0.1 | 0.166 |
| tx batched: create 20 Users + 40 Orders + 20 Sessions | 10 | 22.237 | 449.703 | 2.223 | 1.238 | 11.051 | 11.051 | 1.164 | 11.051 |
| tx mixed: delete old orders  ->  create new orders | 100 | 104.138 | 960.266 | 1.041 | 0.971 | 1.09 | 1.189 | 0.829 | 8.342 |
| tx mixed: count Orders  ->  conditional create | 100 | 9.371 | 10,671.27 | 0.093 | 0.088 | 0.121 | 0.141 | 0.081 | 0.166 |
| tx complex: read User+Orders  ->  aggregate  ->  create Session | 100 | 18.87 | 5,299.428 | 0.188 | 0.15 | 0.223 | 0.288 | 0.135 | 3.002 |

<!-- performance end -->

## Useful Links

- **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)
- **Demos**: https://maifeeulasad.github.io/idb-ts/
- **Live Editor**: https://maifeeulasad.github.io/idb-ts/typescript/
- **Code Coverage report**: https://maifeeulasad.github.io/idb-ts/coverage/lcov-report/

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

Made by [Maifee Ulasad](https://github.com/maifeeulasad) with :heart: and :tea:. Licensed under [MIT](./LICENSE).
