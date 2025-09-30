import { Database, DataClass, KeyPath, Index } from '../index';

describe('QueryBuilder API - extensive tests', () => {
    @DataClass()
    class User {
        @KeyPath()
        id!: string;
        @Index()
        email!: string;
        @Index()
        age!: number;
        status!: string;
        createdAt!: number;
        constructor(id: string, email: string, age: number, status: string, createdAt: number) {
            this.id = id;
            this.email = email;
            this.age = age;
            this.status = status;
            this.createdAt = createdAt;
        }
    }

    let db: any;

    beforeAll(async () => {
        db = await Database.build('QueryExtensiveTestDB', [User]);
        await db.User.clear();
        await db.User.create(new User('u1', 'alice@example.com', 25, 'active', 100));
        await db.User.create(new User('u2', 'bob@example.com', 17, 'inactive', 200));
        await db.User.create(new User('u3', 'carol@example.com', 30, 'active', 300));
        await db.User.create(new User('u4', 'dave@example.com', 22, 'active', 400));
        await db.User.create(new User('u5', 'eve@example.com', 40, 'inactive', 500));
    });

    it('true positive: should find active users older than 18', async () => {
        const users = await db.User.query()
            .where('age').gt(18)
            .and('status').equals('active')
            .execute();
        expect(users.map((u: User) => u.id).sort()).toEqual(['u1', 'u3', 'u4']);
    });

    it('true negative: should not find users with age < 10 and status active', async () => {
        const users = await db.User.query()
            .where('age').lt(10)
            .and('status').equals('active')
            .execute();
        expect(users.length).toBe(0);
    });

    it('false positive: should not match inactive users when filtering for active', async () => {
        const users = await db.User.query()
            .where('status').equals('active')
            .execute();
        expect(users.map((u: User) => u.status)).not.toContain('inactive');
    });

    it('false negative: should not miss any active users', async () => {
        const users = await db.User.query()
            .where('status').equals('active')
            .execute();
        const expected = ['u1', 'u3', 'u4'];
        expect(users.map((u: User) => u.id).sort()).toEqual(expected);
    });

    it('positive: should order users by createdAt desc', async () => {
        const users = await db.User.query()
            .orderBy('createdAt', 'desc')
            .limit(2)
            .execute();
        expect(users[0].id).toBe('u5');
        expect(users[1].id).toBe('u4');
    });

    it('negative: should return empty for impossible age', async () => {
        const users = await db.User.query()
            .where('age').equals(999)
            .execute();
        expect(users.length).toBe(0);
    });

    it('index positive: should find users by email index', async () => {
        const users = await db.User.query()
            .useIndex('email')
            .range('bob@example.com', 'carol@example.com')
            .execute();
        expect(users.map((u: User) => u.id)).toEqual(['u2', 'u3']);
    });

    it('index negative: should throw for non-existent index', async () => {
        await expect(db.User.query().useIndex('nonexistent').execute()).rejects.toThrow();
    });

    it('offset and limit: should paginate results', async () => {
        const users = await db.User.query()
            .orderBy('createdAt', 'asc')
            .offset(1)
            .limit(2)
            .execute();
        expect(users.map((u: User) => u.id)).toEqual(['u2', 'u3']);
    });

    it('edge case: complex conditions for older tests', async () => {
        const users = await db.User.query()
            .where('age').gte(20)
            .and('status').equals('active')
            .orderBy('age', 'asc')
            .execute();
        expect(users.map((u: User) => u.id)).toEqual(['u4', 'u1', 'u3']);
    });

    it('true negative: should not find users with age < 10 and status active', async () => {
        const users = await db.User.query()
            .where('age').lt(10)
            .and('status').equals('active')
            .execute();
        expect(users.length).toBe(0);
    });

    it('false positive: should not match inactive users when filtering for active', async () => {
        const users = await db.User.query()
            .where('status').equals('active')
            .execute();
        expect(users.map((u: User) => u.status)).not.toContain('inactive');
    });

    it('false negative: should not miss any active users', async () => {
        const users = await db.User.query()
            .where('status').equals('active')
            .execute();
        const expected = ['u1', 'u3', 'u4'];
        expect(users.map((u: User) => u.id).sort()).toEqual(expected);
    });

    it('positive: should order users by createdAt desc', async () => {
        const users = await db.User.query()
            .orderBy('createdAt', 'desc')
            .limit(2)
            .execute();
        expect(users[0].id).toBe('u5');
        expect(users[1].id).toBe('u4');
    });

    it('negative: should return empty for impossible age', async () => {
        const users = await db.User.query()
            .where('age').equals(999)
            .execute();
        expect(users.length).toBe(0);
    });

    it('index positive: should find users by email index', async () => {
        const users = await db.User.query()
            .useIndex('email')
            .range('bob@example.com', 'carol@example.com')
            .execute();
        expect(users.map((u: User) => u.id)).toEqual(['u2', 'u3']);
    });

    it('index negative: should throw for non-existent index', async () => {
        await expect(db.User.query().useIndex('nonexistent').execute()).rejects.toThrow();
    });

    it('offset and limit: should paginate results', async () => {
        const users = await db.User.query()
            .orderBy('createdAt', 'asc')
            .offset(1)
            .limit(2)
            .execute();
        expect(users.map((u: User) => u.id)).toEqual(['u2', 'u3']);
    });

    it('multiple conditions: should find users with age >= 22 and status active', async () => {
        const users = await db.User.query()
            .where('age').gte(22)
            .and('status').equals('active')
            .execute();
        expect(users.map((u: User) => u.id).sort()).toEqual(['u1', 'u3', 'u4']);
    });
});
