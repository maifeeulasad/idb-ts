import { Database, KeyPath, DataClass, RetentionPolicy } from '../index';

@DataClass()
@RetentionPolicy({ seconds: 2 })
class ShortRetentionEntry {
  @KeyPath()
  id!: string;

  payload!: string;

  constructor(id: string, payload: string) {
    this.id = id;
    this.payload = payload;
  }
}

@DataClass()
@RetentionPolicy({ seconds: 5 })
class LongRetentionEntry {
  @KeyPath()
  id!: string;

  payload!: string;

  constructor(id: string, payload: string) {
    this.id = id;
    this.payload = payload;
  }
}

describe('Retention policy cleanup', () => {
  let db: any;

  jest.setTimeout(10000);

  beforeAll(async () => {
    const deleteRequest = indexedDB.deleteDatabase('RetentionPolicyDB');
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
    });

    db = await Database.build('RetentionPolicyDB', [
      ShortRetentionEntry,
      LongRetentionEntry,
    ]);
  });

  afterAll(() => {
    db?.close?.();
  });

  it('should cleanup old data with one periodic hook across repositories', async () => {
    await db.ShortRetentionEntry.create(
      new ShortRetentionEntry('short-1', 'batch-1'),
    );
    await db.LongRetentionEntry.create(
      new LongRetentionEntry('long-1', 'batch-1'),
    );

    await new Promise((resolve) => setTimeout(resolve, 3100));

    const afterFirstWaitShort = await db.ShortRetentionEntry.list();
    const afterFirstWaitLong = await db.LongRetentionEntry.list();

    expect(afterFirstWaitShort).toHaveLength(0);
    expect(afterFirstWaitLong).toHaveLength(1);
    expect(afterFirstWaitLong[0].id).toBe('long-1');

    await db.ShortRetentionEntry.create(
      new ShortRetentionEntry('short-2', 'batch-2'),
    );
    await db.LongRetentionEntry.create(
      new LongRetentionEntry('long-2', 'batch-2'),
    );

    await new Promise((resolve) => setTimeout(resolve, 3300));

    const afterSecondWaitShort = await db.ShortRetentionEntry.list();
    const afterSecondWaitLong = await db.LongRetentionEntry.list();

    expect(afterSecondWaitShort).toHaveLength(0);
    expect(afterSecondWaitLong).toHaveLength(1);
    expect(afterSecondWaitLong[0].id).toBe('long-2');
  });
});
