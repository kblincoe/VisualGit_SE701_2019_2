import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from 'rxjs';

import { Theme } from 'model/themes';
import { StyleService } from 'services/style';

@Component({
  selector: "app-main",
  template: `
  <div [ngClass]="['app-container', theme]">
    <app-header></app-header>
    <div class="outer">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  </div>
  `,
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {
  public constructor(
    private styleService: StyleService
  ) {}

  public ngOnInit() {
    this.subscription = this.styleService.observeTheme().subscribe(this.setColourStyle.bind(this));
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  theme = "dark-theme";

  private setColourStyle(theme: Theme) {
    this.theme = theme + "-theme";
  }
  private subscription: Subscription;
}
