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

## Useful Links

- **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)
- **Demos**: https://maifeeulasad.github.io/idb-ts/
- **Live Editor**: https://maifeeulasad.github.io/idb-ts/typescript/
- **Code Coverage report**: https://maifeeulasad.github.io/idb-ts/coverage/lcov-report/

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

Made by [Maifee Ulasad](https://github.com/maifeeulasad) with :heart: and :tea:. Licensed under [MIT](./LICENSE).
