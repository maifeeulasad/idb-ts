import 'reflect-metadata';

function KeyPath(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existing = Reflect.getMetadata("keypath", constructor) || [];
    Reflect.defineMetadata("keypath", [...existing, propertyKey as string], constructor);
  };
}

function Index(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existing = Reflect.getMetadata("indexes", constructor) || [];
    Reflect.defineMetadata("indexes", [...existing, propertyKey as string], constructor);
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

  public static async build(dbName: string, classes: Function[]): Promise<Database> {
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
          const indexFields = Reflect.getMetadata("indexes", cls) || [];

          const storeName = cls.name.toLowerCase() + "s";

          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: keyPathFields[0] });
            
            indexFields.forEach((indexField: string) => {
              if (!store.indexNames.contains(indexField)) {
                store.createIndex(indexField, indexField, { unique: false });
              }
            });
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.debug(`Database initialized with object stores for: ${this.classes.map(cls => cls.name).join(", ")}`);
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
      const store = this.getObjectStore(cls.name, "readwrite");
      const request = store.add(item);

      request.onsuccess = () => {
        console.debug(`Item added to ${cls.name}:`, item);
        resolve();
      };

      request.onerror = () => {
        console.error(`Error adding item to ${cls.name}:`, request.error);
        reject(request.error);
      };
    });
  }

  async read<T>(cls: { new(...args: any[]): T }, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(cls.name, "readonly");
      const request = store.get(key);

      request.onsuccess = () => {
        console.debug(`Item read from ${cls.name}:`, request.result);
        resolve(request.result as T | undefined);
      };

      request.onerror = () => {
        console.error(`Error reading item from ${cls.name}:`, request.error);
        reject(request.error);
      };
    });
  }

  async update<T>(cls: { new(...args: any[]): T }, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(cls.name, "readwrite");
      const request = store.put(item);

      request.onsuccess = () => {
        console.debug(`Item updated in ${cls.name}:`, item);
        resolve();
      };

      request.onerror = () => {
        console.error(`Error updating item in ${cls.name}:`, request.error);
        reject(request.error);
      };
    });
  }

  async delete<T>(cls: { new(...args: any[]): T }, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(cls.name, "readwrite");
      const request = store.delete(key);

      request.onsuccess = () => {
        console.debug(`Item deleted from ${cls.name}:`, key);
        resolve();
      };

      request.onerror = () => {
        console.error(`Error deleting item from ${cls.name}:`, request.error);
        reject(request.error);
      };
    });
  }

  async list<T>(cls: { new(...args: any[]): T }): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(cls.name, "readonly");
      const request = store.getAll();

      request.onsuccess = () => {
        console.debug(`All items from ${cls.name}:`, request.result);
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        console.error(`Error listing items from ${cls.name}:`, request.error);
        reject(request.error);
      };
    });
  }

  async listPaginated<T>(cls: { new(...args: any[]): T }, page: number, pageSize: number): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(cls.name, "readonly");
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as T[];
        const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);
        console.debug(`Paginated items from ${cls.name}:`, paginatedItems);
        resolve(paginatedItems);
      };

      request.onerror = () => {
        console.error(`Error listing items from ${cls.name}:`, request.error);
        reject(request.error);
      };
    });
  }

  async findByIndex<T>(cls: { new(...args: any[]): T }, indexName: string, value: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(cls.name, "readonly");
      
      if (!store.indexNames.contains(indexName)) {
        reject(new Error(`Index '${indexName}' does not exist on ${cls.name}`));
        return;
      }

      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        console.debug(`Items found by index ${indexName} with value ${value}:`, request.result);
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        console.error(`Error finding items by index ${indexName}:`, request.error);
        reject(request.error);
      };
    });
  }

  async findOneByIndex<T>(cls: { new(...args: any[]): T }, indexName: string, value: any): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(cls.name, "readonly");
      
      if (!store.indexNames.contains(indexName)) {
        reject(new Error(`Index '${indexName}' does not exist on ${cls.name}`));
        return;
      }

      const index = store.index(indexName);
      const request = index.get(value);

      request.onsuccess = () => {
        console.debug(`Item found by index ${indexName} with value ${value}:`, request.result);
        resolve(request.result as T | undefined);
      };

      request.onerror = () => {
        console.error(`Error finding item by index ${indexName}:`, request.error);
        reject(request.error);
      };
    });
  }
}

export { Database, KeyPath, DataClass, Index };