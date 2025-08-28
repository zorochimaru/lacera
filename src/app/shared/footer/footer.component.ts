import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routerAnchorLinks, routerLinks } from '@core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-footer',
    imports: [TranslocoModule, TitleCasePipe, RouterModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  protected routerLinks = routerLinks;
  protected routerAnchorLinks = routerAnchorLinks;
}
