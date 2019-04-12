import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "node_modules/@ng-bootstrap/ng-bootstrap";
import { IssuesListLabelsOnIssueResponseItem } from "node_modules/@octokit/rest";
import { IssueService } from "services/issues";
import { Subscription } from "node_modules/rxjs";
import { Label } from "model/github";
import { logger } from "logger";

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
  open(assignedLabels: Label[]) {
    this.modalService.open(this.content);
  }

  onChange(assignedLabels: Label[]) {
    this.assignedLabels = assignedLabels;
    if(this.allLabels != null && this.assignedLabels != null) {
      this.getUnSlectedLabels();
    }
  }

  onSelectedChange(allLabels: Label[]) {
    this.allLabels = allLabels;
    if(this.allLabels != null && this.assignedLabels != null) {
      this.getUnSlectedLabels();
    }


  }

  private getUnSlectedLabels() {
    const newArray: Label[] = new Array();
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

  setAssignedLabels(assignedLabels: Label[]) {
    this.assignedLabels = assignedLabels;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.selectedLabelSubscription.unsubscribe();
  }

  async onRemoveBtnClicked(label: Label) {
    await this.issueService.removeLabel(label.name);
  }

  async onAddBtnClicked(label: Label) {
    await this.issueService.addLabel(label.name);
  }

  @ViewChild('content') content: ElementRef;
  assignedLabels: Label[];

  private subscription: Subscription;
  private selectedLabelSubscription: Subscription;
  allLabels: Label[];
  availableLabels: Label[];


}
