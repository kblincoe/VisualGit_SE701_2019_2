import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { pairwise, debounce, debounceTime } from 'rxjs/operators';

import * as nodegit from 'nodegit';
import { logger } from 'logger';

import WorkingDirectory from 'model/repository/working-directory';
import { ErrorService } from 'services/error.service';

enum PatchType {
  Removed = "removed",
  Added = "added",
  Renamed = "renamed",
  Modified = "modified"
}

function changesEqual(a: nodegit.ConvenientPatch, b: nodegit.ConvenientPatch) {
  return a.newFile().path() === b.newFile().path();
}

@Component({
  selector: "app-file-panel",
  templateUrl: "file.component.html",
  styleUrls: ["file.component.scss"]
})
export class FilePanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() workingDirectory: WorkingDirectory;
  @Output() displayFile = new EventEmitter<{patch: nodegit.ConvenientPatch, prePatch?: nodegit.ConvenientPatch}>();

  constructor(private errorService: ErrorService) {}

  public clear() {}

  public ngOnInit() {
    this.staged = [];
    this.unstaged = [];
    this.subscription = this.selected.valueChanges.subscribe((patch: nodegit.ConvenientPatch) => {
      let prePatch;
      // If this is a staged change, we should check for an unstaged change to unapply first.
      if(this.staged.includes(patch) && !patch.isDeleted())
        prePatch = this.unstaged.find(other => other.newFile().path() === patch.newFile().path());

      this.displayFile.next({patch, prePatch});
    });
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  public ngOnChanges() {
    this.repoSubscription.unsubscribe();
    this.repoSubscription = new Subscription();

    if(!this.workingDirectory) {
      logger.error("Working directory should always be present. Leave this page.");
      return;
    }

    this.repoSubscription.add(
      this.workingDirectory.stagedChanges.subscribe(changes => this.staged = changes)
    );
    this.repoSubscription.add(
      this.workingDirectory.unstagedChanges.subscribe(changes => this.unstaged = changes)
    );

    this.repoSubscription.add(
      combineLatest(this.workingDirectory.stagedChanges, this.workingDirectory.unstagedChanges)
      .pipe(pairwise()) // Get the previous and current. Wait a bit to ensure if both change at same time, we get both.
      .subscribe(this.refreshSelected.bind(this))
    );
  }

  async stage(file: nodegit.ConvenientPatch) {
    // Using the set to only pass through unique items. (i.e. if both files are same, just pass one)
    await this.workingDirectory.stage([...new Set(
      [file.newFile().path(), file.oldFile().path()])
    ]);
  }
  async stageAll() {
    // Collect all unstaged files
    const files = this.unstaged.reduce((acc, change) => ([...acc, change.newFile().path(), change.oldFile().path()]), []);
    await this.workingDirectory.stage([...new Set(files)]);
  }

  async unstage(file: nodegit.ConvenientPatch) {
    await this.workingDirectory.unstage([...new Set(
      [file.newFile().path(), file.oldFile().path()]
    )]);
  }
  async unstageAll() {
    // Collect all staged files
    const files = this.staged.reduce((acc, change) => ([...acc, change.newFile().path(), change.oldFile().path()]), []);
    await this.workingDirectory.unstage([...new Set(files)]);
  }

  async commit() {
    // Ensure there's a commit message.
    if (this.commitMessage.value == null) {
      this.errorService.displayError("Error: You need to enter a commit message before trying to commit");
    }
    // Ensure that there are files to commit.
    else if (!this.staged || this.staged.length == 0) {
      this.errorService.displayError("Error: You need to stage files before you can commit");
    } else {
      await this.workingDirectory.commit(this.commitMessage.value);
      this.commitMessage.setValue(null);
      this.unstageAll();
    }
  }

  public patchType(change: nodegit.ConvenientPatch) {
    if(change.isModified())
      return PatchType.Modified;
    else if(change.isAdded() || change.isUntracked() || change.isCopied())
      return PatchType.Added;
    else if(change.isDeleted())
      return PatchType.Removed;
    else if(change.isRenamed())
      return PatchType.Renamed;
    else
      logger.error("Unknown change. Status: " + change.status());
  }

  staged: nodegit.ConvenientPatch[];
  unstaged: nodegit.ConvenientPatch[];

  commitMessage = new FormControl(null, Validators.required);
  selected = new FormControl(null);

  /**
   * Updates the selected item when the staged/unstaged lists change so that the change is recent.
   */
  private refreshSelected([[prevStaged, prevUnstaged], [curStaged, curUnstaged]]: nodegit.ConvenientPatch[][][]) {
    const prev = this.selected.value as nodegit.ConvenientPatch;

    if(!prev)
      return;

    // Get potential result from both lists seperately
    const stagedFound = curStaged.find(change => changesEqual(change, prev));
    const unstagedFound = curUnstaged.find(change => changesEqual(change, prev));

    // If there is a similar patch in BOTH lists, choose the one from the same list as prevPatch was.
    // If there is only one similar patch, choose that regardless of which list it came from.
    let nextValue;
    if(prevStaged.includes(prev))
      nextValue = stagedFound || unstagedFound;
    else if(prevUnstaged.includes(prev))
      nextValue = unstagedFound || stagedFound;
    else
      nextValue = unstagedFound || stagedFound || prev;

    this.selected.setValue(nextValue);
  }

  private repoSubscription = new Subscription();
  private subscription: Subscription;
}
