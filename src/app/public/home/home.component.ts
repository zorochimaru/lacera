import {
  NgComponentOutlet,
  NgFor,
  TitleCasePipe,
  UpperCasePipe
} from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { routerAnchorLinks } from '@core';
import { TranslocoModule } from '@jsverse/transloco';
import { HeaderComponent } from '@shared';

import { AboutUsSectionComponent } from './about-us-section/about-us-section.component';
import { CustomSetsSectionComponent } from './custom-sets-section/custom-sets-section.component';
import { NewsSectionComponent } from './news-section/news-section.component';
import { ProductsSectionComponent } from './products-section/products-section.component';
import { WelcomeSectionComponent } from './welcome-section/welcome-section.component';
import { WorkshopsSectionComponent } from './workshops-section/workshops-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgFor,
    TranslocoModule,
    TitleCasePipe,
    UpperCasePipe,
    NgComponentOutlet,
    WelcomeSectionComponent,
    AboutUsSectionComponent,
    ProductsSectionComponent,
    NewsSectionComponent,
    WorkshopsSectionComponent,
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  protected homeSections = [
    {
      anchorLink: routerAnchorLinks.home.home,
      component: WelcomeSectionComponent
    },
    {
      anchorLink: routerAnchorLinks.home.aboutUs,
      component: AboutUsSectionComponent
    },
    // TODO: add later
    // {
    //   anchorLink: routerAnchorLinks.home.products,
    //   component: ProductsSectionComponent
    // },
    {
      anchorLink: routerAnchorLinks.home.customSets,
      component: CustomSetsSectionComponent
    },
    {
      anchorLink: routerAnchorLinks.home.workshops,
      component: WorkshopsSectionComponent
    }
    // {
    //   anchorLink: routerAnchorLinks.home.news,
    //   component: NewsSectionComponent
    // }
  ];
}
