import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import {
  FirestoreCollections,
  FirestoreService,
  ProductFirestore,
  routerLinks
} from '@core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [TranslocoModule, TitleCasePipe, UpperCasePipe, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsSectionComponent implements OnInit {
  readonly #firestoreService = inject(FirestoreService);
  readonly #dr = inject(DestroyRef);

  protected products = signal<ProductFirestore[]>([]);
  protected routerLinks = routerLinks;

  public ngOnInit(): void {
    this.#firestoreService
      .getList<ProductFirestore>(FirestoreCollections.products, { limit: 8 })
      .pipe(takeUntilDestroyed(this.#dr))
      .subscribe(res => this.products.set(res));
  }
}
