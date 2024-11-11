import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, routerLinks, TypedForm } from '@core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [AuthService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #router = inject(Router);
  readonly #authService = inject(AuthService);

  public ngOnInit(): void {
    this.#authService.isAuthenticated$.subscribe(res => {
      if (res) {
        this.#gotToAdminPanel();
      }
    });
  }

  protected loginForm: TypedForm<{ email: string; password: string }> =
    this.#fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

  protected onLogin(): void {
    const { email, password } = this.loginForm.getRawValue();
    this.#authService.signIn(email, password).subscribe(() => {
      this.#gotToAdminPanel();
    });
  }

  #gotToAdminPanel(): void {
    this.#router.navigate([routerLinks.private, routerLinks.orders]);
  }
}
