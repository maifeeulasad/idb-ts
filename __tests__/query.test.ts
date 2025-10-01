import { Database, DataClass, KeyPath, Index } from "../index";

// Test entities for coverage improvement
@DataClass()
class CoverageUser {
  @KeyPath()
  id!: string;

  @Index()
  age!: number;

  @Index()
  status!: string;

  @Index()
  score!: number;

  constructor(id: string, age: number, status: string, score: number) {
    this.id = id;
    this.age = age;
    this.status = status;
    this.score = score;
  }
}

describe('Coverage Improvement Tests', () => {
  let db: any;

  beforeEach(async () => {
    // Use unique database names to avoid conflicts
    const dbName = `coverage-test-${Date.now()}-${Math.random()}`;
    
    // Clear any existing database
    const deleteRequest = indexedDB.deleteDatabase(dbName);
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Continue even if deletion fails
    });
    
    db = await Database.build(dbName, [CoverageUser]);
  });

  describe('QueryBuilder Coverage', () => {
    beforeEach(async () => {
      // Clear and add test data
      await db.CoverageUser.clear();
      await db.CoverageUser.create(new CoverageUser('u1', 25, 'active', 85));
      await db.CoverageUser.create(new CoverageUser('u2', 30, 'inactive', 75));
      await db.CoverageUser.create(new CoverageUser('u3', 35, 'active', 95));
      await db.CoverageUser.create(new CoverageUser('u4', 20, 'pending', 65));
    });

    it('should test lte method in QueryBuilder', async () => {
      // Test lte method (line 62-65)
      const results = await db.CoverageUser.query()
        .where('age')
        .lte(30)
        .execute();
      
      expect(results).toHaveLength(3);
      expect(results.map((u: any) => u.id)).toEqual(expect.arrayContaining(['u1', 'u2', 'u4']));
    });

    it('should test lte comparison in query execution', async () => {
      // Test lte comparison (line 129)
      const results = await db.CoverageUser.query()
        .where('score')
        .lte(80)
        .execute();
      
      expect(results).toHaveLength(2);
      expect(results.map((u: any) => u.id)).toEqual(expect.arrayContaining(['u2', 'u4']));
    });

    it('should test descending order sorting', async () => {
      // Test descending order (line 142)
      const results = await db.CoverageUser.query()
        .where('status')
        .equals('active')
        .orderBy('age', 'desc')
        .execute();
      
      expect(results).toHaveLength(2);
      expect(results[0].age).toBe(35); // u3 should be first
      expect(results[1].age).toBe(25); // u1 should be second
    });

    it('should test query with only lower bound', async () => {
      // Test lowerBound only (line 109)
      const results = await db.CoverageUser.query()
        .where('age')
        .gte(30)
        .execute();
      
      expect(results).toHaveLength(2);
      expect(results.map((u: any) => u.id)).toEqual(expect.arrayContaining(['u2', 'u3']));
    });

    it('should test query with only upper bound', async () => {
      // Test upperBound only (line 110)  
      const results = await db.CoverageUser.query()
        .where('age')
        .lte(30)
        .execute();
      
      expect(results).toHaveLength(3);
      expect(results.map((u: any) => u.id)).toEqual(expect.arrayContaining(['u1', 'u2', 'u4']));
    });

    it('should test query with both bounds', async () => {
      // Test bound (both lower and upper) (line 107)
      const results = await db.CoverageUser.query()
        .where('age')
        .gte(25)
        .where('age')
        .lte(30)
        .execute();
      
      expect(results).toHaveLength(2);
      expect(results.map((u: any) => u.id)).toEqual(expect.arrayContaining(['u1', 'u2']));
    });
  });

  describe('Repository Methods Coverage', () => {
    it('should test count method', async () => {
      // Clear and add test data
      await db.CoverageUser.clear();
      await db.CoverageUser.create(new CoverageUser('u1', 25, 'active', 85));
      await db.CoverageUser.create(new CoverageUser('u2', 30, 'inactive', 75));
      
      // Test count method (lines 579-585)
      const count = await db.CoverageUser.count();
      expect(count).toBe(2);
    });

    it('should test exists method', async () => {
      // Clear and add test data
      await db.CoverageUser.clear();
      await db.CoverageUser.create(new CoverageUser('u1', 25, 'active', 85));
      
      // Test exists method (lines 587-597)
      const exists1 = await db.CoverageUser.exists('u1');
      expect(exists1).toBe(true);
      
      const exists2 = await db.CoverageUser.exists('nonexistent');
      expect(exists2).toBe(false);
    });

    it('should test clear method', async () => {
      // Add test data
      await db.CoverageUser.create(new CoverageUser('u1', 25, 'active', 85));
      await db.CoverageUser.create(new CoverageUser('u2', 30, 'inactive', 75));
      
      // Verify data exists
      let count = await db.CoverageUser.count();
      expect(count).toBe(2);
      
      // Test clear method (lines 599-609)
      await db.CoverageUser.clear();
      
      // Verify data is cleared
      count = await db.CoverageUser.count();
      expect(count).toBe(0);
    });
  });

  describe('Error Handling Coverage', () => {
    it('should test database not initialized error', async () => {
      // Test performOperation when database is not initialized (line 627)
      const DatabaseClass = require('../index').Database;
      const uninitializedDb = new DatabaseClass('testDb', [CoverageUser]);
      uninitializedDb.db = null; // Force uninitialized state
      
      try {
        await uninitializedDb.performOperation('test', 'readonly', () => {});
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Database not initialized.');
      }
    });
  });
});