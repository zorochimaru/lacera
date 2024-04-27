import { NgFor, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { LangCodes, routerAnchorLinks, routerLinks } from '../../core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslocoModule, RouterModule, FormsModule, NgFor, NgStyle],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  #translocoService = inject(TranslocoService);

  protected langCodes = Object.values(LangCodes);
  protected routerLinks = routerLinks;
  protected routerAnchorLinks = routerAnchorLinks;
  protected selectedLang = '';

  public ngOnInit(): void {
    this.selectedLang = this.#translocoService.getActiveLang();
  }

  protected changeLanguage(lang: string) {
    this.#translocoService.setActiveLang(lang);
  }
}
