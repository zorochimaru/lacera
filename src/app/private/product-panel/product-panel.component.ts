import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-product-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-panel.component.html',
  styleUrl: './product-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPanelComponent {}
