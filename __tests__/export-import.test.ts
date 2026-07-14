import { Database, DataClass, KeyPath, Index } from '../index';

@DataClass()
class Author {
  @KeyPath()
  id!: string;

  @Index()
  name!: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

@DataClass()
class Book {
  @KeyPath()
  isbn!: string;

  title!: string;
  authorId!: string;

  constructor(isbn: string, title: string, authorId: string) {
    this.isbn = isbn;
    this.title = title;
    this.authorId = authorId;
  }
}

const destroy = (name: string): Promise<void> =>
  new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });

describe('Database export/import', () => {
  let db: any;

  beforeAll(async () => {
    await destroy('ExportSourceDB');
    await destroy('ImportTargetDB');
    db = await Database.build('ExportSourceDB', [Author, Book]);
    await db.Author.create(new Author('a1', 'Ursula K. Le Guin'));
    await db.Book.create(new Book('978-0', 'A Wizard of Earthsea', 'a1'));
    await db.Book.create(new Book('978-1', 'The Dispossessed', 'a1'));
  });

  afterAll(() => db.close());

  it('exports every registered store keyed by entity name', async () => {
    const dump = await db.exportDatabase();

    expect(Object.keys(dump).sort()).toEqual(['Author', 'Book']);
    expect(dump.Author).toHaveLength(1);
    expect(dump.Book).toHaveLength(2);
    expect(dump.Author[0].name).toBe('Ursula K. Le Guin');
    // Internal timestamps are part of the record and survive the export.
    expect(typeof dump.Author[0].__idb_createdAt).toBe('number');
  });

  it('imports a dump into another database preserving records verbatim', async () => {
    const dump = await db.exportDatabase();

    const target: any = await Database.build('ImportTargetDB', [Author, Book]);
    await target.importDatabase(dump);

    expect(await target.Book.count()).toBe(2);
    const author = await target.Author.read('a1');
    expect(author?.name).toBe('Ursula K. Le Guin');
    // Timestamps are preserved verbatim, not regenerated.
    expect(author?.__idb_createdAt).toBe(dump.Author[0].__idb_createdAt);
    target.close();
  });

  it('import with clear replaces existing data', async () => {
    const target: any = await Database.build('ImportTargetDB', [Author, Book]);
    await target.Book.create(new Book('999-9', 'Stale record', 'a1'));

    const dump = await db.exportDatabase();
    await target.importDatabase(dump, { clear: true });

    expect(await target.Book.count()).toBe(2);
    expect(await target.Book.read('999-9')).toBeUndefined();
    target.close();
  });

  it('import without clear upserts into existing data', async () => {
    const target: any = await Database.build('ImportTargetDB', [Author, Book]);
    await target.Book.create(new Book('999-8', 'Kept record', 'a1'));

    await target.importDatabase(await db.exportDatabase());

    expect(await target.Book.count()).toBe(3);
    expect((await target.Book.read('999-8'))?.title).toBe('Kept record');
    target.close();
  });

  it('ignores dump entries for unregistered entities', async () => {
    const target: any = await Database.build('ImportTargetDB', [Author, Book]);
    await expect(
      target.importDatabase({ Ghost: [{ id: 'g1' }] }),
    ).resolves.toBeUndefined();
    target.close();
  });
});
