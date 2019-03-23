import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RepositoryInfo } from './repository.list';

import { logger } from 'logger';
import { Repository } from 'model/repository';
import { UserService } from './user';
import { WorkingDirectoryService } from './working.directory';

export class WorkingDirectoryUncleanError extends Error {}

/**
 * Contains state of the current repository
 */
@Injectable({providedIn: 'root'})
export class RepositoryService {
  public constructor(
    private userService: UserService,
    private workingDirectoryService: WorkingDirectoryService
  ) {}

  public async select(repository: RepositoryInfo) {
    logger.info("Opening repository " + repository.name);
    const user = this.userService.getUser();
    const repo = new Repository(repository.github, repository.local, user ? user.gitCredentials : undefined);
    await repo.setup();

    this.repository.next(repo);
    this.workingDirectoryService.refresh(repo);

    this.branches = await this.getRepository().listBranches();
    logger.debug("Found branches: " + this.branches);
    this.currentBranch.next((await repo.local.getCurrentBranch()).shorthand());
    logger.info("Current branch set to " + this.currentBranch.value);
  }
  public async selectBranch(branchName: string) {
    if(!this.workingDirectoryService.isClean())
      throw new WorkingDirectoryUncleanError("Cannot switch branch when working directory isn't clean");

    await this.getRepository().checkout(branchName);

    // Refresh branches
    this.branches = await this.getRepository().listBranches();

    this.currentBranch.next(branchName);
    // Refresh working directory
    this.workingDirectoryService.refresh();
  }

  public getRepository() {
    return this.repository.getValue();
  }
  public observeRepository() {
    return this.repoObservable;
  }

  public getBranches() {
    return this.branches; // Probably don't need to clone this.
  }

  public getBranch() {
    return this.currentBranch.getValue();
  }
  public observeBranch() {
    return this.currentBranch.asObservable();
  }

  private branches: string[];
  private currentBranch = new BehaviorSubject(null as string);
  private repository = new BehaviorSubject(null as Repository);
  private repoObservable = this.repository.asObservable();
}
