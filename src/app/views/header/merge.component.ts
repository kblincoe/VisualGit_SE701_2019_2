import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RepositoryService } from 'services/repository';
import { Subscription } from 'rxjs';
import { logger } from 'logger';
import * as nodegit from 'nodegit';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Repository, BranchNotFoundError } from 'model/repository';
import Commit from 'model/repository/commit';
import { ErrorService } from 'services/error.service';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-header-merge',
  templateUrl: './merge.component.html',
  styleUrls: ["./merge.component.scss"],
})
export class MergeComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private repositoryService: RepositoryService,
    private errorService: ErrorService) {

  }

  /**
   * Opens the merge modal component
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
   * @param event Handles branch search event for table
   */
  onKeyUp(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchableBranches = this.branches.filter(item => item.toLowerCase().includes(text));
  }

  onRepoChange(repo: Repository) {
    this.repoSubscription.unsubscribe();
    // Adding stuff after a call to unsubscribe does weird things, so we have to recreate the subscription object.
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
   */
  setBranches(branches: nodegit.Reference[]) {
    this.branches = branches.map(branch => branch.shorthand());
    this.searchableBranches = this.branches;
  }

  /**
   * Merge a branch.
   * @param branch the branch you wish to merge into the current branch
   */
  async mergeBranch(branch: string | nodegit.Reference) {
    let from: nodegit.Reference;

    // Convert from string to nodegit.Reference
    // const branches = await this.repositoryService.current().git.repo.getReferences(nodegit.Reference.TYPE.LISTALL);
    const branches = await this.repositoryService.current().branches.pipe(take(1)).toPromise();
    if(typeof branch === "string") {
      const branchReference = branches.find(b => (b.name() === branch) || (b.shorthand() === branch));

      if(branchReference === null)
        throw new BranchNotFoundError("Can't find branch for merge: " + branch);

      from = branchReference;
    }

    // Perform the merge
    try {
      await this.repositoryService.current().head.merge(from);
      this.modalService.dismissAll();

    } catch(error) {
      // Show the error message via a modal
      logger.info("Merging branch failed:");
      logger.info(error);

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
