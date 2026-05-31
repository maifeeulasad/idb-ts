import { Database, DataClass, Index, KeyPath, Validate } from '../index';

@DataClass()
class ValidatedUser {
  @KeyPath()
  @Validate((value: string) => value.length > 0, 'ID cannot be empty')
  id!: string;

  @Validate((value: string) => value.includes('@'), 'Invalid email')
  @Index({ unique: true })
  email!: string;

  @Validate((value: number) => value >= 0 && value <= 150, 'Age must be 0-150')
  age!: number;

  constructor(id: string, email: string, age: number) {
    this.id = id;
    this.email = email;
    this.age = age;
  }
}

describe('Validation decorator', () => {
  let db: any;
  let dbName: string;

  beforeEach(async () => {
    dbName = `validation-test-${Date.now()}-${Math.random()}`;
    const deleteRequest = indexedDB.deleteDatabase(dbName);
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
      deleteRequest.onblocked = () => resolve();
    });

    db = await Database.build(dbName, [ValidatedUser]);
  });

  afterEach(() => {
    db?.close?.();
  });

  it('should allow valid records to be created', async () => {
    await db.ValidatedUser.create(
      new ValidatedUser('u1', 'user@example.com', 34),
    );

    const items = await db.ValidatedUser.list();
    expect(items).toHaveLength(1);
    expect(items[0].email).toBe('user@example.com');
  });

  it('should reject invalid values on create', async () => {
    await expect(
      db.ValidatedUser.create(new ValidatedUser('', 'invalid', 999)),
    ).rejects.toThrow(
      /Validation failed for ValidatedUser: id: ID cannot be empty; email: Invalid email; age: Age must be 0-150/,
    );

    const items = await db.ValidatedUser.list();
    expect(items).toHaveLength(0);
  });

  it('should reject invalid values on update', async () => {
    const user = new ValidatedUser('u2', 'valid@example.com', 20);
    await db.ValidatedUser.create(user);

    user.email = 'broken-email';

    await expect(db.ValidatedUser.update(user)).rejects.toThrow(
      /Validation failed for ValidatedUser: email: Invalid email/,
    );

    const stored = await db.ValidatedUser.read('u2');
    expect(stored?.email).toBe('valid@example.com');
  });
});
