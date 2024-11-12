import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { ProductsHeaderComponent } from '../shared';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [TranslocoDirective, ProductsHeaderComponent]
})
export class PrivacyPolicyComponent {}
