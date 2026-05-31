import type { EntityRepository } from '../index';
import { Database, DataClass, KeyPath } from '../index';

@DataClass()
class TypedEntity {
  @KeyPath()
  id!: string;

  name!: string;
  age!: number;
  tags!: string[];
  active!: boolean;
  createdAt!: number;
}

async function verifyQueryTypes() {
  const db = await Database.build<{
    TypedEntity: EntityRepository<TypedEntity>;
  }>('TypeCheckDB', [TypedEntity]);

  db.TypedEntity.query().where('name').startsWith('John');
  db.TypedEntity.query().where('name').endsWith('son');
  db.TypedEntity.query().where('name').contains('ohn');
  db.TypedEntity.query().where('name').matches(/^J/);
  db.TypedEntity.query().where('age').between(18, 65);
  db.TypedEntity.query().where('age').notBetween(0, 10);
  db.TypedEntity.query().where('tags').contains('typescript');
  db.TypedEntity.query().where('tags').containsAny(['typescript', 'node']);
  db.TypedEntity.query().where('tags').containsAll(['typescript']);
  db.TypedEntity.query().where('age')['in']([18, 25, 65]);
  db.TypedEntity.query().where('age').notIn([1, 2, 3]);
  db.TypedEntity.query().groupBy('active').count();
  db.TypedEntity.query().sum('age');
  db.TypedEntity.query().avg('age');
  db.TypedEntity.query().min('createdAt');
  db.TypedEntity.query().max('createdAt');

  // @ts-expect-error string-only operator on a numeric field
  db.TypedEntity.query().where('age').startsWith('John');

  // @ts-expect-error collection-only operator on a string field
  db.TypedEntity.query().where('name').containsAny(['John']);

  // @ts-expect-error regex matches only applies to string fields
  db.TypedEntity.query().where('tags').matches(/x/);

  // @ts-expect-error sum is numeric only
  db.TypedEntity.query().sum('name');

  // @ts-expect-error avg is numeric only
  db.TypedEntity.query().avg('tags');

  // @ts-expect-error min is only for comparable scalar fields
  db.TypedEntity.query().min('tags');

  // @ts-expect-error max is only for comparable scalar fields
  db.TypedEntity.query().max('tags');
}

void verifyQueryTypes();
