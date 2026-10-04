import { Database, DataClass, Index, KeyPath } from '../index';

@DataClass()
class Item {
  @KeyPath()
  id!: string;

  @Index()
  age!: number;

  status!: string;
  score!: number;
  tags!: string[];
  label!: string;

  constructor(values: Partial<Item> & { id: string }) {
    Object.assign(this, values);
  }
}

const destroy = (name: string): Promise<void> =>
  new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });

describe('QueryBuilder coverage gaps', () => {
  let db: any;

  beforeAll(async () => {
    await destroy('QueryGapsDB');
    db = await Database.build('QueryGapsDB', [Item]);
  });

  afterAll(() => db.close());

  beforeEach(async () => {
    await db.Item.clear();
    await db.Item.createMany([
      new Item({
        id: 'i1',
        age: 20,
        status: 'active',
        score: 5,
        tags: ['a'],
        label: 'x',
      }),
      new Item({
        id: 'i2',
        age: 20,
        status: 'active',
        score: 10,
        tags: ['b'],
        label: 'y',
      }),
      new Item({
        id: 'i3',
        age: 30,
        status: 'inactive',
        score: 15,
        tags: ['a', 'b'],
        label: 'z',
      }),
    ]);
  });

  describe('FieldQueryBuilder.and()/or() chained directly off a field', () => {
    it('moves to the next field via and() without an intervening operator', async () => {
      const results = await db.Item.query()
        .where('status')
        .and('age')
        .equals(20)
        .execute();
      // The 'status' field clause is never appended - only 'age' filters.
      expect(results.map((item: Item) => item.id).sort()).toEqual(['i1', 'i2']);
    });

    it('sets the pending connector to or() via a field directly', async () => {
      const results = await db.Item.query()
        .where('age')
        .equals(30)
        .where('status')
        .or()
        .where('label')
        .equals('x')
        .execute();
      expect(results.map((item: Item) => item.id).sort()).toEqual(['i1', 'i3']);
    });
  });

  describe('flat (non-chained) operator calls directly on QueryBuilder', () => {
    it('supports setting the field then calling operators without chaining the return value', async () => {
      const qb = db.Item.query();
      qb.where('age');
      qb.gte(21);
      const results = await qb.execute();
      expect(results.map((item: Item) => item.id)).toEqual(['i3']);
    });

    it('supports and() between flat operator calls', async () => {
      const qb = db.Item.query();
      qb.where('age');
      qb.gte(18);
      qb.and('status');
      qb.equals('active');
      const results = await qb.execute();
      expect(results.map((item: Item) => item.id).sort()).toEqual(['i1', 'i2']);
    });

    it('exercises every flat comparison and membership operator', async () => {
      const qb = db.Item.query();
      qb.where('age');
      expect(qb.gt(29)).toBe(qb);
      expect((await qb.execute()).map((i: Item) => i.id)).toEqual(['i3']);

      const lt = db.Item.query();
      lt.where('age');
      lt.lt(21);
      expect((await lt.execute()).map((i: Item) => i.id).sort()).toEqual([
        'i1',
        'i2',
      ]);

      const lte = db.Item.query();
      lte.where('age');
      lte.lte(20);
      expect((await lte.execute()).map((i: Item) => i.id).sort()).toEqual([
        'i1',
        'i2',
      ]);

      const startsWith = db.Item.query();
      startsWith.where('status');
      startsWith.startsWith('in');
      expect((await startsWith.execute()).map((i: Item) => i.id)).toEqual([
        'i3',
      ]);

      const endsWith = db.Item.query();
      endsWith.where('status');
      endsWith.endsWith('tive');
      expect((await endsWith.execute()).map((i: Item) => i.id).sort()).toEqual([
        'i1',
        'i2',
        'i3',
      ]);

      const contains = db.Item.query();
      contains.where('label');
      contains.contains('y');
      expect((await contains.execute()).map((i: Item) => i.id)).toEqual(['i2']);

      const matches = db.Item.query();
      matches.where('label');
      matches.matches(/^[xy]$/);
      expect((await matches.execute()).map((i: Item) => i.id).sort()).toEqual([
        'i1',
        'i2',
      ]);

      const between = db.Item.query();
      between.where('score');
      between.between(5, 10);
      expect((await between.execute()).map((i: Item) => i.id).sort()).toEqual([
        'i1',
        'i2',
      ]);

      const notBetween = db.Item.query();
      notBetween.where('score');
      notBetween.notBetween(5, 10);
      expect((await notBetween.execute()).map((i: Item) => i.id)).toEqual([
        'i3',
      ]);

      const inOp = db.Item.query();
      inOp.where('id');
      inOp['in'](['i1', 'i3']);
      expect((await inOp.execute()).map((i: Item) => i.id).sort()).toEqual([
        'i1',
        'i3',
      ]);

      const notIn = db.Item.query();
      notIn.where('id');
      notIn.notIn(['i1', 'i3']);
      expect((await notIn.execute()).map((i: Item) => i.id)).toEqual(['i2']);

      const containsAny = db.Item.query();
      containsAny.where('tags');
      containsAny.containsAny(['b']);
      expect(
        (await containsAny.execute()).map((i: Item) => i.id).sort(),
      ).toEqual(['i2', 'i3']);

      const containsAll = db.Item.query();
      containsAll.where('tags');
      containsAll.containsAll(['a', 'b']);
      expect((await containsAll.execute()).map((i: Item) => i.id)).toEqual([
        'i3',
      ]);
    });

    it('throws when an operator is called with no field selected', async () => {
      const qb = db.Item.query();
      expect(() => qb.equals('x')).toThrow('No field specified for equals');
    });
  });

  describe('range() with a single bound through useIndex()', () => {
    it('applies a lower-bound-only range', async () => {
      const results = await db.Item.query()
        .useIndex('age')
        .range(21, undefined)
        .execute();
      expect(results.map((item: Item) => item.id)).toEqual(['i3']);
    });

    it('applies an upper-bound-only range', async () => {
      const results = await db.Item.query()
        .useIndex('age')
        .range(undefined, 20)
        .execute();
      expect(results.map((item: Item) => item.id).sort()).toEqual(['i1', 'i2']);
    });
  });

  describe('orderBy() tie-breaking', () => {
    it('keeps a stable order for equal values', async () => {
      const results = await db.Item.query()
        .where('age')
        .equals(20)
        .orderBy('age', 'asc')
        .execute();
      expect(results.map((item: Item) => item.id)).toEqual(['i1', 'i2']);
    });
  });

  describe('groupBy().count() tie-breaking', () => {
    it('does not throw when group keys are not strictly order-comparable', async () => {
      // The number 5 and the string "5" are distinct Map keys (and distinct
      // groups), yet `5 < "5"` and `5 > "5"` are both false after numeric
      // coercion - forcing the sort comparator's tie-break ("return 0")
      // branch instead of a strict -1/1 ordering.
      await db.Item.clear();
      await db.Item.createMany([
        new Item({
          id: 'g1',
          age: 1,
          status: 'x',
          score: 5,
          tags: [],
          label: '',
        }),
        new Item({
          id: 'g2',
          age: 2,
          status: 'x',
          score: '5' as any,
          tags: [],
          label: '',
        }),
      ]);

      const grouped = await db.Item.query().groupBy('score').count();
      expect(grouped).toHaveLength(2);
      expect(grouped.reduce((sum: number, g: any) => sum + g.count, 0)).toBe(2);
    });
  });

  describe('plain count() without groupBy', () => {
    it('returns the number of matching records', async () => {
      const count = await db.Item.query()
        .where('status')
        .equals('active')
        .count();
      expect(count).toBe(2);
    });
  });

  describe('aggregations over an empty result set', () => {
    it('avg() returns 0 when nothing matches', async () => {
      const avg = await db.Item.query()
        .where('status')
        .equals('nope')
        .avg('score');
      expect(avg).toBe(0);
    });

    it('min() returns null when nothing matches', async () => {
      const min = await db.Item.query()
        .where('status')
        .equals('nope')
        .min('score');
      expect(min).toBeNull();
    });

    it('max() returns null when nothing matches', async () => {
      const max = await db.Item.query()
        .where('status')
        .equals('nope')
        .max('score');
      expect(max).toBeNull();
    });
  });
});
