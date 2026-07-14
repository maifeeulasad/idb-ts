import { Database, DataClass, KeyPath } from '../index';
import type { SyncAdapter } from '../index';

@DataClass()
class Contact {
  @KeyPath()
  id!: string;

  name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

/** Minimal in-memory adapter standing in for a real backend. */
class MemoryAdapter implements SyncAdapter {
  store = new Map<string, unknown[]>();

  async push(entityName: string, records: unknown[]): Promise<void> {
    this.store.set(entityName, records);
  }

  async pull(entityName: string): Promise<unknown[] | undefined> {
    return this.store.get(entityName);
  }
}

const destroy = (name: string): Promise<void> =>
  new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });

describe('SyncAdapter push/pull', () => {
  beforeAll(async () => {
    await destroy('SyncSourceDB');
    await destroy('SyncTargetDB');
  });

  it('pushTo hands every entity store to the adapter', async () => {
    const db: any = await Database.build('SyncSourceDB', [Contact]);
    await db.Contact.create(new Contact('c1', 'Alice'));
    await db.Contact.create(new Contact('c2', 'Bob'));

    const adapter = new MemoryAdapter();
    await db.pushTo(adapter);

    expect(adapter.store.get('Contact')).toHaveLength(2);
    db.close();
  });

  it('pullFrom applies adapter records into the local database', async () => {
    const adapter = new MemoryAdapter();
    adapter.store.set('Contact', [
      { id: 'c9', name: 'Remote Rita' },
      { id: 'c10', name: 'Remote Rob' },
    ]);

    const db: any = await Database.build('SyncTargetDB', [Contact]);
    await db.pullFrom(adapter);

    expect(await db.Contact.count()).toBe(2);
    expect((await db.Contact.read('c9'))?.name).toBe('Remote Rita');
    db.close();
  });

  it('pullFrom upserts over existing records and skips absent entities', async () => {
    const db: any = await Database.build('SyncTargetDB', [Contact]);

    const adapter = new MemoryAdapter();
    adapter.store.set('Contact', [{ id: 'c9', name: 'Renamed Rita' }]);
    await db.pullFrom(adapter);

    expect((await db.Contact.read('c9'))?.name).toBe('Renamed Rita');
    // c10 remains from the previous pull - pull merges, it does not wipe.
    expect(await db.Contact.count()).toBe(2);

    // An adapter returning undefined for an entity leaves the store alone.
    const emptyAdapter = new MemoryAdapter();
    await db.pullFrom(emptyAdapter);
    expect(await db.Contact.count()).toBe(2);
    db.close();
  });

  it('round-trips between two databases through the adapter', async () => {
    const adapter = new MemoryAdapter();

    const source: any = await Database.build('SyncSourceDB', [Contact]);
    await source.pushTo(adapter);
    source.close();

    await destroy('SyncRoundTripDB');
    const replica: any = await Database.build('SyncRoundTripDB', [Contact]);
    await replica.pullFrom(adapter);

    expect(await replica.Contact.count()).toBe(2);
    expect((await replica.Contact.read('c1'))?.name).toBe('Alice');
    replica.close();
  });
});
