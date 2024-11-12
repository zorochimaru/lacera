import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ProductsHeaderComponent } from '../shared';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterOutlet, ProductsHeaderComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {}
