import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';
import {
  DatasetItemFirestore,
  datasetList,
  DateRange,
  FirestoreCollections,
  FirestoreService,
  Product,
  ProductFirestore
} from '@core';
import { endOfDay, startOfDay } from 'date-fns';
import { BehaviorSubject, forkJoin, map, Observable } from 'rxjs';

@Injectable()
export class ProductsService {
  readonly #fireStoreService = inject(FirestoreService);
  readonly #dr = inject(DestroyRef);

  readonly #sourceData$ = new BehaviorSubject<ProductFirestore[]>([]);
  public sourceData$ = this.#sourceData$.asObservable();

  #dateRange = signal<DateRange>({
    start: startOfDay(new Date()),
    end: endOfDay(new Date())
  });

  #hasMore = true;

  public setDateRange(dateRange: DateRange): void {
    this.#dateRange.set(dateRange);
  }

  public getDateRange(): DateRange | null {
    return this.#dateRange();
  }

  public loadNextData(reset?: boolean) {
    if (this.#hasMore) {
      this.#fireStoreService
        .getListWithPagination<ProductFirestore>(
          FirestoreCollections.products,
          {
            limit: 10,
            orderDirection: 'desc',
            orderBy: 'createdAt',
            startAfter:
              !reset && this.#sourceData$.value.at(-1)
                ? Timestamp.fromDate(this.#sourceData$.value.at(-1)!.createdAt)
                : null
          }
        )
        .pipe(takeUntilDestroyed(this.#dr))
        .subscribe(res => {
          if (reset) {
            this.#sourceData$.next(res.items);
          } else {
            this.#sourceData$.next([...this.#sourceData$.value, ...res.items]);
          }
          this.#hasMore = !!res.last;
        });
    }
  }

  public getProductById(id: string): Observable<ProductFirestore | null> {
    return this.#fireStoreService.get<ProductFirestore>(
      FirestoreCollections.products,
      id
    );
  }

  public createProduct(news: Product): Observable<string> {
    return this.#fireStoreService.create<ProductFirestore>(
      FirestoreCollections.products,
      news
    );
  }

  public updateProduct(id: string, news: ProductFirestore): Observable<void> {
    return this.#fireStoreService.update<ProductFirestore>(
      FirestoreCollections.products,
      id,
      news
    );
  }

  public searchProductsByDate(): void {
    this.#hasMore = true;
    this.#fireStoreService
      .getList<ProductFirestore>(FirestoreCollections.products, {
        customQuery: [
          ['createdAt', '>', this.#dateRange().start],
          ['createdAt', '<', this.#dateRange().end]
        ]
      })
      .pipe(takeUntilDestroyed(this.#dr))
      .subscribe(res => {
        this.#sourceData$.next(res);
      });
  }

  public getDatasets(): Observable<
    Record<FirestoreCollections, DatasetItemFirestore[]>
  > {
    return forkJoin(
      datasetList.map(dataset =>
        this.#fireStoreService.getList<DatasetItemFirestore>(dataset.collection)
      )
    ).pipe(
      map(res => {
        const result: Record<FirestoreCollections, DatasetItemFirestore[]> =
          {} as Record<FirestoreCollections, DatasetItemFirestore[]>;
        datasetList.forEach((dataset, index) => {
          result[dataset.collection] = res[index];
        });
        return result;
      })
    );
  }
}
