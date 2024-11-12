import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { IconComponent } from '../icon';

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {
  protected data = inject<{
    message: string;
    title: string;
    icon: string;
    type: string;
  }>(DIALOG_DATA);
}
