import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-custom-sets-section',
  standalone: true,
  imports: [TranslocoModule, TitleCasePipe],
  templateUrl: './custom-sets-section.component.html',
  styleUrl: './custom-sets-section.component.scss'
})
export class CustomSetsSectionComponent {}
