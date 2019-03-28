import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';

import { logger } from 'logger';
import * as nodegit from 'nodegit';

import { RepositoryService } from 'services/repository';
import { WorkingDirectoryService } from 'services/working.directory';

@Component({
  selector: "app-repository-screen",
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class RepositoryComponent implements OnInit, OnDestroy {
  public constructor(
    private workingDirectoryService: WorkingDirectoryService
  ) {}

  public ngOnInit() {
    this.subscription.add(
      this.workingDirectoryService.observeChanges().subscribe(this.onChange.bind(this))
    );
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  displayFile(file: nodegit.ConvenientPatch) {
    this.selectedFile = file;
  }

  private async onChange(changes: nodegit.ConvenientPatch[]) {
    // Get the changed files in this branch
    this.changes = changes;

    // Try to find a new patch that is on the same file as the old one. Defaults to null if not.
    if(changes != null && changes.length > 0 && this.selectedFile != null) {
      const newPatch = changes.find(patch => patch.newFile().path() === this.selectedFile.newFile().path());
      this.selectedFile = newPatch;
    } else {
      this.selectedFile = null;
    }
  }

  changes: nodegit.ConvenientPatch[] = [];
  selectedFile: nodegit.ConvenientPatch = null;
  selectedPath: string = null;

  private subscription: Subscription = new Subscription();
}
