import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as nodegit from 'nodegit';
import { logger } from 'logger';

import { Repository } from 'model/repository';

@Injectable({providedIn: 'root'})
export class WorkingDirectoryService {

  /**
   * Refreshes the working directory, optionally switching to the given repository
   */
  public async refresh(repository?: Repository) {
    if(repository)
      this.repo = repository;

    const changes = await this.repo.listWorkingDiff();
    logger.info("Found " + (changes ? changes.length : 0) + " changes in the working directory");
    this.changes.next(changes);
  }

  public async stageFiles(paths: string[]) {
    logger.info("Staging " + paths);
    const index = await this.repo.local.index();
    for(const path of paths)
      index.addByPath(path);

    index.write();

    await this.refresh();
  }
  public async unstageFiles(paths: string[]) {
    logger.info("Unstaging " + paths);
    const index = await this.repo.local.index();
    for(const path of paths)
      index.removeByPath(path);

    index.write();

    await this.refresh();
  }

  public getFullPath(workDirPath: string) {
    return this.repo.local.workdir() + '/' + workDirPath;
  }

  public isClean() {
    return this.getChanges().length === 0;
  }

  public getChanges() {
    return this.changes.value;
  }
  public observeChanges() {
    return this.changes.asObservable();
  }

  private repo: Repository;
  private changes = new BehaviorSubject<nodegit.ConvenientPatch[]>([]);
}
