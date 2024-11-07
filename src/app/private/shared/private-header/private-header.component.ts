import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, LangCodes, routerLinks } from '@core';
import { TranslocoService } from '@jsverse/transloco';

import { LanguageSelectComponent } from '../../../shared';

@Component({
  selector: 'app-private-header',
  standalone: true,
  imports: [RouterLink, NgFor, RouterLinkActive, LanguageSelectComponent],
  templateUrl: './private-header.component.html',
  styleUrl: './private-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateHeaderComponent implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #translocoService = inject(TranslocoService);

  protected routerLinks = routerLinks;
  protected langCodes = Object.values(LangCodes);
  protected selectedLang = '';

  public ngOnInit(): void {
    this.selectedLang = this.#translocoService.getActiveLang();
  }

  protected changeLanguage(lang: string): void {
    this.#translocoService.setActiveLang(lang);
    localStorage.setItem('selectedLang', lang);
  }

  protected logOut(): void {
    this.#authService.signOut().subscribe(() => {
      this.#router.navigate(['/']);
    });
  }
}
