import {
  DataClass,
  KeyPath,
  CompositeKeyPath,
  Index,
  Database,
  KeyGenerators,
} from 'idb-ts';

type LogKind = 'info' | 'success' | 'error' | 'warn';

@DataClass({ version: 1 })
class User {
  @KeyPath({ autoIncrement: true })
  id?: number;

  @Index({ unique: true })
  email: string;

  @Index()
  age: number;

  name: string;
  address: string;
  cell?: string;
  status: 'active' | 'inactive' = 'active';
  createdAt: Date = new Date();

  constructor(
    name: string,
    email: string,
    age: number,
    address: string,
    cell?: string,
  ) {
    this.name = name;
    this.email = email;
    this.age = age;
    this.address = address;
    this.cell = cell;
  }
}

@DataClass({ version: 2 })
class Post {
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

  constructor(
    title: string,
    content: string,
    authorEmail: string,
    category: string = 'general',
  ) {
    this.title = title;
    this.content = content;
    this.authorEmail = authorEmail;
    this.category = category;
  }
}

@DataClass({ version: 1 })
@CompositeKeyPath(['userId', 'projectId'])
class UserProject {
  userId: string;
  projectId: string;

  @Index()
  role: 'admin' | 'member' | 'viewer';

  joinedAt: Date = new Date();
  permissions: string[] = [];

  constructor(
    userId: string,
    projectId: string,
    role: 'admin' | 'member' | 'viewer' = 'member',
  ) {
    this.userId = userId;
    this.projectId = projectId;
    this.role = role;
  }
}

@DataClass({ version: 1 })
class Activity {
  @KeyPath({
    generator: (item: Activity) => `${item.type}_${item.userId}_${Date.now()}`,
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

  constructor(
    userId: string,
    type: Activity['type'],
    metadata: Record<string, any> = {},
  ) {
    this.userId = userId;
    this.type = type;
    this.metadata = metadata;
  }
}

const databaseName = 'idb-playground-v1';

const seedData = {
  users: [
    new User(
      'Alice Johnson',
      'alice@example.com',
      28,
      '123 Main St',
      '+1234567890',
    ),
    new User('Bob Smith', 'bob@example.com', 32, '456 Oak Ave'),
    new User('Charlie Brown', 'charlie@example.com', 25, '789 Pine Rd'),
  ],
  posts: [
    new Post(
      'Getting Started with idb-ts',
      'This is a comprehensive guide to using idb-ts in the browser.',
      'alice@example.com',
      'tutorial',
    ),
    new Post(
      'Advanced Database Patterns',
      'A quick tour of more advanced IndexedDB query patterns.',
      'bob@example.com',
      'advanced',
    ),
  ],
  projects: [
    new UserProject('alice@example.com', 'project-alpha', 'admin'),
    new UserProject('bob@example.com', 'project-alpha', 'member'),
    new UserProject('alice@example.com', 'project-beta', 'admin'),
  ],
};

seedData.posts[0].tags = ['typescript', 'indexeddb', 'tutorial'];
seedData.posts[1].tags = ['database', 'patterns', 'advanced'];
seedData.projects[0].permissions = ['read', 'write', 'delete', 'manage'];
seedData.projects[1].permissions = ['read', 'write'];
seedData.projects[2].permissions = ['read', 'write', 'delete', 'manage'];

type PlaygroundDatabase = Database;

const appRoot = document.createElement('div');

function setDocumentTitle(): void {
  document.title = 'idb-ts live playground';
}

function injectStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      color-scheme: dark;
      --bg: #07111f;
      --panel: rgba(16, 25, 44, 0.88);
      --border: rgba(127, 164, 255, 0.16);
      --border-strong: rgba(118, 209, 255, 0.22);
      --text: #eef4ff;
      --muted: #9eb1d0;
      --accent: #6ee7ff;
      --accent-2: #9f7bff;
      --success: #69f0ae;
      --warning: #ffd166;
      --error: #ff7676;
      --shadow: 0 26px 80px rgba(0, 0, 0, 0.38);
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(circle at 20% 20%, rgba(110, 231, 255, 0.18), transparent 30%),
        radial-gradient(circle at 80% 0%, rgba(159, 123, 255, 0.2), transparent 28%),
        linear-gradient(180deg, #06101d 0%, #081423 100%);
      color: var(--text);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
      background-size: 36px 36px;
      mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
      pointer-events: none;
    }

    button,
    textarea,
    select {
      font: inherit;
    }

    button {
      border: 0;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #05111d;
      padding: 0.85rem 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 120ms ease, filter 120ms ease, opacity 120ms ease;
      box-shadow: 0 12px 30px rgba(110, 231, 255, 0.15);
    }

    button:hover {
      transform: translateY(-1px);
      filter: brightness(1.05);
    }

    button:disabled {
      opacity: 0.56;
      cursor: not-allowed;
      transform: none;
    }

    .shell {
      position: relative;
      max-width: 1480px;
      margin: 0 auto;
      padding: 24px;
    }

    .hero {
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
      align-items: stretch;
      margin-bottom: 18px;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }

    .hero-copy {
      padding: 26px;
      overflow: hidden;
      position: relative;
    }

    .hero-copy::after {
      content: '';
      position: absolute;
      inset: auto -12% -40% auto;
      width: 260px;
      height: 260px;
      border-radius: 999px;
      background: radial-gradient(circle, rgba(110, 231, 255, 0.22), transparent 70%);
      pointer-events: none;
    }

    .eyebrow {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      padding: 0.4rem 0.75rem;
      border: 1px solid rgba(110, 231, 255, 0.18);
      border-radius: 999px;
      color: var(--accent);
      background: rgba(110, 231, 255, 0.06);
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 14px 0 10px;
      font-size: clamp(2.15rem, 4vw, 4rem);
      line-height: 0.95;
      letter-spacing: -0.05em;
    }

    .lede {
      max-width: 72ch;
      margin: 0;
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.65;
    }

    .hero-meta {
      padding: 20px;
      display: grid;
      gap: 14px;
      align-content: start;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .stat {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.02);
    }

    .stat-label {
      display: block;
      color: var(--muted);
      font-size: 0.8rem;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .stat-value {
      font-size: 1.15rem;
      font-weight: 700;
      word-break: break-word;
    }

    .workspace {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
      gap: 18px;
      align-items: start;
    }

    .editor,
    .terminal {
      padding: 18px;
    }

    .editor-header,
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .panel-title {
      margin: 0;
      font-size: 0.92rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-top: 14px;
    }

    .toolbar .ghost {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: none;
    }

    .editor-area {
      width: 100%;
      min-height: 390px;
      resize: vertical;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: rgba(3, 8, 18, 0.58);
      color: #f4f8ff;
      padding: 16px;
      line-height: 1.55;
      tab-size: 2;
      outline: none;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .editor-area:focus {
      border-color: var(--border-strong);
      box-shadow: 0 0 0 4px rgba(110, 231, 255, 0.08);
    }

    .hint {
      margin: 12px 0 0;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .snippets {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 14px;
    }

    .snippet {
      text-align: left;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.04);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: none;
    }

    .snippet span {
      display: block;
      margin-top: 6px;
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 500;
    }

    .terminal {
      display: grid;
      gap: 14px;
    }

    .terminal-body {
      display: grid;
      gap: 10px;
      min-height: 390px;
      max-height: 680px;
      overflow: auto;
      padding-right: 4px;
    }

    .entry {
      border: 1px solid var(--border);
      background: rgba(2, 7, 17, 0.58);
      border-radius: 18px;
      padding: 14px;
    }

    .entry-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      color: var(--muted);
      font-size: 0.84rem;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .pill.info { background: rgba(110, 231, 255, 0.12); color: var(--accent); }
    .pill.success { background: rgba(105, 240, 174, 0.12); color: var(--success); }
    .pill.warn { background: rgba(255, 209, 102, 0.12); color: var(--warning); }
    .pill.error { background: rgba(255, 118, 118, 0.12); color: var(--error); }

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      color: #eef4ff;
      line-height: 1.55;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.9rem;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      overflow: hidden;
      border-radius: 14px;
    }

    .table th,
    .table td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.88rem;
      vertical-align: top;
    }

    .table th {
      color: var(--muted);
      font-weight: 600;
      background: rgba(255, 255, 255, 0.03);
    }

    .table tr:last-child td {
      border-bottom: 0;
    }

    .dataset-card {
      border-radius: 18px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.03);
      padding: 14px;
    }

    .dataset-card h3 {
      margin: 0 0 8px;
      font-size: 1rem;
    }

    .dataset-card p {
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--warning);
      box-shadow: 0 0 0 5px rgba(255, 209, 102, 0.12);
    }

    .status-dot.ready {
      background: var(--success);
      box-shadow: 0 0 0 5px rgba(105, 240, 174, 0.12);
    }

    .small {
      color: var(--muted);
      font-size: 0.86rem;
    }

    @media (max-width: 1100px) {
      .hero,
      .workspace {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 700px) {
      .shell {
        padding: 14px;
      }

      .stat-grid,
      .snippets {
        grid-template-columns: 1fr;
      }

      .editor-area {
        min-height: 320px;
      }
    }
  `;
  document.head.appendChild(style);
}

function formatTimestamp(): string {
  return new Date().toLocaleTimeString();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  return (
    JSON.stringify(
      value,
      (_key, currentValue) => {
        if (currentValue instanceof Date) {
          return currentValue.toISOString();
        }

        if (typeof currentValue === 'bigint') {
          return currentValue.toString();
        }

        if (currentValue instanceof Map) {
          return Object.fromEntries(currentValue.entries());
        }

        if (currentValue instanceof Set) {
          return Array.from(currentValue.values());
        }

        if (typeof currentValue === 'object' && currentValue !== null) {
          if (seen.has(currentValue)) {
            return '[Circular]';
          }

          seen.add(currentValue);
        }

        return currentValue;
      },
      2,
    ) ?? 'null'
  );
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  return safeStringify(value);
}

function renderTable(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) {
    return '<div class="small">No rows returned.</div>';
  }

  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  const head = columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join('');
  const body = rows
    .map((row) => {
      const cells = columns
        .map((column) => `<td>${escapeHtml(formatValue(row[column]))}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderValue(value: unknown): string {
  if (
    Array.isArray(value) &&
    value.every(
      (item) => item && typeof item === 'object' && !Array.isArray(item),
    )
  ) {
    return renderTable(value as Array<Record<string, unknown>>);
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return `<pre>${escapeHtml(formatValue(value))}</pre>`;
  }

  return `<pre>${escapeHtml(formatValue(value))}</pre>`;
}

function logMessage(
  output: HTMLElement,
  kind: LogKind,
  label: string,
  value: unknown,
): void {
  const entry = document.createElement('section');
  entry.className = 'entry';
  entry.innerHTML = `
    <div class="entry-head">
      <span>${escapeHtml(formatTimestamp())}</span>
      <span class="pill ${kind}">${escapeHtml(label)}</span>
    </div>
    <div>${renderValue(value)}</div>
  `;
  output.prepend(entry);
}

function logText(
  output: HTMLElement,
  kind: LogKind,
  label: string,
  text: string,
): void {
  const entry = document.createElement('section');
  entry.className = 'entry';
  entry.innerHTML = `
    <div class="entry-head">
      <span>${escapeHtml(formatTimestamp())}</span>
      <span class="pill ${kind}">${escapeHtml(label)}</span>
    </div>
    <pre>${escapeHtml(text)}</pre>
  `;
  output.prepend(entry);
}

function updateStats(
  stats: HTMLElement,
  database: PlaygroundDatabase | null,
): void {
  if (!database) {
    stats.innerHTML = `
      <div class="stat"><span class="stat-label">Database</span><span class="stat-value">not ready</span></div>
      <div class="stat"><span class="stat-label">Entities</span><span class="stat-value">0</span></div>
      <div class="stat"><span class="stat-label">Version</span><span class="stat-value">-</span></div>
      <div class="stat"><span class="stat-label">Mode</span><span class="stat-value">IndexedDB only</span></div>
    `;
    return;
  }

  stats.innerHTML = `
    <div class="stat"><span class="stat-label">Database</span><span class="stat-value">${escapeHtml(databaseName)}</span></div>
    <div class="stat"><span class="stat-label">Entities</span><span class="stat-value">${database.getAvailableEntities().length}</span></div>
    <div class="stat"><span class="stat-label">Version</span><span class="stat-value">${database.getDatabaseVersion()}</span></div>
    <div class="stat"><span class="stat-label">Mode</span><span class="stat-value">browser IndexedDB</span></div>
  `;
}

async function clearDatabase(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

async function createDatabase(): Promise<PlaygroundDatabase> {
  return Database.build(databaseName, [User, Post, UserProject, Activity]);
}

async function seedDatabase(database: PlaygroundDatabase): Promise<void> {
  const existingUsers = await database.User.list();
  if (existingUsers.length > 0) {
    return;
  }

  for (const user of seedData.users) {
    await database.User.create(user);
  }

  for (const post of seedData.posts) {
    await database.Post.create(post);
  }

  for (const project of seedData.projects) {
    await database.UserProject.create(project);
  }

  const activityEntries = [
    new Activity('alice@example.com', 'login', {
      ip: '192.168.1.100',
      browser: 'Chrome',
    }),
    new Activity('alice@example.com', 'post_created', {
      title: seedData.posts[0].title,
      category: seedData.posts[0].category,
    }),
    new Activity('bob@example.com', 'post_liked', {
      title: seedData.posts[0].title,
      likedBy: 'bob@example.com',
    }),
  ];

  for (const activity of activityEntries) {
    await database.Activity.create(activity);
  }
}

function createShellHelpers(output: HTMLElement) {
  return {
    log: (...parts: unknown[]) => {
      logText(
        output,
        'info',
        'log',
        parts.map((part) => formatValue(part)).join(' '),
      );
    },
    inspect: (value: unknown) => logMessage(output, 'info', 'result', value),
    clear: () => {
      output.innerHTML = '';
    },
  };
}

async function executeSnippet(
  database: PlaygroundDatabase,
  source: string,
  output: HTMLElement,
): Promise<unknown> {
  const helpers = createShellHelpers(output);
  const runner = new Function(
    'db',
    'User',
    'Post',
    'UserProject',
    'Activity',
    'helpers',
    `return (async () => {
      const { log, inspect, clear } = helpers;
      ${source}
    })();`,
  ) as (
    db: PlaygroundDatabase,
    UserCtor: typeof User,
    PostCtor: typeof Post,
    UserProjectCtor: typeof UserProject,
    ActivityCtor: typeof Activity,
    helpersArg: ReturnType<typeof createShellHelpers>,
  ) => Promise<unknown>;

  return runner(database, User, Post, UserProject, Activity, helpers);
}

function buildUi(): {
  editor: HTMLTextAreaElement;
  output: HTMLElement;
  stats: HTMLElement;
  statusDot: HTMLElement;
  statusText: HTMLElement;
  entityList: HTMLElement;
  runButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  loadButton: HTMLButtonElement;
} {
  appRoot.className = 'shell';
  appRoot.innerHTML = `
    <section class="hero">
      <article class="panel hero-copy">
        <span class="eyebrow">browser-only interactive playground</span>
        <h1>idb-ts live editor and shell.</h1>
        <p class="lede">
          Run real IndexedDB-backed queries in the browser, inspect structured output in the UI,
          and treat the page like a lightweight shell for the data model.
        </p>
        <div class="toolbar">
          <button class="primary" id="run-btn">Run query</button>
          <button class="ghost" id="load-btn">Load sample query</button>
          <button class="ghost" id="reset-btn">Reset database</button>
        </div>
        <p class="hint">
          Snippets execute inside an async sandbox with <code>db</code>, <code>User</code>, <code>Post</code>,
          <code>UserProject</code>, <code>Activity</code>, plus <code>log()</code> and <code>inspect()</code> helpers.
        </p>
      </article>
      <aside class="panel hero-meta">
        <div class="panel-header">
          <h2 class="panel-title">runtime status</h2>
          <span class="status-dot" id="status-dot"></span>
        </div>
        <div class="stat-grid" id="stats"></div>
        <div class="dataset-card">
          <h3 id="status-text">starting up</h3>
          <p>
            The app will build the database, seed sample records once, and then keep everything
            local to IndexedDB in this browser.
          </p>
        </div>
        <div class="dataset-card">
          <h3>available entities</h3>
          <p id="entity-list">Loading...</p>
        </div>
      </aside>
    </section>

    <section class="workspace">
      <article class="panel editor">
        <div class="editor-header">
          <h2 class="panel-title">editor</h2>
          <span class="small">Ctrl/Cmd + Enter to run</span>
        </div>
        <textarea id="editor" class="editor-area" spellcheck="false"></textarea>
        <div class="snippets">
          <button class="snippet" data-snippet="users">
            List users
            <span>return await db.User.list()</span>
          </button>
          <button class="snippet" data-snippet="query">
            Filter active users
            <span>query with sorting and paging</span>
          </button>
          <button class="snippet" data-snippet="index">
            Look up by index
            <span>find a user by email</span>
          </button>
          <button class="snippet" data-snippet="update">
            Mutate a record
            <span>fetch, edit, and update a project</span>
          </button>
        </div>
      </article>

      <article class="panel terminal">
        <div class="panel-header">
          <h2 class="panel-title">output</h2>
          <span class="small">latest entry appears first</span>
        </div>
        <div class="terminal-body" id="output"></div>
      </article>
    </section>
  `;

  document.body.replaceChildren(appRoot);

  return {
    editor: appRoot.querySelector<HTMLTextAreaElement>('#editor')!,
    output: appRoot.querySelector<HTMLElement>('#output')!,
    stats: appRoot.querySelector<HTMLElement>('#stats')!,
    statusDot: appRoot.querySelector<HTMLElement>('#status-dot')!,
    statusText: appRoot.querySelector<HTMLElement>('#status-text')!,
    entityList: appRoot.querySelector<HTMLElement>('#entity-list')!,
    runButton: appRoot.querySelector<HTMLButtonElement>('#run-btn')!,
    resetButton: appRoot.querySelector<HTMLButtonElement>('#reset-btn')!,
    loadButton: appRoot.querySelector<HTMLButtonElement>('#load-btn')!,
  };
}

function sampleSnippets(): Record<string, string> {
  return {
    users: `const users = await db.User.list();
inspect(users);
return users;`,
    query: `const activeUsers = await db.User.query()
  .where('status')
  .equals('active')
  .and('age')
  .gt(25)
  .orderBy('age', 'asc')
  .execute();

log('active users older than 25:', activeUsers.length);
return activeUsers;`,
    index: `const user = await db.User.findOneByIndex('email', 'alice@example.com');
if (!user) throw new Error('User not found');
return user;`,
    update: `const project = await db.UserProject.read(['alice@example.com', 'project-alpha']);
if (!project) throw new Error('Project relationship not found');
project.permissions.push('deploy');
await db.UserProject.update(project);
return project;`,
    starter: `const users = await db.User.list();
log('users in the database', users.length);

const tutorialPosts = await db.Post.query()
  .where('category')
  .equals('tutorial')
  .execute();

return {
  summary: 'run your own snippet here',
  firstUser: users[0],
  tutorialPosts,
};`,
  };
}

async function main(): Promise<void> {
  setDocumentTitle();
  injectStyles();

  const ui = buildUi();
  ui.editor.value = sampleSnippets().starter;

  let database: PlaygroundDatabase | null = null;
  const setReadyState = (ready: boolean, message: string): void => {
    ui.statusDot.classList.toggle('ready', ready);
    ui.statusText.textContent = message;
    ui.runButton.disabled = !ready;
    ui.resetButton.disabled = !ready;
    ui.loadButton.disabled = !ready;
    updateStats(ui.stats, database);
    ui.entityList.textContent = database
      ? database.getAvailableEntities().join(', ')
      : 'Loading...';
  };

  setReadyState(false, 'building database');
  logText(ui.output, 'info', 'boot', 'starting playground bootstrap');

  try {
    await clearDatabase();
    database = await createDatabase();
    await seedDatabase(database);
    setReadyState(true, 'ready to query');
    logMessage(ui.output, 'success', 'ready', {
      database: databaseName,
      version: database.getDatabaseVersion(),
      entities: database.getAvailableEntities(),
    });
    logMessage(ui.output, 'info', 'seeded data', {
      users: await database.User.list(),
      posts: await database.Post.list(),
      userProjects: await database.UserProject.list(),
    });
  } catch (error) {
    setReadyState(false, 'failed to initialize');
    logMessage(ui.output, 'error', 'init failed', error);
    throw error;
  }

  const runCurrentSnippet = async (): Promise<void> => {
    if (!database) {
      return;
    }

    const source = ui.editor.value.trim();
    if (!source) {
      logText(ui.output, 'warn', 'empty', 'write a snippet before running it');
      return;
    }

    ui.runButton.disabled = true;
    logText(ui.output, 'info', 'query', source);

    try {
      const result = await executeSnippet(database, source, ui.output);
      if (typeof result !== 'undefined') {
        logMessage(ui.output, 'success', 'result', result);
      } else {
        logText(
          ui.output,
          'success',
          'done',
          'snippet completed without an explicit return value',
        );
      }
    } catch (error) {
      logMessage(ui.output, 'error', 'runtime error', error);
    } finally {
      ui.runButton.disabled = false;
    }
  };

  ui.runButton.addEventListener('click', () => {
    void runCurrentSnippet();
  });

  ui.loadButton.addEventListener('click', () => {
    ui.editor.value = sampleSnippets().starter;
    ui.editor.focus();
  });

  ui.resetButton.addEventListener('click', async () => {
    ui.resetButton.disabled = true;
    ui.runButton.disabled = true;
    setReadyState(false, 'resetting database');
    logText(
      ui.output,
      'warn',
      'reset',
      'dropping database and rebuilding seed data',
    );

    try {
      await clearDatabase();
      database = await createDatabase();
      await seedDatabase(database);
      setReadyState(true, 'ready to query');
      logMessage(ui.output, 'success', 'reset complete', {
        database: databaseName,
        entities: database.getAvailableEntities(),
      });
    } catch (error) {
      logMessage(ui.output, 'error', 'reset failed', error);
    } finally {
      ui.resetButton.disabled = false;
      ui.runButton.disabled = !database;
    }
  });

  appRoot
    .querySelectorAll<HTMLButtonElement>('[data-snippet]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const snippetName = button.dataset.snippet as keyof ReturnType<
          typeof sampleSnippets
        >;
        const snippets = sampleSnippets();
        ui.editor.value = snippets[snippetName] ?? snippets.starter;
        ui.editor.focus();
      });
    });

  ui.editor.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void runCurrentSnippet();
    }
  });
}

void main().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<pre style="color:#ff7676;padding:24px;font-family:monospace;white-space:pre-wrap;">${escapeHtml(
    formatValue(error),
  )}</pre>`;
});
