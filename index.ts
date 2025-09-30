import 'reflect-metadata';

type QueryDirection = 'asc' | 'desc';

interface QueryCondition {
  field: string;
  op: 'equals' | 'gt' | 'gte' | 'lt' | 'lte';
  value: any;
}

class QueryBuilder<T> {
  private db: IDBDatabase;
  private storeName: string;
  private conditions: QueryCondition[] = [];
  private orderField?: string;
  private orderDirection: QueryDirection = 'asc';
  private limitCount?: number;
  private offsetCount?: number;
  private indexName?: string;
  private rangeStart?: any;
  private rangeEnd?: any;
  private currentField?: string;

  constructor(db: IDBDatabase, storeName: string) {
    this.db = db;
    this.storeName = storeName;
  }

  where(field: string) {
    this.currentField = field;
    return this;
  }
  and(field: string) {
    this.currentField = field;
    return this;
  }
  equals(value: any) {
    if (!this.currentField) throw new Error('No field specified for equals');
    this.conditions.push({ field: this.currentField, op: 'equals', value });
    this.currentField = undefined;
    return this;
  }
  gt(value: any) {
    if (!this.currentField) throw new Error('No field specified for gt');
    this.conditions.push({ field: this.currentField, op: 'gt', value });
    this.currentField = undefined;
    return this;
  }
  gte(value: any) {
    if (!this.currentField) throw new Error('No field specified for gte');
    this.conditions.push({ field: this.currentField, op: 'gte', value });
    this.currentField = undefined;
    return this;
  }
  lt(value: any) {
    if (!this.currentField) throw new Error('No field specified for lt');
    this.conditions.push({ field: this.currentField, op: 'lt', value });
    this.currentField = undefined;
    return this;
  }
  lte(value: any) {
    if (!this.currentField) throw new Error('No field specified for lte');
    this.conditions.push({ field: this.currentField, op: 'lte', value });
    this.currentField = undefined;
    return this;
  }
  orderBy(field: string, direction: QueryDirection = 'asc') {
    this.orderField = field;
    this.orderDirection = direction;
    return this;
  }
  limit(n: number) {
    this.limitCount = n;
    return this;
  }
  offset(n: number) {
    this.offsetCount = n;
    return this;
  }
  useIndex(indexName: string) {
    this.indexName = indexName;
    return this;
  }
  range(start: any, end: any) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  async execute(): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      let store = tx.objectStore(this.storeName);
      let request: IDBRequest;
  let results: T[] = [];

      // Index-based query
      if (this.indexName) {
        if (!store.indexNames.contains(this.indexName)) {
          reject(new Error(`Index '${this.indexName}' does not exist on ${this.storeName}`));
          return;
        }
        const index = store.index(this.indexName);
        let keyRange: IDBKeyRange | undefined;
        if (this.rangeStart !== undefined && this.rangeEnd !== undefined) {
          keyRange = IDBKeyRange.bound(this.rangeStart, this.rangeEnd);
        } else if (this.rangeStart !== undefined) {
          keyRange = IDBKeyRange.lowerBound(this.rangeStart);
        } else if (this.rangeEnd !== undefined) {
          keyRange = IDBKeyRange.upperBound(this.rangeEnd);
        }
        request = index.openCursor(keyRange);
      } else {
        request = store.openCursor();
      }

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          let match = true;
          const value = cursor.value as T;
          for (const cond of this.conditions) {
            const val = (value as any)[cond.field];
            switch (cond.op) {
              case 'equals': match = match && val === cond.value; break;
              case 'gt': match = match && val > cond.value; break;
              case 'gte': match = match && val >= cond.value; break;
              case 'lt': match = match && val < cond.value; break;
              case 'lte': match = match && val <= cond.value; break;
            }
          }
          if (match) results.push(value);
          cursor.continue();
        } else {
          // Sorting
          if (this.orderField) {
            results.sort((a, b) => {
              const va = (a as any)[this.orderField!];
              const vb = (b as any)[this.orderField!];
              if (va < vb) return this.orderDirection === 'asc' ? -1 : 1;
              if (va > vb) return this.orderDirection === 'asc' ? 1 : -1;
              return 0;
            });
          }
          // Offset & limit
          if (this.offsetCount !== undefined) results = results.slice(this.offsetCount);
          if (this.limitCount !== undefined) results = results.slice(0, this.limitCount);
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

interface KeyPathOptions {
  autoIncrement?: boolean;
  generator?: 'uuid' | 'timestamp' | 'random' | ((item?: any) => string | number);
}

interface KeyPathMetadata {
  fields: string | string[];
  options?: KeyPathOptions;
}

// Key generation utilities
class KeyGenerators {
  static uuid(): string {
    // Simple UUID v4 implementation without external dependencies
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static timestamp(): number {
    return Date.now();
  }

  static random(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Simplified KeyPath decorator - property decorator with optional options
function KeyPath(options?: KeyPathOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    
    // Track individual property keypaths for validation
    const existingKeypaths = Reflect.getMetadata("individual_keypaths", constructor) || [];
    existingKeypaths.push(propertyKey as string);
    Reflect.defineMetadata("individual_keypaths", existingKeypaths, constructor);
    
    const metadata: KeyPathMetadata = {
      fields: propertyKey as string,
      options: options
    };
    Reflect.defineMetadata("keypath", metadata, constructor);
  };
}

// Separate function for composite keys (class decorator)
function CompositeKeyPath(fields: string[], options?: KeyPathOptions): ClassDecorator {
  return (target: Function) => {
    const metadata: KeyPathMetadata = {
      fields: fields,
      options: options
    };
    Reflect.defineMetadata("keypath", metadata, target);
  };
}

function Index(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existing = Reflect.getMetadata("indexes", constructor) || [];
    Reflect.defineMetadata("indexes", [...existing, propertyKey as string], constructor);
  };
}

interface DataClassOptions {
  version?: number;
}

function DataClass(options: DataClassOptions = {}): ClassDecorator {
  return (target: Function) => {
    const keyPathMetadata = Reflect.getMetadata("keypath", target) as KeyPathMetadata;
    if (!keyPathMetadata) {
      throw new Error(`No keypath field defined for the class ${target.name}.`);
    }
    
    // Check for multiple property-level @KeyPath decorators (which is invalid)
    // This is different from composite keys which are defined at class level
    const individualKeypaths = Reflect.getMetadata("individual_keypaths", target) || [];
    if (individualKeypaths.length > 1) {
      throw new Error(`Only one keypath field can be defined for the class ${target.name}.`);
    }
    
    const version = options.version || 1;
    Reflect.defineMetadata("dataclass", true, target);
    Reflect.defineMetadata("version", version, target);
  };
}

interface EntityRepository<T> {
  create(item: T): Promise<void>;
  read(key: string | string[] | number): Promise<T | undefined>;
  update(item: T): Promise<void>;
  delete(key: string | string[] | number): Promise<void>;
  list(): Promise<T[]>;
  listPaginated(page: number, pageSize: number): Promise<T[]>;
  findByIndex(indexName: string, value: any): Promise<T[]>;
  findOneByIndex(indexName: string, value: any): Promise<T | undefined>;
  count(): Promise<number>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  query(): QueryBuilder<T>;
}

type DatabaseWithRepositories<T extends Record<string, any>> = Database & T;

class Database {
  private dbName: string;
  private classes: Function[];
  private db: IDBDatabase | null = null;
  private entityRepositories: Map<string, any> = new Map();
  private dbVersion: number;

  private constructor(dbName: string, classes: Function[]) {
    this.dbName = dbName;
    if (!classes.every(cls => Reflect.getMetadata("dataclass", cls))) {
      throw new Error("All classes should be decorated with @DataClass.");
    }
    this.classes = classes;
    this.dbVersion = this.calculateDatabaseVersion();
  }

  private calculateDatabaseVersion(): number {
    // Calculate the database version based on the highest schema version
    const versions = this.classes.map(cls => Reflect.getMetadata("version", cls) || 1);
    return Math.max(...versions);
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
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion || this.dbVersion;

        console.debug(`Database upgrade from version ${oldVersion} to ${newVersion}`);

        // Handle schema evolution based on versions
        this.classes.forEach((cls) => {
          const keyPathMetadata = Reflect.getMetadata("keypath", cls) as KeyPathMetadata;
          const indexFields = Reflect.getMetadata("indexes", cls) || [];
          const classVersion = Reflect.getMetadata("version", cls) || 1;

          const storeName = cls.name.toLowerCase();

          // Only create/update stores for classes whose version is greater than the old DB version
          if (classVersion > oldVersion) {
            if (!db.objectStoreNames.contains(storeName)) {
              console.debug(`Creating object store: ${storeName} (version ${classVersion})`);
              
              // Determine store options based on keypath metadata
              const storeOptions: IDBObjectStoreParameters = {};
              
              if (keyPathMetadata) {
                storeOptions.keyPath = keyPathMetadata.fields;
                
                // Handle auto-increment option
                if (keyPathMetadata.options?.autoIncrement) {
                  storeOptions.autoIncrement = true;
                }
              }
              
              const store = db.createObjectStore(storeName, storeOptions);

              indexFields.forEach((indexField: string) => {
                if (!store.indexNames.contains(indexField)) {
                  store.createIndex(indexField, indexField, { unique: false });
                }
              });
            } else {
              // Store exists, check if we need to update indexes
              console.debug(`Updating object store: ${storeName} (version ${classVersion})`);
              const transaction = request.transaction;
              if (transaction) {
                const store = transaction.objectStore(storeName);
                
                indexFields.forEach((indexField: string) => {
                  if (!store.indexNames.contains(indexField)) {
                    console.debug(`Adding index: ${indexField} to ${storeName}`);
                    store.createIndex(indexField, indexField, { unique: false });
                  }
                });
              }
            }
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.debug(`Database initialized (version ${this.dbVersion}) with object stores for: ${this.classes.map(cls => `${cls.name}(v${Reflect.getMetadata("version", cls) || 1})`).join(", ")}`);
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
  const self = this;
  
  // Helper function to generate keys
  const generateKey = (item: T): string | number | undefined => {
    const keyPathMetadata = Reflect.getMetadata("keypath", cls) as KeyPathMetadata;
    if (!keyPathMetadata?.options?.generator) return undefined;
    
    const generator = keyPathMetadata.options.generator;
    
    if (typeof generator === 'function') {
      return generator(item);
    }
    
    switch (generator) {
      case 'uuid':
        return KeyGenerators.uuid();
      case 'timestamp':
        return KeyGenerators.timestamp();
      case 'random':
        return KeyGenerators.random();
      default:
        return undefined;
    }
  };
  
  // Helper function to extract key from item
  const extractKey = (item: T): any => {
    const keyPathMetadata = Reflect.getMetadata("keypath", cls) as KeyPathMetadata;
    if (!keyPathMetadata) return undefined;
    
    const fields = keyPathMetadata.fields;
    
    if (Array.isArray(fields)) {
      // Composite key
      return fields.map(field => (item as any)[field]);
    } else {
      // Single field key
      return (item as any)[fields];
    }
  };
  
  // Helper function to set key on item
  const setKey = (item: T, key: string | number): void => {
    const keyPathMetadata = Reflect.getMetadata("keypath", cls) as KeyPathMetadata;
    if (!keyPathMetadata) return;
    
    const fields = keyPathMetadata.fields;
    
    if (typeof fields === 'string') {
      (item as any)[fields] = key;
    }
    // Note: Composite keys cannot be auto-generated in this simple implementation
  };
  
  return {
      query(): QueryBuilder<T> {
        if (!self.db) throw new Error('Database not initialized.');
        const storeName = cls.name.toLowerCase();
        return new QueryBuilder<T>(self.db, storeName);
      },
      
      create: async (item: T): Promise<void> => {
        // Generate key if needed
        const keyPathMetadata = Reflect.getMetadata("keypath", cls) as KeyPathMetadata;
        if (keyPathMetadata?.options?.generator && !keyPathMetadata.options.autoIncrement) {
          const currentKey = extractKey(item);
          if (currentKey === undefined || currentKey === null || currentKey === '') {
            const generatedKey = generateKey(item);
            if (generatedKey !== undefined) {
              setKey(item, generatedKey);
            }
          }
        }
        
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

      read: async (key: string | string[] | number): Promise<T | undefined> => {
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

      delete: async (key: string | string[] | number): Promise<void> => {
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

  getAvailableEntities(): string[] {
    return Array.from(this.entityRepositories.keys());
  }

  getDatabaseVersion(): number {
    return this.dbVersion;
  }

  getEntityVersions(): Map<string, number> {
    const versions = new Map<string, number>();
    this.classes.forEach(cls => {
      const version = Reflect.getMetadata("version", cls) || 1;
      versions.set(cls.name, version);
    });
    return versions;
  }

  getEntityVersion(entityName: string): number | undefined {
    const cls = this.classes.find(c => c.name === entityName);
    return cls ? (Reflect.getMetadata("version", cls) || 1) : undefined;
  }
}

export { Database, KeyPath, CompositeKeyPath, DataClass, Index, EntityRepository, KeyGenerators };
export type { DatabaseWithRepositories, DataClassOptions, KeyPathOptions, KeyPathMetadata };