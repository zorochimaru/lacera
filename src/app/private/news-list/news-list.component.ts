import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { routerLinks } from '@core';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  switchMap,
  tap
} from 'rxjs';

import { NewsFirestore } from '../../core/interfaces';
import { NewsService } from '../../core/services/news.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ReactiveFormsModule, RouterLink],
  providers: [NewsService],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListComponent implements OnInit {
  readonly #newsService = inject(NewsService);
  protected news$!: Observable<NewsFirestore[]>;
  protected searchControl = new FormControl('', { nonNullable: true });
  protected routerLinks = routerLinks;
  public ngOnInit(): void {
    this.news$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.#newsService.getNews()),
      tap(x => console.log(x))
    );
  }
}
