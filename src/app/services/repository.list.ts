import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import * as nodegit from 'nodegit';
import { logger } from 'logger';

import { User } from 'model/user';
import { getOwnedGithubRepositories, GithubRepository, findGithubRepo, clone } from 'model/repositories';
import { UserService } from './user';
import { CommandRecordService } from './command.record';

export interface RepositoryInfo {
  name: string;
  uniqueName: string;

  local: nodegit.Repository; // Null if no local copy
  github: GithubRepository; // Null if no online
}

@Injectable({providedIn: 'root'})
export class RepositoryListService implements OnDestroy {
  public constructor(
    private userService: UserService,
    private commandRecordService: CommandRecordService
  ) {

    this.subscription = this.userService.observeUser().subscribe(this.loadOnlineRepositories.bind(this));
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Clones and creates a repository from a url.
   * Throws if the url is invalid
   */
  public async cloneFromUrl(url: string, directory: string) {
    // First convert URL into github repo
    const githubRepo = await findGithubRepo(url, this.userService.getUser()); // User may be null.
    return await this.cloneFromGithub(githubRepo, directory);
  }
  /**
   * Clones and creates a repository from the repository info
   */
  public async cloneFromGithub(info: GithubRepository, directory: string) {
    this.commandRecordService.addCommand("git clone " + info.clone_url);

    try {
      const repo = await clone(info.clone_url, directory, this.userService.getUser());

      return {
        name: info.name,
        uniqueName: info.full_name,
        github: info,
        local: repo
      };
    } catch(error) {
      logger.warn("Error cloning: ");
      logger.warn(error);
    }
  }

  /**
   * Opens the given directory as a local directory,
   * returning a valid repository info that, if one is found, also
   * contains the relevant github online repo.
   */
  public async openLocal(directory: string): Promise<RepositoryInfo> {
    logger.info("Opening repo at location " + directory);

    const local = await nodegit.Repository.open(directory);

    // Make an attempt at names
    let name = directory.substr(directory.lastIndexOf('/'));
    let uniqueName = null;

    // Try to get github:
    let github: GithubRepository = null;
    const remotes = await local.getRemotes();
    // Only use origin, as we KNOW that that is the true repo (e.g. upstream, even if on github, is not the correct repo)
    if(!remotes.includes('origin')) {
      logger.warn("No origin found, will not attempt to get github information");
    } else {
      const remote = await local.getRemote('origin');
      // Attempt to get it, as if it's a github repo. If it's not then no harm done.
      try {
        github = await findGithubRepo(remote.url(), this.userService.getUser());
        name = github.name;
        uniqueName = github.full_name;
        logger.info("Found github repository at " + github.html_url);
      } catch (error) {
        logger.warn("Could not retrieve github from remote, skipping: ");
        logger.warn(error);
      }
    }

    // Locate the github repo if it exists.
    return {local, github, name, uniqueName};
  }

  public getRepositories(): RepositoryInfo[] {
    return this.repositories.getValue();
  }
  public observeRepositories(): Observable<RepositoryInfo[]> {
    return this.repositories.asObservable();
  }

  private async loadOnlineRepositories(user: User) {
    let githubs = [];
    if(user !== null && user.authenticated) {
      logger.info("Loading github repositories...");
      githubs = await getOwnedGithubRepositories(user);
    }

    logger.info(`${githubs.length} repositories found`);

    this.repositories.next(
      githubs.map(repo => ({name: repo.name, uniqueName: repo.full_name, github: repo, local: null}))
    );
  }

  private repositories: BehaviorSubject<RepositoryInfo[]> = new BehaviorSubject(null);
  private localRepositories: RepositoryInfo[];

  private subscription: Subscription;
}
