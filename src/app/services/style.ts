import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as electron from 'electron';
import { logger } from 'logger';

import { Theme, defaultTheme } from 'model/themes';
import { promises as fs  } from 'fs';

import { promises as fs } from 'fs';
import { Open_Preferences } from 'src/open_preferences';

@Injectable({providedIn: 'root'})
export class StyleService {
  public constructor(
    ngZone: NgZone
  ) {
    electron.ipcRenderer.on('set-theme', (e, theme) => ngZone.run(() => this.setTheme(theme)));
	
	
	
    // This will throw if the file doesn't exist, but that doesnt matter too much as it then wont affect our themes.
    this.openPreferences().then(theme =>
      this.themeSubject.next(theme)
    ).catch(error => {
      logger.debug("No theme file found, defaulting to original theme");
      this.themeSubject.next(defaultTheme);
    });
  }

  public listThemes(): Theme[] {
    return Object.keys(Theme).map(k => Theme[k]);
  }

  public setTheme(theme: Theme) {
    logger.info("Setting theme to " + JSON.stringify(theme));

    this.themeSubject.next(theme);

    // Note: This operation is asynchronous and will not be completed before setTheme returns.
    this.savePreferences(theme);
  }

  public getTheme() {
    return this.themeSubject.getValue();
  }

  public observeTheme() {
    return this.themeSubject.asObservable();
  }

  // Saves the given theme to the theme-setting file
  private async savePreferences(theme: Theme) {
    const file = {color: theme};
    await fs.writeFile(".\\.app\\theme_preference.json", JSON.stringify(file),  {encoding: 'utf-8'});
  }

  // Loads a theme from the theme-setting file
  private async openPreferences(): Promise<Theme> {
    const file = JSON.parse(await fs.readFile(".\\.app\\theme_preference.json", "utf8"));
    return file.color;
  }

  public listTemplates(): string[] {
    const templateFolder = './gitignore_templates';
    const path = require("path");
    const templates = [];
    templates.push("None");

    fs.readdir(path.resolve(__dirname, templateFolder)).then(
      listing => listing.forEach(file => templates.push(file.split(".")[0]))
    );
    return templates;
  }

  private themeSubject = new BehaviorSubject(defaultTheme);
}
