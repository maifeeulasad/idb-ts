import { ref } from 'vue';
import { Database } from 'idb-ts';

export default function useIDBOperations() {
  const db = ref<Database | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const initializeDB = async (dbName: string, classes: Function[]) => {
    loading.value = true;
    error.value = null;
    try {
      const database = await Database.build(dbName, classes);
      db.value = database;
    } catch (err) {
      error.value = 'Failed to initialize database';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createItem = async <T>(entityClass: Function, item: T) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      await repository.create(item);
    } catch (err) {
      error.value = `Failed to create ${entityClass.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const readItem = async <T>(entityClass: Function, key: any): Promise<T | undefined> => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const item = await repository.read(key);
      return item;
    } catch (err) {
      error.value = `Failed to read ${entityClass.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async <T>(entityClass: Function, item: T) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      await repository.update(item);
    } catch (err) {
      error.value = `Failed to update ${entityClass.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (entityClass: Function, key: any) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      await repository.delete(key);
    } catch (err) {
      error.value = `Failed to delete ${entityClass.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const listItems = async <T>(entityClass: Function): Promise<T[]> => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return [];
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const items = await repository.list();
      return items;
    } catch (err) {
      error.value = `Failed to list ${entityClass.name}`;
      console.error(err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const queryItems = async <T>(entityClass: Function, queryFn: (query: any) => any): Promise<T[]> => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return [];
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const query = repository.query();
      const results = await queryFn(query).execute();
      return results;
    } catch (err) {
      error.value = `Failed to query ${entityClass.name}`;
      console.error(err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const findByIndex = async <T>(entityClass: Function, indexName: string, value: any): Promise<T | undefined> => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const item = await repository.findOneByIndex(indexName, value);
      return item;
    } catch (err) {
      error.value = `Failed to find by index in ${entityClass.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const findAllByIndex = async <T>(entityClass: Function, indexName: string, value: any): Promise<T[]> => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return [];
    }
    loading.value = true;
    error.value = null;
    try {
      const repository = (db.value as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const items = await repository.findByIndex(indexName, value);
      return items;
    } catch (err) {
      error.value = `Failed to find all by index in ${entityClass.name}`;
      console.error(err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    db,
    loading,
    error,
    initializeDB,
    createItem,
    readItem,
    updateItem,
    deleteItem,
    listItems,
    queryItems,
    findByIndex,
    findAllByIndex,
  };
}