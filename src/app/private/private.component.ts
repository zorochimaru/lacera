import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { routerLinks } from '@core';

@Component({
  selector: 'app-private',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './private.component.html',
  styleUrl: './private.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateComponent {
  protected routerLinks = routerLinks;
}
