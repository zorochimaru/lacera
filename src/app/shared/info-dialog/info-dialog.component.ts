import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { IconComponent } from '../icon';
import { InfoDialog } from './info-dialog.interface';

@Component({
  selector: 'app-info-dialog',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss'
})
export class InfoDialogComponent {
  protected data = inject<InfoDialog>(DIALOG_DATA);
}
