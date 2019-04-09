import { Component, OnInit } from "node_modules/@angular/core";

import { Router } from "node_modules/@angular/router";
import { FormControl, Validators } from "node_modules/@angular/forms";
import { IssueService } from "services/issues";


@Component({
  selector: "app-new-issue-sreen",
  templateUrl: '../src/app/views/issuePage/commentIssuePanel/component.html',
  styleUrls: ['../src/app/views/issuePage/commentIssuePanel/component.scss']
})

export class CommentIssueComponent implements OnInit{
  constructor(private issueService: IssueService, private router: Router) {
    this.issueTitle = issueService.selectedIssue.title;
  }
  ngOnInit(): void {
  }
  async onBackBtnClicked() {
    this.router.navigate(['issues']);
  }

  comment() {
    this.issueService.sendCommentMessage(this.commentMessage.value);
    this.commentMessage.setValue("");
  }

  async closeIssue() {
   await this.issueService.closeIssue();
   this.router.navigate(['issues']);
  }

  issueTitle: string;
  commentMessage = new FormControl(null, Validators.required);
}
