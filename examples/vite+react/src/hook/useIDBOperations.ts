import { useState } from 'react';
import { Database } from 'idb-ts';

const useIDBOperations = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the database with new API
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

  // Create a new item using repository pattern
  const createItem = async <T>(entityClass: Function, item: T) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      await repository.create(item);
    } catch (err) {
      setError(`Failed to create ${entityClass.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Read an item by key using repository pattern
  const readItem = async <T>(entityClass: Function, key: any): Promise<T | undefined> => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const item = await repository.read(key);
      return item;
    } catch (err) {
      setError(`Failed to read ${entityClass.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update an item using repository pattern
  const updateItem = async <T>(entityClass: Function, item: T) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      await repository.update(item);
    } catch (err) {
      setError(`Failed to update ${entityClass.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete an item by key using repository pattern
  const deleteItem = async (entityClass: Function, key: any) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      await repository.delete(key);
    } catch (err) {
      setError(`Failed to delete ${entityClass.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // List all items using repository pattern
  const listItems = async <T>(entityClass: Function): Promise<T[]> => {
    if (!db) {
      setError('Database not initialized');
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const items = await repository.list();
      return items;
    } catch (err) {
      setError(`Failed to list ${entityClass.name}`);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Advanced query operations
  const queryItems = async <T>(entityClass: Function, queryFn: (query: any) => any): Promise<T[]> => {
    if (!db) {
      setError('Database not initialized');
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const query = repository.query();
      const results = await queryFn(query).execute();
      return results;
    } catch (err) {
      setError(`Failed to query ${entityClass.name}`);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Find by index
  const findByIndex = async <T>(entityClass: Function, indexName: string, value: any): Promise<T | undefined> => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const item = await repository.findOneByIndex(indexName, value);
      return item;
    } catch (err) {
      setError(`Failed to find by index in ${entityClass.name}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Find all by index
  const findAllByIndex = async <T>(entityClass: Function, indexName: string, value: any): Promise<T[]> => {
    if (!db) {
      setError('Database not initialized');
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const repository = (db as any)[entityClass.name];
      if (!repository) {
        throw new Error(`Repository for ${entityClass.name} not found`);
      }
      const items = await repository.findByIndex(indexName, value);
      return items;
    } catch (err) {
      setError(`Failed to find all by index in ${entityClass.name}`);
      console.error(err);
      return [];
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
    queryItems,
    findByIndex,
    findAllByIndex,
  };
};

export default useIDBOperations;