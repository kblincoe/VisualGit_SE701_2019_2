import { Component, Input, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { IssuesListAssigneesResponseItem , IssuesListForRepoResponseItemAssigneesItem } from '@octokit/rest';
import { Subscription } from 'rxjs';
import { IssueService } from "services/issues";
import { AssigneeManagementComponent } from '../assigneeManagement/assigneeManagement.component';

@Component({
  selector: "app-issue-assignee-panel",
  templateUrl: 'assignee.component.html',
  styleUrls: ['assignee.component.scss']
})

export class AssigneeIssueComponent implements OnInit, OnDestroy {

   @ViewChild('assigneeManagement') assigneeManagement: AssigneeManagementComponent;

    allAssignees: IssuesListAssigneesResponseItem[] = new Array();
    currentAssignees: Array<IssuesListForRepoResponseItemAssigneesItem> = new Array();

    private subscription: Subscription;
    private currentAssigneesSubscription: Subscription;

    constructor(private issueService: IssueService, private router: Router) {
      this.subscription = this.issueService.allAssignees.subscribe(this.OnChange.bind(this));
      this.currentAssigneesSubscription = this.issueService.currentAssignees.subscribe(this.OnCurrentAssigneesChange.bind(this));
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
      this.subscription.unsubscribe();
      this.currentAssigneesSubscription.unsubscribe();
    }

    OnChange(assigneeArray: IssuesListAssigneesResponseItem[]) {
      this.allAssignees = assigneeArray;
    }

    OnCurrentAssigneesChange(assigneeArray: IssuesListAssigneesResponseItem[]) {
      this.currentAssignees = assigneeArray;
    }

    /**
     * Opens a pop up to add/remove assignees
     */
    manageAssignees() {
      this.assigneeManagement.open();
    }
}

