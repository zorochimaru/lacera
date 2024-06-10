import { AsyncPipe, DatePipe, NgIf, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsService, routerLinks } from '@core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    RouterModule,
    NgOptimizedImage,
    DatePipe,
    TranslocoModule
  ],
  providers: [NewsService],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsSectionComponent implements OnInit {
  readonly #newsService = inject(NewsService);

  protected sourceData$ = this.#newsService.sourceData$;
  protected routerLinks = routerLinks;

  public ngOnInit(): void {
    this.#newsService.loadNextData();
  }
}
