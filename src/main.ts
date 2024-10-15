import { bootstrapApplication } from '@angular/platform-browser';
import { register as registerSwiperElements } from 'swiper/element/bundle';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Register Swiper custom elements. We do this
// before bootstrapping the Angular application
// so that they're available before any part of
// our application tries rendering them.
registerSwiperElements();

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
