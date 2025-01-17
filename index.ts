interface IUser {
  name: string;
  age: number;
  cell?: string;
  address: string;
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
        db.createObjectStore(this.storeName, { keyPath: "name" }); // Assuming 'name' is unique
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

  async createUser(user: IUser): Promise<void> {
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

  async readUser(name: string): Promise<IUser | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readonly");
        const request = store.get(name);

        request.onsuccess = () => {
          console.log("User read:", request.result);
          resolve(request.result);
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

  async updateUser(user: IUser): Promise<void> {
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

  async listUsers(): Promise<IUser[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readonly");
        const request = store.getAll();

        request.onsuccess = () => {
          console.log("All users:", request.result);
          resolve(request.result);
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
    await db.createUser({ name: "Alice", age: 25, address: "123 Main St" });
    await db.createUser({ name: "Bob", age: 30, cell: "123-456-7890", address: "456 Elm St" });

    const alice = await db.readUser("Alice");
    console.log("Read user:", alice);

    await db.updateUser({ name: "Alice", age: 26, address: "789 Maple St" });

    const users = await db.listUsers();
    console.log("All users:", users);

    await db.deleteUser("Bob");
    console.log("User Bob deleted.");

    const remainingUsers = await db.listUsers();
    console.log("Remaining users:", remainingUsers);
  }, 1000);
})();
