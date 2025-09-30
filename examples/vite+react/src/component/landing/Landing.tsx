import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Modal, Input, notification, Card, Typography, Statistic, Row, Col, Tabs } from 'antd';
import { User, Post, UserProject, Activity } from '../../entities';
import useIDBOperations from '../../hook/useIDBOperations';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const Context = React.createContext({ name: 'Default' });

const Landing = () => {
  const [api, contextHolder] = notification.useNotification();
  const contextValue = useMemo(() => ({ name: 'idb-ts v3.7.0 example' }), []);

  const {
    db,
    loading,
    error,
    initializeDB,
    createItem,
    readItem,
    updateItem,
    deleteItem,
    listItems,
    queryItems,
    findByIndex,
    findAllByIndex,
  } = useIDBOperations();

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, projects: 0, activities: 0 });

  // Modal states
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', age: 18, address: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '', authorEmail: '', category: 'general' });
  const [newProject, setNewProject] = useState({ userId: '', projectId: '', role: 'member' as 'admin' | 'member' | 'viewer' });

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDB('idb-demo-v3-react', [User, Post, UserProject, Activity]);
        await loadData();
        showNotification('success', 'Database initialized successfully with idb-ts v3.7.0!');
      } catch (err) {
        console.error('Failed to initialize database:', err);
        showNotification('error', 'Failed to initialize database');
      }
    };
    init();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, postsData, projectsData, activitiesData] = await Promise.all([
        listItems<User>('User'),
        listItems<Post>('Post'), 
        listItems<UserProject>('UserProject'),
        listItems<Activity>('Activity')
      ]);

      setUsers(usersData);
      setPosts(postsData);
      setUserProjects(projectsData);
      setActivities(activitiesData);
      
      setStats({
        users: usersData.length,
        posts: postsData.length,
        projects: projectsData.length,
        activities: activitiesData.length
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      showNotification('error', 'Failed to load data');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    api[type]({ message, duration: 3 });
  };

  // === User Operations ===
  const handleCreateUser = async () => {
    try {
      const user = new User(newUser.name, newUser.email, newUser.age, newUser.address);
      await createItem('User', user);
      
      // Create login activity
      const loginActivity = new Activity(newUser.email, 'login', { 
        ip: '192.168.1.100', 
        browser: 'Chrome',
        timestamp: Date.now()
      });
      await createItem('Activity', loginActivity);
      
      setIsUserModalVisible(false);
      setNewUser({ name: '', email: '', age: 18, address: '' });
      await loadData();
      showNotification('success', `User ${newUser.name} created with auto-increment ID!`);
    } catch (err) {
      console.error('Failed to create user:', err);
      showNotification('error', 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteItem('User', id);
      await loadData();
      showNotification('success', 'User deleted successfully!');
    } catch (err) {
      console.error('Failed to delete user:', err);
      showNotification('error', 'Failed to delete user');
    }
  };

  // === Post Operations ===
  const handleCreatePost = async () => {
    try {
      const post = new Post(newPost.title, newPost.content, newPost.authorEmail, newPost.category);
      await createItem('Post', post);
      
      // Create post creation activity
      const postActivity = new Activity(newPost.authorEmail, 'post_created', {
        postTitle: newPost.title,
        category: newPost.category
      });
      await createItem('Activity', postActivity);
      
      setIsPostModalVisible(false);
      setNewPost({ title: '', content: '', authorEmail: '', category: 'general' });
      await loadData();
      showNotification('success', `Post "${newPost.title}" created with UUID key!`);
    } catch (err) {
      console.error('Failed to create post:', err);
      showNotification('error', 'Failed to create post');
    }
  };

  const handleDeletePost = async (uuid: string) => {
    try {
      await deleteItem('Post', uuid);
      await loadData();
      showNotification('success', 'Post deleted successfully!');
    } catch (err) {
      console.error('Failed to delete post:', err);
      showNotification('error', 'Failed to delete post');
    }
  };

  // === Project Operations ===
  const handleCreateProject = async () => {
    try {
      const project = new UserProject(newProject.userId, newProject.projectId, newProject.role);
      await createItem('UserProject', project);
      
      setIsProjectModalVisible(false);
      setNewProject({ userId: '', projectId: '', role: 'member' });
      await loadData();
      showNotification('success', `Project relationship created with composite key!`);
    } catch (err) {
      console.error('Failed to create project:', err);
      showNotification('error', 'Failed to create project');
    }
  };

  const handleDeleteProject = async (userId: string, projectId: string) => {
    try {
      await deleteItem('UserProject', [userId, projectId]);
      await loadData();
      showNotification('success', 'Project relationship deleted successfully!');
    } catch (err) {
      console.error('Failed to delete project:', err);
      showNotification('error', 'Failed to delete project');
    }
  };

  // === Advanced Query Operations ===
  const handleAdvancedQueries = async () => {
    try {
      // Query active users older than 25
      const activeUsers = await queryItems<User>('User', (query) =>
        query.where('status').equals('active')
          .and('age').gt(25)
          .orderBy('age', 'asc')
      );

      // Query posts by category
      const tutorialPosts = await queryItems<Post>('Post', (query) =>
        query.where('category').equals('tutorial')
          .orderBy('publishedAt', 'desc')
          .limit(5)
      );

      // Query recent activities
      const recentActivities = await queryItems<Activity>('Activity', (query) =>
        query.where('timestamp').gte(Date.now() - 24 * 60 * 60 * 1000)
          .orderBy('timestamp', 'desc')
          .limit(10)
      );

      showNotification('info', 
        `Advanced queries executed: ${activeUsers.length} active users, ${tutorialPosts.length} tutorial posts, ${recentActivities.length} recent activities`
      );
    } catch (err) {
      console.error('Failed to execute advanced queries:', err);
      showNotification('error', 'Failed to execute advanced queries');
    }
  };

  // === Demo Data Generation ===
  const generateDemoData = async () => {
    try {
      // Create demo users
      const demoUsers = [
        new User('Alice Johnson', 'alice@example.com', 28, '123 Main St'),
        new User('Bob Smith', 'bob@example.com', 32, '456 Oak Ave'),
        new User('Charlie Brown', 'charlie@example.com', 25, '789 Pine Rd')
      ];

      for (const user of demoUsers) {
        await createItem('User', user);
      }

      // Create demo posts
      const demoPosts = [
        new Post('Getting Started with idb-ts', 'Comprehensive guide...', 'alice@example.com', 'tutorial'),
        new Post('Advanced Database Patterns', 'Exploring patterns...', 'bob@example.com', 'advanced'),
        new Post('TypeScript Best Practices', 'Clean code tips...', 'charlie@example.com', 'tutorial')
      ];

      for (const post of demoPosts) {
        await createItem('Post', post);
      }

      // Create demo projects
      const demoProjects = [
        new UserProject('alice@example.com', 'project-alpha', 'admin'),
        new UserProject('bob@example.com', 'project-alpha', 'member'),
        new UserProject('charlie@example.com', 'project-beta', 'admin')
      ];

      for (const project of demoProjects) {
        await createItem('UserProject', project);
      }

      await loadData();
      showNotification('success', 'Demo data generated successfully!');
    } catch (err) {
      console.error('Failed to generate demo data:', err);
      showNotification('error', 'Failed to generate demo data');
    }
  };

  // Table columns
  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Button danger onClick={() => handleDeleteUser(record.id!)}>Delete</Button>
      ),
    },
  ];

  const postColumns = [
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 200 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Author', dataIndex: 'authorEmail', key: 'authorEmail' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Likes', dataIndex: 'likes', key: 'likes' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Post) => (
        <Button danger onClick={() => handleDeletePost(record.uuid!)}>Delete</Button>
      ),
    },
  ];

  const projectColumns = [
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: 'Project ID', dataIndex: 'projectId', key: 'projectId' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Joined At', dataIndex: 'joinedAt', key: 'joinedAt', render: (date: Date) => new Date(date).toLocaleString() },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserProject) => (
        <Button danger onClick={() => handleDeleteProject(record.userId, record.projectId)}>Delete</Button>
      ),
    },
  ];

  const activityColumns = [
    { title: 'Activity ID', dataIndex: 'activityId', key: 'activityId', width: 200 },
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (ts: number) => new Date(ts).toLocaleString() },
  ];

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        <Title level={1}>🚀 idb-ts v3.7.0 Demo - Modern IndexedDB with TypeScript</Title>
        
        <Paragraph>
          This demo showcases the latest features of idb-ts v3.7.0 including schema versioning, 
          auto-increment keys, UUID generation, composite keys, advanced query builder, and more!
        </Paragraph>

        {error && (
          <Card title="Error" style={{ marginBottom: 16, borderColor: 'red' }}>
            <Paragraph type="danger">{error}</Paragraph>
          </Card>
        )}

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Users (Auto-increment)" value={stats.users} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Posts (UUID)" value={stats.posts} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Projects (Composite)" value={stats.projects} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Activities (Custom)" value={stats.activities} />
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={generateDemoData} loading={loading}>
            Generate Demo Data
          </Button>
          <Button onClick={handleAdvancedQueries} loading={loading}>
            Run Advanced Queries
          </Button>
          <Button onClick={() => setIsUserModalVisible(true)}>Add User</Button>
          <Button onClick={() => setIsPostModalVisible(true)}>Add Post</Button>
          <Button onClick={() => setIsProjectModalVisible(true)}>Add Project</Button>
        </Space>

        {/* Data Tables */}
        <Tabs defaultActiveKey="1">
          <TabPane tab="Users (Auto-increment ID)" key="1">
            <Table 
              columns={userColumns} 
              dataSource={users} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane tab="Posts (UUID Keys)" key="2">
            <Table 
              columns={postColumns} 
              dataSource={posts} 
              rowKey="uuid" 
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane tab="Projects (Composite Keys)" key="3">
            <Table 
              columns={projectColumns} 
              dataSource={userProjects} 
              rowKey={(record) => `${record.userId}-${record.projectId}`}
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane tab="Activities (Custom Keys)" key="4">
            <Table 
              columns={activityColumns} 
              dataSource={activities} 
              rowKey="activityId" 
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>

        {/* Add User Modal */}
        <Modal
          title="Add New User (Auto-increment ID)"
          visible={isUserModalVisible}
          onOk={handleCreateUser}
          onCancel={() => setIsUserModalVisible(false)}
          okText="Create User"
        >
          <Input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Age"
            type="number"
            value={newUser.age}
            onChange={(e) => setNewUser({ ...newUser, age: parseInt(e.target.value) || 18 })}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
          />
        </Modal>

        {/* Add Post Modal */}
        <Modal
          title="Add New Post (UUID Key)"
          visible={isPostModalVisible}
          onOk={handleCreatePost}
          onCancel={() => setIsPostModalVisible(false)}
          okText="Create Post"
        >
          <Input
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input.TextArea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Author Email"
            value={newPost.authorEmail}
            onChange={(e) => setNewPost({ ...newPost, authorEmail: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Category"
            value={newPost.category}
            onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
          />
        </Modal>

        {/* Add Project Modal */}
        <Modal
          title="Add New Project (Composite Key)"
          visible={isProjectModalVisible}
          onOk={handleCreateProject}
          onCancel={() => setIsProjectModalVisible(false)}
          okText="Create Project"
        >
          <Input
            placeholder="User ID (Email)"
            value={newProject.userId}
            onChange={(e) => setNewProject({ ...newProject, userId: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Project ID"
            value={newProject.projectId}
            onChange={(e) => setNewProject({ ...newProject, projectId: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <select
            value={newProject.role}
            onChange={(e) => setNewProject({ ...newProject, role: e.target.value as any })}
            style={{ width: '100%', padding: '4px', marginBottom: 8 }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </Modal>
      </div>
    </Context.Provider>
  );
};

export default Landing;