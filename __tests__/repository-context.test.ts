import { Database, DataClass, KeyPath } from '../index';

@DataClass()
class ContextUser {
  @KeyPath()
  id!: string;

  name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

describe('Repository `this` binding consistency', () => {
  let db: any;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('ContextTestDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db = await Database.build('ContextTestDB', [ContextUser]);
  });

  afterAll(() => db.close());

  it('methods work when destructured off the repository', async () => {
    const { create, read, list, count, query } = db.ContextUser;

    await create(new ContextUser('c1', 'Alice'));
    const user = await read('c1');
    expect(user?.name).toBe('Alice');

    const all = await list();
    expect(all).toHaveLength(1);
    expect(await count()).toBe(1);

    const results = await query().where('name').equals('Alice').execute();
    expect(results).toHaveLength(1);
  });

  it('query() uses the database connection via lexical this', async () => {
    const detachedQuery = db.ContextUser.query;
    const builder = detachedQuery();
    const results = await builder.where('id').equals('c1').execute();
    expect(results).toHaveLength(1);
  });
});
