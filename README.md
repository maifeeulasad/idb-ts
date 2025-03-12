# 🚀 idb-ts

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
@DataClass()
class User {
  @KeyPath()
  name: string;
  age: number;
  cell?: string;
  address: string;

  constructor(name: string, age: number, address: string, cell?: string) {
    this.name = name;
    this.age = age;
    this.address = address;
    this.cell = cell;
  }
}

@DataClass()
class Location {
  @KeyPath()
  id: string;
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

const alice = new User("Alice", 25, "123 Main St");
const nyc = new Location("1", "New York", "USA");

await db.create(User, alice);
await db.create(Location, nyc);

const readAlice = await db.read(User, "Alice");
console.log("👤 Read user:", readAlice);

alice.age = 26;
alice.address = "789 Maple St";
await db.update(User, alice);

const users = await db.list(User);
console.log("📋 All users:", users);

await db.delete(User, "Alice");
console.log("❌ User Alice deleted.");

const remainingUsers = await db.list(User);
console.log("🔍 Remaining users:", remainingUsers);

const locations = await db.list(Location);
console.log("🌍 All locations:", locations);
```

---

## 🔗 Useful Links
- 📂 **GitHub**: [maifeeulasad/idb-ts](https://github.com/maifeeulasad/idb-ts)
- 📦 **NPM**: [idb-ts](https://www.npmjs.com/package/idb-ts)

🎉 **Enjoy seamless IndexedDB integration with TypeScript! Happy coding!** 🚀

