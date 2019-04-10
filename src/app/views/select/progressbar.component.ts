import { Component, NgZone, OnInit } from "@angular/core";

@Component({
  selector: "app-select-screen-progressbar",
  templateUrl: "progressbar.component.html",
  styleUrls: ["progressbar.component.scss"]
})


export class ProgressbarComponent implements OnInit{

  public value = 0;
  public isHidden: boolean;

  public constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.isHidden = true;
  }

  public setValue(value) {
    // Stop progress bar when the value is larger than 90 to prevent it stops at 100% for a long time.
    if(value >= 90) {
      return;
    }
    this.zone.run(() => {
      this.value = value;
    });
  }
  // set the progress to 100 when it is fiished
  public setProgressbarFinish() {
    this.value = 100;
  }

  public displayPanel() {
    this.isHidden = false;
  }

  public hidePanel() {
    this.isHidden = true;
    this.value = 0;       // reset progress bar value when the panel is hidden
  }


}
