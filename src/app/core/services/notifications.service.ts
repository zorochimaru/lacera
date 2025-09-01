import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';
import { endOfDay, startOfDay } from 'date-fns';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  CustomQuery,
  DateRange,
  FirestoreCollections,
  FirestoreService,
  NotifyOnStock,
  NotifyOnStockFirestore
} from '../../core';

@Injectable()
export class NotificationsService {
  readonly #fireStoreService = inject(FirestoreService);
  readonly #dr = inject(DestroyRef);
  readonly #http = inject(HttpClient);

  readonly #sourceData$ = new BehaviorSubject<NotifyOnStockFirestore[]>([]);
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

  public sendManagerNotification(
    notification: NotifyOnStock
  ): Observable<{ ok: boolean }> {
    return this.#http.post<{ ok: boolean }>(
      'https://lacera-notifications-manager.vercel.app/api/notify',
      notification
    );
  }

  public loadNextData(reset?: boolean, filter?: CustomQuery[]): void {
    if (this.#hasMore || reset) {
      this.#fireStoreService
        .getListWithPagination<NotifyOnStockFirestore>(
          FirestoreCollections.notifyOnStock,
          {
            limit: 10,
            orderDirection: 'desc',
            orderBy: 'createdAt',
            customQuery: filter,
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

  public getById(id: string): Observable<NotifyOnStockFirestore | null> {
    return this.#fireStoreService.get<NotifyOnStockFirestore>(
      FirestoreCollections.notifyOnStock,
      id
    );
  }

  public createNotification(notification: NotifyOnStock): Observable<string> {
    return this.#fireStoreService.create<NotifyOnStockFirestore>(
      FirestoreCollections.notifyOnStock,
      notification
    );
  }

  public updateNotification(
    id: string,
    notification: NotifyOnStockFirestore
  ): Observable<void> {
    return this.#fireStoreService.update<NotifyOnStockFirestore>(
      FirestoreCollections.notifyOnStock,
      id,
      notification
    );
  }

  public deleteNotification(id: string): Observable<void> {
    return this.#fireStoreService.delete(
      FirestoreCollections.notifyOnStock,
      id
    );
  }

  public searchNotificationsByDate(): void {
    this.#hasMore = true;
    this.#fireStoreService
      .getList<NotifyOnStockFirestore>(FirestoreCollections.notifyOnStock, {
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
}
