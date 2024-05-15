import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { FirestoreCollections, FirestoreService } from '@core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [TranslocoModule, TitleCasePipe, UpperCasePipe],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsSectionComponent implements OnInit {
  readonly #firestoreService = inject(FirestoreService);

  public ngOnInit(): void {
    this.#firestoreService
      .getList(FirestoreCollections.products, {
        limit: 5,
        orderBy: 'updated_at'
      })
      .subscribe();
  }
}
