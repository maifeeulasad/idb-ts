import { Database, KeyPath, DataClass, Index } from '../index';

@DataClass()
class User {
  @KeyPath()
  id!: string;

  @Index()
  email!: string;

  @Index()
  age!: number;

  name!: string;

  constructor(id: string, email: string, age: number, name: string) {
    this.id = id;
    this.email = email;
    this.age = age;
    this.name = name;
  }
}

describe('IndexedDB Indexing', () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.build('IndexingTestDB', [User]);
  });

  beforeEach(async () => {
    // Clear existing data
    const users = await db.list(User);
    for (const user of users) {
      await db.delete(User, user.id);
    }

    // Add test data
    await db.create(User, new User('u1', 'alice@example.com', 30, 'Alice'));
    await db.create(User, new User('u2', 'bob@example.com', 25, 'Bob'));
    await db.create(User, new User('u3', 'charlie@example.com', 30, 'Charlie'));
    await db.create(User, new User('u4', 'alice@work.com', 28, 'Alice Smith'));
  });

  it('should find users by email index', async () => {
    const users = await db.findByIndex(User, 'email', 'alice@example.com');
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Alice');
    expect(users[0].email).toBe('alice@example.com');
  });

  it('should find multiple users by age index', async () => {
    const users = await db.findByIndex(User, 'age', 30);
    expect(users.length).toBe(2);
    const names = users.map(u => u.name).sort();
    expect(names).toEqual(['Alice', 'Charlie']);
  });

  it('should find single user by email index', async () => {
    const user = await db.findOneByIndex(User, 'email', 'bob@example.com');
    expect(user).toBeDefined();
    expect(user!.name).toBe('Bob');
    expect(user!.age).toBe(25);
  });

  it('should return undefined when no user found by index', async () => {
    const user = await db.findOneByIndex(User, 'email', 'nonexistent@example.com');
    expect(user).toBeUndefined();
  });

  it('should return empty array when no users found by index', async () => {
    const users = await db.findByIndex(User, 'age', 99);
    expect(users).toEqual([]);
  });

  it('should throw error when querying non-existent index', async () => {
    await expect(db.findByIndex(User, 'nonexistent', 'value')).rejects.toThrow(
      "Index 'nonexistent' does not exist on User"
    );
  });

  it('should throw error when querying non-existent index with findOneByIndex', async () => {
    await expect(db.findOneByIndex(User, 'nonexistent', 'value')).rejects.toThrow(
      "Index 'nonexistent' does not exist on User"
    );
  });

  it('should work with non-indexed fields not being queryable by index', async () => {
    // name field is not indexed, so this should throw an error
    await expect(db.findByIndex(User, 'name', 'Alice')).rejects.toThrow(
      "Index 'name' does not exist on User"
    );
  });
});
