import { DataClass, KeyPath, CompositeKeyPath, Index, KeyGenerators } from 'idb-ts';

// Example 1: Auto-increment ID with schema versioning
@DataClass({ version: 1 })
export class User {
    @KeyPath({ autoIncrement: true })
    id?: number;

    @Index()
    email: string;

    @Index()
    age: number;

    name: string;
    address: string;
    cell?: string;
    status: 'active' | 'inactive' = 'active';
    createdAt: Date = new Date();

    constructor(name: string, email: string, age: number, address: string, cell?: string) {
        this.name = name;
        this.email = email;
        this.age = age;
        this.address = address;
        this.cell = cell;
    }
}

// Example 2: UUID key generation with versioning
@DataClass({ version: 2 })
export class Post {
    @KeyPath({ generator: KeyGenerators.uuid })
    uuid?: string;

    @Index()
    authorEmail: string;

    @Index()
    category: string;

    title: string;
    content: string;
    tags: string[] = [];
    publishedAt: Date = new Date();
    likes: number = 0;

    constructor(title: string, content: string, authorEmail: string, category: string = 'general') {
        this.title = title;
        this.content = content;
        this.authorEmail = authorEmail;
        this.category = category;
    }
}

// Example 3: Composite key 
@DataClass({ version: 1 })
@CompositeKeyPath(['userId', 'projectId'])
export class UserProject {
    userId: string;
    projectId: string;

    @Index()
    role: 'admin' | 'member' | 'viewer';

    joinedAt: Date = new Date();
    permissions: string[] = [];

    constructor(userId: string, projectId: string, role: 'admin' | 'member' | 'viewer' = 'member') {
        this.userId = userId;
        this.projectId = projectId;
        this.role = role;
    }
}

// Example 4: Custom key generator with advanced features
@DataClass({ version: 1 })
export class Activity {
    @KeyPath({ 
        generator: (item: Activity) => `${item.type}_${item.userId}_${Date.now()}`
    })
    activityId?: string;

    @Index()
    userId: string;

    @Index()
    type: 'login' | 'logout' | 'post_created' | 'post_liked' | 'comment_added';

    @Index()
    timestamp: number = Date.now();

    metadata: Record<string, any> = {};
    ip?: string;

    constructor(userId: string, type: Activity['type'], metadata: Record<string, any> = {}) {
        this.userId = userId;
        this.type = type;
        this.metadata = metadata;
    }
}