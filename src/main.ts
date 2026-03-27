import { registerLocaleData } from '@angular/common';
import localeArEg from '@angular/common/locales/ar-EG';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

registerLocaleData(localeArEg);

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
