import { Database, DataClass, KeyPath } from '../index';

describe('Error handling and edge cases', () => {
  @DataClass()
  class ErrorTestEntity {
    @KeyPath()
    id!: string;
    value!: string;
    
    constructor(id: string, value: string) {
      this.id = id;
      this.value = value;
    }
  }

  // Test database initialization error (mock scenario)
  describe('Database error handling', () => {
    it('should handle query before database initialization', () => {
      // Create a database instance but don't initialize it
      const uninitializedDb = Object.create(Database.prototype);
      uninitializedDb.db = null;
      
      expect(() => {
        uninitializedDb.query(ErrorTestEntity);
      }).toThrow('Database not initialized.');
    });

    it('should handle performOperation with uninitialized database', async () => {
      const db = await Database.build('ErrorTestDB', [ErrorTestEntity]);
      
      // Temporarily set db to null to test error handling
      const originalDb = (db as any).db;
      (db as any).db = null;
      
      await expect(db.ErrorTestEntity.create(new ErrorTestEntity('test', 'value')))
        .rejects.toThrow('Database not initialized.');
        
      // Restore db
      (db as any).db = originalDb;
    });

    it('should test legacy methods with proper entity name conversion', async () => {
      const db = await Database.build('LegacyTestDB', [ErrorTestEntity]);
      
      // Test that legacy methods work with entity name conversion
      const entity = new ErrorTestEntity('legacy-test', 'test-value');
      await db.create(ErrorTestEntity, entity);
      
      const retrieved = await db.ErrorTestEntity.read('legacy-test');
      expect(retrieved?.value).toBe('test-value');
      
      entity.value = 'updated-value';
      await db.update(ErrorTestEntity, entity);
      
      const updated = await db.ErrorTestEntity.read('legacy-test');
      expect(updated?.value).toBe('updated-value');
      
      await db.delete(ErrorTestEntity, 'legacy-test');
      
      const deleted = await db.ErrorTestEntity.read('legacy-test');
      expect(deleted).toBeUndefined();
      
      const allEntities = await db.list(ErrorTestEntity);
      expect(Array.isArray(allEntities)).toBe(true);
    });
  });
});
