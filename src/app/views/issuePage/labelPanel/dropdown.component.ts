import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "node_modules/@ng-bootstrap/ng-bootstrap";
import { IssuesListLabelsOnIssueResponseItem } from "node_modules/@octokit/rest";
import { IssueService } from "services/issues";
import { Subscription } from "node_modules/rxjs";

@Component({
  selector: 'app-issue-dropdown',
  templateUrl: 'dropdown.component.html',
  styleUrls: ["dropdown.component.scss"],
})

export class DropdownComponent implements OnInit, OnDestroy{
  ngOnInit(): void {
  }
  constructor(private modalService: NgbModal, private issueService: IssueService) {
    this.subscription = this.issueService.labels.subscribe(this.onChange.bind(this));
    this.selectedLabelSubscription = this.issueService.allLabels.subscribe(this.onSelectedChange.bind(this));
  }
  open(assignedLabels: IssuesListLabelsOnIssueResponseItem[]) {
    this.modalService.open(this.content);
  }

  onChange(assignedLabels: IssuesListLabelsOnIssueResponseItem[]) {
    this.assignedLabels = assignedLabels;
  }

  onSelectedChange(allLabels: IssuesListLabelsOnIssueResponseItem[]) {
    this.allLabels = allLabels;
    if(this.allLabels != null && this.assignedLabels != null) {
      this.getUnSlectedLabels();
    }


  }

  private getUnSlectedLabels() {
    const newArray: IssuesListLabelsOnIssueResponseItem[] = new Array();
    for(const allLabel of this.allLabels) {
      let exist = false;
      for(const assignLabel of this.assignedLabels) {
        if(allLabel.name === assignLabel.name) {
          exist = true;
        }
      }
      if(!exist)
        newArray.push(allLabel);
    }
    this.availableLabels = newArray;
  }

  setAssignedLabels(assignedLabels: IssuesListLabelsOnIssueResponseItem[]) {
    this.assignedLabels = assignedLabels;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.selectedLabelSubscription.unsubscribe();
  }

  onRemoveBtnClicked(label: IssuesListLabelsOnIssueResponseItem) {
    this.issueService.removeLabel(label.name);
    this.issueService.refresh();
  }

  onAddBtnClicked(label: IssuesListLabelsOnIssueResponseItem) {
    this.issueService.addLabel(label.name);
    this.issueService.refresh();
  }

  @ViewChild('content') content: ElementRef;
  assignedLabels: IssuesListLabelsOnIssueResponseItem[];

  private subscription: Subscription;
  private selectedLabelSubscription: Subscription;
  allLabels: IssuesListLabelsOnIssueResponseItem[];
  availableLabels: IssuesListLabelsOnIssueResponseItem[];


}
