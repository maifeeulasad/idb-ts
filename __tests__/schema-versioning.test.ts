import { Database, KeyPath, DataClass, Index, EntityRepository } from '../index';

// Test entities with different versions
@DataClass({ version: 1 })
class UserV1 {
  @KeyPath()
  id!: string;

  @Index()
  email!: string;

  name!: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

@DataClass({ version: 2 })
class PostV2 {
  @KeyPath()
  id!: string;

  @Index()
  authorId!: string;

  title!: string;
  content!: string;

  constructor(id: string, authorId: string, title: string, content: string) {
    this.id = id;
    this.authorId = authorId;
    this.title = title;
    this.content = content;
  }
}

@DataClass({ version: 4 })
class CommentV4 {
  @KeyPath()
  id!: string;

  @Index()
  postId!: string;

  @Index()
  userId!: string;

  text!: string;
  timestamp!: Date;

  constructor(id: string, postId: string, userId: string, text: string) {
    this.id = id;
    this.postId = postId;
    this.userId = userId;
    this.text = text;
    this.timestamp = new Date();
  }
}

// Test with default version (should be 1)
@DataClass()
class TagDefault {
  @KeyPath()
  id!: string;

  name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

describe('Schema Versioning', () => {
  let db: any;

  beforeAll(async () => {
    // Clear any existing database
    const deleteRequest = indexedDB.deleteDatabase('VersionTestDB');
    await new Promise<void>((resolve) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Continue even if deletion fails
    });

    db = await Database.build('VersionTestDB', [UserV1, PostV2, CommentV4, TagDefault]);
  });

  it('should calculate correct database version from highest entity version', () => {
    expect(db.getDatabaseVersion()).toBe(4); // Highest version among entities
  });

  it('should track entity versions correctly', () => {
    const versions = db.getEntityVersions();
    expect(versions.get('UserV1')).toBe(1);
    expect(versions.get('PostV2')).toBe(2);
    expect(versions.get('CommentV4')).toBe(4);
    expect(versions.get('TagDefault')).toBe(1); // Default version
  });

  it('should get individual entity version', () => {
    expect(db.getEntityVersion('UserV1')).toBe(1);
    expect(db.getEntityVersion('PostV2')).toBe(2);
    expect(db.getEntityVersion('CommentV4')).toBe(4);
    expect(db.getEntityVersion('TagDefault')).toBe(1);
    expect(db.getEntityVersion('NonExistent')).toBeUndefined();
  });

  it('should create and manage entities with different versions', async () => {
    // Test UserV1 (version 1)
    const user = new UserV1('u1', 'Alice', 'alice@example.com');
    await db.UserV1.create(user);
    const retrievedUser = await db.UserV1.read('u1');
    expect(retrievedUser).toEqual(user);

    // Test PostV2 (version 2)
    const post = new PostV2('p1', 'u1', 'Hello World', 'This is my first post');
    await db.PostV2.create(post);
    const retrievedPost = await db.PostV2.read('p1');
    expect(retrievedPost).toEqual(post);

    // Test CommentV4 (version 4)
    const comment = new CommentV4('c1', 'p1', 'u1', 'Great post!');
    await db.CommentV4.create(comment);
    const retrievedComment = await db.CommentV4.read('c1');
    expect(retrievedComment?.text).toBe('Great post!');

    // Test TagDefault (default version 1)
    const tag = new TagDefault('t1', 'typescript');
    await db.TagDefault.create(tag);
    const retrievedTag = await db.TagDefault.read('t1');
    expect(retrievedTag).toEqual(tag);
  });

  it('should handle indexes correctly for different versions', async () => {
    // Test finding by index in UserV1
    const users = await db.UserV1.findByIndex('email', 'alice@example.com');
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Alice');

    // Test finding by index in PostV2
    const posts = await db.PostV2.findByIndex('authorId', 'u1');
    expect(posts.length).toBe(1);
    expect(posts[0].title).toBe('Hello World');

    // Test finding by index in CommentV4
    const comments = await db.CommentV4.findByIndex('postId', 'p1');
    expect(comments.length).toBe(1);
    expect(comments[0].text).toBe('Great post!');
  });

  it('should support query builder with versioned entities', async () => {
    const posts = await db.PostV2.query()
      .where('authorId').equals('u1')
      .execute();
    
    expect(posts.length).toBe(1);
    expect(posts[0].title).toBe('Hello World');

    const comments = await db.CommentV4.query()
      .where('userId').equals('u1')
      .execute();
    
    expect(comments.length).toBe(1);
    expect(comments[0].text).toBe('Great post!');
  });
});