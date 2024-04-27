import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-contant-us-section',
  standalone: true,
  imports: [TranslocoModule, TitleCasePipe],
  templateUrl: './contact-us-section.component.html',
  styleUrl: './contact-us-section.component.scss'
})
export class ContactUsSectionComponent {}
