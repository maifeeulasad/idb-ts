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

## 🔗 Useful Links
- 📂 **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- 📦 **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)
- Demo: https://maifeeulasad.github.io/idb-ts/
- Code Coverage report: https://maifeeulasad.github.io/idb-ts/coverage/lcov-report/

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

