import { DataClass, KeyPath, CompositeKeyPath, Index, Database, KeyGenerators } from "idb-ts";

// Example 1: Auto-increment ID with schema versioning
@DataClass({ version: 1 })
class User {
    @KeyPath('id', { autoIncrement: true })
    id?: number;

    @Index('email', { unique: true })
    email: string;

    @Index('age')
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
class Post {
    @KeyPath('uuid', { generator: KeyGenerators.uuid })
    uuid?: string;

    @Index('authorEmail')
    authorEmail: string;

    @Index('category')
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

// Example 3: Composite key with timestamp generator
@DataClass({ version: 1 })
@CompositeKeyPath(['userId', 'projectId'])
class UserProject {
    userId: string;
    projectId: string;

    @Index('role')
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
class Activity {
    @KeyPath('activityId', { 
        generator: (item: Activity) => `${item.type}_${item.userId}_${Date.now()}`
    })
    activityId?: string;

    @Index('userId')
    userId: string;

    @Index('type')
    type: 'login' | 'logout' | 'post_created' | 'post_liked' | 'comment_added';

    @Index('timestamp')
    timestamp: number = Date.now();

    metadata: Record<string, any> = {};
    ip?: string;

    constructor(userId: string, type: Activity['type'], metadata: Record<string, any> = {}) {
        this.userId = userId;
        this.type = type;
        this.metadata = metadata;
    }
}

async function demonstrateFeatures() {
    console.log("🚀 Starting idb-ts v3.7.0 Feature Demonstration");
    
    // Initialize database with all entities
    const db = new Database("idb-demo-v3", [User, Post, UserProject, Activity]);
    await db.initialize();
    
    console.log(`📊 Database initialized with version: ${db.getDatabaseVersion()}`);
    console.log(`📋 Available entities: ${db.getAvailableEntities().join(', ')}`);

    // === CRUD Operations Demo ===
    console.log("\n=== CRUD Operations Demo ===");
    
    // Create users with auto-increment IDs
    const alice = new User("Alice Johnson", "alice@example.com", 28, "123 Main St", "+1234567890");
    const bob = new User("Bob Smith", "bob@example.com", 32, "456 Oak Ave");
    const charlie = new User("Charlie Brown", "charlie@example.com", 25, "789 Pine Rd");

    await db.User.create(alice);
    await db.User.create(bob);
    await db.User.create(charlie);
    
    console.log("✅ Created 3 users with auto-increment IDs");

    // Create posts with UUID keys
    const post1 = new Post("Getting Started with idb-ts", "This is a comprehensive guide to using idb-ts...", "alice@example.com", "tutorial");
    post1.tags = ["typescript", "indexeddb", "tutorial"];
    
    const post2 = new Post("Advanced Database Patterns", "Let's explore advanced patterns in IndexedDB...", "bob@example.com", "advanced");
    post2.tags = ["database", "patterns", "advanced"];

    await db.Post.create(post1);
    await db.Post.create(post2);
    
    console.log("✅ Created 2 posts with UUID keys");

    // Create user-project relationships with composite keys
    const project1 = new UserProject("alice@example.com", "project-alpha", "admin");
    project1.permissions = ["read", "write", "delete", "manage"];
    
    const project2 = new UserProject("bob@example.com", "project-alpha", "member");
    project2.permissions = ["read", "write"];
    
    const project3 = new UserProject("alice@example.com", "project-beta", "admin");
    project3.permissions = ["read", "write", "delete", "manage"];

    await db.UserProject.create(project1);
    await db.UserProject.create(project2);
    await db.UserProject.create(project3);
    
    console.log("✅ Created user-project relationships with composite keys");

    // Create activities with custom key generation
    const activity1 = new Activity("alice@example.com", "login", { ip: "192.168.1.100", browser: "Chrome" });
    const activity2 = new Activity("alice@example.com", "post_created", { postId: post1.uuid, title: post1.title });
    const activity3 = new Activity("bob@example.com", "post_liked", { postId: post1.uuid, likedBy: "bob@example.com" });

    await db.Activity.create(activity1);
    await db.Activity.create(activity2);
    await db.Activity.create(activity3);
    
    console.log("✅ Created activities with custom key generation");

    // === Advanced Query Builder Demo ===
    console.log("\n=== Advanced Query Builder Demo ===");

    // Query 1: Find active users older than 25, ordered by age
    const activeUsers = await db.User.query()
        .where('status').equals('active')
        .and('age').gt(25)
        .orderBy('age', 'asc')
        .execute();
    
    console.log(`🔍 Found ${activeUsers.length} active users older than 25:`, 
        activeUsers.map(u => ({ name: u.name, age: u.age, email: u.email })));

    // Query 2: Find posts by category with pagination
    const tutorialPosts = await db.Post.query()
        .where('category').equals('tutorial')
        .orderBy('publishedAt', 'desc')
        .limit(10)
        .execute();
    
    console.log(`📚 Found ${tutorialPosts.length} tutorial posts:`, 
        tutorialPosts.map(p => ({ title: p.title, author: p.authorEmail })));

    // Query 3: Find user activities by type with time range
    const recentLogins = await db.Activity.query()
        .where('type').equals('login')
        .and('timestamp').gte(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        .orderBy('timestamp', 'desc')
        .execute();
    
    console.log(`🚪 Found ${recentLogins.length} recent logins:`, 
        recentLogins.map(a => ({ userId: a.userId, timestamp: new Date(a.timestamp).toLocaleString() })));

    // === Index-based Queries Demo ===
    console.log("\n=== Index-based Queries Demo ===");

    // Query by unique email index
    const userByEmail = await db.User.findByIndex('email', 'alice@example.com');
    console.log("👤 User found by email:", userByEmail ? { name: userByEmail.name, email: userByEmail.email } : 'Not found');

    // Query multiple items by non-unique index
    const adminProjects = await db.UserProject.findAllByIndex('role', 'admin');
    console.log(`👑 Found ${adminProjects.length} admin relationships:`, 
        adminProjects.map(p => ({ userId: p.userId, projectId: p.projectId })));

    // === Composite Key Operations Demo ===
    console.log("\n=== Composite Key Operations Demo ===");

    // Read by composite key
    const specificProject = await db.UserProject.read(['alice@example.com', 'project-alpha']);
    console.log("📁 Project relationship:", specificProject ? 
        { user: specificProject.userId, project: specificProject.projectId, role: specificProject.role } : 'Not found');

    // Update composite key entity
    if (specificProject) {
        specificProject.permissions.push("deploy");
        await db.UserProject.update(specificProject);
        console.log("✏️ Updated project permissions");
    }

    // === Pagination Demo ===
    console.log("\n=== Pagination Demo ===");

    // Get paginated results
    const firstPage = await db.User.query()
        .orderBy('name', 'asc')
        .limit(2)
        .execute();
    
    const secondPage = await db.User.query()
        .orderBy('name', 'asc')
        .offset(2)
        .limit(2)
        .execute();

    console.log("📄 First page users:", firstPage.map(u => u.name));
    console.log("📄 Second page users:", secondPage.map(u => u.name));

    // === Statistics Demo ===
    console.log("\n=== Database Statistics ===");
    
    const allUsers = await db.User.list();
    const allPosts = await db.Post.list();
    const allProjects = await db.UserProject.list();
    const allActivities = await db.Activity.list();

    console.log(`📊 Database contains:`);
    console.log(`   Users: ${allUsers.length}`);
    console.log(`   Posts: ${allPosts.length}`);
    console.log(`   User-Project relationships: ${allProjects.length}`);
    console.log(`   Activities: ${allActivities.length}`);

    // Entity versions
    const entityVersions = db.getEntityVersions();
    console.log("🏷️ Entity versions:");
    entityVersions.forEach((version, entity) => {
        console.log(`   ${entity}: v${version}`);
    });

    console.log("\n🎉 idb-ts v3.7.0 Feature Demonstration Complete!");
}

// Run the demonstration
demonstrateFeatures().catch(console.error);
