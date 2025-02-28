import { ref } from 'vue';
import { Database } from 'idb-ts/lib';

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

  const createItem = async <T extends { new (...args: any[]): any }>(cls: T, item: InstanceType<T>) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      await db.value.create(cls, item);
    } catch (err) {
      error.value = `Failed to create ${cls.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const readItem = async <T extends { new (...args: any[]): any }>(cls: T, key: string) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const item = await db.value.read(cls, key);
      return item;
    } catch (err) {
      error.value = `Failed to read ${cls.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async <T extends { new (...args: any[]): any }>(cls: T, item: InstanceType<T>) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      await db.value.update(cls, item);
    } catch (err) {
      error.value = `Failed to update ${cls.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async <T extends { new (...args: any[]): any }>(cls: T, key: string) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      await db.value.delete(cls, key);
    } catch (err) {
      error.value = `Failed to delete ${cls.name}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const listItems = async <T extends { new (...args: any[]): any }>(cls: T) => {
    if (!db.value) {
      error.value = 'Database not initialized';
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const items = await db.value.list(cls);
      return items;
    } catch (err) {
      error.value = `Failed to list ${cls.name}`;
      console.error(err);
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
  };
}