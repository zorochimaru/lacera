import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [TranslocoModule, TitleCasePipe, UpperCasePipe],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSectionComponent {}
