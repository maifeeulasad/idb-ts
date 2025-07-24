import { Database, KeyPath, DataClass } from '../index';

@DataClass()
class User {
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

describe('IndexedDB CRUD', () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.build('TestDB', [User]);
  });

  it('should create a new user', async () => {
    const user = new User('u1', 'Alice', 30);
    await db.create(User, user);

    const stored = await db.read(User, 'u1');
    expect(stored).toEqual(user);
  });

  it('should update an existing user', async () => {
    const user = new User('u1', 'Alice', 31);
    await db.update(User, user);

    const updated = await db.read(User, 'u1');
    expect(updated?.age).toBe(31);
  });

  it('should list all users', async () => {
    const users = await db.list(User);
    expect(users.length).toBeGreaterThan(0);
    expect(users.find(u => u.id === 'u1')).toBeDefined();
  });

  it('should paginate results', async () => {
    await db.create(User, new User('u2', 'Bob', 25));
    await db.create(User, new User('u3', 'Charlie', 22));

    const page1 = await db.listPaginated(User, 1, 2);
    const page2 = await db.listPaginated(User, 2, 2);

    expect(page1.length).toBe(2);
    expect(page2.length).toBeGreaterThanOrEqual(0);
  });

  it('should delete a user', async () => {
    await db.delete(User, 'u1');
    const deleted = await db.read(User, 'u1');
    expect(deleted).toBeUndefined();
  });

});
