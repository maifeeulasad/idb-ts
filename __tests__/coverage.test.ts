import { Database, DataClass, KeyPath, Index } from '../index';

describe('Coverage completion tests', () => {
  @DataClass()
  class TestEntity {
    @KeyPath()
    id!: string;
    @Index()
    name!: string;
    @Index()
    score!: number;
    
    constructor(id: string, name: string, score: number) {
      this.id = id;
      this.name = name;
      this.score = score;
    }
  }

  let db: any;

  beforeAll(async () => {
    db = await Database.build('CoverageTestDB', [TestEntity]);
    await db.TestEntity.clear();
    await db.TestEntity.create(new TestEntity('t1', 'Alice', 100));
    await db.TestEntity.create(new TestEntity('t2', 'Bob', 85));
    await db.TestEntity.create(new TestEntity('t3', 'Charlie', 92));
  });

  // Test QueryBuilder error handling for missing field specification
  describe('QueryBuilder error handling', () => {
    it('should throw error when equals() called without field', () => {
      expect(() => {
        db.query(TestEntity).equals('value');
      }).toThrow('No field specified for equals');
    });

    it('should throw error when gt() called without field', () => {
      expect(() => {
        db.query(TestEntity).gt(10);
      }).toThrow('No field specified for gt');
    });

    it('should throw error when gte() called without field', () => {
      expect(() => {
        db.query(TestEntity).gte(10);
      }).toThrow('No field specified for gte');
    });

    it('should throw error when lt() called without field', () => {
      expect(() => {
        db.query(TestEntity).lt(10);
      }).toThrow('No field specified for lt');
    });

    it('should throw error when lte() called without field', () => {
      expect(() => {
        db.query(TestEntity).lte(10);
      }).toThrow('No field specified for lte');
    });
  });

  // Test QueryBuilder range variations
  describe('QueryBuilder range handling', () => {
    it('should handle range with only start value', async () => {
      const results = await db.query(TestEntity)
        .useIndex('name')
        .range('Bob', undefined)
        .execute();
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle range with only end value', async () => {
      const results = await db.query(TestEntity)
        .useIndex('name')
        .range(undefined, 'Charlie')
        .execute();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  // Test EntityRepository count() and exists() methods
  describe('EntityRepository additional methods', () => {
    it('should count entities', async () => {
      const count = await db.TestEntity.count();
      expect(count).toBe(3);
    });

    it('should check if entity exists', async () => {
      const exists = await db.TestEntity.exists('t1');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent entity', async () => {
      const exists = await db.TestEntity.exists('nonexistent');
      expect(exists).toBe(false);
    });
  });

  // Test legacy Database methods
  describe('Legacy Database methods', () => {
    it('should create using legacy method', async () => {
      const entity = new TestEntity('legacy1', 'Legacy', 95);
      await db.create(TestEntity, entity);
      const retrieved = await db.TestEntity.read('legacy1');
      expect(retrieved?.name).toBe('Legacy');
    });

    it('should read using legacy method', async () => {
      const entity = await db.read(TestEntity, 't1');
      expect(entity?.name).toBe('Alice');
    });

    it('should update using legacy method', async () => {
      const entity = new TestEntity('t1', 'Alice Updated', 105);
      await db.update(TestEntity, entity);
      const updated = await db.TestEntity.read('t1');
      expect(updated?.name).toBe('Alice Updated');
    });

    it('should delete using legacy method', async () => {
      await db.delete(TestEntity, 'legacy1');
      const deleted = await db.TestEntity.read('legacy1');
      expect(deleted).toBeUndefined();
    });

    it('should list using legacy method', async () => {
      const entities = await db.list(TestEntity);
      expect(entities.length).toBeGreaterThan(0);
    });
  });

  // Test getAvailableEntities
  describe('Database utilities', () => {
    it('should get available entities', () => {
      const entities = db.getAvailableEntities();
      expect(entities).toContain('TestEntity');
    });
  });

  // Test query with lte condition (ensure coverage of lte case)
  describe('QueryBuilder lte condition', () => {
    it('should filter with lte condition', async () => {
      const results = await db.query(TestEntity)
        .where('score').lte(90)
        .execute();
      expect(results.length).toBe(1); // Only Bob with score 85
      expect(results[0].name).toBe('Bob');
    });
  });
});
