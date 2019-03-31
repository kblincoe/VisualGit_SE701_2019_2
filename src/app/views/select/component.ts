import { Component, NgZone, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import * as electron from "electron";
import { logger } from "logger";

import { RepositoryListService } from 'services/repository.list';
import { RepositoryService } from 'services/repository';
import { ProgressbarComponent } from "views/select/progressbar.component";

@Component({
  selector: "app-select-screen",
  templateUrl: "component.html",
  styleUrls: ["component.scss"]
})
export class SelectRepositoryComponent implements OnInit, OnDestroy {
  @ViewChild(ProgressbarComponent) progressbar;
  public constructor(
    private router: Router,
    private repositoriesService: RepositoryListService,
    private repositoryService: RepositoryService,
    private ngZone: NgZone
  ) {}
  public ngOnInit() {
    this.subscription = this.cloneUrlForm.valueChanges.subscribe(this.onCloneUrlUpdate.bind(this));
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  async chooseCloneDirectory() {
    // Wrapped in a promise so that the parent knows when we have updated the form
    return new Promise(res =>
      electron.remote.dialog.showOpenDialog(
        electron.remote.getCurrentWindow(),
        {
          title: "Clone Directory",
          properties: ["openDirectory"],
          message: "Repository will be cloned under this directory"
        },
        paths => {
          if(paths && paths.length > 0) {
            let separator = paths[0].includes('\\') ? '\\' : '/';
            if(paths[0].endsWith(separator))
              separator = "";

            this.cloneDirectoryForm.setValue(paths[0] + separator + this.cloneName);
          }
          res();
        }
      )
    );
  }

  async chooseLocalRepository() {
    // Wrapped in a promise so that the parent knows when we have updated the form.
    return new Promise(res =>
      electron.remote.dialog.showOpenDialog(
        electron.remote.getCurrentWindow(),
        {
          title: "Open Repository",
          properties: ["openDirectory"],
          message: "Folder containing repository"
        },
        paths => {
          if(paths && paths.length > 0) {
            this.localRepositoryPathForm.setValue(paths[0]);
          }
          res();
        }
      )
    );
  }

  async clone() {
    this.progressbar.displayPanel();
    try {
      const repoInfo = await this.repositoriesService.cloneFromUrl(this.cloneUrlForm.value, this.cloneDirectoryForm.value);
      this.repositoryService.select(repoInfo);
      // If the above succeed, we can transition

      setTimeout(() => {
        this.progressbar.setValue(100);
        setTimeout(() => {
          this.progressbar.hidePanel()
          this.router.navigate(['/repo']);
        }, 1000);
      } , 1000);
    } catch(error) {
      logger.info("Cloning repository failed: ");
      logger.info(error);
      this.progressbar.hidePanel();
      throw new Error("Need modal to display error");
    }




  }

  async open() {
    try {
      const repoInfo = await this.repositoriesService.openLocal(this.localRepositoryPathForm.value);
      this.repositoryService.select(repoInfo);
      // If the above succeed, we can transition
      this.ngZone.run(() => this.router.navigate(['/repo']));
    } catch(error) {
      logger.info("Opening repository failed: ");
      logger.info(error);

      throw new Error("Need modal to display error");
    }

    // Was openRepository();
  }

  back() {
    this.router.navigate(['/login']);
  }

  cloneUrlForm: FormControl = new FormControl(null, Validators.required);
  cloneDirectoryForm: FormControl = new FormControl(null, Validators.required);
  localRepositoryPathForm: FormControl = new FormControl(null, Validators.required);

  private onCloneUrlUpdate(cloneUrl: string) {
    const prevName = this.cloneName;

    if(cloneUrl) {
      this.cloneName = cloneUrl.substring(
        cloneUrl.lastIndexOf('/', cloneUrl.length - 1) + 1, // Get the last '/' that is not at the end of the string
        cloneUrl.length - (cloneUrl.endsWith(".git") ? 4 : (cloneUrl.endsWith('/') ? 1 : 0)) // Remove an ending '.git' or '/'
      );
    } else {
      this.cloneName = "repo-name";
    }

    if(this.cloneDirectoryForm.value) {
      this.cloneDirectoryForm.setValue(
        (this.cloneDirectoryForm.value as string).replace(prevName, this.cloneName)
      );
    }
  }

  private cloneName = "repo-name";
  private subscription: Subscription;
}
