import * as nodegit from 'nodegit';
import { Component, OnInit, OnDestroy, NgZone, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { logger } from 'logger';

import { Repository } from 'model/repository';
import { RepositoryInfo, RepositoryListService } from 'services/repository.list';
import { RepositoryService } from 'services/repository';
import { UserService } from 'services/user';
import { ErrorService } from 'services/error.service';

import { TagsComponent } from './tags.component';
import { BranchComponent } from './branch.component';
import { MergeComponent } from './merge.component';
import { StashComponent } from './stash.component';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: "app-header",
  templateUrl: "component.html",
  styleUrls: ["component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy  {

  public constructor(
    private router: Router,
    private userService: UserService,
    private repositoriesService: RepositoryListService,
    private repositoryService: RepositoryService,
    private errorService: ErrorService,
    private ngZone: NgZone,
    private notifierService: NotifierService
  ) {
    this.notifier = notifierService;
  }

  public ngOnInit() {
    this.subscription.add(
      this.userService.observeUser().subscribe(user => {
        this.userIconUrl = user && user.githubInfo.avatar_url;
        this.username = user && user.name;
        this.loggedIn = !!user;
      })
    );
    this.subscription.add(
      this.repositoriesService.observeRepositories().subscribe(repos =>
        this.repositories = (repos && repos.length === 0) ? null : repos // An empty repo list is made to be null for rendering purposes
      )
    );
    this.subscription.add(
      this.repositoryService.repository.subscribe(this.onRepoChange.bind(this))
    );
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Switch to the add repo screen (/select)
   */
  gotoAddRepository() {
    this.router.navigate(['/select']);
  }

  /**
   * Select a repository from the repo dropdown.
   * This will ask the user for a directory to clone the repo into, then continue the standard repo clone process.
   */
  async selectRepository(repo: RepositoryInfo) {
    let usableRepo;
    if(!repo.local) {
      // Changes to select router if currently not on clone screen
      if (this.router.url !== '/select') {
        this.ngZone.run(() => this.router.navigate(['/select'], {queryParams: { clone_url: repo.uniqueName } }));
      }
      else {
        // Else do from whats said in
        // this link https://stackoverflow.com/questions/43698032/angular-how-to-update-queryparams-without-changing-route
        this.router.navigate(
          [], {
            queryParams: {
              clone_url: repo.uniqueName
            }
          });
      }

    }
    else {
      usableRepo = repo;
      await this.repositoryService.select(usableRepo);
      await this.router.navigate(['/repo']);

    }
    this.isShowMenu = false;
  }

  /**
   * Logs in or out, depending on user state
   */
  toggleLog() {
    if(this.loggedIn) {  // Log out
      this.userService.logout();
      this.loggedIn = false;
      this.currentRepo = null;
    }
    // Either way, go to login screen.
    this.router.navigate(['/login']);
  }

 /**
  * Display or hide the help page
  */
  toggleHelp() {
    throw new Error("Not implemented");
  }

 /**
  * Display or hide settings
  */
  toggleSetting() {
    throw new Error("Not implemented");
  }

  toggleTag() {
    this.tags.open();
  }

  /**
   * The below operations are simple wrappers around calling the repository behaviour.
   */
  // Returns whether op succeeded, as this function is used in code as well
  async pull() {
    try {
      await this.repositoryService.current().head.pull();

      // Get and check for conflicts
    } catch(error) {
      logger.info("Error pulling from remote: ");
      logger.info(error);

      // Should try and detect whether error is: no remote, no access to remote, no corresponding remote branch
      // popup a modal to show the error message
      this.errorService.displayError(error);

      return false;
    }
    return true;
  }

  // Returns whether op succeeded, as this function is used in code as well
  async push() {
    try {
      this.notifier.notify( 'info', 'Pushing ...' );
      await this.repositoryService.current().head.push();
      this.notifier.notify( 'success', 'Push successful!' );
    } catch(error) {
      logger.info("Error pushing to remote: ");
      logger.info(error);

      // Should try and detect whether error is: no remote, no push permissions
      // popup a modal to show the error message
      this.errorService.displayError(error);

      // If the error is that there is no branch on remote, we will create one and notify user via an alert (ngAlert)
      throw new Error("Can't detect whether error is that there is no remote branch. ");
    }
  }
  async clean() {
    throw new Error("No modal to display to confirm whether user really wants to clean repo.");
    await this.repositoryService.current().workingDirectory.clean();
  }
  async sync() {
    // Only push if the pull succeeded.
    if(await this.pull()) {
      await this.push();
    }
  }

  async issue() {
    try {
      this.router.navigate(['/issues']);
    }catch (e) {
      throw new Error("Please Log in Before visualizing the issue");
    }

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
          this.branches = branches.map(branch => branch.shorthand())
        )
      );
    }
    else {
      this.currentRepo = null;
      this.branches = [];
    }
  }

  openBranchModal() {
    this.branch.open();
  }

  openMergeModal() {
    this.merge.open();
  }
  
  openStashModal() {
    this.stash.open();
  }

  @ViewChild('tags') tags: TagsComponent;
  @ViewChild('branch') branch: BranchComponent;
  @ViewChild('merge') merge: MergeComponent;
  @ViewChild('stash') stash: StashComponent;

  createBranchInput: string;

  currentRepo: string;
  repositories: RepositoryInfo[] = [];

  currentBranch: string;
  branches: string[] = [];

  userIconUrl: string;
  username: string;
  loggedIn = false;

  isCollapsed = false;

  branchCreationName = new FormControl('');

  private subscription = new Subscription();
  private repoSubscription = new Subscription();
  private readonly notifier: NotifierService;
  private isShowMenu = false;

}
