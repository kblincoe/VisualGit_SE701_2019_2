import { Component } from "@angular/core";

@Component({
  selector: "diff-panel",
  template: `
  <div class="diff-panel" id="diff-panel">
    <div class="diff-panel-body" id="diff-panel-body"></div>
    
    <div class="diff-panel-buttons" id="diff-panel-buttons">
      <button class="save-button" id="save-button" disabled>Save</button>
      <button class="cancel-button" id="cancel-button" disabled>Cancel</button>
    </div>
  </div>
  
  `
})

export class DiffPanelComponent {

}
