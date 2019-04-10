import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as electron from 'electron';
import { logger } from 'logger';

import { Theme, defaultTheme } from 'model/themes';

@Injectable({providedIn: 'root'})
export class StyleService {
  public constructor(
    ngZone: NgZone
  ) {
    electron.ipcRenderer.on('set-theme', (e, theme) => ngZone.run(() => this.setTheme(theme)));
  }

  public getColours() {

  }

  public listThemes(): Theme[] {
    return Object.keys(Theme).map(k => Theme[k]);
  }
  public setTheme(theme: Theme) {
    logger.info("Setting theme to " + JSON.stringify(theme));

    this.themeSubject.next(theme);
  }
  public getTheme() {
    return this.themeSubject.getValue();
  }
  public observeTheme() {
    return this.themeSubject.asObservable();
  }

  private themeSubject = new BehaviorSubject(defaultTheme);
}
