import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routerLinks } from '../../../../core';
import { LanguageSelectComponent } from '../../../../shared';

@Component({
  selector: 'app-products-header',
  standalone: true,
  imports: [RouterModule, LanguageSelectComponent],
  templateUrl: './products-header.component.html',
  styleUrl: './products-header.component.scss'
})
export class ProductsHeaderComponent {
  protected readonly routerLinks = routerLinks;
}
