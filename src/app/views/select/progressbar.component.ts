import { Component, OnInit } from "node_modules/@angular/core";
import construct = Reflect.construct;

@Component({
  selector: "app-select-screen-progressbar",
  templateUrl: "../src/app/views/select/progressbar.component.html",
  styleUrls: ["../src/app/views/select/progressbar.component.scss"]
})


export class ProgressbarComponent implements OnInit{

  value = 0;
  isHidden: boolean;
  public constructor() {

  }
  ngOnInit(): void {
    this.isHidden = true;
  }
  public setValue(value) {
    this.value = value;
  }
  public displayPanel() {
    this.isHidden = false;
  }

  public hidePanel() {
    this.isHidden = true;
  }


}
