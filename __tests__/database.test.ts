import { Database, KeyPath, DataClass, Index } from '../index';

@DataClass()
class User {
  @KeyPath()
  id!: string;

  @Index()
  email!: string;

  name!: string;
  age!: number;

  constructor(id: string, name: string, age: number, email?: string) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.email = email || `${name.toLowerCase()}@example.com`;
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

  it('should find users by email index', async () => {
    const user = new User('u5', 'Diana', 35, 'diana@example.com');
    await db.create(User, user);

    const found = await db.findByIndex(User, 'email', 'diana@example.com');
    expect(found.length).toBe(1);
    expect(found[0].name).toBe('Diana');
  });

  it('should find one user by email index', async () => {
    const user = new User('u6', 'Eve', 29, 'eve@example.com');
    await db.create(User, user);

    const found = await db.findOneByIndex(User, 'email', 'eve@example.com');
    expect(found).toBeDefined();
    expect(found!.name).toBe('Eve');
  });

});
