import { Database, DataClass, KeyPath, CompositeKeyPath } from '../index';

@DataClass()
class KeyedItem {
  @KeyPath()
  id!: string;

  label!: string;

  constructor(id: string, label: string) {
    this.id = id;
    this.label = label;
  }
}

@DataClass()
@CompositeKeyPath(['userId', 'projectId'])
class Membership {
  userId!: string;
  projectId!: string;

  constructor(userId: string, projectId: string) {
    this.userId = userId;
    this.projectId = projectId;
  }
}

describe('EntityRepository.getKeys', () => {
  let db: any;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('GetKeysTestDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db = await Database.build('GetKeysTestDB', [KeyedItem, Membership]);
  });

  afterAll(() => db.close());

  it('returns an empty array for an empty store', async () => {
    expect(await db.KeyedItem.getKeys()).toEqual([]);
  });

  it('returns only the primary keys, not the records', async () => {
    await db.KeyedItem.create(new KeyedItem('a', 'first'));
    await db.KeyedItem.create(new KeyedItem('b', 'second'));
    await db.KeyedItem.create(new KeyedItem('c', 'third'));

    const keys = await db.KeyedItem.getKeys();
    expect(keys).toEqual(['a', 'b', 'c']);
  });

  it('reflects deletions', async () => {
    await db.KeyedItem.delete('b');
    expect(await db.KeyedItem.getKeys()).toEqual(['a', 'c']);
  });

  it('returns composite keys as arrays', async () => {
    await db.Membership.create(new Membership('u1', 'p1'));
    await db.Membership.create(new Membership('u2', 'p2'));

    const keys = await db.Membership.getKeys();
    expect(keys).toEqual([
      ['u1', 'p1'],
      ['u2', 'p2'],
    ]);
  });
});
