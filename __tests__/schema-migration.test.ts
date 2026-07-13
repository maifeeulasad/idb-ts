import { Database, DataClass, KeyPath, Index } from '../index';

/**
 * Builds a fresh entity class at runtime so the same store name can be
 * redeclared with a different shape between `Database.build` calls -
 * exactly what happens across app releases.
 */
const defineEntity = (
  name: string,
  indexes: string[] = [],
  version = 1,
): any => {
  class Entity {
    id!: string;
    [field: string]: any;
  }

  Object.defineProperty(Entity, 'name', { value: name });
  KeyPath()(Entity.prototype, 'id');
  indexes.forEach((field) => Index()(Entity.prototype, field));
  DataClass({ version })(Entity as any);
  return Entity;
};

const destroyDatabase = (name: string): Promise<void> =>
  new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });

describe('Schema migration lifecycle', () => {
  describe('index added without a version bump', () => {
    const dbName = 'MigrationAddIndexDB';

    beforeAll(() => destroyDatabase(dbName));

    it('creates the new index via drift detection', async () => {
      const V1 = defineEntity('Note', []);
      let db: any = await Database.build(dbName, [V1]);
      await db.Note.create({ id: 'n1', tag: 'idea' });
      db.close();

      const V2 = defineEntity('Note', ['tag']);
      db = await Database.build(dbName, [V2]);

      const matches = await db.Note.findByIndex('tag', 'idea');
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toBe('n1');
      db.close();
    });
  });

  describe('index removed without a version bump', () => {
    const dbName = 'MigrationRemoveIndexDB';

    beforeAll(() => destroyDatabase(dbName));

    it('drops the stale index and preserves the data', async () => {
      const V1 = defineEntity('Doc', ['email']);
      let db: any = await Database.build(dbName, [V1]);
      await db.Doc.create({ id: 'd1', email: 'a@example.com' });

      // Sanity check: index works before removal.
      const before = await db.Doc.findByIndex('email', 'a@example.com');
      expect(before).toHaveLength(1);
      db.close();

      const V2 = defineEntity('Doc', []);
      db = await Database.build(dbName, [V2]);

      await expect(
        db.Doc.findByIndex('email', 'a@example.com'),
      ).rejects.toThrow("Index 'email' does not exist");

      // Records survive the index removal.
      const doc = await db.Doc.read('d1');
      expect(doc?.email).toBe('a@example.com');
      db.close();
    });
  });

  describe('entity version lowered', () => {
    const dbName = 'MigrationDowngradeDB';

    beforeAll(() => destroyDatabase(dbName));

    it('opens at the persisted version instead of throwing VersionError', async () => {
      const High = defineEntity('Item', [], 5);
      let db: any = await Database.build(dbName, [High]);
      expect(db.getDatabaseVersion()).toBe(5);
      await db.Item.create({ id: 'i1', label: 'kept' });
      db.close();

      const Low = defineEntity('Item', [], 2);
      db = await Database.build(dbName, [Low]);

      // IndexedDB cannot downgrade - the persisted version wins.
      expect(db.getDatabaseVersion()).toBe(5);
      const item = await db.Item.read('i1');
      expect(item?.label).toBe('kept');
      db.close();
    });
  });

  describe('orphaned stores', () => {
    const dbName = 'MigrationOrphanDB';

    beforeAll(() => destroyDatabase(dbName));

    it('preserves stores whose entity is no longer registered', async () => {
      const Keep = defineEntity('Kept', []);
      const Drop = defineEntity('Dropped', []);
      let db: any = await Database.build(dbName, [Keep, Drop]);
      await db.Dropped.create({ id: 'x1', payload: 'still-here' });
      db.close();

      // Rebuild without the Dropped entity - its store must survive.
      const KeepAgain = defineEntity('Kept', []);
      db = await Database.build(dbName, [KeepAgain]);
      expect(db.getAvailableEntities()).toEqual(['Kept']);
      db.close();

      // Re-registering the entity finds the original data intact.
      const KeepFinal = defineEntity('Kept', []);
      const DropFinal = defineEntity('Dropped', []);
      db = await Database.build(dbName, [KeepFinal, DropFinal]);
      const record = await db.Dropped.read('x1');
      expect(record?.payload).toBe('still-here');
      db.close();
    });
  });

  describe('stable schema', () => {
    const dbName = 'MigrationStableDB';

    beforeAll(() => destroyDatabase(dbName));

    it('does not bump the version when nothing changed', async () => {
      const V1 = defineEntity('Stable', ['kind'], 3);
      let db: any = await Database.build(dbName, [V1]);
      expect(db.getDatabaseVersion()).toBe(3);
      db.close();

      const V1Again = defineEntity('Stable', ['kind'], 3);
      db = await Database.build(dbName, [V1Again]);
      expect(db.getDatabaseVersion()).toBe(3);
      db.close();
    });
  });
});
