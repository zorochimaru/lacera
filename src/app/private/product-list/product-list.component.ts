import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DateRange,
  IntersectionListenerDirective,
  ProductsService,
  routerLinks
} from '@core';
import { endOfDay, startOfDay } from 'date-fns';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    IntersectionListenerDirective
  ],
  providers: [ProductsService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  readonly #productsService = inject(ProductsService);

  protected products$ = this.#productsService.sourceData$;
  protected maxDate = '';
  protected minDate = '';
  protected startDate = new Date().toISOString().split('T')[0];
  protected routerLinks = routerLinks;

  public ngOnInit(): void {
    this.#productsService.loadNextData();
  }

  protected setDateFilters(e: Event, type: 'start' | 'end'): void {
    const isoDate = (e.target as HTMLInputElement).valueAsDate!.toISOString();
    const result: DateRange = {
      start:
        this.#productsService.getDateRange()?.start || startOfDay(new Date()),
      end: this.#productsService.getDateRange()?.end || endOfDay(new Date())
    };

    if (type === 'start') {
      result.start = startOfDay((e.target as HTMLInputElement).valueAsDate!);
      this.minDate = isoDate.split('T')[0];
    }
    if (type === 'end') {
      result.end = endOfDay((e.target as HTMLInputElement).valueAsDate!);
      this.maxDate = isoDate.split('T')[0];
    }

    this.#productsService.setDateRange(result);
  }

  protected searchByFilters(): void {
    this.#productsService.searchProductsByDate();
  }

  protected loadMore(isLast: boolean): void {
    if (isLast) {
      this.#productsService.loadNextData();
    }
  }
}
