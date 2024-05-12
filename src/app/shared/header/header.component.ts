import { JsonPipe, NgFor, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { LangCodes, routerAnchorLinks, routerLinks } from '../../core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    TranslocoModule,
    RouterModule,
    FormsModule,
    NgFor,
    NgStyle,
    JsonPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  #translocoService = inject(TranslocoService);

  protected langCodes = Object.values(LangCodes);
  protected routerLinks = routerLinks;
  protected routerAnchorLinks = routerAnchorLinks;
  protected selectedLang = '';
  // @HostBinding('class.not-top') notTop = false;

  // ⤵️ Access through ViewChild like this
  // @ViewChild('nav') header!: ElementRef;

  // @HostListener('document:scroll', ['$event'])
  // public onViewportScroll() {
  //   // ⤵️ Captures / defines current window height when called
  //   const windowHeight = window.innerHeight;
  //   // ⤵️ Captures bounding rectangle of 5th element

  //   const boundingHeader = this.header.nativeElement.getBoundingClientRect();

  //   // ⤵️ IF the top of the element is greater or = to 0 (it's not ABOVE the viewport)
  //   // AND IF the bottom of the element is less than or = to viewport height
  //   // show the corresponding icon after half a second
  //   // else hide all icons
  //   if (boundingHeader.top >= 0 && boundingHeader.bottom <= windowHeight) {
  //     setTimeout(() => {
  //       this.notTop = false;
  //     }, 500);
  //   } else {
  //     this.notTop = true;
  //   }
  // }
  public ngOnInit(): void {
    this.selectedLang = this.#translocoService.getActiveLang();
  }

  protected changeLanguage(lang: string): void {
    this.#translocoService.setActiveLang(lang);
    localStorage.setItem('selectedLang', lang);
  }
}
