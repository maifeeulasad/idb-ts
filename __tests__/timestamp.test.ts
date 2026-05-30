import { Database, KeyPath, DataClass } from '../index';

@DataClass()
class AuditRecord {
  @KeyPath()
  id!: string;

  message!: string;

  constructor(id: string, message: string) {
    this.id = id;
    this.message = message;
  }
}

describe('Internal timestamp fields', () => {
  let db: any;

  beforeAll(async () => {
    const deleteRequest = indexedDB.deleteDatabase('TimestampAnnotationDB');
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
    });

    db = await Database.build('TimestampAnnotationDB', [AuditRecord]);
  });

  it('should manage creation and update timestamps internally', async () => {
    const record = new AuditRecord('audit-1', 'first write');
    const beforeCreate = Date.now();

    await db.AuditRecord.create(record);

    const afterCreate = Date.now();
    const createdAt = (record as any).createdAt;
    const updatedAt = (record as any).updatedAt;

    expect(createdAt).toBeGreaterThanOrEqual(beforeCreate);
    expect(createdAt).toBeLessThanOrEqual(afterCreate);
    expect(updatedAt).toBeGreaterThanOrEqual(beforeCreate);
    expect(updatedAt).toBeLessThanOrEqual(afterCreate);
    expect(createdAt).toBeDefined();
    expect(updatedAt).toBeDefined();

    const storedAfterCreate = await db.AuditRecord.read('audit-1');
    expect(storedAfterCreate).toEqual(record);

    await new Promise((resolve) => setTimeout(resolve, 2));

    (record as any).createdAt = 999999;
    (record as any).updatedAt = 888888;
    const beforeUpdate = Date.now();

    await db.AuditRecord.update(record);

    const afterUpdate = Date.now();
    const storedAfterUpdate = await db.AuditRecord.read('audit-1');

    expect((storedAfterUpdate as any)?.createdAt).toBe(createdAt);
    expect((storedAfterUpdate as any)?.createdAt).not.toBe(999999);
    expect((storedAfterUpdate as any)?.updatedAt).toBeGreaterThanOrEqual(beforeUpdate);
    expect((storedAfterUpdate as any)?.updatedAt).toBeLessThanOrEqual(afterUpdate);
    expect((storedAfterUpdate as any)?.updatedAt).not.toBe(888888);
  });
});