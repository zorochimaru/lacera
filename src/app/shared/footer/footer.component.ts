import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { routerAnchorLinks } from '../../core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslocoModule, TitleCasePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  protected footerId = routerAnchorLinks.shared.footer;
}
