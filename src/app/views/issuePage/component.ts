import { Component, NgZone, OnDestroy, OnInit } from "node_modules/@angular/core";

import { logger } from "logger";
import { Router } from "node_modules/@angular/router";
import { Subscription } from "node_modules/rxjs";
import { IssuesListForRepoResponseItem } from "node_modules/@octokit/rest";
import { FormControl } from "node_modules/@angular/forms";
import { IssueService } from "services/issues";



@Component({
  selector: "app-issue-sreen",
  templateUrl: '../src/app/views/issuePage/component.html',
  styleUrls: ['../src/app/views/issuePage/component.scss']
})

export class IFrameComponent implements OnInit, OnDestroy{


  constructor(private issueService: IssueService, private router: Router, private ngZone: NgZone) {
    this.subscription = this.issueService.issues.subscribe(this.OnChange.bind(this));
  }
  ngOnDestroy(): void {
  }

  ngOnInit(): void {

  }

  OnChange(issueArray: IssuesListForRepoResponseItem[]) {
    this.issueArray = issueArray;
    logger.info("number of issues: " + this.issueArray.length);
  }

  onBackBtnClicked() {
    this.ngZone.run(() => this.router.navigate(['repo']));
  }

  onNewIssueBtnClicked() {
    this.router.navigate(['newIssue']);
  }

  OnRowClicked(issue: IssuesListForRepoResponseItem) {
    this.issueService.selectedIssue = issue;
    this.router.navigate(['commentIssue']);
  }

  getIssueTime(issue: IssuesListForRepoResponseItem) {
    const fullTime = issue.created_at;
    return fullTime.substring(11, 19);
  }

  private subscription: Subscription;
  issueArray: IssuesListForRepoResponseItem[];
  selected = new FormControl(null);
}
