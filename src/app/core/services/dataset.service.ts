import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';

import {
  DatasetItem,
  DatasetItemFirestore,
  FirestoreCollections
} from '../interfaces';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class DatasetService {
  readonly #fireStoreService = inject(FirestoreService);
  readonly #dr = inject(DestroyRef);

  #sourceData = signal<DatasetItemFirestore[]>([]);
  public sourceData = this.#sourceData.asReadonly();

  #hasMore = true;

  public loadDataset(datasetCollection: FirestoreCollections, reset?: boolean) {
    if (this.#hasMore || reset) {
      this.#fireStoreService
        .getListWithPagination<DatasetItemFirestore>(datasetCollection, {
          limit: 10,
          orderDirection: 'desc',
          orderBy: 'createdAt',
          startAfter:
            !reset && this.#sourceData().at(-1)
              ? Timestamp.fromDate(this.#sourceData().at(-1)!.createdAt)
              : null
        })
        .pipe(takeUntilDestroyed(this.#dr))
        .subscribe(res => {
          if (reset) {
            this.#sourceData.set(res.items);
          } else {
            this.#sourceData.update(oldValue => [...oldValue, ...res.items]);
          }
          this.#hasMore = !!res.last;
        });
    }
  }

  public getAllDataset(datasetCollection: FirestoreCollections) {
    return this.#fireStoreService.getList<DatasetItemFirestore>(
      datasetCollection
    );
  }

  public createValue(
    datasetCollection: FirestoreCollections,
    value: DatasetItem
  ) {
    return this.#fireStoreService.create(datasetCollection, value);
  }

  public updateValue(
    datasetCollection: FirestoreCollections,
    id: string,
    value: DatasetItemFirestore
  ) {
    return this.#fireStoreService.update(datasetCollection, id, value);
  }

  public deleteValue(datasetCollection: FirestoreCollections, id: string) {
    return this.#fireStoreService.delete(datasetCollection, id);
  }

  public getDatasetById(datasetCollection: FirestoreCollections, id: string) {
    return this.#fireStoreService.get<DatasetItemFirestore>(
      datasetCollection,
      id
    );
  }
}
