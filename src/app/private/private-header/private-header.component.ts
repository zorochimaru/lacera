import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, routerLinks } from '@core';

@Component({
  selector: 'app-private-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './private-header.component.html',
  styleUrl: './private-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateHeaderComponent {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  protected routerLinks = routerLinks;

  protected logOut(): void {
    this.#authService.signOut().subscribe(() => {
      this.#router.navigate(['/']);
    });
  }
}
