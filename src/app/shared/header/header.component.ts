import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  inject
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { LangCodes, routerAnchorLinks, routerLinks } from '../../core';
import { LanguageSelectComponent } from '../language-select';

// TODO: Make navbar links dynamically
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, TranslocoModule, NgStyle, LanguageSelectComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  #elRef = inject(ElementRef);

  @HostBinding('class.scrolled') scrolled = false;

  @HostListener('document:scroll', ['$event'])
  onWindowScroll() {
    const boundingHeader = this.#elRef.nativeElement.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    this.scrolled = scrollTop > boundingHeader.top;
  }

  protected langCodes = Object.values(LangCodes);
  protected routerLinks = routerLinks;
  protected routerAnchorLinks = routerAnchorLinks;
}
