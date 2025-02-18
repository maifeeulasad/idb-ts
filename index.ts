import 'reflect-metadata';

function KeyPath(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    Reflect.defineMetadata("keypath", [propertyKey as string], constructor);
  };
}

function DataClass(): ClassDecorator {
  return (target: Function) => {
    if (!Reflect.getMetadata("keypath", target)) {
      throw new Error(`No keypath field defined for the class ${target.name}.`);
    }
    const keyPathFields = Reflect.getMetadata("keypath", target) || [];
    if (keyPathFields.length > 1) {
      throw new Error(`Only one keypath field can be defined for the class ${target.name}.`);
    }
    Reflect.defineMetadata("dataclass", true, target);
  };
}

class Database {
  private dbName: string;
  private classes: Function[];
  private db: IDBDatabase | null = null;

  private constructor(dbName: string, classes: Function[]) {
    this.dbName = dbName;
    if (!classes.every(cls => Reflect.getMetadata("dataclass", cls))) {
      throw new Error("All classes should be decorated with @DataClass.");
    }
    this.classes = classes;
  }

  static async build(dbName: string, classes: Function[]): Promise<Database> {
    const instance = new Database(dbName, classes);
    await instance.initDB();
    return instance;
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        this.classes.forEach((cls) => {
          const keyPathFields = Reflect.getMetadata("keypath", cls) || [];

          const storeName = cls.name.toLowerCase() + "s";

          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: keyPathFields[0] });
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log(`Database initialized with object stores for: ${this.classes.map(cls => cls.name).join(", ")}`);
        resolve();
      };

      request.onerror = () => {
        console.error("Error initializing database:", request.error);
        reject(request.error);
      };
    });
  }

  private getObjectStore(className: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database not initialized.");
    }
    const storeName = className.toLowerCase() + "s";
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async create<T>(cls: { new(...args: any[]): T }, item: T): Promise<void> {
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

  async read<T>(cls: { new(...args: any[]): T }, key: string): Promise<T | undefined> {
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

  async update<T>(cls: { new(...args: any[]): T }, item: T): Promise<void> {
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

  async delete<T>(cls: { new(...args: any[]): T }, key: string): Promise<void> {
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

  async list<T>(cls: { new(...args: any[]): T }): Promise<T[]> {
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

export { Database, KeyPath, DataClass };