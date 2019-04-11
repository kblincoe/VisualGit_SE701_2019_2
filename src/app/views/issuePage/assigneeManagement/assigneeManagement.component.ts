import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { IssuesListAssigneesResponseItem } from '@octokit/rest';
import { Subscription } from 'rxjs';
import { IssueService } from "services/issues";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: "app-issue-assignee-management",
  templateUrl: 'assigneeManagement.component.html',
  styleUrls: ['assigneeManagement.component.scss']
})

export class AssigneeManagementComponent implements OnInit, OnDestroy {

  @ViewChild('content') content: ElementRef;

  allAssignees: IssuesListAssigneesResponseItem[] = new Array();
  currentAssignees: IssuesListAssigneesResponseItem[] = new Array();
  availableAssignees: IssuesListAssigneesResponseItem[] = new Array();

  private allAssigneesSubscription: Subscription;
  private currentAssigneesSubscription: Subscription;

  constructor(private modalService: NgbModal, private issueService: IssueService, private router: Router) {
    this.allAssigneesSubscription = this.issueService.allAssignees.subscribe(this.OnChange.bind(this));
    this.currentAssigneesSubscription = this.issueService.currentAssignees.subscribe(this.OnCurrentAssigneesChange.bind(this));
  }

 /**
  * Opens manage assignee pop up
  */
  open() {
    this.modalService.open(this.content);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.allAssigneesSubscription.unsubscribe();
    this.currentAssigneesSubscription.unsubscribe();
  }

  OnChange(assigneeArray: IssuesListAssigneesResponseItem[]) {
    this.allAssignees = assigneeArray;
    this.computeAvailableAssignees();
  }

  OnCurrentAssigneesChange(assigneeArray: IssuesListAssigneesResponseItem[]) {
    this.currentAssignees = assigneeArray;
    this.computeAvailableAssignees();
  }

  async removeAssignee(assignee: string) {
    const assignees: string[] = new Array();
    assignees.push(assignee);
    await this.issueService.removeAssigneesFromIssue(assignees);
    this.issueService.refresh();
  }

  async addAssignee(assignee: string) {
    const assignees: string[] = new Array();
    assignees.push(assignee);
    await this.issueService.addAssigneesToIssue(assignees);
    this.issueService.refresh();
  }

  /**
   * Compute a new list of available assignees whenever all assigness list or current assignee list is updated
   */
  private computeAvailableAssignees() {
    this.availableAssignees = new Array();
    for (const assignee of this.allAssignees) {
      let hasAssigned = false;

      if (this.currentAssignees != null) {
        for (const currentAssignee of this.currentAssignees) {
          if (assignee.id === currentAssignee.id) {
            hasAssigned = true;
          }
        }
      }
      if (!hasAssigned) {
        this.availableAssignees.push(assignee);
      }
    }
  }

}

