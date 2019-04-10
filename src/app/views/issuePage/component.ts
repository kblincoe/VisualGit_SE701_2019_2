import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { logger } from "logger";
import { IssuesListForRepoResponseItem } from "@octokit/rest";

import { IssueService } from "services/issues";

@Component({
  selector: "app-issue-sreen",
  templateUrl: 'component.html',
  styleUrls: ['component.scss']
})

export class IFrameComponent implements OnInit, OnDestroy{


  constructor(private issueService: IssueService, private router: Router, private ngZone: NgZone) {
    this.subscription = this.issueService.issues.subscribe(this.OnChange.bind(this));
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
