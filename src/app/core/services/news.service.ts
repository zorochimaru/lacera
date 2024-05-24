import { inject, Injectable } from '@angular/core';
import { FirestoreCollections, News, NewsFirestore } from '@core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { FirestoreService } from './firestore.service';

@Injectable()
export class NewsService {
  readonly #fireStoreService = inject(FirestoreService);
  readonly #cache = new BehaviorSubject<NewsFirestore[]>([]);

  public loadNextData(): Observable<void> {
    return this.getNews().pipe(
      tap(news => {
        this.#cache.next([...this.#cache.value, ...news]);
      }),
      map(() => void 0)
    );
  }

  public getNews(): Observable<NewsFirestore[]> {
    return this.#fireStoreService.getList<NewsFirestore>(
      FirestoreCollections.news,
      {
        limit: 5
      }
    );
  }

  public getNewsById(id: string): Observable<NewsFirestore | null> {
    return this.#fireStoreService.get<NewsFirestore>(
      FirestoreCollections.news,
      id
    );
  }

  public createNews(news: News): Observable<string> {
    return this.#fireStoreService.create<NewsFirestore>(
      FirestoreCollections.news,
      news
    );
  }

  public updateNews(id: string, news: NewsFirestore): Observable<void> {
    return this.#fireStoreService.update<NewsFirestore>(
      FirestoreCollections.news,
      id,
      news
    );
  }
}
