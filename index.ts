import 'reflect-metadata';

function KeyPath(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existingKeys: string[] = Reflect.getMetadata("keypath", constructor) || [];
    if (existingKeys.length > 0) {
      throw new Error("Only one keypath can be annotated.");
    }
    Reflect.defineMetadata("keypath", [propertyKey as string], constructor);
  };
}

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

class Database {
  private dbName: string;
  private classes: Function[];
  private db: IDBDatabase | null = null;

  constructor(dbName: string, classes: Function[]) {
    this.dbName = dbName;
    this.classes = classes;
    this.initDB();
  }

  private initDB(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      this.classes.forEach((cls) => {
        const keyPathFields = Reflect.getMetadata("keypath", cls) || [];

        if (keyPathFields.length === 0) {
          throw new Error(`No keypath field defined for the class ${cls.name}.`);
        }

        const storeName = cls.name.toLowerCase() + "s";

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: keyPathFields[0] });
        }
      });
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log(`Database initialized with object stores for: ${this.classes.map(cls => cls.name).join(", " )}`);
    };

    request.onerror = () => {
      console.error("Error initializing database:", request.error);
    };
  }

  private getObjectStore(className: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database not initialized.");
    }
    const storeName = className.toLowerCase() + "s";
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async create<T>(cls: { new (...args: any[]): T }, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore(cls.name, "readwrite");
        const request = store.add(item);

        request.onsuccess = () => {
          console.log(`Item added to ${cls.name}:`, item);
          resolve();
        };

        request.onerror = () => {
          console.error(`Error adding item to ${cls.name}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async read<T>(cls: { new (...args: any[]): T }, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore(cls.name, "readonly");
        const request = store.get(key);

        request.onsuccess = () => {
          console.log(`Item read from ${cls.name}:`, request.result);
          resolve(request.result as T | undefined);
        };

        request.onerror = () => {
          console.error(`Error reading item from ${cls.name}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async update<T>(cls: { new (...args: any[]): T }, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore(cls.name, "readwrite");
        const request = store.put(item);

        request.onsuccess = () => {
          console.log(`Item updated in ${cls.name}:`, item);
          resolve();
        };

        request.onerror = () => {
          console.error(`Error updating item in ${cls.name}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async delete<T>(cls: { new (...args: any[]): T }, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore(cls.name, "readwrite");
        const request = store.delete(key);

        request.onsuccess = () => {
          console.log(`Item deleted from ${cls.name}:`, key);
          resolve();
        };

        request.onerror = () => {
          console.error(`Error deleting item from ${cls.name}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async list<T>(cls: { new (...args: any[]): T }): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore(cls.name, "readonly");
        const request = store.getAll();

        request.onsuccess = () => {
          console.log(`All items from ${cls.name}:`, request.result);
          resolve(request.result as T[]);
        };

        request.onerror = () => {
          console.error(`Error listing items from ${cls.name}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Example usage:
(async () => {
  const db = new Database("AppDB", [User, Location]);

  // Wait for the DB to initialize
  setTimeout(async () => {
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
  }, 1000);
})();
