import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DropdownComponent } from "views/issuePage/labelPanel/dropdown.component";
import { IssueService } from "services/issues";
import { Subscription } from "node_modules/rxjs";
import { IssuesListLabelsOnIssueResponseItem } from "node_modules/@octokit/rest";
import { logger } from "logger";

@Component({
  selector: "app-issue-label",
  templateUrl: 'component.html',
  styleUrls: ['component.scss']
})

export class LabelComponent implements OnInit, OnDestroy{
  @ViewChild('dropdown') dropDown: DropdownComponent;

  constructor(private issueService: IssueService) {
    this.subscription = this.issueService.labels.subscribe(this.OnChange.bind(this));
  }

  onSettingBtnClicked() {
    this.dropDown.open(this.labelArray);
  }

  ngOnInit(): void {
  }

  OnChange(labelArray: IssuesListLabelsOnIssueResponseItem[]) {
    this.labelArray = labelArray;
    logger.info("number of Labels: " + labelArray.length);
  }

  private subscription: Subscription;
  private labelArray: IssuesListLabelsOnIssueResponseItem[];

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
