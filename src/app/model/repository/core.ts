import { BehaviorSubject, Subject } from 'rxjs';
import * as nodegit from 'nodegit';
import { logger } from 'logger';

import { User } from '../user';

/**
 * This class contains the git data, and manages
 * updating/notifying about changes in it.
 * This means separate modules can concern themselves with different parts of the data,
 * and other modules can recieve updates about changes without direct dependencies.
 * Uses rxjs, as angular provides it.
 */
export default class Core {

  public constructor(git: nodegit.Repository, user?: User) {
    this.repo = git;

    if(user)
      this.credentials = user.gitCredentials;
    else
      this.credentials = {
      certificateCheck() { return 1; },
      credentials() { return nodegit.Cred.defaultNew(); }
    };
  }

  public async refresh(firstTime = false) {
    this.head = await this.repo.head();

    this.commit = await this.repo.getHeadCommit();
    this.index = await this.repo.refreshIndex();

    this.onRefresh.next();

    if(firstTime)
      return;

    if(this.oldHead !== this.head.name()) {
      logger.info("Current branch has changed");
      this.oldHead = this.head.name();
      this.onChange.head.next();
    }

    if(this.oldCommit !== this.commit.id().tostrS()) {
      logger.info("Current commit has changed");
      this.oldCommit = this.commit.id().tostrS();
      this.onChange.tip.next();
    }

    if(this.oldIndex !== this.index.checksum().tostrS()) {
      logger.info("Current index has changed");
      this.oldIndex = this.index.checksum().tostrS();
      this.onChange.index.next();
    }

    // This should change if history changes.
    this.onChange.local.next();

    // This could be improved
    this.onChange.remote.next();

    // I don't know if there is a way of checking for changes
    this.onChange.workingDirectory.next();
  }

  public hasChanges() {
    return this.index.entries().length > 0 || this.index.hasConflicts();
  }

  // Called whenever the repository information is refreshed
  public onRefresh = new Subject<void>();

  // These items are all BehaviorSubject as they allow subsequent pipes to return immediate values.
  public onChange = {
    head: new BehaviorSubject<void>(null),
    tip: new BehaviorSubject<void>(null),
    index: new BehaviorSubject<void>(null),
    remote: new BehaviorSubject<void>(null),
    local: new BehaviorSubject<void>(null),
    workingDirectory: new BehaviorSubject<void>(null)
  };

  public head: nodegit.Reference;
  public commit: nodegit.Commit;
  public index: nodegit.Index;
  public repo: nodegit.Repository;

  public credentials: nodegit.RemoteCallbacks;

  public commandRecord = new Subject<string>();

  private oldHead = "";
  private oldCommit = "";
  private oldIndex = "";
}
