import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';

import { ProductFirestore, ProductsService, routerLinks } from '../../../core';
import { NotifyOnStockFirestore } from '../../../core/interfaces/notify-on-stock';
import { IconComponent } from '../../../shared';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [DatePipe, IconComponent, RouterModule],
  providers: [ProductsService],
  templateUrl: './notification-modal.component.html',
  styleUrl: './notification-modal.component.scss'
})
export class NotificationModalComponent implements OnInit {
  readonly #dialogRef = inject(DialogRef);
  readonly #router = inject(Router);
  readonly #productsService = inject(ProductsService);
  readonly #dr = inject(DestroyRef);

  protected notification = inject<NotifyOnStockFirestore>(DIALOG_DATA);

  protected product = signal<ProductFirestore | null>(null);

  protected routerLinks = routerLinks;

  public ngOnInit(): void {
    this.#productsService
      .getProductById(this.notification.productId)
      .pipe(takeUntilDestroyed(this.#dr))
      .subscribe(res => {
        this.product.set(res);
      });
  }

  protected openProductInNewTab(productId: string): void {
    const url = this.#router.serializeUrl(
      this.#router.createUrlTree(['/', routerLinks.productList, productId])
    );

    window.open(url, '_blank');
  }

  protected completeNotification(): void {
    if (!confirm('Are you sure you want to complete this notification?')) {
      return;
    }
    this.#dialogRef.close(true);
  }

  protected deleteNotification(): void {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    this.#dialogRef.close(false);
  }

  protected close(): void {
    this.#dialogRef.close();
  }
}
