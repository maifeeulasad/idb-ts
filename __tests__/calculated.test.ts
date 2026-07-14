import { Database, DataClass, KeyPath, Calculated, Validate } from '../index';

@DataClass()
class OrderLine {
  @KeyPath()
  id!: string;

  quantity!: number;
  unitPrice!: number;

  @Calculated<OrderLine>((item) => item.quantity * item.unitPrice)
  total!: number;

  constructor(id: string, quantity: number, unitPrice: number) {
    this.id = id;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
}

@DataClass()
class Profile {
  @KeyPath()
  id!: string;

  firstName!: string;
  lastName!: string;

  @Calculated<Profile>((item) => `${item.firstName} ${item.lastName}`)
  @Validate((v) => typeof v === 'string' && v.trim().length > 1, 'full name required')
  fullName!: string;

  constructor(id: string, firstName: string, lastName: string) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

describe('@Calculated fields', () => {
  let db: any;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('CalculatedDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db = await Database.build('CalculatedDB', [OrderLine, Profile]);
  });

  afterAll(() => db.close());

  it('computes the field on create', async () => {
    await db.OrderLine.create(new OrderLine('o1', 3, 9.5));
    const stored = await db.OrderLine.read('o1');
    expect(stored?.total).toBe(28.5);
  });

  it('recomputes the field on update', async () => {
    const stored = await db.OrderLine.read('o1');
    stored.quantity = 4;
    stored.total = -1; // stale value must be overwritten
    await db.OrderLine.update(stored);

    const updated = await db.OrderLine.read('o1');
    expect(updated?.total).toBe(38);
  });

  it('is queryable like any persisted field', async () => {
    await db.OrderLine.create(new OrderLine('o2', 1, 100));
    const results = await db.OrderLine.query().where('total').gt(50).execute();
    expect(results.map((line: OrderLine) => line.id)).toEqual(['o2']);
  });

  it('runs before validation so validators see the computed value', async () => {
    await db.Profile.create(new Profile('u1', 'Ada', 'Lovelace'));
    const profile = await db.Profile.read('u1');
    expect(profile?.fullName).toBe('Ada Lovelace');
  });
});
