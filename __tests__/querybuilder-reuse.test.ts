import { Database, DataClass, KeyPath } from '../index';

@DataClass()
class Person {
  @KeyPath()
  id!: string;

  name!: string;
  age!: number;

  constructor(id: string, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;
  }
}

describe('QueryBuilder reuse safety', () => {
  let db: any;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('ReuseQueryDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db = await Database.build('ReuseQueryDB', [Person]);
    await db.Person.createMany([
      new Person('p1', 'Alice', 25),
      new Person('p2', 'Bob', 35),
      new Person('p3', 'Cara', 45),
    ]);
  });

  afterAll(() => db.close());

  it('re-executing the same builder returns stable results', async () => {
    const query = db.Person.query().where('age').gte(30);
    const first = await query.execute();
    const second = await query.execute();
    expect(second).toEqual(first);
    expect(second).toHaveLength(2);
  });

  it('clone() creates an independent copy that does not share state', async () => {
    const base = db.Person.query().where('age').gte(30);
    const narrowed = base.clone().where('name').equals('Bob');

    const narrowedResults = await narrowed.execute();
    expect(narrowedResults.map((p: Person) => p.id)).toEqual(['p2']);

    // The original builder is unaffected by conditions added to the clone.
    const baseResults = await base.execute();
    expect(baseResults).toHaveLength(2);
  });

  it('clone() copies ordering, pagination and grouping', async () => {
    const base = db.Person.query().orderBy('age', 'desc').limit(2);
    const copy = base.clone();

    const results = await copy.execute();
    expect(results.map((p: Person) => p.id)).toEqual(['p3', 'p2']);
  });

  it('reset() clears accumulated state for safe reuse', async () => {
    const query = db.Person.query().where('age').gte(30);
    expect(await query.execute()).toHaveLength(2);

    query.reset();
    const all = await query.execute();
    expect(all).toHaveLength(3);

    const filtered = await query.reset().where('name').equals('Alice').execute();
    expect(filtered.map((p: Person) => p.id)).toEqual(['p1']);
  });
});
