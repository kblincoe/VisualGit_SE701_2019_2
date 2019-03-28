import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import * as nodegit from 'nodegit';
import { logger } from 'logger';
import { WorkingDirectoryService } from 'services/working.directory';
import { RepositoryService } from 'services/repository';

enum PatchType {
  Removed = "removed",
  Added = "added",
  Renamed = "renamed",
  Modified = "modified"
}

@Component({
  selector: "app-file-panel",
  templateUrl: "file.component.html",
  styleUrls: ["file.component.scss"]
})
export class FilePanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() changes: nodegit.ConvenientPatch[];
  @Output() displayFile = new EventEmitter<nodegit.ConvenientPatch>();

  public constructor(
    private repositoryService: RepositoryService,
    private workingDirectoryService: WorkingDirectoryService
  ) {}

  public clear() {}

  public ngOnInit() {
    this.subscription.add(
      this.commitForm.get('selectAll').valueChanges.subscribe(this.toggleAll.bind(this))
    );
    this.subscription.add(
      this.selected.valueChanges.subscribe(change => this.displayFile.emit(change))
    );
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public ngOnChanges() {
    // Update toggle controls
    const controlsArray = (this.commitForm.get('staging') as FormArray);
    // Angular 8 allows clear, but it only just came out :(
    // Preset the check boxes to whether the patch is staged
    controlsArray.controls = this.changes.map(change => new FormControl(!change.isUntracked()));

    if(this.changes.length === 0)
      this.commitForm.get('selectAll').disable();
    else
      this.commitForm.get('selectAll').enable();

    for(const change of this.changes) {
      if(change.isModified())
        this.patchTypes.set(change, PatchType.Modified);
      else if(change.isAdded() || change.isCopied())
        this.patchTypes.set(change, PatchType.Added);
      else if(change.isDeleted())
        this.patchTypes.set(change, PatchType.Removed);
      else
        this.patchTypes.set(change, PatchType.Renamed);
    }
  }

  toggleAll() {
    const value = this.commitForm.get("selectAll").value;
    for(const control of (this.commitForm.get('staging') as FormArray).controls) {
      control.setValue(value);
    }
  }

  async stage(file: nodegit.ConvenientPatch) {
    await this.workingDirectoryService.stageFiles([file.newFile().path(), file.oldFile().path()]);
  }

  async commit() {
    await this.repositoryService.getRepository().commit(this.commitForm.controls.commitMessage.value);
  }

  patchTypes = new Map<nodegit.ConvenientPatch, PatchType>();

  commitForm: FormGroup = new FormGroup({
    selectAll: new FormControl(false),
    staging: new FormArray([]),
    commitMessage: new FormControl(null, Validators.required)
  });
  selected = new FormControl(null as nodegit.ConvenientPatch);


  private subscription: Subscription = new Subscription();
}
