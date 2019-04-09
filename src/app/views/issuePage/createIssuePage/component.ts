import { Component, OnInit } from "node_modules/@angular/core";

import { FormControl } from "node_modules/@angular/forms";
import { Router } from "node_modules/@angular/router";
import { IssueService } from "services/issues";

@Component({
  selector: "app-new-issue-sreen",
  templateUrl: '../src/app/views/issuePage/createIssuePage/component.html',
  styleUrls: ['../src/app/views/issuePage/createIssuePage/component.scss']
})

export class NewIssueComponent implements OnInit{
  constructor(private issueService: IssueService, private router: Router) {

  }
  ngOnInit(): void {
  }

  async onBackBtnClicked() {
    this.router.navigate(['issues']);
  }

  async save() {
    await this.issueService.createIssue(this.titleMessage.value, this.bodyMessage.value);
    this.clearMessages();
    await this.onBackBtnClicked();
  }

  discard() {
    this.clearMessages();
  }


  private clearMessages() {
    this.titleMessage.setValue("");
    this.bodyMessage.setValue("");
  }
  titleMessage = new FormControl(null);
  bodyMessage = new FormControl(null);

}
