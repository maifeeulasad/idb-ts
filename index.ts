import 'reflect-metadata';

/**
 * Specifies the sort direction for query results.
 *
 * @remarks
 * Used with {@link QueryBuilder.orderBy} to control ascending or descending record order.
 */
type QueryDirection = 'asc' | 'desc';

/**
 * Logical connector used to combine adjacent query clauses.
 *
 * - `'and'` - both conditions must be satisfied (default).
 * - `'or'`  - either condition may be satisfied.
 */
type QueryConnector = 'and' | 'or';

/**
 * Extracts all `string`-assignable keys from type `T`.
 *
 * @typeParam T - The entity type to inspect.
 */
type QueryFieldKey<T> = Extract<keyof T, string>;

/**
 * Values that support comparison operators (`gt`, `gte`, `lt`, `lte`, `between`).
 */
type ComparableValue = string | number | bigint | Date;

/**
 * Narrows `QueryFieldKey<T>` to only those keys whose value type extends {@link ComparableValue}.
 *
 * @typeParam T - The entity type to inspect.
 */
type ComparableFieldKey<T> = {
  [K in QueryFieldKey<T>]-?: T[K] extends ComparableValue ? K : never;
}[QueryFieldKey<T>];

/**
 * Narrows `QueryFieldKey<T>` to only those keys whose value type is `number`.
 *
 * @typeParam T - The entity type to inspect.
 */
type NumericFieldKey<T> = {
  [K in QueryFieldKey<T>]-?: T[K] extends number ? K : never;
}[QueryFieldKey<T>];

/**
 * Narrows `QueryFieldKey<T>` to only those keys whose value type is `string`.
 *
 * @typeParam T - The entity type to inspect.
 */
type StringFieldKey<T> = {
  [K in QueryFieldKey<T>]-?: T[K] extends string ? K : never;
}[QueryFieldKey<T>];

/**
 * Narrows `QueryFieldKey<T>` to only those keys whose value type is a readonly array.
 *
 * @typeParam T - The entity type to inspect.
 */
type ArrayFieldKey<T> = {
  [K in QueryFieldKey<T>]-?: T[K] extends readonly any[] ? K : never;
}[QueryFieldKey<T>];

/**
 * Resolves to the element type of an array type `T`.
 *
 * @typeParam T - An array type.
 *
 * @example
 * ```ts
 * type Elem = ArrayElement<string[]>; // string
 * ```
 */
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Resolves the value type accepted by the `contains` operator for field `T`.
 *
 * - For `string` fields, accepts a `string` substring.
 * - For array fields, accepts an element of that array.
 *
 * @typeParam T - The field value type.
 */
type ContainsValue<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
  ? U
  : never;

/**
 * All filter operators supported by {@link FieldQueryBuilder} and {@link QueryBuilder}.
 *
 * | Operator       | Applicable field types          | Description                                      |
 * |----------------|---------------------------------|--------------------------------------------------|
 * | `equals`       | any                             | Strict equality (`===`).                         |
 * | `gt`           | {@link ComparableValue}         | Greater than.                                    |
 * | `gte`          | {@link ComparableValue}         | Greater than or equal.                           |
 * | `lt`           | {@link ComparableValue}         | Less than.                                       |
 * | `lte`          | {@link ComparableValue}         | Less than or equal.                              |
 * | `startsWith`   | `string`                        | String prefix match.                             |
 * | `endsWith`     | `string`                        | String suffix match.                             |
 * | `contains`     | `string` \| array               | Substring or array membership.                   |
 * | `matches`      | `string`                        | Regular-expression test.                         |
 * | `between`      | {@link ComparableValue}         | Inclusive range `[start, end]`.                  |
 * | `notBetween`   | {@link ComparableValue}         | Outside the range `(start, end)`.                |
 * | `in`           | any                             | Value present in a supplied list.                |
 * | `notIn`        | any                             | Value absent from a supplied list.               |
 * | `containsAny`  | array                           | Array field contains at least one supplied value.|
 * | `containsAll`  | array                           | Array field contains every supplied value.       |
 */
type QueryOperator =
  | 'equals'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'startsWith'
  | 'endsWith'
  | 'contains'
  | 'matches'
  | 'between'
  | 'notBetween'
  | 'in'
  | 'notIn'
  | 'containsAny'
  | 'containsAll';

/**
 * Base structure shared by all query clauses.
 *
 * @internal
 */
interface QueryClauseBase {
  /** Logical connector joining this clause to its predecessor, or `null` for the first clause. */
  connector: QueryConnector | null;
}

/**
 * A leaf query clause that tests a single field against an operator and value.
 *
 * @internal
 */
interface QueryCondition extends QueryClauseBase {
  kind: 'condition';
  /** Name of the entity field being tested. */
  field: string;
  /** Filter operator applied to the field value. */
  op: QueryOperator;
  /** Reference value for the comparison. */
  value: any;
}

/**
 * A composite query clause containing a nested list of {@link QueryClause} nodes.
 * All clauses in the group are evaluated together and their combined result
 * is treated as a single boolean for the outer clause tree.
 *
 * @internal
 */
interface QueryGroup extends QueryClauseBase {
  kind: 'group';
  /** Nested clauses evaluated as a logical sub-expression. */
  clauses: QueryClause[];
}

/**
 * A discriminated union of all possible clause node types.
 *
 * @internal
 */
type QueryClause = QueryCondition | QueryGroup;

/**
 * Return type of {@link QueryBuilder.count} when `groupBy` has been called.
 *
 * Each element carries the value of the grouped field together with the
 * number of records sharing that value.
 *
 * @typeParam T - The entity type.
 * @typeParam K - The field key used as the grouping dimension.
 */
type GroupCountResult<T, K extends Extract<keyof T, string>> = Array<
  Record<K, T[K]> & { count: number }
>;

/**
 * A type-safe, fluent builder that appends filter conditions for a single field
 * onto the parent {@link QueryBuilder}.
 *
 * Instances are created by calling {@link QueryBuilder.where} with a field name.
 * Every terminal method (e.g., `equals`, `gt`, `contains`) appends the
 * corresponding {@link QueryCondition} to the parent builder and returns the
 * parent, enabling chained query construction.
 *
 * @typeParam T - The entity type being queried.
 * @typeParam K - The specific field key this builder targets.
 *
 * @example
 * ```ts
 * const results = await db.User.query()
 *   .where('age').gte(18)
 *   .and('status').equals('active')
 *   .execute();
 * ```
 */
class FieldQueryBuilder<T, K extends QueryFieldKey<T>> {
  constructor(
    private parent: QueryBuilder<T>,
    private field: K,
  ) { }

  /**
   * Filters records where `field === value`.
   *
   * @param value - The exact value to match.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  equals(value: T[K]): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'equals', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `field > value`.
   * Only available on fields whose type extends {@link ComparableValue}.
   *
   * @param value - The exclusive lower bound.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  gt(value: T[K] extends ComparableValue ? T[K] : never): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'gt', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `field >= value`.
   * Only available on fields whose type extends {@link ComparableValue}.
   *
   * @param value - The inclusive lower bound.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  gte(value: T[K] extends ComparableValue ? T[K] : never): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'gte', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `field < value`.
   * Only available on fields whose type extends {@link ComparableValue}.
   *
   * @param value - The exclusive upper bound.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  lt(value: T[K] extends ComparableValue ? T[K] : never): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'lt', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `field <= value`.
   * Only available on fields whose type extends {@link ComparableValue}.
   *
   * @param value - The inclusive upper bound.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  lte(value: T[K] extends ComparableValue ? T[K] : never): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'lte', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where the string field starts with `value`.
   * Only available on `string` fields.
   *
   * @param value - The required prefix.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  startsWith(
    this: FieldQueryBuilder<T, StringFieldKey<T>>,
    value: string,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'startsWith', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where the string field ends with `value`.
   * Only available on `string` fields.
   *
   * @param value - The required suffix.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  endsWith(
    this: FieldQueryBuilder<T, StringFieldKey<T>>,
    value: string,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'endsWith', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where the field contains `value`.
   *
   * - For `string` fields: tests substring inclusion.
   * - For array fields: tests element membership.
   *
   * Only available on `string` or array fields.
   *
   * @param value - The substring or element to search for.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  contains(
    this:
      | FieldQueryBuilder<T, StringFieldKey<T>>
      | FieldQueryBuilder<T, ArrayFieldKey<T>>,
    value: ContainsValue<T[K]>,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'contains', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where the string field matches the given regular expression.
   * Only available on `string` fields.
   *
   * @param value - A `RegExp` instance or a pattern string. When a string is
   *   provided it is passed to `new RegExp(value)`.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  matches(
    this: FieldQueryBuilder<T, StringFieldKey<T>>,
    value: RegExp | string,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'matches', value);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `start <= field <= end` (inclusive on both bounds).
   * Only available on fields whose type extends {@link ComparableValue}.
   *
   * @param start - The inclusive lower bound.
   * @param end   - The inclusive upper bound.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  between(
    start: T[K] extends ComparableValue ? T[K] : never,
    end: T[K] extends ComparableValue ? T[K] : never,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'between', [start, end]);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `field < start || field > end`
   * (exclusive on both bounds, i.e., outside the range).
   * Only available on fields whose type extends {@link ComparableValue}.
   *
   * @param start - The lower boundary of the excluded range.
   * @param end   - The upper boundary of the excluded range.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  notBetween(
    start: T[K] extends ComparableValue ? T[K] : never,
    end: T[K] extends ComparableValue ? T[K] : never,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'notBetween', [start, end]);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `field` is present in `values`.
   *
   * @param values - The allowed values.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  in(values: Array<T[K]>): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'in', values);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where `field` is **not** present in `values`.
   *
   * @param values - The disallowed values.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  notIn(values: Array<T[K]>): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'notIn', values);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where the array field contains **at least one** of `values`.
   * Only available on array fields.
   *
   * @param values - One or more elements to search for.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  containsAny(
    this: FieldQueryBuilder<T, ArrayFieldKey<T>>,
    values: Array<ArrayElement<T[K]>>,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'containsAny', values);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Filters records where the array field contains **every** element in `values`.
   * Only available on array fields.
   *
   * @param values - All elements that must be present.
   * @returns The parent {@link QueryBuilder} for further chaining.
   */
  containsAll(
    this: FieldQueryBuilder<T, ArrayFieldKey<T>>,
    values: Array<ArrayElement<T[K]>>,
  ): QueryBuilder<T> {
    this.parent.appendCondition(this.field, 'containsAll', values);
    this.parent.clearCurrentField();
    return this.parent;
  }

  /**
   * Appends an `AND` clause for the given field and returns a new
   * {@link FieldQueryBuilder} targeting that field.
   *
   * @typeParam K2 - The key of the next field.
   * @param field  - The entity field to target.
   * @returns A new {@link FieldQueryBuilder} for `field`.
   */
  and<K2 extends QueryFieldKey<T>>(field: K2): FieldQueryBuilder<T, K2> {
    this.parent.clearCurrentField();
    return this.parent.and(field);
  }

  /**
   * Sets the pending logical connector to `'or'` and returns the parent
   * {@link QueryBuilder}, ready to begin the next clause.
   *
   * @returns The parent {@link QueryBuilder}.
   */
  or(): QueryBuilder<T> {
    this.parent.clearCurrentField();
    return this.parent.or();
  }
}

/**
 * Fluent query builder for constructing, filtering, sorting, and aggregating
 * records stored in an IndexedDB object store.
 *
 * Obtain an instance through {@link EntityRepository.query}. Do not instantiate
 * this class directly.
 *
 * @typeParam T - The entity type being queried.
 *
 * @remarks
 * The builder accumulates filter clauses, ordering directives, and pagination
 * constraints, then executes them in memory after fetching candidates from
 * IndexedDB. When an index and optional range are configured via
 * {@link QueryBuilder.useIndex} and {@link QueryBuilder.range}, the initial
 * candidate set is narrowed at the IDB layer before in-memory filtering begins.
 *
 * @example Basic filtering with chaining
 * ```ts
 * const results = await db.User.query()
 *   .where('age').gte(18)
 *   .and('status').equals('active')
 *   .orderBy('name')
 *   .limit(20)
 *   .execute();
 * ```
 *
 * @example Aggregation
 * ```ts
 * const total = await db.Order.query().where('status').equals('paid').sum('amount');
 * const grouped = await db.Order.query().groupBy('status').count();
 * ```
 */
class QueryBuilder<T> {
  private db: IDBDatabase;
  private storeName: string;
  private transaction?: IDBTransaction;
  private clauses: QueryClause[] = [];
  private orderField?: Extract<keyof T, string>;
  private orderDirection: QueryDirection = 'asc';
  private limitCount?: number;
  private offsetCount?: number;
  private indexName?: string;
  private rangeStart?: any;
  private rangeEnd?: any;
  private currentField?: string;
  private groupField?: Extract<keyof T, string>;
  private pendingConnector: QueryConnector = 'and';

  /** @internal */
  constructor(
    db: IDBDatabase,
    storeName: string,
    transaction?: IDBTransaction,
  ) {
    this.db = db;
    this.storeName = storeName;
    this.transaction = transaction;
  }

  /**
   * Begins a filter condition for the given field, or adds a nested group
   * via a builder callback.
   *
   * @overload
   * @param field - The entity field to target.
   * @returns A {@link FieldQueryBuilder} for `field`.
   *
   * @overload
   * @param builder - A callback that receives a nested {@link QueryBuilder} and
   *   appends clauses to it. The entire sub-expression is treated as a single
   *   grouped condition in the outer query.
   * @returns `this` for chaining.
   *
   * @example Field form
   * ```ts
   * query.where('age').gte(18)
   * ```
   *
   * @example Grouped form
   * ```ts
   * query
   *   .where((qb) =>
   *     qb.where('type').equals('premium').and('status').equals('active'),
   *   )
   *   .or()
   *   .where('isTrial').equals(true)
   * ```
   */
  where<K extends QueryFieldKey<T>>(field: K): FieldQueryBuilder<T, K>;
  where(builder: (query: QueryBuilder<T>) => QueryBuilder<T> | void): this;
  where(
    fieldOrBuilder:
      | QueryFieldKey<T>
      | ((query: QueryBuilder<T>) => QueryBuilder<T> | void),
  ): this | FieldQueryBuilder<T, any> {
    if (typeof fieldOrBuilder === 'function') {
      this.clearCurrentField();
      return this.addNestedGroup(fieldOrBuilder);
    }

    this.currentField = fieldOrBuilder;
    return new FieldQueryBuilder<T, any>(this, fieldOrBuilder);
  }

  /**
   * Alias for {@link QueryBuilder.where} that conveys `AND` semantics.
   * Accepts both the field-name and builder-callback overloads.
   *
   * @param fieldOrBuilder - A field key or a nested-group builder callback.
   * @returns A {@link FieldQueryBuilder} (field overload) or `this` (builder overload).
   */
  and<K extends QueryFieldKey<T>>(field: K): FieldQueryBuilder<T, K>;
  and(builder: (query: QueryBuilder<T>) => QueryBuilder<T> | void): this;
  and(
    fieldOrBuilder:
      | QueryFieldKey<T>
      | ((query: QueryBuilder<T>) => QueryBuilder<T> | void),
  ): this | FieldQueryBuilder<T, any> {
    return this.where(fieldOrBuilder as any);
  }

  /**
   * Sets the logical connector for the **next** clause to `'or'`.
   *
   * @returns `this` for chaining.
   *
   * @example
   * ```ts
   * query.where('age').lt(18).or().where('hasParentalConsent').equals(true)
   * ```
   */
  or(): this {
    this.pendingConnector = 'or';
    return this;
  }

  /** @internal */
  private addNestedGroup(
    builder: (query: QueryBuilder<T>) => QueryBuilder<T> | void,
  ): this {
    const nested = new QueryBuilder<T>(
      this.db,
      this.storeName,
      this.transaction,
    );
    const returned = builder(nested) ?? nested;
    const clauses =
      returned instanceof QueryBuilder ? returned.clauses : nested.clauses;
    this.appendClause({ kind: 'group', clauses });
    return this;
  }

  /**
   * Clears the internally tracked "current field" pointer.
   * Called automatically by terminal {@link FieldQueryBuilder} methods.
   *
   * @internal
   */
  clearCurrentField(): void {
    this.currentField = undefined;
  }

  /**
   * Appends a leaf {@link QueryCondition} to the clause list using the pending
   * connector.
   *
   * @param field - Entity field name.
   * @param op    - Filter operator.
   * @param value - Comparison value.
   *
   * @internal
   */
  appendCondition(field: string, op: QueryOperator, value: any): void {
    this.appendClause({ kind: 'condition', field, op, value });
  }

  /** @internal */
  private appendClause(
    clause: Omit<QueryCondition, 'connector'> | Omit<QueryGroup, 'connector'>,
  ): void {
    const connector = this.clauses.length === 0 ? null : this.pendingConnector;
    this.clauses.push({ ...clause, connector } as QueryClause);
    this.pendingConnector = 'and';
  }

  /** @internal */
  private requireCurrentField(operation: string): string {
    if (!this.currentField) {
      throw new Error(`No field specified for ${operation}`);
    }

    const field = this.currentField;
    this.currentField = undefined;
    return field;
  }

  /** @internal */
  private addCondition(op: QueryOperator, value: any): this {
    const field = this.requireCurrentField(op);
    this.appendCondition(field, op, value);
    return this;
  }

  /**
   * Filters records where the current field strictly equals `value`.
   * @param value - Expected value.
   */
  equals(value: any) {
    return this.addCondition('equals', value);
  }

  /**
   * Filters records where the current field is greater than `value`.
   * @param value - Exclusive lower bound.
   */
  gt(value: any) {
    return this.addCondition('gt', value);
  }

  /**
   * Filters records where the current field is greater than or equal to `value`.
   * @param value - Inclusive lower bound.
   */
  gte(value: any) {
    return this.addCondition('gte', value);
  }

  /**
   * Filters records where the current field is less than `value`.
   * @param value - Exclusive upper bound.
   */
  lt(value: any) {
    return this.addCondition('lt', value);
  }

  /**
   * Filters records where the current field is less than or equal to `value`.
   * @param value - Inclusive upper bound.
   */
  lte(value: any) {
    return this.addCondition('lte', value);
  }

  /**
   * Filters records where the current string field starts with `value`.
   * @param value - Required prefix.
   */
  startsWith(value: string) {
    return this.addCondition('startsWith', value);
  }

  /**
   * Filters records where the current string field ends with `value`.
   * @param value - Required suffix.
   */
  endsWith(value: string) {
    return this.addCondition('endsWith', value);
  }

  /**
   * Filters records where the current string or array field contains `value`.
   * @param value - Substring or array element to search for.
   */
  contains(value: any) {
    return this.addCondition('contains', value);
  }

  /**
   * Filters records where the current string field matches the given pattern.
   * @param value - `RegExp` instance or pattern string.
   */
  matches(value: RegExp | string) {
    return this.addCondition('matches', value);
  }

  /**
   * Filters records where `start <= field <= end`.
   * @param start - Inclusive lower bound.
   * @param end   - Inclusive upper bound.
   */
  between(start: any, end: any) {
    return this.addCondition('between', [start, end]);
  }

  /**
   * Filters records where `field < start || field > end`.
   * @param start - Lower boundary of the excluded range.
   * @param end   - Upper boundary of the excluded range.
   */
  notBetween(start: any, end: any) {
    return this.addCondition('notBetween', [start, end]);
  }

  /**
   * Filters records where the current field's value is in the `values` array.
   * @param values - Allowed values.
   */
  ['in'](values: any[]) {
    return this.addCondition('in', values);
  }

  /**
   * Filters records where the current field's value is **not** in the `values` array.
   * @param values - Disallowed values.
   */
  notIn(values: any[]) {
    return this.addCondition('notIn', values);
  }

  /**
   * Filters records where the array field contains at least one value from `values`.
   * @param values - Elements, at least one of which must be present.
   */
  containsAny(values: any[]) {
    return this.addCondition('containsAny', values);
  }

  /**
   * Filters records where the array field contains every value in `values`.
   * @param values - Elements, all of which must be present.
   */
  containsAll(values: any[]) {
    return this.addCondition('containsAll', values);
  }

  /**
   * Specifies the field and direction used to sort results.
   *
   * @param field     - The entity field to sort by.
   * @param direction - `'asc'` (default) or `'desc'`.
   * @returns `this` for chaining.
   */
  orderBy(field: Extract<keyof T, string>, direction: QueryDirection = 'asc') {
    this.orderField = field;
    this.orderDirection = direction;
    return this;
  }

  /**
   * Limits the maximum number of records returned after filtering and sorting.
   *
   * @param n - Maximum number of records.
   * @returns `this` for chaining.
   */
  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  /**
   * Skips `n` records from the filtered, sorted result set before applying
   * any {@link QueryBuilder.limit}.
   *
   * @param n - Number of records to skip.
   * @returns `this` for chaining.
   */
  offset(n: number) {
    this.offsetCount = n;
    return this;
  }

  /**
   * Directs the initial candidate fetch to use the specified IDB index instead
   * of a full store scan. Combine with {@link QueryBuilder.range} to exploit
   * native key-range filtering at the IDB layer.
   *
   * @param indexName - The name of an existing index on the object store.
   * @returns `this` for chaining.
   *
   * @throws `Error` if the named index does not exist on the store at execution time.
   */
  useIndex(indexName: string) {
    this.indexName = indexName;
    return this;
  }

  /**
   * Constrains the IDB key range used when reading via {@link QueryBuilder.useIndex}.
   *
   * Unlike {@link QueryBuilder.where} conditions - which are evaluated
   * **in memory** after candidates are fetched - the range is applied natively
   * at the IndexedDB layer, so it narrows the candidate set before any
   * in-memory filtering runs. Because a range is meaningless without an index
   * to apply it to, executing a query that sets a range without calling
   * `useIndex` throws instead of silently ignoring the bounds.
   *
   * @param start - Inclusive lower bound of the key range, or `undefined` for an open lower bound.
   * @param end   - Inclusive upper bound of the key range, or `undefined` for an open upper bound.
   * @returns `this` for chaining.
   */
  range(start: any, end: any) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  /**
   * Groups results by the given field and transforms the query so that
   * {@link QueryBuilder.count} returns a {@link GroupCountResult} array.
   *
   * @typeParam K - The field key to group by.
   * @param field - The entity field to use as the grouping dimension.
   * @returns A modified `QueryBuilder` whose `count()` method returns grouped counts.
   *
   * @example
   * ```ts
   * const byStatus = await db.Order.query().groupBy('status').count();
   * // [{ status: 'paid', count: 42 }, { status: 'pending', count: 7 }]
   * ```
   */
  groupBy<K extends QueryFieldKey<T>>(field: K) {
    this.groupField = field;
    return this as unknown as QueryBuilder<T> & {
      count(): Promise<GroupCountResult<T, K>>;
    };
  }

  /** @internal */
  private async loadCandidates(): Promise<T[]> {
    const store = this.transaction
      ? this.transaction.objectStore(this.storeName)
      : this.db
        .transaction(this.storeName, 'readonly')
        .objectStore(this.storeName);

    const request = this.createReadRequest(store);
    return new Promise<T[]>((resolve, reject) => {
      request.onsuccess = () => resolve((request.result as T[]) ?? []);
      request.onerror = () => reject(request.error);
    });
  }

  /** @internal */
  private createReadRequest(store: IDBObjectStore): IDBRequest {
    if (!this.indexName) {
      if (this.rangeStart !== undefined || this.rangeEnd !== undefined) {
        throw new Error(
          'range() requires useIndex(): key ranges are applied at the ' +
          'IndexedDB layer through an index. Either call useIndex(indexName) ' +
          'before range(), or express the bounds as in-memory filters via ' +
          'where(field).between(start, end) / gte() / lte().',
        );
      }

      return store.getAll();
    }

    if (!store.indexNames.contains(this.indexName)) {
      throw new Error(
        `Index '${this.indexName}' does not exist on ${this.storeName}`,
      );
    }

    const index = store.index(this.indexName);
    let keyRange: IDBKeyRange | undefined;
    if (this.rangeStart !== undefined && this.rangeEnd !== undefined) {
      keyRange = IDBKeyRange.bound(this.rangeStart, this.rangeEnd);
    } else if (this.rangeStart !== undefined) {
      keyRange = IDBKeyRange.lowerBound(this.rangeStart);
    } else if (this.rangeEnd !== undefined) {
      keyRange = IDBKeyRange.upperBound(this.rangeEnd);
    }

    return keyRange ? index.getAll(keyRange) : index.getAll();
  }

  /** @internal */
  private matchesClause(item: T, clause: QueryClause): boolean {
    if (clause.kind === 'group') {
      return this.evaluateClauses(item, clause.clauses);
    }

    const value = (item as any)[clause.field];
    switch (clause.op) {
      case 'equals':
        return value === clause.value;
      case 'gt':
        return value > clause.value;
      case 'gte':
        return value >= clause.value;
      case 'lt':
        return value < clause.value;
      case 'lte':
        return value <= clause.value;
      case 'startsWith':
        return (
          typeof value === 'string' && value.startsWith(String(clause.value))
        );
      case 'endsWith':
        return (
          typeof value === 'string' && value.endsWith(String(clause.value))
        );
      case 'contains':
        if (typeof value === 'string') {
          return value.includes(String(clause.value));
        }

        return Array.isArray(value) && value.includes(clause.value);
      case 'matches': {
        const pattern =
          clause.value instanceof RegExp
            ? new RegExp(clause.value.source, clause.value.flags)
            : new RegExp(String(clause.value));
        return typeof value === 'string' && pattern.test(value);
      }
      case 'between': {
        const [start, end] = clause.value as [any, any];
        return value >= start && value <= end;
      }
      case 'notBetween': {
        const [start, end] = clause.value as [any, any];
        return value < start || value > end;
      }
      case 'in':
        return Array.isArray(clause.value) && clause.value.includes(value);
      case 'notIn':
        return Array.isArray(clause.value) && !clause.value.includes(value);
      case 'containsAny':
        return (
          Array.isArray(value) &&
          Array.isArray(clause.value) &&
          clause.value.some((entry: any) => value.includes(entry))
        );
      case 'containsAll':
        return (
          Array.isArray(value) &&
          Array.isArray(clause.value) &&
          clause.value.every((entry: any) => value.includes(entry))
        );
    }
  }

  /** @internal */
  private evaluateClauses(item: T, clauses: QueryClause[]): boolean {
    if (!clauses.length) {
      return true;
    }

    let result = this.matchesClause(item, clauses[0]);

    for (let index = 1; index < clauses.length; index += 1) {
      const clause = clauses[index];
      const matches = this.matchesClause(item, clause);
      result =
        clause.connector === 'or' ? result || matches : result && matches;
    }

    return result;
  }

  /** @internal */
  private async collectMatches(): Promise<T[]> {
    const candidates = await this.loadCandidates();
    return candidates.filter((item) =>
      this.evaluateClauses(item, this.clauses),
    );
  }

  /** @internal */
  private sortResults(results: T[]): T[] {
    if (!this.orderField) {
      return results;
    }

    return [...results].sort((left, right) => {
      const leftValue = (left as any)[this.orderField!];
      const rightValue = (right as any)[this.orderField!];
      if (leftValue < rightValue) return this.orderDirection === 'asc' ? -1 : 1;
      if (leftValue > rightValue) return this.orderDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /** @internal */
  private applyPagination(results: T[]): T[] {
    let nextResults = results;
    if (this.offsetCount !== undefined) {
      nextResults = nextResults.slice(this.offsetCount);
    }
    if (this.limitCount !== undefined) {
      nextResults = nextResults.slice(0, this.limitCount);
    }
    return nextResults;
  }

  /** @internal */
  private async aggregateValues<R>(
    field: Extract<keyof T, string> | undefined,
    reducer: (values: Array<any>) => R,
  ): Promise<R> {
    const results = await this.collectMatches();
    const values = field
      ? results.map((item) => (item as any)[field])
      : results;
    return reducer(values);
  }

  /** @internal */
  private async aggregateGroupedCount<K extends Extract<keyof T, string>>(
    field: K,
  ): Promise<GroupCountResult<T, K>> {
    const results = await this.collectMatches();
    const groups = new Map<any, number>();

    for (const item of results) {
      const key = (item as any)[field];
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }

    return Array.from(groups.entries())
      .sort(([left], [right]) => {
        if (left < right) return -1;
        if (left > right) return 1;
        return 0;
      })
      .map(
        ([key, count]) =>
          ({ [field]: key, count }) as Record<K, T[K]> & { count: number },
      );
  }

  /**
   * Executes the query and returns all matching records after applying
   * ordering and pagination.
   *
   * @returns A promise that resolves to an array of matching entities.
   *
   * @example
   * ```ts
   * const activeUsers = await db.User.query()
   *   .where('status').equals('active')
   *   .orderBy('createdAt', 'desc')
   *   .limit(10)
   *   .execute();
   * ```
   */
  async execute(): Promise<T[]> {
    const results = await this.collectMatches();
    return this.applyPagination(this.sortResults(results));
  }

  /**
   * Returns the number of records matching the current query.
   *
   * When {@link QueryBuilder.groupBy} has been called, returns a
   * {@link GroupCountResult} array instead of a plain number.
   *
   * @returns A promise that resolves to either a `number` or a
   *   `GroupCountResult` array, depending on whether `groupBy` was invoked.
   */
  async count(): Promise<
    number | GroupCountResult<T, Extract<keyof T, string>>
  > {
    if (this.groupField) {
      return this.aggregateGroupedCount(this.groupField);
    }

    const results = await this.collectMatches();
    return results.length;
  }

  /**
   * Computes the sum of a numeric field across all matching records.
   * Non-numeric values are treated as `0`.
   *
   * @param field - A numeric field key (enforced at compile time).
   * @returns A promise that resolves to the numeric sum.
   */
  async sum(field: NumericFieldKey<T>): Promise<number> {
    const total = await this.aggregateValues(field, (values) =>
      values.reduce(
        (accumulator, value) => accumulator + (Number(value) || 0),
        0,
      ),
    );
    return total;
  }

  /**
   * Computes the arithmetic mean of a numeric field across all matching records.
   * Returns `0` when no records match.
   *
   * @param field - A numeric field key (enforced at compile time).
   * @returns A promise that resolves to the average value.
   */
  async avg(field: NumericFieldKey<T>): Promise<number> {
    const values = await this.aggregateValues(field, (items) => items);
    if (!values.length) {
      return 0;
    }

    const total = values.reduce(
      (accumulator, value) => accumulator + (Number(value) || 0),
      0,
    );
    return total / values.length;
  }

  /**
   * Returns the minimum value of a comparable field across all matching records.
   * Returns `null` when no records match.
   *
   * @param field - A field key whose value type extends {@link ComparableValue}.
   * @returns A promise that resolves to the minimum field value, or `null`.
   */
  async min(field: ComparableFieldKey<T>): Promise<T[typeof field] | null> {
    const values = await this.aggregateValues(field, (items) => items);
    if (!values.length) {
      return null;
    }

    return values.reduce((currentMin, value) =>
      value < currentMin ? value : currentMin,
    );
  }

  /**
   * Returns the maximum value of a comparable field across all matching records.
   * Returns `null` when no records match.
   *
   * @param field - A field key whose value type extends {@link ComparableValue}.
   * @returns A promise that resolves to the maximum field value, or `null`.
   */
  async max(field: ComparableFieldKey<T>): Promise<T[typeof field] | null> {
    const values = await this.aggregateValues(field, (items) => items);
    if (!values.length) {
      return null;
    }

    return values.reduce((currentMax, value) =>
      value > currentMax ? value : currentMax,
    );
  }
}

// ─── Decorator Option Interfaces ─────────────────────────────────────────────

/**
 * Configuration options for the {@link KeyPath} and {@link CompositeKeyPath}
 * decorators, controlling key generation behaviour.
 */
interface KeyPathOptions {
  /**
   * When `true`, the object store is created with `autoIncrement: true` and
   * the browser assigns a monotonically increasing numeric key on each `add`.
   *
   * @default false
   */
  autoIncrement?: boolean;

  /**
   * Key generator to invoke when creating a record whose key field is absent
   * or empty.
   *
   * - `'uuid'`      - UUID v4 string via {@link KeyGenerators.uuid}.
   * - `'timestamp'` - `Date.now()` integer via {@link KeyGenerators.timestamp}.
   * - `'random'`    - Short random alphanumeric string via {@link KeyGenerators.random}.
   * - `function`    - Custom generator that receives the item and returns a
   *                   `string` or `number`.
   */
  generator?:
  | 'uuid'
  | 'timestamp'
  | 'random'
  | ((item?: any) => string | number);
}

/**
 * Describes a per-field validation rule registered via {@link Validate}.
 *
 * @typeParam T - The entity type the rule applies to.
 */
interface ValidationRule<T = any> {
  /** Name of the field being validated. */
  field: string;
  /**
   * Returns `true` when the field value is valid.
   *
   * @param value - The current field value.
   * @param item  - The full entity instance being validated.
   */
  predicate: (value: any, item: T) => boolean;
  /** Human-readable message appended to the thrown error when validation fails. */
  message: string;
}

/**
 * Metadata recorded for each field decorated with {@link Index}.
 *
 * @internal
 */
interface IndexMetadata {
  /** Name of the entity field that the IDB index covers. */
  field: string;
  /** Optional IDB index parameters (e.g., `unique`). */
  options?: IDBIndexParameters;
}

/**
 * Options accepted by the {@link RetentionPolicy} class decorator.
 */
interface RetentionPolicyOptions {
  /**
   * Duration in seconds after which records are considered expired and eligible
   * for automatic deletion. Must be a positive integer.
   */
  seconds: number;

  /**
   * Whether the retention cleanup job is active for this entity.
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * The numeric timestamp field (milliseconds since Unix epoch) used to
   * determine record age. Defaults to the internally managed
   * `__idb_createdAt` field.
   *
   * @default '__idb_createdAt'
   */
  field?: string;
}

/**
 * Resolved and normalised form of {@link RetentionPolicyOptions} stored in
 * entity metadata after decoration.
 *
 * @internal
 */
interface RetentionPolicyMetadata {
  /** Retention duration in seconds. */
  seconds: number;
  /** Whether the cleanup job is active. */
  enabled: boolean;
  /** The timestamp field used for age calculation. */
  field: string;
}

/** @internal Name of the internal creation-timestamp field. */
const INTERNAL_CREATED_AT_FIELD = '__idb_createdAt';
/** @internal Name of the internal last-updated-timestamp field. */
const INTERNAL_UPDATED_AT_FIELD = '__idb_updatedAt';

/**
 * Metadata associated with a `@KeyPath` or `@CompositeKeyPath` decorator.
 *
 * @internal
 */
interface KeyPathMetadata {
  /** Single field name (simple key) or array of field names (composite key). */
  fields: string | string[];
  /** Key generation and auto-increment options. */
  options?: KeyPathOptions;
}

// ─── Key Generators ───────────────────────────────────────────────────────────

/**
 * Built-in key generation utilities used by the {@link KeyPath} `generator`
 * option and available for direct use in application code.
 *
 * @example
 * ```ts
 * import { KeyGenerators } from 'idb-ts';
 *
 * const id        = KeyGenerators.uuid();      // "a1b2c3d4-..."
 * const timestamp = KeyGenerators.timestamp(); // 1696118400000
 * const random    = KeyGenerators.random();    // "xyz789abc123"
 * ```
 */
class KeyGenerators {
  /**
   * Generates a RFC 4122 UUID v4 string.
   * The implementation does not rely on any external dependency.
   *
   * @returns A UUID v4 string, e.g., `"a1b2c3d4-e5f6-4789-abcd-ef1234567890"`.
   */
  static uuid(): string {
    // Simple UUID v4 implementation without external dependencies
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  /**
   * Returns the current Unix timestamp in milliseconds (`Date.now()`).
   *
   * @returns A numeric timestamp, e.g., `1696118400000`.
   */
  static timestamp(): number {
    return Date.now();
  }

  /**
   * Generates a short random alphanumeric string derived from
   * `Math.random().toString(36)`.
   *
   * @returns A random string of approximately 13 characters, e.g., `"xyz789abc123"`.
   */
  static random(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// ─── Decorators ──────────────────────────────────────────────────────────────

/**
 * Property decorator that designates the decorated field as the primary key
 * (key path) for the entity's IndexedDB object store.
 *
 * Exactly **one** property per entity class may be annotated with `@KeyPath`.
 * For composite keys spanning multiple fields, use {@link CompositeKeyPath}
 * at the class level instead.
 *
 * @param options - Optional key generation and auto-increment configuration.
 *
 * @remarks
 * The decorator stores {@link KeyPathMetadata} via `reflect-metadata` on the
 * constructor. The `@DataClass` decorator validates at class decoration time
 * that exactly one key path is present.
 *
 * @example Single UUID key
 * ```ts
 * @DataClass()
 * class Document {
 *   @KeyPath({ generator: 'uuid' })
 *   id!: string;
 * }
 * ```
 *
 * @example Auto-increment numeric key
 * ```ts
 * @DataClass()
 * class Task {
 *   @KeyPath({ autoIncrement: true })
 *   id!: number;
 * }
 * ```
 */
function KeyPath(options?: KeyPathOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;

    // Track individual property keypaths for validation
    const existingKeypaths =
      Reflect.getMetadata('individual_keypaths', constructor) || [];
    existingKeypaths.push(propertyKey as string);
    Reflect.defineMetadata(
      'individual_keypaths',
      existingKeypaths,
      constructor,
    );

    const metadata: KeyPathMetadata = {
      fields: propertyKey as string,
      options: options,
    };
    Reflect.defineMetadata('keypath', metadata, constructor);
  };
}

/**
 * Class decorator that defines a **composite primary key** spanning multiple
 * fields. Use this when the entity's identity is determined by a combination
 * of fields rather than a single property.
 *
 * @param fields  - An ordered array of field names that together form the key.
 * @param options - Optional key generation configuration (note: auto-generated
 *   keys are not supported for composite keys).
 *
 * @remarks
 * Apply `@CompositeKeyPath` **before** `@DataClass` (decorators execute
 * bottom-up). `@KeyPath` must **not** also be used on the same class.
 *
 * @example
 * ```ts
 * @CompositeKeyPath(['userId', 'projectId'])
 * @DataClass()
 * class UserProject {
 *   userId!: string;
 *   projectId!: string;
 *   role!: string;
 * }
 *
 * // Read by composite key:
 * const rel = await db.UserProject.read(['user1', 'proj42']);
 * ```
 */
function CompositeKeyPath(
  fields: string[],
  options?: KeyPathOptions,
): ClassDecorator {
  return (target: Function) => {
    const metadata: KeyPathMetadata = {
      fields: fields,
      options: options,
    };
    Reflect.defineMetadata('keypath', metadata, target);
  };
}

/**
 * Property decorator that creates an IndexedDB index on the decorated field,
 * enabling efficient lookups via {@link EntityRepository.findByIndex} and
 * {@link EntityRepository.findOneByIndex}.
 *
 * @param options - Standard `IDBIndexParameters` (e.g., `{ unique: true }`).
 *
 * @example
 * ```ts
 * @DataClass()
 * class User {
 *   @KeyPath()
 *   id!: string;
 *
 *   @Index({ unique: true })
 *   email!: string;
 *
 *   @Index()
 *   department!: string;
 * }
 * ```
 */
function Index(options?: IDBIndexParameters): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existing = Reflect.getMetadata('indexes', constructor) || [];
    const nextIndexes = [
      ...existing,
      { field: propertyKey as string, options } as IndexMetadata,
    ];
    Reflect.defineMetadata('indexes', nextIndexes, constructor);
  };
}

/**
 * Property decorator that attaches a validation rule to the decorated field.
 * The rule is enforced on every {@link EntityRepository.create} and
 * {@link EntityRepository.update} call.
 *
 * @typeParam T - The entity class to which this rule belongs.
 * @param predicate - A function that returns `true` when the field value is
 *   valid. Receives both the field value and the full entity instance.
 * @param message   - A short, human-readable description of the constraint,
 *   appended to the thrown error on failure.
 *
 * @throws `Error` - On write operations when any rule's `predicate` returns
 *   `false`. The error message lists all failing rules in the format
 *   `field: message`, joined by `; `.
 *
 * @example
 * ```ts
 * @DataClass()
 * class User {
 *   @KeyPath()
 *   id!: string;
 *
 *   @Validate((v) => typeof v === 'string' && v.includes('@'), 'must be a valid email')
 *   email!: string;
 *
 *   @Validate((v) => typeof v === 'number' && v >= 0, 'age must be >= 0')
 *   age!: number;
 * }
 * ```
 */
function Validate<T = any>(
  predicate: (value: any, item: T) => boolean,
  message: string,
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor as Function;
    const existing = Reflect.getMetadata('validators', constructor) || [];
    const nextRules = [
      ...existing,
      { field: propertyKey as string, predicate, message } as ValidationRule<T>,
    ];
    Reflect.defineMetadata('validators', nextRules, constructor);
  };
}

/**
 * Class decorator that configures an automatic data retention policy for
 * the entity. When one or more entities define a retention policy, the
 * {@link Database} runs a background cleanup job that periodically deletes
 * expired records.
 *
 * @param options - Retention configuration. `seconds` is required.
 *
 * @throws `Error` - At decoration time if `options.seconds` is not a positive integer.
 *
 * @remarks
 * The cleanup interval is derived from the GCD of all registered `seconds`
 * values, ensuring the job runs as infrequently as possible while still
 * honouring every policy. The job uses a cursor-based `readwrite` transaction
 * and emits debug-level log messages on each tick.
 *
 * @example
 * ```ts
 * @RetentionPolicy({ seconds: 60 * 60 * 24 * 30 }) // 30-day retention
 * @DataClass()
 * class Session {
 *   @KeyPath()
 *   id!: string;
 *   userId!: string;
 * }
 * ```
 */
function RetentionPolicy(options: RetentionPolicyOptions): ClassDecorator {
  return (target: Function) => {
    if (!Number.isInteger(options.seconds) || options.seconds <= 0) {
      throw new Error('RetentionPolicy.seconds must be a positive integer.');
    }

    const metadata: RetentionPolicyMetadata = {
      seconds: options.seconds,
      enabled: options.enabled ?? true,
      field: options.field ?? INTERNAL_CREATED_AT_FIELD,
    };

    Reflect.defineMetadata('retention_policy', metadata, target);
  };
}

/**
 * Options passed to the {@link DataClass} decorator.
 */
interface DataClassOptions {
  /**
   * Schema version number for this entity. The {@link Database} sets the
   * underlying `IDBDatabase` version to the highest version across all
   * registered entities, triggering `onupgradeneeded` when new entities are
   * added or existing ones are incremented.
   *
   * @default 1
   */
  version?: number;
}

/**
 * Class decorator that marks an entity class for use with {@link Database}.
 *
 * `@DataClass` must be applied **after** `@KeyPath` (or `@CompositeKeyPath`)
 * and performs the following at decoration time:
 *
 * 1. Verifies that exactly one `@KeyPath` (or `@CompositeKeyPath`) annotation
 *    is present on the class.
 * 2. Records the schema `version` in `reflect-metadata`.
 * 3. Marks the class as a valid data class (guards against passing plain
 *    classes to {@link Database.build}).
 *
 * @param options - Optional schema version configuration.
 *
 * @throws `Error` - If no `@KeyPath` / `@CompositeKeyPath` annotation is found.
 * @throws `Error` - If more than one property-level `@KeyPath` annotation is
 *   present (use `@CompositeKeyPath` for multi-field keys instead).
 *
 * @example
 * ```ts
 * @DataClass({ version: 2 })
 * class User {
 *   @KeyPath({ generator: 'uuid' })
 *   id!: string;
 *
 *   @Index({ unique: true })
 *   email!: string;
 *
 *   name!: string;
 * }
 * ```
 */
function DataClass(options: DataClassOptions = {}): ClassDecorator {
  return (target: Function) => {
    const keyPathMetadata = Reflect.getMetadata(
      'keypath',
      target,
    ) as KeyPathMetadata;
    if (!keyPathMetadata) {
      throw new Error(`No keypath field defined for the class ${target.name}.`);
    }

    // Check for multiple property-level @KeyPath decorators (which is invalid)
    // This is different from composite keys which are defined at class level
    const individualKeypaths =
      Reflect.getMetadata('individual_keypaths', target) || [];
    if (individualKeypaths.length > 1) {
      throw new Error(
        `Only one keypath field can be defined for the class ${target.name}.`,
      );
    }

    const version = options.version || 1;
    Reflect.defineMetadata('dataclass', true, target);
    Reflect.defineMetadata('version', version, target);
  };
}

// ─── Repository & Database Interfaces ────────────────────────────────────────

/**
 * The full CRUD and query surface exposed for each registered entity.
 *
 * An `EntityRepository<T>` is created automatically by {@link Database.build}
 * and is accessible as a named property on the returned database object (e.g.,
 * `db.User`, `db.Order`).
 *
 * @typeParam T - The entity type managed by this repository.
 *
 * @example
 * ```ts
 * const db = await Database.build<{ User: EntityRepository<User> }>('mydb', [User]);
 *
 * await db.User.create(new User('u1', 'Alice', 25));
 * const alice = await db.User.read('u1');
 * await db.User.delete('u1');
 * ```
 */
interface EntityRepository<T> {
  /**
   * Persists a new record.
   *
   * Key generation (if configured) and timestamp injection (`__idb_createdAt`,
   * `__idb_updatedAt`) are applied before storage. Validation rules are
   * enforced prior to the write.
   *
   * @param item - The entity instance to store.
   * @throws `Error` if validation fails or the IDB operation rejects.
   */
  create(item: T): Promise<void>;

  /**
   * Persists multiple records sequentially.
   * Equivalent to calling {@link EntityRepository.create} for each item.
   *
   * @param items - An array of entity instances to store.
   */
  createMany(items: T[]): Promise<void>;

  /**
   * Retrieves a record by its primary key.
   *
   * @param key - The primary key value. Pass an array for composite keys.
   * @returns A promise resolving to the entity, or `undefined` if not found.
   */
  read(key: string | string[] | number): Promise<T | undefined>;

  /**
   * Replaces an existing record with the supplied entity.
   *
   * Preserves the original `__idb_createdAt` timestamp and refreshes
   * `__idb_updatedAt`. Validation rules are enforced prior to the write.
   *
   * @param item - The updated entity instance.
   * @throws `Error` if validation fails or the IDB operation rejects.
   */
  update(item: T): Promise<void>;

  /**
   * Updates multiple records sequentially.
   * Equivalent to calling {@link EntityRepository.update} for each item.
   *
   * @param items - An array of updated entity instances.
   */
  updateMany(items: T[]): Promise<void>;

  /**
   * Removes the record identified by `key`.
   *
   * @param key - The primary key value. Pass an array for composite keys.
   */
  delete(key: string | string[] | number): Promise<void>;

  /**
   * Removes multiple records by their primary keys.
   *
   * @param keys - An array of primary key values.
   */
  deleteMany(keys: Array<string | string[] | number>): Promise<void>;

  /**
   * Removes all records that match the supplied query predicate.
   *
   * @param predicate - A callback receiving a {@link QueryBuilder} and
   *   returning the configured builder (or `void`).
   */
  deleteWhere(
    predicate: (query: QueryBuilder<T>) => QueryBuilder<T> | void,
  ): Promise<void>;

  /**
   * Returns all records in the store.
   *
   * @returns A promise resolving to an array of all entities.
   */
  list(): Promise<T[]>;

  /**
   * Returns a page of records from the store.
   *
   * @param page     - 1-based page number.
   * @param pageSize - Number of records per page.
   * @returns A promise resolving to the requested page.
   */
  listPaginated(page: number, pageSize: number): Promise<T[]>;

  /**
   * Returns all records whose indexed field equals `value`.
   *
   * @param indexName - The name of the IDB index to query.
   * @param value     - The index key to look up.
   * @throws `Error` if the named index does not exist.
   */
  findByIndex(indexName: string, value: any): Promise<T[]>;

  /**
   * Returns the first record whose indexed field equals `value`, or
   * `undefined` if none is found.
   *
   * @param indexName - The name of the IDB index to query.
   * @param value     - The index key to look up.
   * @throws `Error` if the named index does not exist.
   */
  findOneByIndex(indexName: string, value: any): Promise<T | undefined>;

  /**
   * Returns the total number of records in the store.
   *
   * @returns A promise resolving to the record count.
   */
  count(): Promise<number>;

  /**
   * Returns whether a record with the given primary key exists.
   *
   * @param key - The primary key to check.
   * @returns `true` if a matching record exists, `false` otherwise.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Deletes **all** records from the store.
   */
  clear(): Promise<void>;

  /**
   * Returns a new {@link QueryBuilder} scoped to this entity's object store,
   * optionally sharing the supplied transaction.
   *
   * @returns A fresh {@link QueryBuilder} instance ready for chaining.
   */
  query(): QueryBuilder<T>;
}

/**
 * Exposes `commit` and `rollback` control over a multi-store IDB transaction.
 *
 * Obtained via {@link Database.beginTransaction} or provided to the callback
 * of {@link Database.transaction}.
 */
interface TransactionController {
  /**
   * Explicitly commits the transaction, waiting for all pending operations
   * to complete. Falls back gracefully when `IDBTransaction.commit` is
   * unavailable in older runtimes.
   */
  commit(): Promise<void>;

  /**
   * Aborts the transaction, discarding all uncommitted writes.
   * Subsequent calls are silently ignored.
   */
  rollback(): Promise<void>;
}

/**
 * A union of a typed repository map `T` and {@link TransactionController}.
 * The object returned by {@link Database.beginTransaction} and passed to
 * the {@link Database.transaction} callback implements this type.
 *
 * @typeParam T - A `Record` mapping entity names to their `EntityRepository`.
 */
type TransactionalDatabase<T extends Record<string, EntityRepository<any>>> =
  T & TransactionController;

/**
 * The object type returned by {@link Database.build}.
 * Extends the base {@link Database} class with dynamically generated
 * `EntityRepository` properties keyed by entity name.
 *
 * @typeParam T - A `Record` mapping entity class names to `EntityRepository` types.
 *
 * @example
 * ```ts
 * type MyDB = DatabaseWithRepositories<{
 *   User: EntityRepository<User>;
 *   Order: EntityRepository<Order>;
 * }>;
 *
 * const db: MyDB = await Database.build<{
 *   User: EntityRepository<User>;
 *   Order: EntityRepository<Order>;
 * }>('mydb', [User, Order]);
 * ```
 */
type DatabaseWithRepositories<T extends Record<string, any>> = Database & T;

// ─── Database ────────────────────────────────────────────────────────────────

/**
 * Central access point for an IndexedDB database managed by **idb-ts**.
 *
 * A `Database` instance owns the IDB connection, maintains entity
 * repositories, and runs retention-cleanup background jobs. Always obtain
 * instances through the async factory {@link Database.build} - the constructor
 * is private.
 *
 * @remarks
 * **Schema versioning.** The effective database version is the highest
 * `version` value across all registered `@DataClass` entities. On each
 * `onupgradeneeded` event, only stores whose `version` exceeds the previous
 * database version are created or updated, so additive schema evolution is
 * handled automatically.
 *
 * **Retention cleanup.** When entities declare `@RetentionPolicy`, a periodic
 * `setInterval` job is started after the database opens. The interval is the
 * GCD of all configured retention periods (in milliseconds), ensuring every
 * policy is evaluated at the right frequency with a single timer.
 *
 * **Repository access.** After `build` resolves, each registered entity is
 * accessible as a named property on the returned object:
 * ```ts
 * const db = await Database.build<{ User: EntityRepository<User> }>('mydb', [User]);
 * await db.User.create(new User('u1', 'Alice'));
 * ```
 *
 * @example
 * ```ts
 * const db = await Database.build<{
 *   User:  EntityRepository<User>;
 *   Order: EntityRepository<Order>;
 * }>('shop', [User, Order]);
 *
 * await db.User.create(new User('u1', 'Alice', 30));
 * const alice = await db.User.read('u1');
 * db.close();
 * ```
 */
class Database {
  private dbName: string;
  private classes: Function[];
  private db: IDBDatabase | null = null;
  private entityRepositories: Map<string, any> = new Map();
  private dbVersion: number;
  private retentionTimer: ReturnType<typeof setInterval> | null = null;
  private retentionCleanupRunning = false;
  private retentionPolicies: Array<{
    className: string;
    storeName: string;
    policy: RetentionPolicyMetadata;
  }>;
  private printEnabled: boolean;

  /**
   * Logs a debug message to the console when debug logging is enabled.
   *
   * @param data - Values forwarded to `console.debug`.
   * @internal
   */
  private printDebug = (...data: any) => {
    if (!this.printEnabled)
      return;
    console.debug('[idb-ts]:DEBUG:', ...data);
  };

  /**
   * Logs an error message to the console when debug logging is enabled.
   *
   * @param error - Values forwarded to `console.error`.
   * @internal
   */
  private printError = (...error: any) => {
    if (!this.printEnabled)
      return;
    console.error('[idb-ts]:ERROR:', ...error);
  };

  /** @internal Use {@link Database.build} to create instances. */
  private constructor(dbName: string, classes: Function[], printEnabled = false) {
    this.dbName = dbName;
    this.printEnabled = printEnabled;
    if (!classes.every((cls) => Reflect.getMetadata('dataclass', cls))) {
      throw new Error('All classes should be decorated with @DataClass.');
    }
    this.classes = classes;
    this.dbVersion = this.calculateDatabaseVersion();
    this.retentionPolicies = this.classes
      .map((cls) => {
        const policy = Reflect.getMetadata('retention_policy', cls) as
          | RetentionPolicyMetadata
          | undefined;
        if (!policy?.enabled) {
          return null;
        }

        return {
          className: cls.name,
          storeName: cls.name.toLowerCase(),
          policy,
        };
      })
      .filter(
        (
          policy,
        ): policy is {
          className: string;
          storeName: string;
          policy: RetentionPolicyMetadata;
        } => policy !== null,
      );
  }

  /**
   * Derives the IDB database version from the highest `version` annotation
   * across all registered entity classes.
   *
   * @returns The calculated database version number.
   * @internal
   */
  private calculateDatabaseVersion(): number {
    // Calculate the database version based on the highest schema version
    const versions = this.classes.map(
      (cls) => Reflect.getMetadata('version', cls) || 1,
    );
    return Math.max(...versions);
  }

  /**
   * Creates and initialises a new {@link Database} instance, opening the
   * underlying IndexedDB database and generating entity repositories.
   *
   * This is the **only** public way to obtain a `Database` instance.
   *
   * @typeParam T - A `Record` mapping entity names to their `EntityRepository`
   *   types, used to type the returned object's named repository properties.
   * @param dbName  - The name passed to `indexedDB.open`.
   * @param classes - The `@DataClass`-decorated entity constructors to register.
   *
   * @returns A promise resolving to a fully initialised
   *   {@link DatabaseWithRepositories} instance.
   *
   * @throws `Error` - If any class is not decorated with `@DataClass`.
   * @throws `IDBRequest` error - If the underlying `indexedDB.open` call fails.
   *
   * @example
   * ```ts
   * const db = await Database.build<{
   *   User:  EntityRepository<User>;
   *   Order: EntityRepository<Order>;
   * }>('shop', [User, Order]);
   * ```
   */
  public static async build<T extends Record<string, EntityRepository<any>>>(
    dbName: string,
    classes: Function[],
  ): Promise<DatabaseWithRepositories<T>> {
    const instance = new Database(dbName, classes) as any;
    await instance.initDB();
    instance.generateEntityRepositories();
    return instance as DatabaseWithRepositories<T>;
  }

  /** @internal */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion || this.dbVersion;

        this.printDebug(
          `Database upgrade from version ${oldVersion} to ${newVersion}`,
        );

        // Handle schema evolution based on versions
        this.classes.forEach((cls) => {
          const keyPathMetadata = Reflect.getMetadata(
            'keypath',
            cls,
          ) as KeyPathMetadata;
          const indexFields = Reflect.getMetadata('indexes', cls) || [];
          const classVersion = Reflect.getMetadata('version', cls) || 1;

          const storeName = cls.name.toLowerCase();

          // Only create/update stores for classes whose version is greater than the old DB version
          if (classVersion > oldVersion) {
            if (!db.objectStoreNames.contains(storeName)) {
              this.printDebug(
                `Creating object store: ${storeName} (version ${classVersion})`,
              );

              // Determine store options based on keypath metadata
              const storeOptions: IDBObjectStoreParameters = {};

              if (keyPathMetadata) {
                storeOptions.keyPath = keyPathMetadata.fields;

                // Handle auto-increment option
                if (keyPathMetadata.options?.autoIncrement) {
                  storeOptions.autoIncrement = true;
                }
              }

              const store = db.createObjectStore(storeName, storeOptions);

              indexFields.forEach((indexField: string | IndexMetadata) => {
                const indexName =
                  typeof indexField === 'string'
                    ? indexField
                    : indexField.field;
                const indexOptions =
                  typeof indexField === 'string'
                    ? { unique: false }
                    : (indexField.options ?? { unique: false });

                if (!store.indexNames.contains(indexName)) {
                  store.createIndex(indexName, indexName, indexOptions);
                }
              });
            } else {
              // Store exists, check if we need to update indexes
              this.printDebug(
                `Updating object store: ${storeName} (version ${classVersion})`,
              );
              const transaction = request.transaction;
              if (transaction) {
                const store = transaction.objectStore(storeName);

                indexFields.forEach((indexField: string | IndexMetadata) => {
                  const indexName =
                    typeof indexField === 'string'
                      ? indexField
                      : indexField.field;
                  const indexOptions =
                    typeof indexField === 'string'
                      ? { unique: false }
                      : (indexField.options ?? { unique: false });

                  if (!store.indexNames.contains(indexName)) {
                    this.printDebug(`Adding index: ${indexName} to ${storeName}`);
                    store.createIndex(indexName, indexName, indexOptions);
                  }
                });
              }
            }
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.printDebug(
          `Database initialized (version ${this.dbVersion}) with object stores for: ${this.classes.map((cls) => `${cls.name}(v${Reflect.getMetadata('version', cls) || 1})`).join(', ')}`,
        );
        this.startRetentionCleanup();
        resolve();
      };

      request.onerror = () => {
        this.printError('Error initializing database:', request.error);
        reject(request.error);
      };
    });
  }

  /** @internal */
  private generateEntityRepositories(): void {
    this.classes.forEach((cls) => {
      const entityName = cls.name;
      const repository = this.createEntityRepository(cls);

      // repo name, internal use
      this.entityRepositories.set(entityName, repository);

      // Dynamically add the repository as a property on the database instance
      Object.defineProperty(this, entityName, {
        value: repository,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    });
  }

  /**
   * Calculates the setInterval period for the retention cleanup job as the
   * GCD of all registered policy `seconds` values, converted to milliseconds.
   *
   * @returns The interval in milliseconds, or `undefined` if no retention
   *   policies are registered.
   * @internal
   */
  private calculateRetentionCleanupIntervalMs(): number | undefined {
    if (!this.retentionPolicies.length) {
      return undefined;
    }

    const gcd = (left: number, right: number): number => {
      let a = left;
      let b = right;
      while (b !== 0) {
        const remainder = a % b;
        a = b;
        b = remainder;
      }
      return Math.abs(a);
    };

    const seconds = this.retentionPolicies.map(({ policy }) => policy.seconds);
    return (
      seconds.reduce((accumulator, value) => gcd(accumulator, value)) * 1000
    );
  }

  /** @internal */
  private startRetentionCleanup(): void {
    const cleanupIntervalMs = this.calculateRetentionCleanupIntervalMs();
    if (!cleanupIntervalMs || !this.db || this.retentionTimer) {
      return;
    }

    this.printDebug(
      `Retention cleanup enabled for ${this.retentionPolicies.length} entities every ${cleanupIntervalMs}ms`,
    );
    void this.runRetentionCleanup();
    this.retentionTimer = setInterval(() => {
      void this.runRetentionCleanup();
    }, cleanupIntervalMs);
  }

  /** @internal */
  private async runRetentionCleanup(): Promise<void> {
    if (
      !this.db ||
      this.retentionCleanupRunning ||
      !this.retentionPolicies.length
    ) {
      return;
    }

    this.retentionCleanupRunning = true;
    try {
      this.printDebug('Retention cleanup tick started');
      for (const { storeName, className, policy } of this.retentionPolicies) {
        await this.cleanupExpiredRecords(storeName, className, policy);
      }
      this.printDebug('Retention cleanup tick finished');
    } finally {
      this.retentionCleanupRunning = false;
    }
  }

  /** @internal */
  private cleanupExpiredRecords(
    storeName: string,
    className: string,
    policy: RetentionPolicyMetadata,
  ): Promise<void> {
    if (!this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const cutoff = Date.now() - policy.seconds * 1000;
        const request = store.openCursor();

        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            return;
          }

          const value = cursor.value as Record<string, any>;
          const timestamp = value?.[policy.field];
          this.printDebug(
            `Retention cleanup inspecting ${className}.${policy.field}:`,
            timestamp,
            'cutoff:',
            cutoff,
          );
          if (typeof timestamp === 'number' && timestamp <= cutoff) {
            const deleteRequest = cursor.delete();
            deleteRequest.onsuccess = () => {
              this.printDebug(
                `Retention cleanup removed expired record from ${className}`,
              );
              cursor.continue();
            };
            deleteRequest.onerror = () =>
              reject(
                deleteRequest.error ??
                new Error(`Retention cleanup delete failed for ${className}`),
              );
            return;
          }

          cursor.continue();
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(
            transaction.error ??
            new Error(`Retention cleanup failed for ${className}`),
          );
        transaction.onabort = () =>
          reject(
            transaction.error ??
            new Error(`Retention cleanup aborted for ${className}`),
          );
      } catch (error) {
        reject(error);
      }
    });
  }

  /** @internal */
  private createEntityRepository<T>(
    cls: Function,
    transaction?: IDBTransaction,
  ): EntityRepository<T> {
    const self = this;
    const creationTimestampField = INTERNAL_CREATED_AT_FIELD;
    const updateTimestampField = INTERNAL_UPDATED_AT_FIELD;
    const validators = (Reflect.getMetadata('validators', cls) ||
      []) as ValidationRule<T>[];

    const validateItem = (item: T): void => {
      const failures: string[] = [];

      validators.forEach((rule) => {
        const value = (item as any)[rule.field];
        let valid = false;

        try {
          valid = rule.predicate(value, item);
        } catch {
          valid = false;
        }

        if (!valid) {
          failures.push(`${rule.field}: ${rule.message}`);
        }
      });

      if (failures.length) {
        throw new Error(
          `Validation failed for ${cls.name}: ${failures.join('; ')}`,
        );
      }
    };

    const generateKey = (item: T): string | number | undefined => {
      const keyPathMetadata = Reflect.getMetadata(
        'keypath',
        cls,
      ) as KeyPathMetadata;
      if (!keyPathMetadata?.options?.generator) return undefined;

      const generator = keyPathMetadata.options.generator;

      if (typeof generator === 'function') {
        return generator(item);
      }

      switch (generator) {
        case 'uuid':
          return KeyGenerators.uuid();
        case 'timestamp':
          return KeyGenerators.timestamp();
        case 'random':
          return KeyGenerators.random();
        default:
          return undefined;
      }
    };

    const applyTimestampFields = (item: T, existingItem?: T): void => {
      const now = Date.now();
      const existingCreationValue = existingItem
        ? (existingItem as any)[creationTimestampField]
        : undefined;

      (item as any)[creationTimestampField] =
        existingCreationValue !== undefined ? existingCreationValue : now;
      (item as any)[updateTimestampField] = now;
    };

    const readExistingItem = (
      store: IDBObjectStore,
      key: string | string[] | number,
    ): Promise<T | undefined> => {
      return new Promise<T | undefined>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      });
    };

    const createStoredItem = (
      store: IDBObjectStore,
      item: T,
    ): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const request = store.add(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    const updateStoredItem = async (
      store: IDBObjectStore,
      item: T,
    ): Promise<void> => {
      const key = extractKey(item);

      let existingItem: T | undefined;
      if (key !== undefined && key !== null) {
        existingItem = await readExistingItem(store, key);
      }

      applyTimestampFields(item, existingItem);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    const deleteStoredItem = (
      store: IDBObjectStore,
      key: string | string[] | number,
    ): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    // Helper function to extract key from item
    const extractKey = (item: T): any => {
      const keyPathMetadata = Reflect.getMetadata(
        'keypath',
        cls,
      ) as KeyPathMetadata;
      if (!keyPathMetadata) return undefined;

      const fields = keyPathMetadata.fields;

      if (Array.isArray(fields)) {
        // Composite key
        return fields.map((field) => (item as any)[field]);
      } else {
        // Single field key
        return (item as any)[fields];
      }
    };

    // Helper function to set key on item
    const setKey = (item: T, key: string | number): void => {
      const keyPathMetadata = Reflect.getMetadata(
        'keypath',
        cls,
      ) as KeyPathMetadata;
      if (!keyPathMetadata) return;

      const fields = keyPathMetadata.fields;

      if (typeof fields === 'string') {
        (item as any)[fields] = key;
      }
      // Note: Composite keys cannot be auto-generated in this simple implementation
    };

    return {
      query(): QueryBuilder<T> {
        if (!self.db) throw new Error('Database not initialized.');
        const storeName = cls.name.toLowerCase();
        return new QueryBuilder<T>(self.db, storeName, transaction);
      },

      create: async (item: T): Promise<void> => {
        // Generate key if needed
        const keyPathMetadata = Reflect.getMetadata(
          'keypath',
          cls,
        ) as KeyPathMetadata;
        if (
          keyPathMetadata?.options?.generator &&
          !keyPathMetadata.options.autoIncrement
        ) {
          const currentKey = extractKey(item);
          if (
            currentKey === undefined ||
            currentKey === null ||
            currentKey === ''
          ) {
            const generatedKey = generateKey(item);
            if (generatedKey !== undefined) {
              setKey(item, generatedKey);
            }
          }
        }

        validateItem(item);
        applyTimestampFields(item);

        return this.performOperation(
          cls.name,
          'readwrite',
          (store) => {
            return createStoredItem(store, item).then(() => {
              this.printDebug(`Item added to ${cls.name}:`, item);
            });
          },
          transaction,
        );
      },

      createMany: async (items: T[]): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        for (const item of items) {
          await repository.create(item);
        }
      },

      read: async (key: string | string[] | number): Promise<T | undefined> => {
        return this.performOperation(
          cls.name,
          'readonly',
          (store) => {
            const request = store.get(key);
            return new Promise<T | undefined>((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Item read from ${cls.name}:`, request.result);
                resolve(request.result as T | undefined);
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },

      update: async (item: T): Promise<void> => {
        validateItem(item);

        return this.performOperation(
          cls.name,
          'readwrite',
          (store) => {
            return updateStoredItem(store, item).then(() => {
              this.printDebug(`Item updated in ${cls.name}:`, item);
            });
          },
          transaction,
        );
      },

      updateMany: async (items: T[]): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        for (const item of items) {
          await repository.update(item);
        }
      },

      delete: async (key: string | string[] | number): Promise<void> => {
        return this.performOperation(
          cls.name,
          'readwrite',
          (store) => {
            return deleteStoredItem(store, key).then(() => {
              this.printDebug(`Item deleted from ${cls.name}:`, key);
            });
          },
          transaction,
        );
      },

      deleteMany: async (
        keys: Array<string | string[] | number>,
      ): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        for (const key of keys) {
          await repository.delete(key);
        }
      },

      deleteWhere: async (
        predicate: (query: QueryBuilder<T>) => QueryBuilder<T> | void,
      ): Promise<void> => {
        const repository = this.createEntityRepository<T>(cls, transaction);
        const query = repository.query();
        const resolvedQuery = predicate(query) ?? query;
        const matches = await resolvedQuery.execute();
        const keys = matches
          .map((item) => extractKey(item))
          .filter(
            (key): key is string | string[] | number =>
              key !== undefined && key !== null,
          );

        await repository.deleteMany(keys);
      },

      list: async (): Promise<T[]> => {
        return this.performOperation(
          cls.name,
          'readonly',
          (store) => {
            const request = store.getAll();
            return new Promise<T[]>((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`All items from ${cls.name}:`, request.result);
                resolve(request.result as T[]);
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },

      listPaginated: async (page: number, pageSize: number): Promise<T[]> => {
        return this.performOperation(
          cls.name,
          'readonly',
          (store) => {
            const request = store.getAll();
            return new Promise<T[]>((resolve, reject) => {
              request.onsuccess = () => {
                const items = request.result as T[];
                const paginatedItems = items.slice(
                  (page - 1) * pageSize,
                  page * pageSize,
                );
                this.printDebug(
                  `Paginated items from ${cls.name}:`,
                  paginatedItems,
                );
                resolve(paginatedItems);
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },

      findByIndex: async (indexName: string, value: any): Promise<T[]> => {
        return this.performOperation(
          cls.name,
          'readonly',
          (store) => {
            if (!store.indexNames.contains(indexName)) {
              throw new Error(
                `Index '${indexName}' does not exist on ${cls.name}`,
              );
            }

            const index = store.index(indexName);
            const request = index.getAll(value);
            return new Promise<T[]>((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(
                  `Items found by index ${indexName} with value ${value}:`,
                  request.result,
                );
                resolve(request.result as T[]);
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },

      findOneByIndex: async (
        indexName: string,
        value: any,
      ): Promise<T | undefined> => {
        return this.performOperation(
          cls.name,
          'readonly',
          (store) => {
            if (!store.indexNames.contains(indexName)) {
              throw new Error(
                `Index '${indexName}' does not exist on ${cls.name}`,
              );
            }

            const index = store.index(indexName);
            const request = index.get(value);
            return new Promise<T | undefined>((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(
                  `Item found by index ${indexName} with value ${value}:`,
                  request.result,
                );
                resolve(request.result as T | undefined);
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },

      count: async (): Promise<number> => {
        return this.performOperation(
          cls.name,
          'readonly',
          (store) => {
            const request = store.count();
            return new Promise<number>((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Count for ${cls.name}:`, request.result);
                resolve(request.result);
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },

      exists: async (key: string): Promise<boolean> => {
        return this.performOperation(
          cls.name,
          'readonly',
          (store) => {
            const request = store.count(key);
            return new Promise<boolean>((resolve, reject) => {
              request.onsuccess = () => {
                const exists = request.result > 0;
                this.printDebug(
                  `Exists check for ${cls.name} with key ${key}:`,
                  exists,
                );
                resolve(exists);
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },

      clear: async (): Promise<void> => {
        return this.performOperation(
          cls.name,
          'readwrite',
          (store) => {
            const request = store.clear();
            return new Promise<void>((resolve, reject) => {
              request.onsuccess = () => {
                this.printDebug(`Cleared all items from ${cls.name}`);
                resolve();
              };
              request.onerror = () => reject(request.error);
            });
          },
          transaction,
        );
      },
    };
  }

  /** @internal */
  private async performOperation<R>(
    className: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<R>,
    transaction?: IDBTransaction,
  ): Promise<R> {
    if (!this.db && !transaction) {
      throw new Error('Database not initialized.');
    }

    const storeName = className.toLowerCase();
    const activeTransaction =
      transaction ?? this.db!.transaction(storeName, mode);
    const store = activeTransaction.objectStore(storeName);

    return operation(store);
  }

  /** @internal */
  private createTransactionHandle(
    entityNames: string[],
    mode: IDBTransactionMode,
  ): TransactionalDatabase<Record<string, EntityRepository<any>>> {
    if (!this.db) {
      throw new Error('Database not initialized.');
    }

    const uniqueEntityNames = [...new Set(entityNames)];
    const storeNames = uniqueEntityNames.map((entityName) => {
      const entityClass = this.classes.find((cls) => cls.name === entityName);
      if (!entityClass) {
        throw new Error(
          `Entity '${entityName}' is not registered in ${this.dbName}.`,
        );
      }

      return entityClass.name.toLowerCase();
    });

    const nativeTransaction = this.db.transaction(storeNames, mode);
    let rollbackRequested = false;

    const completion = new Promise<void>((resolve, reject) => {
      nativeTransaction.oncomplete = () => resolve();
      nativeTransaction.onabort = () => {
        if (rollbackRequested) {
          resolve();
          return;
        }

        reject(nativeTransaction.error ?? new Error('Transaction aborted.'));
      };
      nativeTransaction.onerror = () => {
        if (rollbackRequested) {
          resolve();
          return;
        }

        reject(nativeTransaction.error ?? new Error('Transaction failed.'));
      };
    });

    const handle = {} as TransactionalDatabase<
      Record<string, EntityRepository<any>>
    >;
    uniqueEntityNames.forEach((entityName) => {
      const entityClass = this.classes.find((cls) => cls.name === entityName);
      if (entityClass) {
        handle[entityName] = this.createEntityRepository(
          entityClass,
          nativeTransaction,
        );
      }
    });

    handle.commit = async () => {
      if (typeof nativeTransaction.commit === 'function') {
        nativeTransaction.commit();
      }

      await completion;
    };

    handle.rollback = async () => {
      rollbackRequested = true;
      try {
        nativeTransaction.abort();
      } catch {
        // Ignore abort errors after the transaction has already settled.
      }

      await completion.catch(() => undefined);
    };

    return handle;
  }

  /**
   * Opens a multi-store IDB transaction and returns a
   * {@link TransactionalDatabase} with per-entity repositories that share the
   * underlying `IDBTransaction`.
   *
   * Use the returned handle's `commit()` and `rollback()` methods to finalise
   * or discard the transaction. For automatic commit/rollback, prefer the
   * callback-based {@link Database.transaction} method.
   *
   * @param entityNames - Names of the entity classes whose stores will be
   *   enrolled in the transaction.
   * @param mode        - IDB transaction mode (`'readonly'` or `'readwrite'`).
   *   Defaults to `'readwrite'`.
   *
   * @returns A promise resolving to a {@link TransactionalDatabase} handle.
   *
   * @throws `Error` if any name in `entityNames` is not registered.
   *
   * @example
   * ```ts
   * const tx = await db.beginTransaction(['User', 'Order']);
   * try {
   *   await tx.User.create(user);
   *   await tx.Order.create(order);
   *   await tx.commit();
   * } catch (e) {
   *   await tx.rollback();
   * }
   * ```
   */
  public async beginTransaction(
    entityNames: string[],
    mode: IDBTransactionMode = 'readwrite',
  ): Promise<TransactionalDatabase<Record<string, EntityRepository<any>>>> {
    return this.createTransactionHandle(entityNames, mode);
  }

  /**
   * Executes `callback` within a single `readwrite` IDB transaction that spans
   * **all** registered entities. Commits automatically on success; rolls back
   * and rethrows on any error.
   *
   * @typeParam T - The type of the value returned by `callback`.
   * @param callback - An async or synchronous function receiving the
   *   {@link TransactionalDatabase} handle. The callback's return value is
   *   forwarded to the caller.
   *
   * @returns A promise resolving to the value returned by `callback`.
   *
   * @throws Re-throws any error thrown by `callback` after rolling back.
   *
   * @example
   * ```ts
   * await db.transaction(async (tx) => {
   *   await tx.User.create(user);
   *   await tx.Order.create(order);
   *   await tx.OrderItem.create(item);
   * });
   * ```
   */
  public async transaction<T>(
    callback: (
      tx: TransactionalDatabase<Record<string, EntityRepository<any>>>,
    ) => Promise<T> | T,
  ): Promise<T> {
    const tx = this.createTransactionHandle(
      this.classes.map((cls) => cls.name),
      'readwrite',
    );

    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  /**
   * Closes the underlying IDB connection and stops the retention cleanup timer.
   * The instance must not be used after calling this method.
   *
   * @example
   * ```ts
   * db.close();
   * ```
   */
  close(): void {
    if (this.retentionTimer) {
      clearInterval(this.retentionTimer);
      this.retentionTimer = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Returns the names of all entity classes registered with this database.
   *
   * @returns An array of entity class name strings.
   */
  getAvailableEntities(): string[] {
    return Array.from(this.entityRepositories.keys());
  }

  /**
   * Returns the current IDB database version, derived from the highest
   * `version` annotation across all registered entities.
   *
   * @returns The database version number.
   */
  getDatabaseVersion(): number {
    return this.dbVersion;
  }

  /**
   * Returns a `Map` of each registered entity name to its configured schema
   * version.
   *
   * @returns A `Map<string, number>` where keys are entity class names and
   *   values are version numbers.
   */
  getEntityVersions(): Map<string, number> {
    const versions = new Map<string, number>();
    this.classes.forEach((cls) => {
      const version = Reflect.getMetadata('version', cls) || 1;
      versions.set(cls.name, version);
    });
    return versions;
  }

  /**
   * Returns the schema version of a single registered entity.
   *
   * @param entityName - The class name of the entity to look up.
   * @returns The entity's version number, or `undefined` if not registered.
   */
  getEntityVersion(entityName: string): number | undefined {
    const cls = this.classes.find((c) => c.name === entityName);
    return cls ? Reflect.getMetadata('version', cls) || 1 : undefined;
  }
}

export {
  Database,
  KeyPath,
  CompositeKeyPath,
  DataClass,
  Index,
  Validate,
  RetentionPolicy,
  EntityRepository,
  KeyGenerators,
};
export type {
  DatabaseWithRepositories,
  DataClassOptions,
  KeyPathOptions,
  KeyPathMetadata,
  RetentionPolicyOptions,
  RetentionPolicyMetadata,
};
