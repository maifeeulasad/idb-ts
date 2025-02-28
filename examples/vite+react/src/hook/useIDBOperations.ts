import { useState } from 'react';
import { Database } from 'idb-ts/lib';

const useIDBOperations = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the database
  const initializeDB = async (dbName: string, classes: Function[]) => {
    setLoading(true);
    setError(null);
    try {
      const database = await Database.build(dbName, classes);
      setDb(database);
    } catch (err) {
      setError('Failed to initialize database');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new item
  const createItem = async <T extends { new (...args: any[]): any }>(cls: T, item: InstanceType<T>) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await db.create(cls, item);
    } catch (err) {
      setError(`Failed to create ${cls.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Read an item by key
  const readItem = async <T extends { new (...args: any[]): any }>(cls: T, key: string) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const item = await db.read(cls, key);
      return item;
    } catch (err) {
      setError(`Failed to read ${cls.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update an item
  const updateItem = async <T extends { new (...args: any[]): any }>(cls: T, item: InstanceType<T>) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await db.update(cls, item);
    } catch (err) {
      setError(`Failed to update ${cls.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete an item by key
  const deleteItem = async <T extends { new (...args: any[]): any }>(cls: T, key: string) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await db.delete(cls, key);
    } catch (err) {
      setError(`Failed to delete ${cls.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // List all items
  const listItems = async <T extends { new (...args: any[]): any }>(cls: T) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await db.list(cls);
      return items;
    } catch (err) {
      setError(`Failed to list ${cls.name}`);
      console.error(err);
    } finally {
      setLoading(false);
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
};

export default useIDBOperations;