import { Database, KeyPath, DataClass, Index } from '../index';

describe('IndexedDB annotation', () => {
  it('should throw error if class is missing @KeyPath', async () => {
    const build = async () => {
      @DataClass()
      class BadClass {
        x!: number;
      }

      await Database.build('InvalidDB', [BadClass]);
    };

    await expect(build()).rejects.toThrow(/No keypath field defined/);
  });

  it('should throw error if class is missing @DataClass', async () => {
    class RawClass {
      @KeyPath()
      id!: string;
    }

    await expect(async () => {
      await Database.build('InvalidDB2', [RawClass]);
    }).rejects.toThrow(/All classes should be decorated/);
  });

  it('should throw error if multiple keypaths are defined', () => {
    expect(() => {
      @DataClass()
      class MultiKey1 {
        @KeyPath() x!: string;
        @KeyPath() y!: string;
      }

      void MultiKey1;
    }).toThrow(/Only one keypath field can be defined/);
  });

  it('should throw error if even one class is not decorated with @DataClass', async () => {
    @DataClass()
    class Good {
      @KeyPath()
      id!: string;
    }

    class Bad {
      @KeyPath()
      id!: string;
    }

    await expect(async () => {
      await Database.build('InvalidDB3', [Good, Bad]);
    }).rejects.toThrow(/All classes should be decorated/);
  });

  it('should work with @Index decorator', async () => {
    @DataClass()
    class IndexedUser {
      @KeyPath()
      id!: string;

      @Index()
      email!: string;

      name!: string;
    }

    const db = await Database.build('IndexedDB', [IndexedUser]);
    expect(db).toBeDefined();
  });

  it('should expose getAvailableEntities utility', async () => {
    @DataClass()
    class Foo {
      @KeyPath()
      id!: string;
    }

    @DataClass()
    class Bar {
      @KeyPath()
      id!: string;
    }

    const db = await Database.build('UtilDB', [Foo, Bar]);
    const entities = db.getAvailableEntities();
    expect(entities).toContain('Foo');
    expect(entities).toContain('Bar');
  });

});
