import { Database, DataClass, KeyPath } from '../index';

@DataClass()
class User {
  @KeyPath()
  id!: string;

  name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

@DataClass()
class Order {
  @KeyPath()
  id!: string;

  userId!: string;
  total!: number;

  constructor(id: string, userId: string, total: number) {
    this.id = id;
    this.userId = userId;
    this.total = total;
  }
}

@DataClass()
class OrderItem {
  @KeyPath()
  id!: string;

  orderId!: string;
  sku!: string;
  quantity!: number;

  constructor(id: string, orderId: string, sku: string, quantity: number) {
    this.id = id;
    this.orderId = orderId;
    this.sku = sku;
    this.quantity = quantity;
  }
}

describe('Transaction API', () => {
  let db: any;
  let dbName: string;

  beforeEach(async () => {
    dbName = `transaction-test-${Date.now()}-${Math.random()}`;
    const deleteRequest = indexedDB.deleteDatabase(dbName);
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
      deleteRequest.onblocked = () => resolve();
    });

    db = await Database.build(dbName, [User, Order, OrderItem]);
  });

  afterEach(() => {
    db?.close?.();
  });

  it('commits all repository writes inside a callback transaction', async () => {
    const user = new User('u1', 'Alice');
    const order = new Order('o1', 'u1', 125);
    const item = new OrderItem('oi1', 'o1', 'sku-1', 2);

    await db.transaction(async (tx: any) => {
      await tx.User.create(user);
      await tx.Order.create(order);
      await tx.OrderItem.create(item);
    });

    expect(await db.User.read('u1')).toEqual(user);
    expect(await db.Order.read('o1')).toEqual(order);
    expect(await db.OrderItem.read('oi1')).toEqual(item);
  });

  it('rolls back callback transactions when an error is thrown', async () => {
    const user = new User('u2', 'Bob');
    const order = new Order('o2', 'u2', 75);

    await expect(
      db.transaction(async (tx: any) => {
        await tx.User.create(user);
        await tx.Order.create(order);
        throw new Error('abort this transaction');
      }),
    ).rejects.toThrow('abort this transaction');

    expect(await db.User.read('u2')).toBeUndefined();
    expect(await db.Order.read('o2')).toBeUndefined();
  });

  it('supports explicit commit and rollback control', async () => {
    const committedUser = new User('u3', 'Carol');
    const committedOrder = new Order('o3', 'u3', 50);

    const tx = await db.beginTransaction(['User', 'Order'], 'readwrite');
    await tx.User.create(committedUser);
    await tx.Order.create(committedOrder);
    await tx.commit();

    expect(await db.User.read('u3')).toEqual(committedUser);
    expect(await db.Order.read('o3')).toEqual(committedOrder);

    const rolledBackUser = new User('u4', 'Dave');
    const rolledBackOrder = new Order('o4', 'u4', 99);

    const rollbackTx = await db.beginTransaction(
      ['User', 'Order'],
      'readwrite',
    );
    await rollbackTx.User.create(rolledBackUser);
    await rollbackTx.Order.create(rolledBackOrder);
    await rollbackTx.rollback();

    expect(await db.User.read('u4')).toBeUndefined();
    expect(await db.Order.read('o4')).toBeUndefined();
  });
});
