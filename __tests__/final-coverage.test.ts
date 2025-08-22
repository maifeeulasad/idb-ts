import { Database, DataClass, KeyPath } from '../index';

describe('Final coverage tests', () => {
  @DataClass()
  class FinalEntity {
    @KeyPath()
    id!: string;
    value1!: string;
    value2!: string;
    
    constructor(id: string, value1: string, value2: string) {
      this.id = id;
      this.value1 = value1;
      this.value2 = value2;
    }
  }

  // Test QueryBuilder sorting return 0 path (when values are equal)
  describe('QueryBuilder sorting edge cases', () => {
    it('should handle equal values in sorting', async () => {
      const db = await Database.build('FinalTestDB', [FinalEntity]);
      await db.FinalEntity.clear();
      
      // Create entities with same value to trigger return 0 path
      await db.FinalEntity.create(new FinalEntity('f1', 'same', 'data1'));
      await db.FinalEntity.create(new FinalEntity('f2', 'same', 'data2'));
      await db.FinalEntity.create(new FinalEntity('f3', 'different', 'data3'));
      
      const results = await db.query(FinalEntity)
        .orderBy('value1', 'asc')
        .execute();
      
      expect(results.length).toBe(3);
      // The first two should have same value1, triggering the return 0 path
      expect(results.filter((r: FinalEntity) => r.value1 === 'same').length).toBe(2);
    });
  });
});
