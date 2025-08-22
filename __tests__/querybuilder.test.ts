import { Database, DataClass, KeyPath, Index } from '../index';

describe('QueryBuilder API', () => {
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
        db = await Database.build('QueryTestDB', [User]);
        await db.User.clear();
        await db.User.create(new User('u1', 'alice@example.com', 25, 'active', 100));
        await db.User.create(new User('u2', 'bob@example.com', 17, 'inactive', 200));
        await db.User.create(new User('u3', 'carol@example.com', 30, 'active', 300));
        await db.User.create(new User('u4', 'dave@example.com', 22, 'active', 400));
        await db.User.create(new User('u5', 'eve@example.com', 40, 'inactive', 500));
    });

    it('should filter, order, limit, and offset users (class pattern)', async () => {
        const users = await db.query(User)
            .where('age').gt(18)
            .and('status').equals('active')
            .orderBy('createdAt', 'desc')
            .limit(2)
            .offset(0)
            .execute();
        expect(users.length).toBe(2);
        expect(users[0].id).toBe('u4'); // createdAt 400
        expect(users[1].id).toBe('u3'); // createdAt 300
    });

    it('should filter, order, limit, and offset users (repo pattern)', async () => {
        const users = await db.User.query()
            .where('age').gt(18)
            .and('status').equals('active')
            .orderBy('createdAt', 'desc')
            .limit(2)
            .offset(0)
            .execute();
        expect(users.length).toBe(2);
        expect(users[0].id).toBe('u4');
        expect(users[1].id).toBe('u3');
    });

    it('should query by index range (class pattern)', async () => {
        const users = await db.query(User)
            .useIndex('email')
            .range('bob@example.com', 'eve@example.com')
            .execute();
        expect(users.map((u: User) => u.id)).toEqual(['u2', 'u3', 'u4', 'u5']);
    });

    it('should query by index range (repo pattern)', async () => {
        const users = await db.User.query()
            .useIndex('email')
            .range('bob@example.com', 'eve@example.com')
            .execute();
        expect(users.map((u: User) => u.id)).toEqual(['u2', 'u3', 'u4', 'u5']);
    });
});
