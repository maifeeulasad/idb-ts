import { Database, DataClass, KeyPath, CompositeKeyPath } from '../index';

@DataClass()
class NumericKeyed {
  @KeyPath({ autoIncrement: true })
  id!: number;

  label!: string;

  constructor(label: string) {
    this.label = label;
  }
}

@DataClass()
@CompositeKeyPath(['region', 'code'])
class Locale {
  region!: string;
  code!: string;

  constructor(region: string, code: string) {
    this.region = region;
    this.code = code;
  }
}

describe('exists() accepts every primary key shape', () => {
  let db: any;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('ApiTypesDB');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db = await Database.build('ApiTypesDB', [NumericKeyed, Locale]);
  });

  afterAll(() => db.close());

  it('checks numeric auto-increment keys', async () => {
    await db.NumericKeyed.create(new NumericKeyed('first'));
    expect(await db.NumericKeyed.exists(1)).toBe(true);
    expect(await db.NumericKeyed.exists(999)).toBe(false);
  });

  it('checks composite keys passed as arrays', async () => {
    await db.Locale.create(new Locale('eu', 'de-DE'));
    expect(await db.Locale.exists(['eu', 'de-DE'])).toBe(true);
    expect(await db.Locale.exists(['eu', 'fr-FR'])).toBe(false);
  });
});
