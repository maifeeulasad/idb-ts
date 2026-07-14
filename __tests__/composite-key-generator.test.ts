import { Database, DataClass, CompositeKeyPath } from '../index';

describe('CompositeKeyPath key generation guard', () => {
  it('throws at decoration time when a generator is configured', () => {
    expect(() => {
      class Bad {
        userId!: string;
        projectId!: string;
      }
      CompositeKeyPath(['userId', 'projectId'], { generator: 'uuid' })(Bad);
    }).toThrow('Key generators are not supported for composite keys');
  });

  it('throws at decoration time when a custom generator function is configured', () => {
    expect(() => {
      class Bad {
        userId!: string;
        projectId!: string;
      }
      CompositeKeyPath(['userId', 'projectId'], {
        generator: () => 'nope',
      })(Bad);
    }).toThrow('Key generators are not supported for composite keys');
  });

  it('throws at decoration time when autoIncrement is configured', () => {
    expect(() => {
      class Bad {
        userId!: string;
        projectId!: string;
      }
      CompositeKeyPath(['userId', 'projectId'], { autoIncrement: true })(Bad);
    }).toThrow('autoIncrement is not supported for composite keys');
  });

  it('still accepts composite keys without generation options', async () => {
    @DataClass()
    @CompositeKeyPath(['userId', 'projectId'])
    class Assignment {
      userId!: string;
      projectId!: string;
      role!: string;

      constructor(userId: string, projectId: string, role: string) {
        this.userId = userId;
        this.projectId = projectId;
        this.role = role;
      }
    }

    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('CompositeGuardDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });

    const db: any = await Database.build('CompositeGuardDB', [Assignment]);
    await db.Assignment.create(new Assignment('u1', 'p1', 'owner'));
    const stored = await db.Assignment.read(['u1', 'p1']);
    expect(stored?.role).toBe('owner');
    db.close();
  });
});
