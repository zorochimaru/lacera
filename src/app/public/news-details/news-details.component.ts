import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CurrentLanguagePipe, NewsService, routerLinks } from '@core';
import { switchMap } from 'rxjs';

import { ImageDialogComponent } from '../../shared';
import { ProductsHeaderComponent } from '../shared';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [
    RouterModule,
    CurrentLanguagePipe,
    ProductsHeaderComponent,
    DatePipe,
    DialogModule
  ],
  providers: [NewsService],
  templateUrl: './news-details.component.html',
  styleUrl: './news-details.component.scss'
})
export class NewsDetailsComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #newsService = inject(NewsService);
  readonly #dialog = inject(Dialog);

  protected newsItem = toSignal(
    this.#route.params.pipe(
      switchMap(params => {
        return this.#newsService.getNewsById(params['id']);
      })
    )
  );

  protected galleryItems = computed(() => {
    return this.newsItem()?.imageUrls || [];
  });

  protected routerLinks = routerLinks;

  openDialog(src: string): void {
    this.#dialog.open<string>(ImageDialogComponent, {
      data: { src }
    });
  }
}
