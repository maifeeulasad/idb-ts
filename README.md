# 🚀 idb-ts

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
    <img src="https://img.shields.io/github/commits-since/maifeeulasad/idb-ts/latest/main?include_prereleases" alt="Commits after release">
  </a>
</p>


## 📌 Introduction
**idb-ts** is a lightweight, declarative, and type-safe way to work with IndexedDB using TypeScript. Effortlessly perform CRUD operations on your database with clean, structured code! 🔥

## 📦 Installation
Install via npm and start using IndexedDB like a pro! ⚡
```sh
npm i idb-ts
```

## ✨ Features
- ✅ **Declarative & Type-Safe** - Define your data models with decorators.
- ⚡ **Easy CRUD Operations** - Perform create, read, update, and delete seamlessly.
- 🚀 **Fully Typed API** - Benefit from TypeScript’s powerful type system.
- 🏎️ **Performance Optimized** - Minimal overhead with IndexedDB's native capabilities.
- 🔄 **Schema Versioning** - Manage database schema evolution with automatic migration support.
- 🔑 **Advanced Key Management** - Auto-increment, UUID, timestamp, custom generators, and composite keys.

---

## 📖 Example Usage

### 🏗️ Declaring Entities
Use decorators to define your data models. Each class must have exactly one `@KeyPath()` and be decorated with `@DataClass()`.

```typescript
import { Database, DataClass, KeyPath, Index } from "idb-ts";

@DataClass()
class User {
  @KeyPath()
  id!: string;

  @Index()
  email!: string;

  name!: string;
  age!: number;

  constructor(id: string, name: string, age: number, email?: string) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.email = email || `${name.toLowerCase()}@example.com`;
  }
}

@DataClass()
class Location {
  @KeyPath()
  id!: string;

  @Index()
  city!: string;

  country!: string;

  constructor(id: string, city: string, country: string) {
    this.id = id;
    this.city = city;
    this.country = country;
  }
}
```

### 🔄 CRUD Operations
Perform database operations using the repository API:

```typescript
const db = await Database.build("idb-crud", [User, Location]);

const alice = new User("u1", "Alice", 25);
const bob = new User("u2", "Bob", 30);
const nyc = new Location("1", "New York", "USA");
const sf = new Location("2", "San Francisco", "USA");

await db.User.create(alice);
await db.User.create(bob);
await db.Location.create(nyc);
await db.Location.create(sf);

const readAlice = await db.User.read("u1");
console.log("👤 Read user:", readAlice);

alice.age = 26;
await db.User.update(alice);

const users = await db.User.list();
console.log("📋 All users:", users);

// Pagination
const page1 = await db.User.listPaginated(1, 2); // page 1, 2 users per page
console.log("📄 Page 1:", page1);

await db.User.delete("u1");
console.log("❌ User Alice deleted.");

const remainingUsers = await db.User.list();
console.log("🔍 Remaining users:", remainingUsers);

const locations = await db.Location.list();
console.log("🌍 All locations:", locations);
```

### 🔍 Indexing Support
Create indexes on fields for fast querying. Query indexes using the repository API:

```typescript
@DataClass()
class Product {
  @KeyPath()
  id!: string;

  @Index()
  category!: string;

  @Index()
  price!: number;

  name!: string;
  description!: string;

  constructor(id: string, category: string, price: number, name: string, description: string) {
    this.id = id;
    this.category = category;
    this.price = price;
    this.name = name;
    this.description = description;
  }
}

const db = await Database.build("products-db", [Product]);

const electronics = await db.Product.findByIndex('category', 'Electronics');
const expensiveItems = await db.Product.findByIndex('price', 999.99);
const firstElectronic = await db.Product.findOneByIndex('category', 'Electronics');
```

#### Index Methods:
- `findByIndex(indexName, value): Promise<T[]>` - Find all records matching the index value
- `findOneByIndex(indexName, value): Promise<T | undefined>` - Find the first record matching the index value

#### Error Handling
- If you query a non-existent index, an error is thrown:
  ```typescript
  await db.Product.findByIndex('nonexistent', 'value'); // throws
  ```

---

## 🔑 Multi-Field & Composite Key Support

idb-ts provides flexible key management options including auto-increment keys, key generators, and composite keys for complex data relationships.

### Auto-Increment Keys
Perfect for entities where you want the database to automatically generate sequential IDs:

```typescript
@DataClass()
class Task {
  @KeyPath({ autoIncrement: true })
  id!: number;

  title!: string;
  completed!: boolean;

  constructor(title: string, completed = false) {
    this.title = title;
    this.completed = completed;
  }
}

const db = await Database.build("tasks-db", [Task]);

// IDs are automatically generated: 1, 2, 3, etc.
const task1 = await db.Task.create(new Task("Learn TypeScript"));
const task2 = await db.Task.create(new Task("Build amazing apps"));
console.log(task1.id); // 1
console.log(task2.id); // 2
```

### Key Generators
Generate keys automatically using built-in generators:

#### UUID Keys
```typescript
@DataClass()
class Document {
  @KeyPath({ generator: 'uuid' })
  uuid!: string;

  @Index()
  category!: string;

  title!: string;
  content!: string;

  constructor(category: string, title: string, content: string) {
    this.category = category;
    this.title = title;
    this.content = content;
  }
}

const db = await Database.build("docs-db", [Document]);

const doc = await db.Document.create(new Document("tutorial", "Getting Started", "Welcome..."));
console.log(doc.uuid); // e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

#### Timestamp Keys
```typescript
@DataClass()
class Event {
  @KeyPath({ generator: 'timestamp' })
  timestamp!: number;

  @Index()
  type!: string;

  data!: any;

  constructor(type: string, data: any) {
    this.type = type;
    this.data = data;
  }
}

const event = await db.Event.create(new Event("user_login", { userId: "123" }));
console.log(event.timestamp); // e.g., 1696118400000
```

#### Random Keys
```typescript
@DataClass()
class Session {
  @KeyPath({ generator: 'random' })
  sessionId!: string;

  userId!: string;
  expiresAt!: Date;

  constructor(userId: string, expiresAt: Date) {
    this.userId = userId;
    this.expiresAt = expiresAt;
  }
}

const session = await db.Session.create(new Session("user123", new Date()));
console.log(session.sessionId); // e.g., "xyz789abc123"
```

### Custom Key Generators
Create your own key generation logic:

```typescript
@DataClass()
class Invoice {
  @KeyPath({ generator: (entity: any) => `INV-${entity.year}-${String(entity.number).padStart(4, '0')}` })
  invoiceId!: string;

  year!: number;
  number!: number;
  amount!: number;

  constructor(year: number, number: number, amount: number) {
    this.year = year;
    this.number = number;
    this.amount = amount;
  }
}

const invoice = await db.Invoice.create(new Invoice(2024, 1, 1500.00));
console.log(invoice.invoiceId); // "INV-2024-0001"
```

### Composite Keys
Handle many-to-many relationships with composite keys using the `@CompositeKeyPath` decorator:

```typescript
import { CompositeKeyPath } from "idb-ts";

@CompositeKeyPath(['userId', 'projectId'])
@DataClass()
class UserProject {
  userId!: string;
  projectId!: string;

  @Index()
  role!: string;

  joinedAt!: Date;

  constructor(userId: string, projectId: string, role: string) {
    this.userId = userId;
    this.projectId = projectId;
    this.role = role;
    this.joinedAt = new Date();
  }
}

const db = await Database.build("collaboration-db", [UserProject]);

// Create relationships
await db.UserProject.create(new UserProject("user123", "project456", "developer"));
await db.UserProject.create(new UserProject("user123", "project789", "admin"));
await db.UserProject.create(new UserProject("user456", "project456", "viewer"));

// Read with composite key
const relationship = await db.UserProject.read(['user123', 'project456']);
console.log(relationship?.role); // "developer"

// Update relationship
if (relationship) {
  relationship.role = "maintainer";
  await db.UserProject.update(relationship);
}

// Delete with composite key
await db.UserProject.delete(['user123', 'project789']);

// Query by role index
const developers = await db.UserProject.findByIndex('role', 'developer');
```

### Key Generation Utilities
Access key generators directly for your custom logic:

```typescript
import { KeyGenerators } from "idb-ts";

const uuid = KeyGenerators.uuid();        // Generate UUID
const timestamp = KeyGenerators.timestamp(); // Current timestamp
const random = KeyGenerators.random();    // Random string
```

---

## 🔄 Schema Versioning

idb-ts supports schema versioning to manage database evolution over time. Version your entities and let the library handle automatic migration!

### Basic Usage

```typescript
@DataClass({ version: 1 })
class User {
  @KeyPath() id!: string;
  @Index() email!: string;
  name!: string;
}

@DataClass({ version: 2 })
class Post {
  @KeyPath() id!: string;
  @Index() authorId!: string;
  title!: string;
  content!: string;
}

@DataClass({ version: 3 })
class Comment {
  @KeyPath() id!: string;
  @Index() postId!: string;
  @Index() authorId!: string;
  text!: string;
}

// Database version will be 3 (highest entity version)
const db = await Database.build("blog", [User, Post, Comment]);

console.log(db.getDatabaseVersion()); // 3
console.log(db.getEntityVersions()); // Map with entity versions
```

### Key Features

- **Automatic Version Calculation**: Database version = highest entity version
- **Seamless Migration**: Only new/updated entities are processed during upgrades
- **Backward Compatibility**: Entities without version default to version 1
- **Index Evolution**: New indexes are automatically created during migration

### Version Management

```typescript
// Check versions
const dbVersion = db.getDatabaseVersion();
const entityVersions = db.getEntityVersions();
const userVersion = db.getEntityVersion('User');

// Version upgrade flow:
// v1.0: User(v1) → Database v1
// v1.1: User(v1), Post(v2) → Database v2  
// v1.2: User(v1), Post(v2), Comment(v3) → Database v3
```

📖 **[Complete Schema Versioning Guide](./SCHEMA_VERSIONING.md)** - Detailed documentation with examples and best practices.

---

## 🔗 Useful Links
- 📂 **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- 📦 **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)
- Demo: https://maifeeulasad.github.io/idb-ts/
- Code Coverage report: https://maifeeulasad.github.io/idb-ts/coverage/lcov-report/

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

