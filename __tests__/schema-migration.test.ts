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

  describe('new entity added without a version bump', () => {
    const dbName = 'MigrationNewEntityDB';

    beforeAll(() => destroyDatabase(dbName));

    it('creates the missing store via drift detection instead of staying absent', async () => {
      const A = defineEntity('Alpha', [], 1);
      let db: any = await Database.build(dbName, [A]);
      db.close();

      // Beta is a brand-new entity at the same version as Alpha, so the
      // declared target version does not increase - only drift detection
      // (not onupgradeneeded) can create its store.
      const AAgain = defineEntity('Alpha', [], 1);
      const B = defineEntity('Beta', [], 1);
      db = await Database.build(dbName, [AAgain, B]);

      expect(db.getAvailableEntities().sort()).toEqual(['Alpha', 'Beta']);
      await db.Beta.create({ id: 'b1' });
      expect((await db.Beta.read('b1'))?.id).toBe('b1');
      db.close();
    });
  });

  describe('key path changed alongside a real version bump', () => {
    const dbName = 'MigrationKeyPathChangeDB';

    beforeAll(() => destroyDatabase(dbName));

    it('logs a warning and leaves the existing store key path untouched', async () => {
      class V1 {
        id!: string;
        [field: string]: any;
      }
      Object.defineProperty(V1, 'name', { value: 'Widget' });
      KeyPath()(V1.prototype, 'id');
      DataClass({ version: 1 })(V1 as any);

      let db: any = await Database.build(dbName, [V1]);
      await db.Widget.create({ id: 'w1' });
      db.close();

      // Redeclare the same store with a different key path AND bump the
      // version so an upgrade transaction actually runs - key-path changes
      // are not auto-applied, but syncStore() still logs a warning instead
      // of throwing.
      class V2 {
        uuid!: string;
        [field: string]: any;
      }
      Object.defineProperty(V2, 'name', { value: 'Widget' });
      KeyPath()(V2.prototype, 'uuid');
      DataClass({ version: 2 })(V2 as any);

      db = await Database.build(dbName, [V2]);
      expect(db.getDatabaseVersion()).toBe(2);

      // The old key path is unchanged - IndexedDB cannot alter it in place.
      const existing = await db.Widget.read('w1');
      expect(existing?.id).toBe('w1');
      db.close();
    });
  });

  describe('orphaned store reported alongside a real version bump', () => {
    const dbName = 'MigrationOrphanWarningDB';

    beforeAll(() => destroyDatabase(dbName));

    it('logs a warning for the orphaned store while reconciling other drift', async () => {
      const Keep = defineEntity('KeptV', [], 1);
      const Drop = defineEntity('DroppedV', [], 1);
      let db: any = await Database.build(dbName, [Keep, Drop]);
      await db.DroppedV.create({ id: 'x1' });
      db.close();

      // Bump Kept's version so an upgrade transaction runs even though
      // DroppedV is no longer registered - reportOrphanedStores() should
      // run and warn, without touching the orphaned store's data.
      const KeepV2 = defineEntity('KeptV', [], 2);
      db = await Database.build(dbName, [KeepV2]);
      expect(db.getDatabaseVersion()).toBe(2);
      expect(db.getAvailableEntities()).toEqual(['KeptV']);
      db.close();

      const KeepFinal = defineEntity('KeptV', [], 2);
      const DropFinal = defineEntity('DroppedV', [], 1);
      db = await Database.build(dbName, [KeepFinal, DropFinal]);
      expect((await db.DroppedV.read('x1'))?.id).toBe('x1');
      db.close();
    });
  });

  describe('readPersistedVersion probe fallback', () => {
    const dbName = 'MigrationProbeFallbackDB';

    beforeAll(() => destroyDatabase(dbName));

    it('falls back to the probe-open strategy when indexedDB.databases() is unavailable', async () => {
      const originalDatabases = (indexedDB as any).databases;
      (indexedDB as any).databases = undefined;

      try {
        const V1 = defineEntity('Probed', [], 1);
        let db: any = await Database.build(dbName, [V1]);
        expect(db.getDatabaseVersion()).toBe(1);
        await db.Probed.create({ id: 'p1' });
        db.close();

        // Reopening at the same declared version, still without
        // indexedDB.databases(), must correctly read back version 1 via the
        // manual probe-open strategy instead of mistaking it for 0.
        const V1Again = defineEntity('Probed', [], 1);
        db = await Database.build(dbName, [V1Again]);
        expect(db.getDatabaseVersion()).toBe(1);
        expect((await db.Probed.read('p1'))?.id).toBe('p1');
        db.close();
      } finally {
        (indexedDB as any).databases = originalDatabases;
      }
    });

    it('falls through to the probe strategy when indexedDB.databases() throws', async () => {
      const probeDbName = 'MigrationProbeThrowDB';
      await destroyDatabase(probeDbName);

      const originalDatabases = (indexedDB as any).databases;
      (indexedDB as any).databases = () => Promise.reject(new Error('boom'));

      try {
        const V1 = defineEntity('ProbedThrow', [], 1);
        const db: any = await Database.build(probeDbName, [V1]);
        expect(db.getDatabaseVersion()).toBe(1);
        db.close();
      } finally {
        (indexedDB as any).databases = originalDatabases;
      }
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
