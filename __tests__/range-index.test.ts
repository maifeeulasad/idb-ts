import { Database, DataClass, KeyPath, Index } from '../index';

@DataClass()
class Reading {
  @KeyPath()
  id!: string;

  @Index()
  value!: number;

  sensor!: string;

  constructor(id: string, value: number, sensor: string) {
    this.id = id;
    this.value = value;
    this.sensor = sensor;
  }
}

describe('QueryBuilder range()/useIndex() validation', () => {
  let db: any;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('RangeIndexDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db = await Database.build('RangeIndexDB', [Reading]);
    await db.Reading.createMany([
      new Reading('r1', 10, 'a'),
      new Reading('r2', 20, 'a'),
      new Reading('r3', 30, 'b'),
      new Reading('r4', 40, 'b'),
    ]);
  });

  afterAll(() => db.close());

  it('rejects range() without useIndex()', async () => {
    await expect(db.Reading.query().range(10, 30).execute()).rejects.toThrow(
      'range() requires useIndex()',
    );
  });

  it('rejects a lone lower bound without useIndex()', async () => {
    await expect(
      db.Reading.query().range(10, undefined).execute(),
    ).rejects.toThrow('range() requires useIndex()');
  });

  it('applies range() through the index when useIndex() is set', async () => {
    const results = await db.Reading.query()
      .useIndex('value')
      .range(15, 35)
      .execute();
    expect(results.map((r: Reading) => r.id).sort()).toEqual(['r2', 'r3']);
  });

  it('still allows where() filters on other fields alongside an index range', async () => {
    const results = await db.Reading.query()
      .useIndex('value')
      .range(15, 45)
      .where('sensor')
      .equals('b')
      .execute();
    expect(results.map((r: Reading) => r.id).sort()).toEqual(['r3', 'r4']);
  });
});
