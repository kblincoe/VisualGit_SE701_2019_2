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
  selector: 'app-header-stash',
  templateUrl: './stash.component.html',
  styleUrls: ["./stash.component.scss"],
})
/**
 * StashComponent is used for showing the stashing modal
 * and stashing and reapplying stashes. It shows all the
 * user's stashes in a list, and the changed files in each.
 * Clicking on a stash in the list applies the stash to
 * the user's current branch.
 * Stashes can be saved with a name, and searched for by name.
 */
export class StashComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private modalService: NgbModal,
    private repositoryService: RepositoryService,
    private errorService: ErrorService) {
  }

  /**
   * Opens the stash modal component.
   */
  open() {
    this.modalService.open(this.content);
    this.searchableStashes = this.stashes;
  }

  /**
   * On init, listen for repository and branch changes.
   */
  public ngOnInit() {
    this.subscription.add(
      this.repositoryService.repository.subscribe(this.onRepoChange.bind(this))
    );
  }

  /**
   * Filters the stashes by the search term.
   * @param event The stash search event.
   */
  onKeyUp(event: any) {
    const text = event.target.value.toLowerCase();
    this.searchableStashes = this.stashes.filter(stash => stash.toLowerCase().includes(text));
  }

  /**
   * Ensure repositories are kept listened to when the repository changes.
   */
  onRepoChange(repo: Repository) {
    this.repoSubscription.unsubscribe();
    // Recreate the subscription object.
    this.repoSubscription = new Subscription();

    if(repo) {
      this.currentRepo = repo.getName();

      this.repoSubscription.add(
        repo.head.name.subscribe(name => this.currentBranch = name )
      );
    }
  }

  /**
   * Applies a stash to the current branch.
   */
  async applyStash(stashIndex: number) {
    try {
      // Inform the repositoryService.
      await this.repositoryService.current().applyStash(stashIndex);

      this.modalService.dismissAll();
      
      // Remove from the stashes array.
      this.stashes.splice(stashIndex, 1);

      this.errorService.displayError(
        "Successfully applied stashed changes to "+ this.currentBranch,
        "Success");
    } catch(error) {
      logger.info("Applying the stash failed:");
      logger.info(error);
      // Popup a modal to show the error message.
      this.errorService.displayError(error);
    }
  }

  /**
   * Create a stash with a user-specified name.
   */
  async createStash() {
    const message = this.stashName.value;
    try {
      // Ensure the stash has a valid name.
      if (message !== null || message !== "") {
        // Inform the repositoryService.
        await this.repositoryService.current().createStash(message);
        this.stashes.unshift(message);
      }
      else {
        // Popup a modal to show the error message.
        this.errorService.displayError("Please enter a stash name");
      }

    } catch(error) {
      logger.info("Error trying to create stash: ");
      logger.info(error);

      // Popup a modal to show the error message.
      this.errorService.displayError(error);
    }
  }

  @ViewChild('content') content: ElementRef;

  private subscription = new Subscription();
  private repoSubscription = new Subscription();

  stashes: string[] = [];
  searchableStashes: string[] = [];

  stashName = new FormControl('');
  currentRepo: string;
  currentBranch: string;
}
