import { Component, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import * as nodegit from 'nodegit';
import { logger } from 'logger';

import { Repository } from 'model/repository';
import { ErrorService } from 'services/error.service';
import { RepositoryService } from 'services/repository';

@Component({
  selector: 'app-header-branch',
  templateUrl: './branch.component.html',
  styleUrls: ["./branch.component.scss"],
})
export class BranchComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private modalService: NgbModal,
    private repositoryService: RepositoryService,
    private errorService: ErrorService,
    private router: Router) {

  }

  /**
   * Opens the branch modal component
   */
  open() {
    this.modalService.open(this.content);
    this.searchableBranches = this.branches;
  }

  public ngOnInit() {
    this.subscription.add(
      this.repositoryService.repository.subscribe(this.onRepoChange.bind(this))
    );
  }

  /**
   *
   * @param event Handles branch search event for table
   */
  onKeyUp(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchableBranches = this.branches.filter(item => item.toLowerCase().includes(text));
  }

  onRepoChange(repo: Repository) {
    this.repoSubscription.unsubscribe();
    // Took me an hour to find out that adding stuff after a call to unsubscribe does weird things,
    // so we have to recreate the subscription object.
    this.repoSubscription = new Subscription();

    if(repo) {
      this.currentRepo = repo.getName();

      this.repoSubscription.add(
        repo.head.name.subscribe(name => this.currentBranch = name )
      );
      this.repoSubscription.add(
        repo.branches.subscribe(branches =>
          this.setBranches(branches)
        )
      );
    }
    else {
      this.currentRepo = null;
      this.branches = [];
      this.searchableBranches = [];
      this.deletionAllowed = false;
    }
  }

  /**
   * Handles branch repo updates
   */
  setBranches(branches: nodegit.Reference[]) {
    this.branches = branches.map(branch => branch.shorthand());
    this.searchableBranches = this.branches;
    this.deletionAllowed = this.branches.length > 1 && this.currentBranch !== "master";
  }

  /**
   * Select a branch.
   * Same rules as normal for branch selection
   */
  async selectBranch(branch: string) {
    try {
      await this.repositoryService.current().checkout(branch);
      this.modalService.dismissAll();

      this.ngZone.run(() => this.router.navigate(['/repo']));
    } catch(error) {
      logger.info("Selecting branch failed:");
      logger.info(error);

      // popup a modal to show the error message
      this.errorService.displayError(error);
    }
  }

  /**
   * Taking a branch name from the form control,
   * prompts? whether the user wants to create that branch, does so,
   * then moves to that branch.
   */
  async createBranch() {
    try {
      if (this.branchCreationName.value !== null || this.branchCreationName.value !== "") {
        await this.repositoryService.current().createBranch(this.branchCreationName.value);
        await this.selectBranch(this.branchCreationName.value);
        this.modalService.dismissAll();
      }
      else {
        // popup a modal to show the error message
        this.errorService.displayError("Please enter a branch name");
      }

    } catch(error) {
      logger.info("Error trying to create branch: ");
      logger.info(error);

      // popup a modal to show the error message
      this.errorService.displayError(error);
    }
  }

  /**
   * Delete a branch.
   * (TODO) Pop up a modal to confirm with the user they wish to do this.
   */
  async deleteBranch() {
    try {
      // Only delete if there are other branches.
      if (this.deletionAllowed) {
        // TODO (Blocked by issue 241) Pop up a modal here to confirm deletion.
        await this.repositoryService.current().deleteBranch(this.currentBranch);

        if (this.branches && this.branches.length > 0) {
          // Update the list of searchable branches.
          const indexOfDeletedItem = this.branches.indexOf(this.currentBranch);
          if (indexOfDeletedItem !== -1) {
            this.branches.splice(indexOfDeletedItem, 1);
          }
          // Switch to the master branch, or whatever's highest in priority.
          // This will also trigger onRepoChange, which will update the searchableBranches too.
          await this.selectBranch(this.branches[0]);
        }

        this.modalService.dismissAll();
        this.repositoryService.current().refresh();
      }
      else {
        // Popup a modal to show the error message.
        this.errorService.displayError("Attempting to delete a master branch or the only branch.");
      }

    } catch(error) {
      logger.info("Error trying to delete branch: ");
      logger.info(error);

      // Popup a modal to show the error message.
      this.errorService.displayError(error);
    }
  }

  @ViewChild('content') content: ElementRef;

  private subscription = new Subscription();
  private repoSubscription = new Subscription();

  branches: string[] = [];
  searchableBranches: string[] = [];

  branchCreationName = new FormControl('');
  currentRepo: string;
  currentBranch: string;

  deletionAllowed = true;
}
