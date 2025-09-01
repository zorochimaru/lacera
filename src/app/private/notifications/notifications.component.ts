import { Dialog } from '@angular/cdk/dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { NotificationsService } from '../../core';
import { NotifyOnStockFirestore } from '../../core/interfaces/notify-on-stock';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';

@Component({
  selector: 'app-notifications',
  imports: [CdkTableModule, ReactiveFormsModule],
  providers: [NotificationsService],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  readonly #notificationsService = inject(NotificationsService);
  readonly #dialog = inject(Dialog);
  readonly #dr = inject(DestroyRef);

  protected readonly notifications = toSignal(
    this.#notificationsService.sourceData$
  );

  protected completedControl = new FormControl(false);

  public ngOnInit(): void {
    this.#notificationsService.loadNextData(true, [
      ['completed', '==', this.completedControl.getRawValue()]
    ]);

    this.completedControl.valueChanges.subscribe(res => {
      this.#notificationsService.loadNextData(true, [['completed', '==', res]]);
    });
  }

  protected openNotificationDetails(
    notification: NotifyOnStockFirestore
  ): void {
    this.#dialog
      .open(NotificationModalComponent, { data: notification })
      .closed.subscribe(res => {
        if (res) {
          this.#notificationsService
            .updateNotification(notification.id, {
              ...notification,
              completed: true
            })
            .pipe(takeUntilDestroyed(this.#dr))
            .subscribe(() =>
              this.#notificationsService.loadNextData(true, [
                ['completed', '==', this.completedControl.getRawValue()]
              ])
            );
        }
        if (res === false) {
          this.#notificationsService
            .deleteNotification(notification.id)
            .subscribe(() =>
              this.#notificationsService.loadNextData(true, [
                ['completed', '==', this.completedControl.getRawValue()]
              ])
            );
        }
      });
  }
}
