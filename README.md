# idb-ts

## Introduction
Use IndexedDB with TypeScript in a declarative style

## Installation
```
npm i idb-ts
```

## Example

### Declaring entity
```

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

### CRUD on DB
```
const db = await Database.build("idb-crud", [User, Location]);

const alice = new User("Alice", 25, "123 Main St");
const nyc = new Location("1", "New York", "USA");

await db.create(User, alice);
await db.create(Location, nyc);

const readAlice = await db.read(User, "Alice");
console.log("Read user:", readAlice);

alice.age = 26;
alice.address = "789 Maple St";
await db.update(User, alice);

const users = await db.list(User);
console.log("All users:", users);

await db.delete(User, "Alice");
console.log("User Alice deleted.");

const remainingUsers = await db.list(User);
console.log("Remaining users:", remainingUsers);

const locations = await db.list(Location);
console.log("All locations:", locations);
```

## Links
 - GitHub: https://github.com/maifeeulasad/idb-ts
 - NPM: https://www.npmjs.com/package/idb-ts
