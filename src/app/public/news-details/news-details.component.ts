import { AsyncPipe, DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  CurrentLanguagePipe,
  NewsFirestore,
  NewsService,
  routerLinks
} from '@core';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    RouterModule,
    CurrentLanguagePipe,
    DatePipe,
    NgOptimizedImage
  ],
  providers: [NewsService],
  templateUrl: './news-details.component.html',
  styleUrl: './news-details.component.scss'
})
export class NewsDetailsComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #newsService = inject(NewsService);

  protected newsItem$!: Observable<NewsFirestore | null>;

  protected routerLinks = routerLinks;

  public ngOnInit(): void {
    this.newsItem$ = this.#route.params.pipe(
      switchMap(params => {
        return this.#newsService.getNewsById(params['id']);
      })
    );
  }
}
