import 'reflect-metadata';


interface UniqueFieldMetadata {
  keyPath: string;
}

function Unique(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existingKeys: string[] = Reflect.getMetadata("unique", constructor) || [];
    Reflect.defineMetadata("unique", [...existingKeys, propertyKey as string], constructor);
  };
}

class User {
  @Unique()
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

class UserDatabase {
  private dbName = "UserDB";
  private storeName = "users";
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const uniqueFields = Reflect.getMetadata("unique", User) || [];

        if (uniqueFields.length === 0) {
          throw new Error("No unique field defined for the object store.");
        }

        db.createObjectStore(this.storeName, { keyPath: uniqueFields[0] });
      }
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log("Database initialized.");
    };

    request.onerror = (event) => {
      console.error("Error initializing database:", request.error);
    };
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database not initialized.");
    }
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  async createUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readwrite");
        const request = store.add(user);

        request.onsuccess = () => {
          console.log("User added:", user);
          resolve();
        };

        request.onerror = () => {
          console.error("Error adding user:", request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async readUser(name: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readonly");
        const request = store.get(name);

        request.onsuccess = () => {
          console.log("User read:", request.result);
          resolve(request.result as User | undefined);
        };

        request.onerror = () => {
          console.error("Error reading user:", request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readwrite");
        const request = store.put(user);

        request.onsuccess = () => {
          console.log("User updated:", user);
          resolve();
        };

        request.onerror = () => {
          console.error("Error updating user:", request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteUser(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readwrite");
        const request = store.delete(name);

        request.onsuccess = () => {
          console.log("User deleted:", name);
          resolve();
        };

        request.onerror = () => {
          console.error("Error deleting user:", request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async listUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readonly");
        const request = store.getAll();

        request.onsuccess = () => {
          console.log("All users:", request.result);
          resolve(request.result as User[]);
        };

        request.onerror = () => {
          console.error("Error listing users:", request.error);
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
  const db = new UserDatabase();

  // Wait for the DB to initialize
  setTimeout(async () => {
    const alice = new User("Alice", 25, "123 Main St");
    const bob = new User("Bob", 30, "456 Elm St", "123-456-7890");

    await db.createUser(alice);
    await db.createUser(bob);

    const readAlice = await db.readUser("Alice");
    console.log("Read user:", readAlice);

    alice.age = 26;
    alice.address = "789 Maple St";
    await db.updateUser(alice);

    const users = await db.listUsers();
    console.log("All users:", users);

    await db.deleteUser("Bob");
    console.log("User Bob deleted.");

    const remainingUsers = await db.listUsers();
    console.log("Remaining users:", remainingUsers);
  }, 1000);
})();
