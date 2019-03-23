import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RepositoryInfo, RepositoryListService } from 'services/repository.list';
import { RepositoryService } from 'services/repository';
import { UserService } from 'services/user';
import { logger } from 'logger';

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
    private repositoryService: RepositoryService
  ) {}

  public ngOnInit() {
    this.subscription.add(this.userService.observeUser().subscribe(user => {
      this.userIconUrl = user && user.avatarUrl;
      this.loggedIn = !!user;
    }));
    this.subscription.add(this.repositoryService.observeRepository().subscribe(repo => {
      this.currentRepo = repo ? repo.getName() : null;
      this.branches = repo ? this.repositoryService.getBranches() : null;
    }));
    this.subscription.add(this.repositoriesService.observeRepositories().subscribe(repos =>
      this.repositories = (repos && repos.length === 0) ? null : repos // An empty repos is made to be null for rendering purposes
    ));
    this.subscription.add(this.repositoryService.observeBranch().subscribe(branch => this.currentBranch = branch));
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
      this.repositoryService.selectBranch(branch);
    } catch(error) {
      logger.info("Selecting branch failed:");
      logger.info(error);

      // Here is where a generic modal would be created with error info, if we had one.
      throw new Error("No modal to present with error info");
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
   * When the user clicks their icon
   */
  selectUser() {
    throw new Error("Not implemented");
  }

  /**
   * Taking a branch name from the form control,
   * prompts? whether the user wants to create that branch, does so,
   * then moves to that branch.
   */
  createBranch() {
    try {
      this.repositoryService.getRepository().createBranch(this.branchCreationName.value);
    } catch(error) {
      logger.info("Error trying to create branch: ");
      logger.info(error);

      // Here is where we would present a generic error modal for informing about error
      throw new Error("No modal to display error with");
    }
  }

  /**
   * The below operations are simple wrappers around calling the repository behaviour.
   */

  // Returns whether op succeeded, as this function is used in code as well
  async pull() {
    try {
      await this.repositoryService.getRepository().pull();

      // Get and check for conflicts
      // Display a modal if there are
    } catch(error) {
      logger.info("Error pulling from remote: ");
      logger.info(error);

      // Here is where we would present a generic error modal for user.
      // Should try and detect whether error is: no remote, no access to remote, no corresponding remote branch
      throw new Error("No modal to display error with");

      return false;
    }
    return true;
  }
  // Returns whether op succeeded, as this function is used in code as well
  async push() {
    try {
      await this.repositoryService.getRepository().push();
    } catch(error) {
      logger.info("Error pushing to remote: ");
      logger.info(error);

      // Here is where we would present a generic error modal for user.
      // Should try and detect whether error is: no remote, no push permissions
      throw new Error("No modal to display error with");

      // If the error is that there is no branch on remote, we will create one and notify user via an alert (ngAlert)
      throw new Error("Can't detect whether error is that there is no remote branch. No alert to display if this is the case");
    }
  }
  async clean() {
    throw new Error("No modal to display to confirm whether user really wants to clean repo.");
    await this.repositoryService.getRepository().clean();
  }
  async sync() {
    // Only push if the pull succeeded.
    if(await this.pull())
      await this.push();
  }

  currentRepo: string;
  repositories: RepositoryInfo[] = [];

  currentBranch: string;
  branches: string[] = [];

  userIconUrl: string;
  loggedIn = false;

  isCollapsed = false;

  branchCreationName = new FormControl('');

  private subscription: Subscription = new Subscription();
}
