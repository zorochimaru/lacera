import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DateRange, IntersectionListenerDirective, routerLinks } from '@core';
import { endOfDay, startOfDay } from 'date-fns';

import { NewsService } from '../../core/services/news.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    IntersectionListenerDirective
  ],
  providers: [NewsService],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListComponent implements OnInit {
  readonly #newsService = inject(NewsService);

  protected news$ = this.#newsService.sourceData$;
  protected maxDate = '';
  protected minDate = '';
  protected startDate = new Date().toISOString().split('T')[0];
  protected routerLinks = routerLinks;

  public ngOnInit(): void {
    this.#newsService.loadNextData();
  }

  protected setDateFilters(e: Event, type: 'start' | 'end'): void {
    const isoDate = (e.target as HTMLInputElement).valueAsDate!.toISOString();
    const result: DateRange = {
      start: this.#newsService.getDateRange()?.start || startOfDay(new Date()),
      end: this.#newsService.getDateRange()?.end || endOfDay(new Date())
    };

    if (type === 'start') {
      result.start = startOfDay((e.target as HTMLInputElement).valueAsDate!);
      this.minDate = isoDate.split('T')[0];
    }
    if (type === 'end') {
      result.end = endOfDay((e.target as HTMLInputElement).valueAsDate!);
      this.maxDate = isoDate.split('T')[0];
    }

    this.#newsService.setDateRange(result);
  }

  protected searchByFilters(): void {
    this.#newsService.searchNewsByDate();
  }

  protected loadMore(isLast: boolean): void {
    if (isLast) {
      this.#newsService.loadNextData();
    }
  }
}
