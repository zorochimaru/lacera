import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { endOfDay, startOfDay } from 'date-fns';
import { BehaviorSubject } from 'rxjs';

import { DateRange, FirestoreService } from '../../core';

@Injectable()
export class NotificationsService {
  readonly #fireStoreService = inject(FirestoreService);
  readonly #dr = inject(DestroyRef);

  readonly #sourceData$ = new BehaviorSubject<any[]>([]);
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

  // public loadNextData(reset?: boolean, filter?: CustomQuery[]): void {
  //   if (this.#hasMore || reset) {
  //     this.#fireStoreService
  //       .getListWithPagination<OrderFirestore>(FirestoreCollections.orders, {
  //         limit: 10,
  //         orderDirection: 'desc',
  //         orderBy: 'createdAt',
  //         customQuery: filter,
  //         startAfter:
  //           !reset && this.#sourceData$.value.at(-1)
  //             ? Timestamp.fromDate(this.#sourceData$.value.at(-1)!.createdAt)
  //             : null
  //       })
  //       .pipe(takeUntilDestroyed(this.#dr))
  //       .subscribe(res => {
  //         if (reset) {
  //           this.#sourceData$.next(res.items);
  //         } else {
  //           this.#sourceData$.next([...this.#sourceData$.value, ...res.items]);
  //         }
  //         this.#hasMore = !!res.last;
  //       });
  //   }
  // }

  // public getOrderById(id: string): Observable<OrderFirestore | null> {
  //   return this.#fireStoreService.get<OrderFirestore>(
  //     FirestoreCollections.orders,
  //     id
  //   );
  // }

  // public createOrder(order: Order): Observable<string> {
  //   return this.#fireStoreService.create<OrderFirestore>(
  //     FirestoreCollections.orders,
  //     order
  //   );
  // }

  // public updateOrder(id: string, order: OrderFirestore): Observable<void> {
  //   return this.#fireStoreService.update<OrderFirestore>(
  //     FirestoreCollections.orders,
  //     id,
  //     order
  //   );
  // }

  // public deleteOrder(id: string): Observable<void> {
  //   return this.#fireStoreService.delete(FirestoreCollections.orders, id);
  // }

  // public searchOrdersByDate(): void {
  //   this.#hasMore = true;
  //   this.#fireStoreService
  //     .getList<OrderFirestore>(FirestoreCollections.orders, {
  //       customQuery: [
  //         ['createdAt', '>', this.#dateRange().start],
  //         ['createdAt', '<', this.#dateRange().end]
  //       ]
  //     })
  //     .pipe(takeUntilDestroyed(this.#dr))
  //     .subscribe(res => {
  //       this.#sourceData$.next(res);
  //     });
  // }
}
