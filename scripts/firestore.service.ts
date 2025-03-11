import { BulkWriterError, WhereFilterOp } from '@google-cloud/firestore';
import {
  CollectionGroup,
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  FieldValue,
  Firestore,
  getFirestore,
  OrderByDirection,
  Query,
  QuerySnapshot,
  Timestamp,
  WriteBatch,
  WriteResult
} from 'firebase-admin/firestore';
import { chunk } from 'lodash';

import { sleep } from './sleep';

export enum Operations {
  create = 'create',
  delete = 'delete',
  update = 'update'
}

export type PartialSubtype<T extends S, S> = Omit<T, keyof S> & Partial<S>;

interface CommonFirestore {
  createdAt: Date;
  createdBy: string;
  id: string;
  updatedAt: Date;
  updatedBy: string;
}

export type CustomQuery = [string | FieldPath, WhereFilterOp, unknown];

export interface CustomQueryOptions<T> {
  limit?: number;
  orderBy?: string | FieldPath;
  orderDirection?: OrderByDirection;
  startAfter?: DocumentSnapshot<T> | string | null;
  withParentId?: boolean;
}

export interface CustomListWithPagination<T> {
  items: T[];
  last: DocumentSnapshot<T> | null;
}

export const firestoreBatchOperations = [
  Operations.create,
  Operations.delete,
  Operations.update
];

export interface FirestoreBatchItem {
  __collection?: string;
  __docId: string;
  __operation: Operations;

  [field: string]: unknown;
}

const maxBatchSize = 500;
const maxSlowBatchSize = 100;
const maxBatchSizeInQuery = 30;
/**
 * Firestore service
 */
export class FirestoreService<T> {
  protected static objectTimestampToDate(obj: unknown): unknown {
    const res = { ...(obj as { [key: string]: unknown }) };

    Object.keys(res).forEach(key => {
      if (res[key] instanceof Timestamp) {
        res[key] = (res[key] as Timestamp).toDate();
      }
    });
    return res;
  }

  public get autoId(): string {
    return this.db.collection(this.collectionName).doc().id;
  }

  protected readonly db: Firestore;

  constructor(
    protected readonly collectionName: string,
    protected readonly userDocId?: string
  ) {
    this.db = getFirestore();
  }

  public static getNewDoc(data: DocumentData): DocumentData {
    return {
      createdBy: 'system',
      updatedBy: 'system',
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
  }

  public count(
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<T>
  ): Promise<number> {
    let query: Query<T> = this.db.collection(
      this.collectionName
    ) as CollectionReference<T>;
    query = this.applyQueryOptions(query, queryOptions, options);
    return query
      .count()
      .get()
      .then(res => res.data().count);
  }

  public getList(
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<T>
  ): Promise<T[]> {
    return this.#getList(queryOptions, options).then(res =>
      res.docs.map(doc => this.mapDoc(doc))
    );
  }

  public getQuerySnapshot(
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<T>
  ): Promise<QuerySnapshot<T>> {
    return this.#getList(queryOptions, options);
  }

  public getListFromSubcollection<D = T>(
    subcollection: string,
    parentId: string,
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<D>
  ): Promise<D[]> {
    let query: Query<D> = this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subcollection) as CollectionReference<D>;
    query = this.applyQueryOptions(query, queryOptions, options);
    return query.get().then(res => res.docs.map(doc => this.mapDoc(doc)));
  }

  public async getDocumentSnapshot(
    docId: string
  ): Promise<DocumentSnapshot<T>> {
    return (this.db.collection(this.collectionName) as CollectionReference<T>)
      .doc(docId)
      .get();
  }

  public getDocSnapshotsFromCollectionGroup<D = T>(
    collectionGroupName: string,
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<D>
  ): Promise<DocumentSnapshot<D>[]> {
    let query: Query<D> = this.db.collectionGroup(
      collectionGroupName
    ) as CollectionGroup<D>;

    query = this.applyQueryOptions(query, queryOptions, options);
    return query.get().then(res => res.docs);
  }

  public getListFromCollectionGroup<D = T>(
    collectionGroupName: string,
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<D>
  ): Promise<D[]> {
    return this.getDocSnapshotsFromCollectionGroup(
      collectionGroupName,
      queryOptions,
      options
    ).then(docs =>
      docs.map(doc =>
        options?.withParentId ? this.mapDocWithParentId(doc) : this.mapDoc(doc)
      )
    );
  }

  public getListWithPagination(
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<T>
  ): Promise<CustomListWithPagination<T>> {
    return this.#getList(queryOptions, options).then(res => ({
      items: res.docs.map(doc => this.mapDoc(doc)),
      last: res.empty ? null : res.docs[res.docs.length - 1]
    }));
  }

  public get(docId: string): Promise<T | null> {
    return (this.db.collection(this.collectionName) as CollectionReference<T>)
      .doc(docId)
      .get()
      .then(doc => (doc.exists ? this.mapDoc(doc) : null));
  }

  public getFromSubcollection<D = T>(
    subcollection: string,
    parentId: string,
    docId: string
  ): Promise<D | null> {
    return (
      this.db
        .collection(this.collectionName)
        .doc(parentId)
        .collection(subcollection) as CollectionReference<D>
    )
      .doc(docId)
      .get()
      .then(doc => (doc.exists ? this.mapDoc(doc) : null));
  }

  public async add(
    doc: T extends CommonFirestore ? PartialSubtype<T, CommonFirestore> : T
  ): Promise<string> {
    const { id, ...copy } = doc as unknown as Partial<CommonFirestore>;
    if (this.userDocId) {
      copy.createdBy = this.userDocId;
      copy.updatedBy = this.userDocId;
    }
    const docId = id || this.autoId;
    const docRef = this.db.collection(this.collectionName).doc(docId);
    await docRef.set(FirestoreService.getNewDoc(copy));
    return docId;
  }

  public addToSubcollection<D = T>(
    subcollection: string,
    parentId: string,
    doc: D extends CommonFirestore ? PartialSubtype<D, CommonFirestore> : D
  ): Promise<DocumentReference<D>> {
    const { id, ...copy } = doc as unknown as Partial<CommonFirestore>;
    if (this.userDocId) {
      copy.createdBy = this.userDocId;
      copy.updatedBy = this.userDocId;
    }
    return this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subcollection)
      .add(FirestoreService.getNewDoc(copy)) as Promise<DocumentReference<D>>;
  }

  // Merge existing records by default
  public update(
    docId: string,
    doc: Partial<T>,
    merge = true
  ): Promise<WriteResult> {
    const { id, ...copy } = doc as unknown as Partial<CommonFirestore>;
    if (this.userDocId) {
      copy.updatedBy = this.userDocId;
    }
    return this.db
      .collection(this.collectionName)
      .doc(docId)
      .set(
        {
          updatedBy: 'system',
          ...copy,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge }
      );
  }

  public updateSubcollectionDoc<D = T>(
    subcollection: string,
    parentId: string,
    subDocId: string,
    doc: Partial<D>,
    merge = true
  ): Promise<WriteResult> {
    const { id, ...copy } = doc as unknown as Partial<CommonFirestore>;
    if (this.userDocId) {
      copy.updatedBy = this.userDocId;
    }
    return this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subcollection)
      .doc(subDocId)
      .set(
        {
          updatedBy: 'system',
          ...copy,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge }
      );
  }

  public delete(docId: string): Promise<WriteResult> {
    return this.db.collection(this.collectionName).doc(docId).delete();
  }

  public deleteSubcollectionDoc(
    subcollection: string,
    parentId: string,
    subDocId: string
  ): Promise<WriteResult> {
    return this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subcollection)
      .doc(subDocId)
      .delete();
  }

  public recursiveDelete(docId: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(docId);
    return this.db.recursiveDelete(docRef);
  }

  public async parallelWrite(
    items: FirestoreBatchItem[],
    merge = true,
    overrideCreatedAt?: Date
  ): Promise<void> {
    const bulkWriter = this.db.bulkWriter();
    const errors: BulkWriterError[] = [];

    items.forEach(item => {
      const { __operation, __docId, __collection, ...data } = item;
      const docRef = this.db
        .collection(__collection || this.collectionName)
        .doc(__docId);

      if (__operation === Operations.delete) {
        bulkWriter.delete(docRef).catch(err => errors.push(err));
        return;
      }

      if (__operation === Operations.create) {
        data['createdAt'] = FieldValue.serverTimestamp();
        data['createdBy'] = this.userDocId || data['createdBy'] || 'system';
      }
      data['updatedAt'] = FieldValue.serverTimestamp();
      data['updatedBy'] = this.userDocId || data['updatedBy'] || 'system';

      if (overrideCreatedAt) {
        data['createdAt'] = overrideCreatedAt;
        data['updatedAt'] = overrideCreatedAt;
      }

      bulkWriter.set(docRef, data, { merge }).catch(err => errors.push(err));
    });

    await bulkWriter.close();

    if (errors.length) {
      const message = errors
        .map(err => `${err.documentRef.id}: ${err.message}`)
        .join('\n');
      throw new Error(`Error during parallel write:\n${message}`);
    }
  }

  public batchWrite(
    items: FirestoreBatchItem[],
    merge = true,
    batchSize?: number
  ): Promise<void> {
    const chunks = chunk<FirestoreBatchItem>(items, batchSize || maxBatchSize);

    return Promise.all(
      chunks.map(chunkItems => {
        const batch = this.db.batch();

        chunkItems.forEach(item => {
          const { __operation, __docId, __collection, ...data } = item;
          const docRef = this.db
            .collection(
              (__collection as string | undefined) || this.collectionName
            )
            .doc(__docId);

          if (__operation === Operations.delete) {
            batch.delete(docRef);
            return;
          }

          if (__operation === Operations.create) {
            data['createdAt'] = FieldValue.serverTimestamp();
            data['createdBy'] = this.userDocId || data['createdBy'] || 'system';
          }
          data['updatedAt'] = FieldValue.serverTimestamp();
          data['updatedBy'] = this.userDocId || data['updatedBy'] || 'system';

          batch.set(docRef, data, { merge });
        });

        return batch.commit();
      })
    ).then();
  }

  public batchUpdate(items: Partial<T>[], updatedBy?: string): Promise<void> {
    const preparedItems = this.#prepareBatchUpdate(items, updatedBy);
    const chunks = chunk(preparedItems, maxBatchSize);
    return Promise.all(
      chunks.map(chunkItems =>
        this.#batchUpdatePrepareBatch(chunkItems).commit()
      )
    ).then();
  }

  public batchUpdateSubcollection<D = T>(
    items: Partial<D>[],
    subcollection: string,
    parentId: string,
    updatedBy?: string
  ): Promise<void> {
    const preparedItems = this.#prepareBatchUpdate<D>(items, updatedBy);
    const chunks = chunk(preparedItems, maxBatchSize);
    return Promise.all(
      chunks.map(chunkItems =>
        this.#batchUpdatePrepareBatchSubcollection<D>(
          chunkItems,
          subcollection,
          parentId
        ).commit()
      )
    ).then();
  }

  public async slowBatchUpdate(
    items: Partial<T>[],
    timeoutSec = 5,
    updatedBy?: string
  ): Promise<void> {
    const preparedItems = this.#prepareBatchUpdate(items, updatedBy);
    const chunks = chunk(preparedItems, maxSlowBatchSize);
    for (const chunkItems of chunks) {
      await this.#batchUpdatePrepareBatch(chunkItems).commit();
      await sleep(timeoutSec * 1000);
    }
  }

  public batchDeleteSnapshots(snapshots: DocumentSnapshot[]): Promise<void> {
    const chunks = chunk(snapshots, maxBatchSize);
    return Promise.all(
      chunks.map(chunkItems => {
        const batch = this.db.batch();
        chunkItems.forEach(snapshot => batch.delete(snapshot.ref));
        return batch.commit();
      })
    ).then(() => void 0);
  }

  public getItemsByIds(ids: string[]): Promise<T[]> {
    return Promise.all(
      chunk(ids, maxBatchSizeInQuery).map(chunkIds =>
        this.getList([[FieldPath.documentId(), 'in', chunkIds]])
      )
    ).then(res => res.flat());
  }

  public getItemsByFieldValues(
    field: string & keyof T,
    values: string[]
  ): Promise<T[]> {
    return Promise.all(
      chunk(values, maxBatchSizeInQuery).map(chunkValues =>
        this.getList([[field, 'in', chunkValues]])
      )
    ).then(res => res.flat());
  }

  protected mapDoc<D = T>(snapshot: DocumentSnapshot<D>): D {
    const doc = {
      ...(snapshot.data() as Partial<CommonFirestore>),
      id: snapshot.id
    };

    return FirestoreService.objectTimestampToDate(doc) as D;
  }

  protected mapDocWithParentId<D = T>(
    snapshot: DocumentSnapshot<D>
  ): D & { parentId?: string } {
    const doc = this.mapDoc(snapshot) as D & { parentId?: string };

    if (snapshot.ref.parent.parent?.id) {
      doc.parentId = snapshot.ref.parent.parent.id;
    }

    return FirestoreService.objectTimestampToDate(doc) as D & {
      parentId?: string;
    };
  }

  protected applyQueryOptions<D = T>(
    query: Query<D>,
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<D>
  ): Query<D> {
    queryOptions.forEach(options => (query = query.where(...options)));

    if (options?.orderBy) {
      query = query.orderBy(options.orderBy, options?.orderDirection || 'asc');
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.startAfter) {
      if (!options?.orderBy) {
        query = query.orderBy('updatedAt', options?.orderDirection || 'asc');
      }
      query = query.startAfter(options.startAfter);
    }

    return query;
  }

  #getList(
    queryOptions: CustomQuery[] = [],
    options?: CustomQueryOptions<T>
  ): Promise<QuerySnapshot<T>> {
    let query: Query<T> = this.db.collection(
      this.collectionName
    ) as CollectionReference<T>;

    query = this.applyQueryOptions(query, queryOptions, options);

    return query.get();
  }

  #prepareBatchUpdate<D = T>(
    items: Partial<D>[],
    updatedBy?: string
  ): (Partial<D> & CommonFirestore)[] {
    return items.map(item => {
      const data = item as Partial<D> & CommonFirestore;
      if (updatedBy) {
        data.updatedBy = updatedBy;
      }
      if (this.userDocId) {
        data.updatedBy = this.userDocId;
      }
      data.updatedAt = FieldValue.serverTimestamp() as unknown as Date;
      return data;
    });
  }

  #batchUpdatePrepareBatch(
    chunkItems: (Partial<T> & CommonFirestore)[]
  ): WriteBatch {
    const batch = this.db.batch();
    chunkItems.forEach(({ id, ...data }) => {
      const docRef = this.db.collection(this.collectionName).doc(id);
      batch.update(docRef, data);
    });
    return batch;
  }

  #batchUpdatePrepareBatchSubcollection<D = T>(
    chunkItems: (Partial<D> & CommonFirestore)[],
    subcollection: string,
    parentId: string
  ): WriteBatch {
    const batch = this.db.batch();
    chunkItems.forEach(({ id, ...data }) => {
      const docRef = this.db
        .collection(this.collectionName)
        .doc(parentId)
        .collection(subcollection)
        .doc(id);
      batch.update(docRef, data);
    });
    return batch;
  }
}
