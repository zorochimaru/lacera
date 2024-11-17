import { Dialog } from '@angular/cdk/dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { Component, DestroyRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { NotificationsService } from './notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CdkTableModule, ReactiveFormsModule],
  providers: [NotificationsService],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  readonly #notificationsService = inject(NotificationsService);
  readonly #dialog = inject(Dialog);
  readonly #dr = inject(DestroyRef);

  protected readonly notifications = toSignal(
    this.#notificationsService.sourceData$
  );

  protected completedControl = new FormControl(false);
  protected openNotificationDetails(notification: any): void {}
}
