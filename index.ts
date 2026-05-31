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
  private transaction?: IDBTransaction;
  private conditions: QueryCondition[] = [];
  private orderField?: Extract<keyof T, string>;
  private orderDirection: QueryDirection = 'asc';
  private limitCount?: number;
  private offsetCount?: number;
  private indexName?: string;
  private rangeStart?: any;
  private rangeEnd?: any;
  private currentField?: string;

  constructor(db: IDBDatabase, storeName: string, transaction?: IDBTransaction) {
    this.db = db;
    this.storeName = storeName;
    this.transaction = transaction;
  }

  where(field: Extract<keyof T, string>) {
    this.currentField = field;
    return this;
  }
  and(field: Extract<keyof T, string>) {
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
  orderBy(field: Extract<keyof T, string>, direction: QueryDirection = 'asc') {
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
      const store = this.transaction ? this.transaction.objectStore(this.storeName) : this.db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
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

interface ValidationRule<T = any> {
  field: string;
  predicate: (value: any, item: T) => boolean;
  message: string;
}

interface IndexMetadata {
  field: string;
  options?: IDBIndexParameters;
}

interface RetentionPolicyOptions {
  seconds: number;
  enabled?: boolean;
  field?: string;
}

interface RetentionPolicyMetadata {
  seconds: number;
  enabled: boolean;
  field: string;
}

const INTERNAL_CREATED_AT_FIELD = '__idb_createdAt';
const INTERNAL_UPDATED_AT_FIELD = '__idb_updatedAt';

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
    const existingKeypaths = Reflect.getMetadata('individual_keypaths', constructor) || [];
    existingKeypaths.push(propertyKey as string);
    Reflect.defineMetadata('individual_keypaths', existingKeypaths, constructor);
    
    const metadata: KeyPathMetadata = {
      fields: propertyKey as string,
      options: options
    };
    Reflect.defineMetadata('keypath', metadata, constructor);
  };
}

// Separate function for composite keys (class decorator)
function CompositeKeyPath(fields: string[], options?: KeyPathOptions): ClassDecorator {
  return (target: Function) => {
    const metadata: KeyPathMetadata = {
      fields: fields,
      options: options
    };
    Reflect.defineMetadata('keypath', metadata, target);
  };
}

function Index(options?: IDBIndexParameters): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existing = Reflect.getMetadata('indexes', constructor) || [];
    const nextIndexes = [...existing, { field: propertyKey as string, options } as IndexMetadata];
    Reflect.defineMetadata('indexes', nextIndexes, constructor);
  };
}

function Validate<T = any>(predicate: (value: any, item: T) => boolean, message: string): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existing = Reflect.getMetadata('validators', constructor) || [];
    const nextRules = [...existing, { field: propertyKey as string, predicate, message } as ValidationRule<T>];
    Reflect.defineMetadata('validators', nextRules, constructor);
  };
}

function RetentionPolicy(options: RetentionPolicyOptions): ClassDecorator {
  return (target: Function) => {
    if (!Number.isInteger(options.seconds) || options.seconds <= 0) {
      throw new Error('RetentionPolicy.seconds must be a positive integer.');
    }

    const metadata: RetentionPolicyMetadata = {
      seconds: options.seconds,
      enabled: options.enabled ?? true,
      field: options.field ?? INTERNAL_CREATED_AT_FIELD
    };

    Reflect.defineMetadata('retention_policy', metadata, target);
  };
}

interface DataClassOptions {
  version?: number;
}

function DataClass(options: DataClassOptions = {}): ClassDecorator {
  return (target: Function) => {
    const keyPathMetadata = Reflect.getMetadata('keypath', target) as KeyPathMetadata;
    if (!keyPathMetadata) {
      throw new Error(`No keypath field defined for the class ${target.name}.`);
    }
    
    // Check for multiple property-level @KeyPath decorators (which is invalid)
    // This is different from composite keys which are defined at class level
    const individualKeypaths = Reflect.getMetadata('individual_keypaths', target) || [];
    if (individualKeypaths.length > 1) {
      throw new Error(`Only one keypath field can be defined for the class ${target.name}.`);
    }
    
    const version = options.version || 1;
    Reflect.defineMetadata('dataclass', true, target);
    Reflect.defineMetadata('version', version, target);
  };
}

interface EntityRepository<T> {
  create(item: T): Promise<void>;
  createMany(items: T[]): Promise<void>;
  read(key: string | string[] | number): Promise<T | undefined>;
  update(item: T): Promise<void>;
  updateMany(items: T[]): Promise<void>;
  delete(key: string | string[] | number): Promise<void>;
  deleteMany(keys: Array<string | string[] | number>): Promise<void>;
  deleteWhere(predicate: (query: QueryBuilder<T>) => QueryBuilder<T> | void): Promise<void>;
  list(): Promise<T[]>;
  listPaginated(page: number, pageSize: number): Promise<T[]>;
  findByIndex(indexName: string, value: any): Promise<T[]>;
  findOneByIndex(indexName: string, value: any): Promise<T | undefined>;
  count(): Promise<number>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  query(): QueryBuilder<T>;
}

interface TransactionController {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

type TransactionalDatabase<T extends Record<string, EntityRepository<any>>> = T & TransactionController;

type DatabaseWithRepositories<T extends Record<string, any>> = Database & T;

class Database {
  private dbName: string;
  private classes: Function[];
  private db: IDBDatabase | null = null;
  private entityRepositories: Map<string, any> = new Map();
  private dbVersion: number;
  private retentionTimer: ReturnType<typeof setInterval> | null = null;
  private retentionCleanupRunning = false;
  private retentionPolicies: Array<{ className: string; storeName: string; policy: RetentionPolicyMetadata }>;

  private constructor(dbName: string, classes: Function[]) {
    this.dbName = dbName;
    if (!classes.every(cls => Reflect.getMetadata('dataclass', cls))) {
      throw new Error('All classes should be decorated with @DataClass.');
    }
    this.classes = classes;
    this.dbVersion = this.calculateDatabaseVersion();
    this.retentionPolicies = this.classes
      .map((cls) => {
        const policy = Reflect.getMetadata('retention_policy', cls) as RetentionPolicyMetadata | undefined;
        if (!policy?.enabled) {
          return null;
        }

        return {
          className: cls.name,
          storeName: cls.name.toLowerCase(),
          policy
        };
      })
      .filter((policy): policy is { className: string; storeName: string; policy: RetentionPolicyMetadata } => policy !== null);
  }

  private calculateDatabaseVersion(): number {
    // Calculate the database version based on the highest schema version
    const versions = this.classes.map(cls => Reflect.getMetadata('version', cls) || 1);
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
          const keyPathMetadata = Reflect.getMetadata('keypath', cls) as KeyPathMetadata;
          const indexFields = Reflect.getMetadata('indexes', cls) || [];
          const classVersion = Reflect.getMetadata('version', cls) || 1;

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

              indexFields.forEach((indexField: string | IndexMetadata) => {
                const indexName = typeof indexField === 'string' ? indexField : indexField.field;
                const indexOptions = typeof indexField === 'string'
                  ? { unique: false }
                  : (indexField.options ?? { unique: false });

                if (!store.indexNames.contains(indexName)) {
                  store.createIndex(indexName, indexName, indexOptions);
                }
              });
            } else {
              // Store exists, check if we need to update indexes
              console.debug(`Updating object store: ${storeName} (version ${classVersion})`);
              const transaction = request.transaction;
              if (transaction) {
                const store = transaction.objectStore(storeName);
                
                indexFields.forEach((indexField: string | IndexMetadata) => {
                  const indexName = typeof indexField === 'string' ? indexField : indexField.field;
                  const indexOptions = typeof indexField === 'string'
                    ? { unique: false }
                    : (indexField.options ?? { unique: false });

                  if (!store.indexNames.contains(indexName)) {
                    console.debug(`Adding index: ${indexName} to ${storeName}`);
                    store.createIndex(indexName, indexName, indexOptions);
                  }
                });
              }
            }
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.debug(`Database initialized (version ${this.dbVersion}) with object stores for: ${this.classes.map(cls => `${cls.name}(v${Reflect.getMetadata('version', cls) || 1})`).join(', ')}`);
        this.startRetentionCleanup();
        resolve();
      };

      request.onerror = () => {
        console.error('Error initializing database:', request.error);
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

  private calculateRetentionCleanupIntervalMs(): number | undefined {
    if (!this.retentionPolicies.length) {
      return undefined;
    }

    const gcd = (left: number, right: number): number => {
      let a = left;
      let b = right;
      while (b !== 0) {
        const remainder = a % b;
        a = b;
        b = remainder;
      }
      return Math.abs(a);
    };

    const seconds = this.retentionPolicies.map(({ policy }) => policy.seconds);
    return seconds.reduce((accumulator, value) => gcd(accumulator, value)) * 1000;
  }

  private startRetentionCleanup(): void {
    const cleanupIntervalMs = this.calculateRetentionCleanupIntervalMs();
    if (!cleanupIntervalMs || !this.db || this.retentionTimer) {
      return;
    }

    console.debug(`Retention cleanup enabled for ${this.retentionPolicies.length} entities every ${cleanupIntervalMs}ms`);
    void this.runRetentionCleanup();
    this.retentionTimer = setInterval(() => {
      void this.runRetentionCleanup();
    }, cleanupIntervalMs);
  }

  private async runRetentionCleanup(): Promise<void> {
    if (!this.db || this.retentionCleanupRunning || !this.retentionPolicies.length) {
      return;
    }

    this.retentionCleanupRunning = true;
    try {
      console.debug('Retention cleanup tick started');
      for (const { storeName, className, policy } of this.retentionPolicies) {
        await this.cleanupExpiredRecords(storeName, className, policy);
      }
      console.debug('Retention cleanup tick finished');
    } finally {
      this.retentionCleanupRunning = false;
    }
  }

  private cleanupExpiredRecords(
    storeName: string,
    className: string,
    policy: RetentionPolicyMetadata
  ): Promise<void> {
    if (!this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const cutoff = Date.now() - (policy.seconds * 1000);
        const request = store.openCursor();

        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            return;
          }

          const value = cursor.value as Record<string, any>;
          const timestamp = value?.[policy.field];
          console.debug(`Retention cleanup inspecting ${className}.${policy.field}:`, timestamp, 'cutoff:', cutoff);
          if (typeof timestamp === 'number' && timestamp <= cutoff) {
            const deleteRequest = cursor.delete();
            deleteRequest.onsuccess = () => {
              console.debug(`Retention cleanup removed expired record from ${className}`);
              cursor.continue();
            };
            deleteRequest.onerror = () => reject(deleteRequest.error ?? new Error(`Retention cleanup delete failed for ${className}`));
            return;
          }

          cursor.continue();
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error(`Retention cleanup failed for ${className}`));
        transaction.onabort = () => reject(transaction.error ?? new Error(`Retention cleanup aborted for ${className}`));
      } catch (error) {
        reject(error);
      }
    });
  }

  private createEntityRepository<T>(cls: Function, transaction?: IDBTransaction): EntityRepository<T> {
    const self = this;
    const creationTimestampField = INTERNAL_CREATED_AT_FIELD;
    const updateTimestampField = INTERNAL_UPDATED_AT_FIELD;
    const validators = (Reflect.getMetadata('validators', cls) || []) as ValidationRule<T>[];

    const validateItem = (item: T): void => {
      const failures: string[] = [];

      validators.forEach((rule) => {
        const value = (item as any)[rule.field];
        let valid = false;

        try {
          valid = rule.predicate(value, item);
        } catch {
          valid = false;
        }

        if (!valid) {
          failures.push(`${rule.field}: ${rule.message}`);
        }
      });

      if (failures.length) {
        throw new Error(`Validation failed for ${cls.name}: ${failures.join('; ')}`);
      }
    };

    const generateKey = (item: T): string | number | undefined => {
      const keyPathMetadata = Reflect.getMetadata('keypath', cls) as KeyPathMetadata;
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

    const applyTimestampFields = (item: T, existingItem?: T): void => {
      const now = Date.now();
      const existingCreationValue = existingItem ? (existingItem as any)[creationTimestampField] : undefined;

      (item as any)[creationTimestampField] = existingCreationValue !== undefined ? existingCreationValue : now;
      (item as any)[updateTimestampField] = now;
    };

    const readExistingItem = (store: IDBObjectStore, key: string | string[] | number): Promise<T | undefined> => {
      return new Promise<T | undefined>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      });
    };

    const createStoredItem = (store: IDBObjectStore, item: T): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const request = store.add(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    const updateStoredItem = async (store: IDBObjectStore, item: T): Promise<void> => {
      const key = extractKey(item);

      let existingItem: T | undefined;
      if (key !== undefined && key !== null) {
        existingItem = await readExistingItem(store, key);
      }

      applyTimestampFields(item, existingItem);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    const deleteStoredItem = (store: IDBObjectStore, key: string | string[] | number): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

  // Helper function to extract key from item
    const extractKey = (item: T): any => {
      const keyPathMetadata = Reflect.getMetadata('keypath', cls) as KeyPathMetadata;
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
      const keyPathMetadata = Reflect.getMetadata('keypath', cls) as KeyPathMetadata;
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
        return new QueryBuilder<T>(self.db, storeName, transaction);
      },

      create: async (item: T): Promise<void> => {
        // Generate key if needed
        const keyPathMetadata = Reflect.getMetadata('keypath', cls) as KeyPathMetadata;
        if (keyPathMetadata?.options?.generator && !keyPathMetadata.options.autoIncrement) {
          const currentKey = extractKey(item);
          if (currentKey === undefined || currentKey === null || currentKey === '') {
            const generatedKey = generateKey(item);
            if (generatedKey !== undefined) {
              setKey(item, generatedKey);
            }
          }
        }

        validateItem(item);
        applyTimestampFields(item);

        return this.performOperation(cls.name, 'readwrite', (store) => {
          return createStoredItem(store, item).then(() => {
            console.debug(`Item added to ${cls.name}:`, item);
          });
        }, transaction);
      },

      createMany: async (items: T[]): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        for (const item of items) {
          await repository.create(item);
        }
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
        }, transaction);
      },

      update: async (item: T): Promise<void> => {
        validateItem(item);

        return this.performOperation(cls.name, 'readwrite', (store) => {
          return updateStoredItem(store, item).then(() => {
            console.debug(`Item updated in ${cls.name}:`, item);
          });
        }, transaction);
      },

      updateMany: async (items: T[]): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        for (const item of items) {
          await repository.update(item);
        }
      },

      delete: async (key: string | string[] | number): Promise<void> => {
        return this.performOperation(cls.name, 'readwrite', (store) => {
          return deleteStoredItem(store, key).then(() => {
            console.debug(`Item deleted from ${cls.name}:`, key);
          });
        }, transaction);
      },

      deleteMany: async (keys: Array<string | string[] | number>): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        for (const key of keys) {
          await repository.delete(key);
        }
      },

      deleteWhere: async (predicate: (query: QueryBuilder<T>) => QueryBuilder<T> | void): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        const query = repository.query();
        const resolvedQuery = predicate(query) ?? query;
        const matches = await resolvedQuery.execute();
        const keys = matches
          .map((item) => extractKey(item))
          .filter((key): key is string | string[] | number => key !== undefined && key !== null);

        await repository.deleteMany(keys);
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
        }, transaction);
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
        }, transaction);
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
        }, transaction);
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
        }, transaction);
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
        }, transaction);
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
        }, transaction);
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
        }, transaction);
      }
    };
  }

  private async performOperation<R>(
    className: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<R>,
    transaction?: IDBTransaction
  ): Promise<R> {
    if (!this.db && !transaction) {
      throw new Error('Database not initialized.');
    }

    const storeName = className.toLowerCase();
    const activeTransaction = transaction ?? this.db!.transaction(storeName, mode);
    const store = activeTransaction.objectStore(storeName);

    return operation(store);
  }

  private createTransactionHandle(entityNames: string[], mode: IDBTransactionMode): TransactionalDatabase<Record<string, EntityRepository<any>>> {
    if (!this.db) {
      throw new Error('Database not initialized.');
    }

    const uniqueEntityNames = [...new Set(entityNames)];
    const storeNames = uniqueEntityNames.map((entityName) => {
      const entityClass = this.classes.find((cls) => cls.name === entityName);
      if (!entityClass) {
        throw new Error(`Entity '${entityName}' is not registered in ${this.dbName}.`);
      }

      return entityClass.name.toLowerCase();
    });

    const nativeTransaction = this.db.transaction(storeNames, mode);
    let rollbackRequested = false;

    const completion = new Promise<void>((resolve, reject) => {
      nativeTransaction.oncomplete = () => resolve();
      nativeTransaction.onabort = () => {
        if (rollbackRequested) {
          resolve();
          return;
        }

        reject(nativeTransaction.error ?? new Error('Transaction aborted.'));
      };
      nativeTransaction.onerror = () => {
        if (rollbackRequested) {
          resolve();
          return;
        }

        reject(nativeTransaction.error ?? new Error('Transaction failed.'));
      };
    });

    const handle = {} as TransactionalDatabase<Record<string, EntityRepository<any>>>;
    uniqueEntityNames.forEach((entityName) => {
      const entityClass = this.classes.find((cls) => cls.name === entityName);
      if (entityClass) {
        handle[entityName] = this.createEntityRepository(entityClass, nativeTransaction);
      }
    });

    handle.commit = async () => {
      if (typeof nativeTransaction.commit === 'function') {
        nativeTransaction.commit();
      }

      await completion;
    };

    handle.rollback = async () => {
      rollbackRequested = true;
      try {
        nativeTransaction.abort();
      } catch {
        // Ignore abort errors after the transaction has already settled.
      }

      await completion.catch(() => undefined);
    };

    return handle;
  }

  public async beginTransaction(entityNames: string[], mode: IDBTransactionMode = 'readwrite'): Promise<TransactionalDatabase<Record<string, EntityRepository<any>>>> {
    return this.createTransactionHandle(entityNames, mode);
  }

  public async transaction<T>(callback: (tx: TransactionalDatabase<Record<string, EntityRepository<any>>>) => Promise<T> | T): Promise<T> {
    const tx = this.createTransactionHandle(this.classes.map((cls) => cls.name), 'readwrite');

    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  close(): void {
    if (this.retentionTimer) {
      clearInterval(this.retentionTimer);
      this.retentionTimer = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }
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
      const version = Reflect.getMetadata('version', cls) || 1;
      versions.set(cls.name, version);
    });
    return versions;
  }

  getEntityVersion(entityName: string): number | undefined {
    const cls = this.classes.find(c => c.name === entityName);
    return cls ? (Reflect.getMetadata('version', cls) || 1) : undefined;
  }
}

export { Database, KeyPath, CompositeKeyPath, DataClass, Index, Validate, RetentionPolicy, EntityRepository, KeyGenerators };
export type { DatabaseWithRepositories, DataClassOptions, KeyPathOptions, KeyPathMetadata, RetentionPolicyOptions, RetentionPolicyMetadata };