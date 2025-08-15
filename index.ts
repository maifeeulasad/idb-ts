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

interface EntityRepository<T> {
  create(item: T): Promise<void>;
  read(key: string): Promise<T | undefined>;
  update(item: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<T[]>;
  listPaginated(page: number, pageSize: number): Promise<T[]>;
  findByIndex(indexName: string, value: any): Promise<T[]>;
  findOneByIndex(indexName: string, value: any): Promise<T | undefined>;
  count(): Promise<number>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

type DatabaseWithRepositories<T extends Record<string, any>> = Database & T;

class Database {
  private dbName: string;
  private classes: Function[];
  private db: IDBDatabase | null = null;
  private entityRepositories: Map<string, any> = new Map();

  private constructor(dbName: string, classes: Function[]) {
    this.dbName = dbName;
    if (!classes.every(cls => Reflect.getMetadata("dataclass", cls))) {
      throw new Error("All classes should be decorated with @DataClass.");
    }
    this.classes = classes;
  }

  public static async build<T extends Record<string, EntityRepository<any>>>(
    dbName: string,
    classes: Function[]
  ): Promise<DatabaseWithRepositories<T>> {
    const instance = new Database(dbName, classes) as any;
    await instance.initDB();
    instance.generateEntityRepositories();
    return instance as DatabaseWithRepositories<T>;
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        this.classes.forEach((cls) => {
          const keyPathFields = Reflect.getMetadata("keypath", cls) || [];
          const indexFields = Reflect.getMetadata("indexes", cls) || [];

          const storeName = cls.name.toLowerCase();

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

  private generateEntityRepositories(): void {
    this.classes.forEach(cls => {
      const entityName = cls.name;
      const repository = this.createEntityRepository(cls);

      // repo name, internal use
      this.entityRepositories.set(entityName, repository);

      // Dynamically add the repository as a property on the database instance
      Object.defineProperty(this, entityName, {
        value: repository,
        writable: false,
        enumerable: true,
        configurable: false
      });
    });
  }

  private createEntityRepository<T>(cls: Function): EntityRepository<T> {
    return {
      create: async (item: T): Promise<void> => {
        return this.performOperation(cls.name, 'readwrite', (store) => {
          const request = store.add(item);
          return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item added to ${cls.name}:`, item);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      read: async (key: string): Promise<T | undefined> => {
        return this.performOperation(cls.name, 'readonly', (store) => {
          const request = store.get(key);
          return new Promise<T | undefined>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item read from ${cls.name}:`, request.result);
              resolve(request.result as T | undefined);
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      update: async (item: T): Promise<void> => {
        return this.performOperation(cls.name, 'readwrite', (store) => {
          const request = store.put(item);
          return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item updated in ${cls.name}:`, item);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      delete: async (key: string): Promise<void> => {
        return this.performOperation(cls.name, 'readwrite', (store) => {
          const request = store.delete(key);
          return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item deleted from ${cls.name}:`, key);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      list: async (): Promise<T[]> => {
        return this.performOperation(cls.name, 'readonly', (store) => {
          const request = store.getAll();
          return new Promise<T[]>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`All items from ${cls.name}:`, request.result);
              resolve(request.result as T[]);
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      listPaginated: async (page: number, pageSize: number): Promise<T[]> => {
        return this.performOperation(cls.name, 'readonly', (store) => {
          const request = store.getAll();
          return new Promise<T[]>((resolve, reject) => {
            request.onsuccess = () => {
              const items = request.result as T[];
              const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);
              console.debug(`Paginated items from ${cls.name}:`, paginatedItems);
              resolve(paginatedItems);
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      findByIndex: async (indexName: string, value: any): Promise<T[]> => {
        return this.performOperation(cls.name, 'readonly', (store) => {
          if (!store.indexNames.contains(indexName)) {
            throw new Error(`Index '${indexName}' does not exist on ${cls.name}`);
          }

          const index = store.index(indexName);
          const request = index.getAll(value);
          return new Promise<T[]>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Items found by index ${indexName} with value ${value}:`, request.result);
              resolve(request.result as T[]);
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      findOneByIndex: async (indexName: string, value: any): Promise<T | undefined> => {
        return this.performOperation(cls.name, 'readonly', (store) => {
          if (!store.indexNames.contains(indexName)) {
            throw new Error(`Index '${indexName}' does not exist on ${cls.name}`);
          }

          const index = store.index(indexName);
          const request = index.get(value);
          return new Promise<T | undefined>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Item found by index ${indexName} with value ${value}:`, request.result);
              resolve(request.result as T | undefined);
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      count: async (): Promise<number> => {
        return this.performOperation(cls.name, 'readonly', (store) => {
          const request = store.count();
          return new Promise<number>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Count for ${cls.name}:`, request.result);
              resolve(request.result);
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      exists: async (key: string): Promise<boolean> => {
        return this.performOperation(cls.name, 'readonly', (store) => {
          const request = store.count(key);
          return new Promise<boolean>((resolve, reject) => {
            request.onsuccess = () => {
              const exists = request.result > 0;
              console.debug(`Exists check for ${cls.name} with key ${key}:`, exists);
              resolve(exists);
            };
            request.onerror = () => reject(request.error);
          });
        });
      },

      clear: async (): Promise<void> => {
        return this.performOperation(cls.name, 'readwrite', (store) => {
          const request = store.clear();
          return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
              console.debug(`Cleared all items from ${cls.name}`);
              resolve();
            };
            request.onerror = () => reject(request.error);
          });
        });
      }
    };
  }

  private async performOperation<R>(
    className: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<R>
  ): Promise<R> {
    if (!this.db) {
      throw new Error("Database not initialized.");
    }

    const storeName = className.toLowerCase();
    const transaction = this.db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    return operation(store);
  }

  // Legacy methods for backward compatibility
  // will be removed in future versions
  async create<T>(cls: { new(...args: any[]): T }, item: T): Promise<void> {
    const entityName = cls.name.toLowerCase();
    const repository = this.entityRepositories.get(entityName);
    return repository?.create(item);
  }

  async read<T>(cls: { new(...args: any[]): T }, key: string): Promise<T | undefined> {
    const entityName = cls.name.toLowerCase();
    const repository = this.entityRepositories.get(entityName);
    return repository?.read(key);
  }

  async update<T>(cls: { new(...args: any[]): T }, item: T): Promise<void> {
    const entityName = cls.name.toLowerCase();
    const repository = this.entityRepositories.get(entityName);
    return repository?.update(item);
  }

  async delete<T>(cls: { new(...args: any[]): T }, key: string): Promise<void> {
    const entityName = cls.name.toLowerCase();
    const repository = this.entityRepositories.get(entityName);
    return repository?.delete(key);
  }

  async list<T>(cls: { new(...args: any[]): T }): Promise<T[]> {
    const entityName = cls.name.toLowerCase();
    const repository = this.entityRepositories.get(entityName);
    return repository?.list() || [];
  }
  // legacy method implementation ends here

  getAvailableEntities(): string[] {
    return Array.from(this.entityRepositories.keys());
  }
}

export { Database, KeyPath, DataClass, Index, EntityRepository };
export type { DatabaseWithRepositories };