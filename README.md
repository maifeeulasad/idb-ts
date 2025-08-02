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
Use decorators to define your data models with automatic schema management.

```typescript
import { Database, DataClass, KeyPath, Index } from "idb-ts";

@DataClass()
class User {
  @KeyPath()
  name: string;
  
  @Index()
  email: string;
  
  age: number;
  cell?: string;
  address: string;

  constructor(name: string, email: string, age: number, address: string, cell?: string) {
    this.name = name;
    this.email = email;
    this.age = age;
    this.address = address;
    this.cell = cell;
  }
}

@DataClass()
class Location {
  @KeyPath()
  id: string;
  
  @Index()
  city: string;
  
  country: string;

  constructor(id: string, city: string, country: string) {
    this.id = id;
    this.city = city;
    this.country = country;
  }
}
```

### 🔄 CRUD Operations
Perform database operations in an intuitive way:

```typescript
const db = await Database.build("idb-crud", [User, Location]);

const alice = new User("Alice", "alice@example.com", 25, "123 Main St");
const bob = new User("Bob", "bob@example.com", 30, "456 Oak Ave");
const nyc = new Location("1", "New York", "USA");
const sf = new Location("2", "San Francisco", "USA");

await db.create(User, alice);
await db.create(User, bob);
await db.create(Location, nyc);
await db.create(Location, sf);

const readAlice = await db.read(User, "Alice");
console.log("👤 Read user:", readAlice);

alice.age = 26;
alice.address = "789 Maple St";
await db.update(User, alice);

const users = await db.list(User);
console.log("📋 All users:", users);

const userByEmail = await db.findOneByIndex(User, 'email', 'bob@example.com');
console.log("🔎 User by email:", userByEmail);

const locationsInSF = await db.findByIndex(Location, 'city', 'San Francisco');
console.log("🌆 Locations in San Francisco:", locationsInSF);

await db.delete(User, "Alice");
console.log("❌ User Alice deleted.");

const remainingUsers = await db.list(User);
console.log("🔍 Remaining users:", remainingUsers);

const locations = await db.list(Location);
console.log("🌍 All locations:", locations);
```

### 🔍 Indexing Support
Create indexes on fields for fast querying:

```typescript
@DataClass()
class Product {
  @KeyPath()
  id: string;
  
  @Index()
  category: string;
  
  @Index()
  price: number;
  
  name: string;
  description: string;

  constructor(id: string, category: string, price: number, name: string, description: string) {
    this.id = id;
    this.category = category;
    this.price = price;
    this.name = name;
    this.description = description;
  }
}

const db = await Database.build("products-db", [Product]);

const electronics = await db.findByIndex(Product, 'category', 'Electronics');

const expensiveItems = await db.findByIndex(Product, 'price', 999.99);

const firstElectronic = await db.findOneByIndex(Product, 'category', 'Electronics');
```

#### Index Methods:
- `findByIndex<T>(cls, indexName, value): Promise<T[]>` - Find all records matching the index value
- `findOneByIndex<T>(cls, indexName, value): Promise<T | undefined>` - Find the first record matching the index value

---

## 🔗 Useful Links
- 📂 **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- 📦 **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)
- Demo: https://maifeeulasad.github.io/idb-ts/
- Code Coverage report: https://maifeeulasad.github.io/idb-ts/coverage/lcov-report/

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

