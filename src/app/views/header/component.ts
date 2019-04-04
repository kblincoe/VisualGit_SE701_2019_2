import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RepositoryInfo, RepositoryListService } from 'services/repository.list';
import { RepositoryService } from 'services/repository';
import { UserService } from 'services/user';
import { logger } from 'logger';
import { Repository } from 'model/repository';
import { ErrorService } from "services/error.service";

@Component({
  selector: "app-header",
  templateUrl: "component.html",
  styleUrls: ["component.scss"]
})
export class HeaderComponent implements OnInit, OnDestroy  {
  public constructor(
    private router: Router,
    private modalService: NgbModal,
    private userService: UserService,
    private repositoriesService: RepositoryListService,
    private repositoryService: RepositoryService,
    private errorService: ErrorService
  ) {}

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
      // Here is where a directory selection modal would be created if we had one
      throw new Error("Modals not implemented, cannot determine directory to clone repo into");
      const directory = null;

      usableRepo = await this.repositoriesService.cloneFromGithub(repo.github, directory);
    }
    else
      usableRepo = repo;

    await this.repositoryService.select(usableRepo);
    await this.router.navigate(['/repo']);
  }
  /**
   * Select a branch.
   * Same rules as normal for branch selection
   */
  async selectBranch(branch: string) {
    try {
      this.repositoryService.current().checkout(branch);
    } catch(error) {
      logger.info("Selecting branch failed:");
      logger.info(error);

      // popup a modal to show the error message
      this.errorService.displayError(error);
    }
  }

  /**
   * Logs in or out, depending on user state
   */
  toggleLog() {
    if(this.loggedIn) {  // Log out
      this.userService.logout();
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

  /**
   * Taking a branch name from the form control,
   * prompts? whether the user wants to create that branch, does so,
   * then moves to that branch.
   */
  async createBranch() {
    try {
      await this.repositoryService.current().createBranch(this.branchCreationName.value);
    } catch(error) {
      logger.info("Error trying to create branch: ");
      logger.info(error);

      // popup a modal to show the error message
      this.errorService.displayError(error);
    }
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
      await this.repositoryService.current().head.push();
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
    if(await this.pull())
      await this.push();
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
}
