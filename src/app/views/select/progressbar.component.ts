import { Component, NgZone, OnInit } from "node_modules/@angular/core";
import construct = Reflect.construct;
import { RepositoryListService } from "services/repository.list";

@Component({
  selector: "app-select-screen-progressbar",
  templateUrl: "../src/app/views/select/progressbar.component.html",
  styleUrls: ["../src/app/views/select/progressbar.component.scss"]
})


export class ProgressbarComponent implements OnInit{

  private value = 0;
  private isHidden: boolean;
  public constructor(private zone: NgZone) {

  }
  ngOnInit(): void {
    this.isHidden = true;
  }

  public setValue(value) {
    if(value >= 90) {
      return;
    }
    this.zone.run(() => {
      this.value = value;
    });
  }

  public setProgressbarFinish() {
    this.value = 100;
  }

  public displayPanel() {
    this.isHidden = false;
  }

  public hidePanel() {
    this.isHidden = true;
    this.value = 0;
  }


}
