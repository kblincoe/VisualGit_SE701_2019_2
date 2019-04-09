import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RepositoryService } from 'services/repository';
import { Subscription } from 'rxjs';
import { logger } from 'logger';
import * as nodegit from 'nodegit';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Repository } from 'model/repository';
import Commit from 'model/repository/commit';
import { ErrorService } from 'services/error.service';

@Component({
  selector: 'app-header-branch',
  templateUrl: './branch.component.html',
  styleUrls: ["./branch.component.scss"],
})
export class BranchComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private repositoryService: RepositoryService,
    private errorService: ErrorService) {

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
    var text = event.target.value;
    this.searchableBranches = this.branches.filter(item => -1 < item.toLowerCase().indexOf(text.toLowerCase()))
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
    }
  }

  /**
   * Handles branch repo updates
   * @param branches
   */
  setBranches(branches: nodegit.Reference[]) {
    this.branches = branches.map(branch => branch.shorthand())
    this.searchableBranches = this.branches;
  }

  /**
   * Select a branch.
   * Same rules as normal for branch selection
   */
  async selectBranch(branch: string) {
    try {
      await this.repositoryService.current().checkout(branch);
      this.modalService.dismissAll();
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
      if (this.branchCreationName.value !== null || this.branchCreationName.value != "") {
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


  @ViewChild('content') content: ElementRef;

  private subscription = new Subscription();
  private repoSubscription = new Subscription();

  branches: string[] = [];
  searchableBranches: string[] = [];

  branchCreationName = new FormControl('');
  currentRepo: string;
  currentBranch: string;
}
