import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import {
  IfFeatureFlagDirective,
  RemoteConfigParams,
  routerAnchorLinks,
  routerLinks
} from '../../core';
import { LanguageSelectComponent } from '../language-select';

// TODO: Make navbar links dynamically
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    TranslocoModule,
    LanguageSelectComponent,
    IfFeatureFlagDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.scrolled]': 'scrolled',
    '(document:scroll)': 'onWindowScroll($event)'
  }
})
export class HeaderComponent {
  #elRef = inject(ElementRef);

  protected remoteConfigParams = RemoteConfigParams;
  protected routerLinks = routerLinks;
  protected routerAnchorLinks = routerAnchorLinks;
  protected scrolled = false;

  protected onWindowScroll() {
    const boundingHeader = this.#elRef.nativeElement.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    this.scrolled = scrollTop > boundingHeader.top;
  }
}
