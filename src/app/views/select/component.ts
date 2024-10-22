import { Component, NgZone, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import * as path from 'path';
import * as electron from "electron";
import { logger } from "logger";

import { RepositoryListService } from 'services/repository.list';
import { RepositoryService } from 'services/repository';
import { discoverSshCredentials } from 'model/user';
import { UserService } from 'services/user';

import { ProgressbarComponent } from './progressbar.component';
import { ErrorService } from "services/error.service";
import { StyleService } from 'services/style';

@Component({
  selector: "app-select-screen",
  templateUrl: "component.html",
  styleUrls: ["component.scss"]
})
export class SelectRepositoryComponent implements OnInit, OnDestroy {
  @ViewChild(ProgressbarComponent) progressbar;

  public constructor(
    private router: Router,
    private userService: UserService,
    private repositoriesService: RepositoryListService,
    private repositoryService: RepositoryService,
    private ngZone: NgZone,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private styleService: StyleService
  ) {
    this.gitignoreTemplates = this.styleService.listTemplates();
  }
  public ngOnInit() {
    this.subscription.add(this.cloneUrlForm.valueChanges.subscribe(this.onCloneUrlUpdate.bind(this)));
    this.subscription.add(this.route.queryParams.subscribe((params) => {this.setGitHubURLName(params); }));

  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Sets the github url field when users select a repo from the header button
  async setGitHubURLName(params: Params) {

    const value = params.clone_url;
    if (value !== undefined) {
      this.cloneUrlForm.setValue("https://github.com/" + value + ".git");
    }

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

            this.cloneDirectoryForm.setValue(path.join(paths[0], this.cloneName));
          }
          res();
        }
      )
    );
  }

  async chooseSSHDirectory() {
    // Wrapped in a promise so that the parent knows when we have updated the form
    return new Promise(res =>
      electron.remote.dialog.showOpenDialog(
        electron.remote.getCurrentWindow(),
        {
          title: "SSH key Directory",
          properties: ["openDirectory"],
          message: "Select Directory where SSH keys are stored"
        },
        async paths => {
          if(paths && paths.length > 0) {
            const results = await discoverSshCredentials(paths[0]);
            if(results.length === 0) {
              logger.info("No credentials found in path " + paths[0]);

              this.sshForm.setValue({publicPath: "", privatePath: ""});
            }
            else {
              if(results.length > 1)
                logger.error("Unable to pick between multiple ssh credentials in one directory. Choosing first one.");

              this.sshForm.setValue(results[0]);
            }
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
      const repoInfo = await this.repositoriesService.cloneFromUrl(
        this.cloneUrlForm.value,
        this.cloneDirectoryForm.value,
        value => this.progressbar.setValue(value)
      );

      this.repositoryService.select(repoInfo);
      this.progressbar.value = 100;
      setTimeout(() => {
        this.progressbar.hidePanel();
        setTimeout(() => this.router.navigate(['/repo']), 500);
      }, 500);

    } catch(error) {
      this.progressbar.hidePanel();
      logger.warn("Error cloning: ");
      logger.warn(error);
      this.errorService.displayError(error);
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

      this.errorService.displayError(error);
    }
  }

  async saveSshKeys() {
    if(!this.userService.getUser())
      logger.error("There should be a user by the time we are on this screen");
    else
      await this.userService.getUser().addSshCredentials(this.sshForm.value.publicPath, this.sshForm.value.privatePath);
  }

  // Cloning
  cloneUrlForm: FormControl = new FormControl(null, Validators.required);
  cloneDirectoryForm: FormControl = new FormControl(null, Validators.required);
  // Opening
  localRepositoryPathForm: FormControl = new FormControl(null, Validators.required);
  // SSH
  sshForm: FormGroup = new FormGroup({
    publicPath: new FormControl("", Validators.required),
    privatePath: new FormControl("", Validators.required)
  });
  // Create repo
  creatRepoFrom: FormGroup = new FormGroup({
    repoLocaltion:  new FormControl("", Validators.required),
    repoCreateInit: new FormControl(false)
  });


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


  addGitignoreTemplate(template: string) {
    this.choosedTemplate = template;
    this.isShowMenu = false;
  }


  async chooseRepoLocaltion() {
    // Wrapped in a promise so that the parent knows when we have updated the form.
    return new Promise(res =>
      electron.remote.dialog.showOpenDialog(
        electron.remote.getCurrentWindow(),
        {
          title: "Repository Init Into",
          properties: ["openDirectory"],
          message: "Select Directory"
        },
        paths => {
          if(paths && paths.length > 0) {
            this.creatRepoFrom.patchValue({repoLocaltion: paths[0]});
          }
          res();
        }
      )
    );
  }

  async createRepo() {
    const repoDir = this.creatRepoFrom.value.repoLocaltion;
    const fs = require('fs');
    if(fs.existsSync(repoDir + "\\.git")) {
      alert("A git repository already exist! Please choose another folder!");
      this.creatRepoFrom.setValue({repoLocaltion: "", repoCreateInit: false});
      this.choosedTemplate = "None"
      return;
    }
    const autoInit = this.creatRepoFrom.value.repoCreateInit;
    const ignoreTemplate = this.choosedTemplate + ".gitignore";
    this.repositoryService.initRepo(repoDir, autoInit, ignoreTemplate);
    alert("Create Success!");
    this.creatRepoFrom.setValue({repoLocaltion: "", repoCreateInit: false});
    this.choosedTemplate = "None";
  }

  private cloneName = "repo-name";
  private subscription: Subscription = new Subscription();
  gitignoreTemplates: string[] = [];
  choosedTemplate = "None";
  private isShowMenu = false;
}
