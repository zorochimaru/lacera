import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PrivateHeaderComponent } from './private-header/private-header.component';

@Component({
  selector: 'app-private',
  standalone: true,
  imports: [RouterOutlet, PrivateHeaderComponent],
  templateUrl: './private.component.html',
  styleUrl: './private.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateComponent {}
