import { Database, DataClass, KeyPath } from '../index';

@DataClass()
class Order {
  @KeyPath()
  id!: string;

  name!: string;
  email!: string;
  description!: string;
  tags!: string[];
  skills!: string[];
  roles!: string[];
  age!: number;
  price!: number;
  amount!: number;
  date!: number;
  status!: string;
  type!: string;
  isTrial!: boolean;
  hasParentalConsent!: boolean;

  constructor(values: Order) {
    Object.assign(this, values);
  }
}

describe('Advanced QueryBuilder operators', () => {
  let db: any;

  beforeAll(async () => {
    db = await Database.build('AdvancedQueryTestDB', [Order]);
  });

  beforeEach(async () => {
    await db.Order.clear();

    await db.Order.create(
      new Order({
        id: 'o1',
        name: 'John Doe',
        email: 'john@gmail.com',
        description: 'important release notes',
        tags: ['typescript', 'backend'],
        skills: ['js', 'ts', 'node'],
        roles: ['admin', 'user'],
        age: 25,
        price: 12,
        amount: 100,
        date: 3,
        status: 'active',
        type: 'premium',
        isTrial: false,
        hasParentalConsent: false,
      }),
    );

    await db.Order.create(
      new Order({
        id: 'o2',
        name: 'Johnny Appleseed',
        email: 'johnny@yahoo.com',
        description: 'secondary notes',
        tags: ['node', 'js'],
        skills: ['js'],
        roles: ['user'],
        age: 17,
        price: 4,
        amount: 50,
        date: 1,
        status: 'inactive',
        type: 'basic',
        isTrial: true,
        hasParentalConsent: true,
      }),
    );

    await db.Order.create(
      new Order({
        id: 'o3',
        name: 'Alice Smith',
        email: 'alice@gmail.com',
        description: 'important internal memo',
        tags: ['typescript', 'node'],
        skills: ['ts', 'node'],
        roles: ['user', 'editor'],
        age: 65,
        price: 20,
        amount: 150,
        date: 5,
        status: 'active',
        type: 'premium',
        isTrial: false,
        hasParentalConsent: false,
      }),
    );

    await db.Order.create(
      new Order({
        id: 'o4',
        name: 'Zoe Archive',
        email: 'zoe@company.com',
        description: 'archived record',
        tags: ['documentation'],
        skills: ['node', 'go'],
        roles: ['archived'],
        age: 70,
        price: 30,
        amount: 25,
        date: 9,
        status: 'archived',
        type: 'basic',
        isTrial: false,
        hasParentalConsent: false,
      }),
    );
  });

  it('supports string operators', async () => {
    const startsWith = await db.Order.query()
      .where('name')
      .startsWith('John')
      .execute();
    expect(startsWith.map((order: Order) => order.id)).toEqual(['o1', 'o2']);

    const endsWith = await db.Order.query()
      .where('email')
      .endsWith('@gmail.com')
      .execute();
    expect(endsWith.map((order: Order) => order.id)).toEqual(['o1', 'o3']);

    const contains = await db.Order.query()
      .where('description')
      .contains('important')
      .execute();
    expect(contains.map((order: Order) => order.id)).toEqual(['o1', 'o3']);

    const matches = await db.Order.query()
      .where('name')
      .matches(/^[A-Z]/)
      .execute();
    expect(matches).toHaveLength(4);
  });

  it('supports range and collection operators', async () => {
    const between = await db.Order.query()
      .where('age')
      .between(18, 65)
      .execute();
    expect(between.map((order: Order) => order.id)).toEqual(['o1', 'o3']);

    const notBetween = await db.Order.query()
      .where('price')
      .notBetween(0, 10)
      .execute();
    expect(notBetween.map((order: Order) => order.id)).toEqual([
      'o1',
      'o3',
      'o4',
    ]);

    const arrayContains = await db.Order.query()
      .where('tags')
      .contains('typescript')
      .execute();
    expect(arrayContains.map((order: Order) => order.id)).toEqual(['o1', 'o3']);

    const containsAny = await db.Order.query()
      .where('skills')
      .containsAny(['js', 'ts', 'node'])
      .execute();
    expect(containsAny.map((order: Order) => order.id)).toEqual([
      'o1',
      'o2',
      'o3',
      'o4',
    ]);

    const containsAll = await db.Order.query()
      .where('roles')
      .containsAll(['admin', 'user'])
      .execute();
    expect(containsAll.map((order: Order) => order.id)).toEqual(['o1']);

    const inList = await db.Order.query()
      .where('age')['in']([17, 25, 70])
      .execute();
    expect(inList.map((order: Order) => order.id)).toEqual(['o1', 'o2', 'o4']);

    const notInList = await db.Order.query()
      .where('status')
      .notIn(['deleted', 'archived'])
      .execute();
    expect(notInList.map((order: Order) => order.id)).toEqual([
      'o1',
      'o2',
      'o3',
    ]);
  });

  it('supports logical grouping with or clauses', async () => {
    const simpleOr = await db.Order.query()
      .where('age')
      .gte(18)
      .or()
      .where('hasParentalConsent')
      .equals(true)
      .execute();
    expect(simpleOr.map((order: Order) => order.id)).toEqual([
      'o1',
      'o2',
      'o3',
      'o4',
    ]);

    const grouped = await db.Order.query()
      .where((qb: any) =>
        qb.where('type').equals('premium').and('status').equals('active'),
      )
      .or()
      .where('isTrial')
      .equals(true)
      .execute();
    expect(grouped.map((order: Order) => order.id)).toEqual(['o1', 'o2', 'o3']);
  });

  it('supports aggregations', async () => {
    await expect(db.Order.query().sum('amount')).resolves.toBe(325);
    await expect(db.Order.query().avg('price')).resolves.toBe(16.5);
    await expect(db.Order.query().min('date')).resolves.toBe(1);
    await expect(db.Order.query().max('date')).resolves.toBe(9);

    const groupedCounts = await db.Order.query().groupBy('status').count();
    expect(groupedCounts).toEqual([
      { status: 'active', count: 2 },
      { status: 'archived', count: 1 },
      { status: 'inactive', count: 1 },
    ]);
  });
});
