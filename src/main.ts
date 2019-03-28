import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as logger from './app/logger';

if (environment.production) {
  enableProdMode();
}

logger.setup();
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
