import { AsyncPipe, DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CurrentLanguagePipe, NewsService, routerLinks } from '@core';
import { GalleryModule, ImageItem } from 'ng-gallery';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    RouterModule,
    CurrentLanguagePipe,
    DatePipe,
    NgOptimizedImage,
    GalleryModule
  ],
  providers: [NewsService],
  templateUrl: './news-details.component.html',
  styleUrl: './news-details.component.scss'
})
export class NewsDetailsComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #newsService = inject(NewsService);

  protected newsItem = toSignal(
    this.#route.params.pipe(
      switchMap(params => {
        return this.#newsService.getNewsById(params['id']);
      })
    )
  );

  protected galleryItems = computed(() => {
    return (this.newsItem()?.imageUrls || []).map(
      imageUrl =>
        new ImageItem({
          src: imageUrl,
          thumb: imageUrl
        })
    );
  });

  protected routerLinks = routerLinks;
}
