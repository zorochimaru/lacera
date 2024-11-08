import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FeatureFlags,
  IfFeatureFlagDirective,
  RemoteConfigParams,
  routerAnchorLinks
} from '@core';
import { HeaderComponent } from '@shared';

import { AboutUsSectionComponent } from './about-us-section/about-us-section.component';
import { CustomSetsSectionComponent } from './custom-sets-section/custom-sets-section.component';
import { NewsSectionComponent } from './news-section/news-section.component';
import { ProductsSectionComponent } from './products-section/products-section.component';
import { WelcomeSectionComponent } from './welcome-section/welcome-section.component';
import { WorkshopsSectionComponent } from './workshops-section/workshops-section.component';

interface HomeSection {
  anchorLink: string;
  component: any;
  remoteConfig?: FeatureFlags;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IfFeatureFlagDirective,

    AboutUsSectionComponent,
    CustomSetsSectionComponent,
    HeaderComponent,
    NewsSectionComponent,
    ProductsSectionComponent,
    WelcomeSectionComponent,
    WorkshopsSectionComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  protected routerAnchorLinks = routerAnchorLinks;
  protected remoteConfigParams = RemoteConfigParams;
}
