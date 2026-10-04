import { Database, DataClass, KeyGenerators, KeyPath } from '../index';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(jest.requireActual('crypto').randomUUID),
  randomBytes: jest.fn(jest.requireActual('crypto').randomBytes),
}));

const nodeCrypto = require('crypto');
const actualRandomUUID = jest.requireActual('crypto').randomUUID;
const actualRandomBytes = jest.requireActual('crypto').randomBytes;

@DataClass()
class V6Keyed {
  @KeyPath({ generator: 'uuidv6' })
  id?: string;

  label!: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@DataClass()
class UnknownGeneratorEntity {
  @KeyPath({ generator: 'bogus' as any })
  id?: string;
}

describe('KeyGenerators', () => {
  it('leaves the key unset for an unrecognized generator string', async () => {
    const db: any = await Database.build('UnknownGeneratorDB', [
      UnknownGeneratorEntity,
    ]);
    await expect(
      db.UnknownGeneratorEntity.create({} as UnknownGeneratorEntity),
    ).rejects.toBeDefined();
    db.close();
  });

  it('generator: "uuidv6" produces a valid UUID and persists the record', async () => {
    const db: any = await Database.build('KeyGenV6DB', [V6Keyed]);
    await db.V6Keyed.create({ label: 'hello' } as V6Keyed);

    const all = await db.V6Keyed.list();
    expect(all).toHaveLength(1);
    expect(all[0].id).toMatch(UUID_PATTERN);
    // UUID v6 encodes version 6 in the 13th hex digit.
    expect(all[0].id.charAt(14)).toBe('6');

    const direct = KeyGenerators.uuidV6();
    expect(direct).toMatch(UUID_PATTERN);
    expect(direct.charAt(14)).toBe('6');

    db.close();
  });

  describe('fallback chain when the Web Crypto API is unavailable', () => {
    // globalThis.crypto is a non-writable accessor in modern Node, so a
    // plain assignment silently no-ops - redefine the property instead.
    let originalDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalDescriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        'crypto',
      );
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        configurable: true,
      });
    });

    afterEach(() => {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, 'crypto', originalDescriptor);
      }
      nodeCrypto.randomUUID.mockImplementation(actualRandomUUID);
      nodeCrypto.randomBytes.mockImplementation(actualRandomBytes);
    });

    it('falls back to the Node crypto module for uuidV4() and uuidV6()', () => {
      const id = KeyGenerators.uuidV4();
      expect(id).toMatch(UUID_PATTERN);

      const v6 = KeyGenerators.uuidV6();
      expect(v6).toMatch(UUID_PATTERN);
    });

    it('falls back when crypto is present but lacks randomUUID()', () => {
      Object.defineProperty(globalThis, 'crypto', {
        value: {},
        configurable: true,
      });

      const id = KeyGenerators.uuidV4();
      expect(id).toMatch(UUID_PATTERN);
    });

    it('falls back to Math.random() when the Node crypto module also fails', () => {
      nodeCrypto.randomUUID.mockImplementation(() => {
        throw new Error('randomUUID unavailable');
      });
      nodeCrypto.randomBytes.mockImplementation(() => {
        throw new Error('randomBytes unavailable');
      });

      const id = KeyGenerators.uuidV4();
      expect(id).toMatch(UUID_PATTERN);

      const v6 = KeyGenerators.uuidV6();
      expect(v6).toMatch(UUID_PATTERN);
    });
  });
});
