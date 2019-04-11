import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription, Observable, combineLatest } from 'rxjs';
import { RepositoryInfo } from './repository.list';

import { logger } from 'logger';
import { Repository } from 'model/repository';
import { UserService } from './user';

import { GitHub } from 'model/github';

import * as nodegit from 'nodegit';
import { promises as fs  } from 'fs';

const REFRESH_RATE = 3.0 * 1000;

export class WorkingDirectoryUncleanError extends Error {}

/**
 * Contains state of the current repository
 */
@Injectable({providedIn: 'root'})
export class RepositoryService implements OnDestroy {
  public constructor(
    private userService: UserService
  ) {
    this.repository = this.repositorySubject.asObservable();
    this.github = this.githubSubject.asObservable();

    // Refresh every 3 seconds
    this.subscription =
      combineLatest(this.repository, interval(REFRESH_RATE))
      .subscribe( ([repo, _]) => repo ? repo.refresh() : null );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public async select(repository: RepositoryInfo) {
    logger.info("Opening repository " + repository.name);
    const user = this.userService.getUser();

    const repo = await Repository.create(repository.local, repository.name, user);

    this.repositorySubject.next(repo);
    this.githubSubject.next(new GitHub(user, repository.github));
  }

  public current() {
    return this.repositorySubject.getValue();
  }

  public async initRepo(repoDir: string, autoInit: boolean, ignoreTemplate: string) {
    const path = require("path");
    const fileName = "README.md";

    nodegit.Repository.init(path.resolve(__dirname, repoDir), 0)
      .then( (repo) => {
        if(autoInit) {
          const content = "# Welcome\nVisualGit is an easy-to-use, visually-oriented desktop client for Git.";
          fs.writeFile(path.join(repo.workdir(), fileName), content);
        }
        if(ignoreTemplate !== "None.gitignore") {
          const template = './gitignore_templates/' + ignoreTemplate;
          fs.copyFile(path.resolve(__dirname, template), repo.workdir() + ".gitignore");
        }
        return;
      })
      .catch( (reasonForFailure) => {
        return reasonForFailure;
      });
  }

  public repository: Observable<Repository>;
  public github: Observable<GitHub>;

  private repositorySubject = new BehaviorSubject(null as Repository);
  private githubSubject = new BehaviorSubject(null as GitHub);
  private subscription: Subscription;
}
