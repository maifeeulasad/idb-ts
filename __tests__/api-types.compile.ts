import type { EntityRepository } from '../index';
import { Database, DataClass, KeyPath, Index } from '../index';

@DataClass()
class StrictEntity {
  @KeyPath()
  id!: string;

  @Index()
  email!: string;

  age!: number;
}

async function verifyApiTypes() {
  const db = await Database.build<{
    StrictEntity: EntityRepository<StrictEntity>;
  }>('ApiTypeCheckDB', [StrictEntity]);

  // exists() accepts every primary key shape, matching read()/delete().
  await db.StrictEntity.exists('simple');
  await db.StrictEntity.exists(42);
  await db.StrictEntity.exists(['composite', 'key']);

  // Index lookups accept valid IDB keys.
  await db.StrictEntity.findByIndex('email', 'a@example.com');
  await db.StrictEntity.findByIndex('email', 42);
  await db.StrictEntity.findByIndex('email', new Date());
  await db.StrictEntity.findOneByIndex('email', ['a', 'b']);

  // Index range bounds are typed as IDB keys.
  db.StrictEntity.query().useIndex('email').range('a', 'z');
  db.StrictEntity.query().useIndex('email').range(1, 99);
  db.StrictEntity.query().useIndex('email').range(undefined, 'z');

  // @ts-expect-error booleans are not valid IndexedDB keys
  await db.StrictEntity.findByIndex('email', true);

  // @ts-expect-error objects are not valid IndexedDB keys
  await db.StrictEntity.findOneByIndex('email', { nested: true });

  // @ts-expect-error booleans are not valid IndexedDB range bounds
  db.StrictEntity.query().useIndex('email').range(true, false);

  // @ts-expect-error null is not a valid exists() key
  await db.StrictEntity.exists(null);
}

void verifyApiTypes();
