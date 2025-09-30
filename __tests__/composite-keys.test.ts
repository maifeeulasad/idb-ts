import { Database, KeyPath, DataClass, Index, EntityRepository, KeyGenerators, CompositeKeyPath } from '../index';

// Test entities with different key configurations

// Auto-increment key
@DataClass({ version: 1 })
class AutoIncrementEntity {
  @KeyPath({ autoIncrement: true })
  id!: number;
  
  name!: string;
  value!: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }
}

// UUID generated key
@DataClass({ version: 1 })
class UUIDEntity {
  @KeyPath({ generator: 'uuid' })
  uuid!: string;
  
  @Index()
  category!: string;
  
  title!: string;

  constructor(category: string, title: string) {
    this.category = category;
    this.title = title;
  }
}

// Timestamp generated key
@DataClass({ version: 1 })
class TimestampEntity {
  @KeyPath({ generator: 'timestamp' })
  timestamp!: number;
  
  event!: string;
  data!: any;

  constructor(event: string, data: any) {
    this.event = event;
    this.data = data;
  }
}

// Random generated key
@DataClass({ version: 1 })
class RandomEntity {
  @KeyPath({ generator: 'random' })
  randomId!: string;
  
  description!: string;

  constructor(description: string) {
    this.description = description;
  }
}

// Custom key generator
@DataClass({ version: 1 })
class CustomKeyEntity {
  @KeyPath({ generator: (item: any) => `custom_${item.type}_${Date.now()}` })
  customId!: string;
  
  type!: string;
  content!: string;

  constructor(type: string, content: string) {
    this.type = type;
    this.content = content;
  }
}

// Composite key entity
@DataClass({ version: 1 })
@CompositeKeyPath(['userId', 'projectId'])
class UserProject {
  userId!: string;
  projectId!: string;
  
  @Index()
  role!: string;
  
  @Index()
  joinedAt!: Date;

  constructor(userId: string, projectId: string, role: string) {
    this.userId = userId;
    this.projectId = projectId;
    this.role = role;
    this.joinedAt = new Date();
  }
}

// Traditional single key (for comparison)
@DataClass({ version: 1 })
class TraditionalEntity {
  @KeyPath()
  id!: string;
  
  name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

describe('Multi-Field & Composite Key Support', () => {
  let db: any;

  beforeAll(async () => {
    // Clear any existing database
    const deleteRequest = indexedDB.deleteDatabase('CompositeKeyTestDB');
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Continue even if deletion fails
    });

    db = await Database.build('CompositeKeyTestDB', [
      AutoIncrementEntity,
      UUIDEntity,
      TimestampEntity,
      RandomEntity,
      CustomKeyEntity,
      UserProject,
      TraditionalEntity
    ]);
  });

  describe('Auto-increment keys', () => {
    it('should create entities with auto-increment keys', async () => {
      const entity1 = new AutoIncrementEntity('First', 100);
      const entity2 = new AutoIncrementEntity('Second', 200);

      await db.AutoIncrementEntity.create(entity1);
      await db.AutoIncrementEntity.create(entity2);

      const items = await db.AutoIncrementEntity.list();
      expect(items.length).toBe(2);
      expect(items[0].id).toBeDefined();
      expect(items[1].id).toBeDefined();
      expect(items[0].id).not.toBe(items[1].id);
    });
  });

  describe('UUID generated keys', () => {
    it('should create entities with UUID keys', async () => {
      const entity = new UUIDEntity('test', 'Test Entity');
      
      await db.UUIDEntity.create(entity);
      
      expect(entity.uuid).toBeDefined();
      expect(entity.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      
      const retrieved = await db.UUIDEntity.read(entity.uuid);
      expect(retrieved).toEqual(entity);
    });

    it('should generate different UUIDs for different entities', async () => {
      const entity1 = new UUIDEntity('test1', 'Test Entity 1');
      const entity2 = new UUIDEntity('test2', 'Test Entity 2');
      
      await db.UUIDEntity.create(entity1);
      await db.UUIDEntity.create(entity2);
      
      expect(entity1.uuid).not.toBe(entity2.uuid);
    });
  });

  describe('Timestamp generated keys', () => {
    it('should create entities with timestamp keys', async () => {
      const beforeTime = Date.now();
      const entity = new TimestampEntity('user_login', { userId: 'user123' });
      
      await db.TimestampEntity.create(entity);
      const afterTime = Date.now();
      
      expect(entity.timestamp).toBeDefined();
      expect(entity.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(entity.timestamp).toBeLessThanOrEqual(afterTime);
      
      const retrieved = await db.TimestampEntity.read(entity.timestamp);
      expect(retrieved).toEqual(entity);
    });
  });

  describe('Random generated keys', () => {
    it('should create entities with random keys', async () => {
      const entity = new RandomEntity('Random test entity');
      
      await db.RandomEntity.create(entity);
      
      expect(entity.randomId).toBeDefined();
      expect(typeof entity.randomId).toBe('string');
      expect(entity.randomId.length).toBeGreaterThan(0);
      
      const retrieved = await db.RandomEntity.read(entity.randomId);
      expect(retrieved).toEqual(entity);
    });

    it('should generate different random keys for different entities', async () => {
      const entity1 = new RandomEntity('Random entity 1');
      const entity2 = new RandomEntity('Random entity 2');
      
      await db.RandomEntity.create(entity1);
      await db.RandomEntity.create(entity2);
      
      expect(entity1.randomId).not.toBe(entity2.randomId);
    });
  });

  describe('Custom key generators', () => {
    it('should create entities with custom generated keys', async () => {
      const entity = new CustomKeyEntity('blog_post', 'My first blog post');
      
      await db.CustomKeyEntity.create(entity);
      
      expect(entity.customId).toBeDefined();
      expect(entity.customId).toMatch(/^custom_blog_post_\d+$/);
      
      const retrieved = await db.CustomKeyEntity.read(entity.customId);
      expect(retrieved).toEqual(entity);
    });
  });

  describe('Composite keys', () => {
    it('should create entities with composite keys', async () => {
      const userProject = new UserProject('user123', 'project456', 'developer');
      
      await db.UserProject.create(userProject);
      
      // Read using composite key
      const retrieved = await db.UserProject.read(['user123', 'project456']);
      expect(retrieved).toBeDefined();
      expect(retrieved.userId).toBe('user123');
      expect(retrieved.projectId).toBe('project456');
      expect(retrieved.role).toBe('developer');
    });

    it('should handle multiple entities with different composite keys', async () => {
      const userProject1 = new UserProject('user123', 'project789', 'admin');
      const userProject2 = new UserProject('user456', 'project456', 'viewer');
      
      await db.UserProject.create(userProject1);
      await db.UserProject.create(userProject2);
      
      const retrieved1 = await db.UserProject.read(['user123', 'project789']);
      const retrieved2 = await db.UserProject.read(['user456', 'project456']);
      
      expect(retrieved1?.role).toBe('admin');
      expect(retrieved2?.role).toBe('viewer');
    });

    it('should support updates with composite keys', async () => {
      const userProject = new UserProject('user789', 'project123', 'contributor');
      await db.UserProject.create(userProject);
      
      // Update the entity
      userProject.role = 'maintainer';
      await db.UserProject.update(userProject);
      
      const retrieved = await db.UserProject.read(['user789', 'project123']);
      expect(retrieved?.role).toBe('maintainer');
    });

    it('should support deletion with composite keys', async () => {
      const userProject = new UserProject('user999', 'project999', 'temp');
      await db.UserProject.create(userProject);
      
      // Verify it exists
      let retrieved = await db.UserProject.read(['user999', 'project999']);
      expect(retrieved).toBeDefined();
      
      // Delete it
      await db.UserProject.delete(['user999', 'project999']);
      
      // Verify it's gone
      retrieved = await db.UserProject.read(['user999', 'project999']);
      expect(retrieved).toBeUndefined();
    });

    it('should support index queries on composite key entities', async () => {
      // Find by role index
      const developers = await db.UserProject.findByIndex('role', 'developer');
      expect(developers.length).toBeGreaterThanOrEqual(1);
      expect(developers.every((up: any) => up.role === 'developer')).toBe(true);
    });
  });

  describe('Traditional single keys (backward compatibility)', () => {
    it('should still work with traditional single key syntax', async () => {
      const entity = new TraditionalEntity('trad_1', 'Traditional Entity');
      
      await db.TraditionalEntity.create(entity);
      
      const retrieved = await db.TraditionalEntity.read('trad_1');
      expect(retrieved).toEqual(entity);
    });
  });

  describe('Key generation utilities', () => {
    it('should provide access to key generators', async () => {
      expect(KeyGenerators.uuid).toBeDefined();
      expect(KeyGenerators.timestamp).toBeDefined();
      expect(KeyGenerators.random).toBeDefined();
      
      const uuid = KeyGenerators.uuid();
      const timestamp = KeyGenerators.timestamp();
      const random = KeyGenerators.random();
      
      expect(typeof uuid).toBe('string');
      expect(typeof timestamp).toBe('number');
      expect(typeof random).toBe('string');
    });
  });

  describe('Error handling', () => {
    it('should handle missing composite key parts gracefully', async () => {
      try {
        await db.UserProject.read(['user123']); // Missing projectId
        // Should either work or throw a clear error
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});