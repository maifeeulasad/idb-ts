import { Database, KeyPath, DataClass } from '../index';

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

});
