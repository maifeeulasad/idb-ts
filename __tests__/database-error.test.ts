import { Database, DataClass, KeyPath } from '../index';

@DataClass()
class DatabaseErrorTestEntity {
  @KeyPath()
  id!: string;
  value!: string;
}

describe('Database Error Handling', () => {
  let originalIndexedDB: any;

  beforeEach(() => {
    // Store the original IndexedDB
    originalIndexedDB = global.indexedDB;
  });

  afterEach(() => {
    // Restore the original IndexedDB
    global.indexedDB = originalIndexedDB;
  });

  it('should handle database initialization errors', async () => {
    // Mock IndexedDB to return an error
    const mockOpen = jest.fn().mockImplementation(() => {
      const mockRequest = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        error: new Error('Database initialization failed'),
        result: null,
        readyState: 'pending',
        source: null,
        transaction: null
      };

      // Simulate an error after a short delay
      setTimeout(() => {
        if (mockRequest.onerror) {
          mockRequest.onerror();
        }
      }, 10);

      return mockRequest;
    });

    global.indexedDB = {
      open: mockOpen,
      deleteDatabase: jest.fn(),
      databases: jest.fn(),
      cmp: jest.fn()
    } as any;

    // This should trigger the error path in lines 263-264
    await expect(Database.build('test-error-db', [DatabaseErrorTestEntity])).rejects.toThrow();
  });
});
