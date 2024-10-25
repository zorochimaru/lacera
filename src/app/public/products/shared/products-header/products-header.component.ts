import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routerLinks } from '../../../../core';

@Component({
  selector: 'app-products-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './products-header.component.html',
  styleUrl: './products-header.component.scss'
})
export class ProductsHeaderComponent {
  protected readonly routerLinks = routerLinks;
}
